#pragma strict

private var gd : CurrentGameData;
private var im : InputManager;

var WithBots : boolean;
var Automatic : boolean;
var conscious : boolean = true;
var MinPlayers : int;

var RacingPlayers : NetworkedRacer[];
var PotentialPlayers : NetworkPlayer[];
var WaitingPlayers : NetworkPlayer[];

var serverType : ServerState = ServerState.Lobby;
enum ServerState{Lobby,LoadingRace,Racing};

private var workingProcesses : int;

function Awake()
{
	gd = transform.GetComponent(CurrentGameData);
	im = transform.GetComponent(InputManager);
}

function Start () {

	var mm : Main_Menu = GameObject.Find("Menu Holder").GetComponent(Main_Menu);

	WithBots = mm.WithBots;
	Automatic = mm.Automatic;
	conscious = mm.conscious;
	MinPlayers = mm.MinPlayers;
	
	var myStuff = gd.currentChoices[0];
	
	RecievedLocalRacer(myStuff.character,myStuff.hat,myStuff.kart,myStuff.wheel);
	
	networkView.RPC("LoadNetworkLevel",RPCMode.AllBuffered,"Lobby",0);

}

function OnPlayerConnected(player: NetworkPlayer) {
	var copy = new Array();
	
	if(WaitingPlayers != null)
		copy = WaitingPlayers;
		
	copy.Push(player);
	
	WaitingPlayers = copy;
	
	networkView.RPC("VersionCheck",player);
	
}

@RPC
function VersionUpdate(verText : String,info : NetworkMessageInfo)
{
if(verText != gd.version)
Network.CloseConnection(info.sender,true);
}

function OnPlayerDisconnected(player: NetworkPlayer) {

		workingProcesses ++;

		Debug.Log("Clean up after player " +  player);
		Network.RemoveRPCs(player);
		Network.DestroyPlayerObjects(player);
		
		var copy = new Array();

		if(RacingPlayers != null)
		{
		
		for(var i : int = 0; i < RacingPlayers.Length; i++)
		{
		if(RacingPlayers[i].networkplayer == player)
		{
		RacingPlayers[i].connected = false;
		break;
		}
		}
		
		if(serverType == ServerState.Lobby)
		CheckforLeavers();
		
		}
		else if(PotentialPlayers != null)
		{
		copy = PotentialPlayers;
		copy.Remove(player);
		PotentialPlayers = copy;
		}		
		else if(WaitingPlayers != null)
		{
		copy = WaitingPlayers;
		copy.Remove(player);
		WaitingPlayers = copy;
		}
		
		workingProcesses --;
}

function FixedUpdate () {

switch (serverType)
{
	case ServerState.Lobby:
	//Updating Racing Players List
		if(RacingPlayers == null || (PotentialPlayers != null && (RacingPlayers.Length + PotentialPlayers.Length) < 12 && workingProcesses == 0) ||(RacingPlayers.Length < 12 && workingProcesses == 0))
			AddNewRacers();

	break;

}
}

function AddNewRacers()
{

workingProcesses ++;

var amountToAdd = 12;

if(RacingPlayers != null)
amountToAdd -= RacingPlayers.Length;

if(PotentialPlayers != null)
amountToAdd -= PotentialPlayers.Length;

var copy = new Array();
var copy2 = new Array();

if(PotentialPlayers != null)
copy = PotentialPlayers;

if(WaitingPlayers != null)
copy2 = WaitingPlayers;

for(var i : int = 0; i < amountToAdd; i++)
{
if(copy2.length <= i)
break;
else
{

copy.Add(WaitingPlayers[i]);
copy2.RemoveAt(i);

}
}

PotentialPlayers = copy;
WaitingPlayers = copy2;

for(i = 0; i < PotentialPlayers.Length; i++)
{

networkView.RPC("QuizNewRacer",PotentialPlayers[i]);

}

workingProcesses --;

}

function CheckforLeavers()
{

workingProcesses ++;

var copy = new Array();

for(var i : int = 0; i < RacingPlayers.Length; i++)
{
if(RacingPlayers[i].connected)
copy.Push(RacingPlayers[i]);
}

RacingPlayers = copy;

workingProcesses --;

}

@RPC
function RecievedNewRacer(character : int, hat : int, kart : int, wheel : int,info : NetworkMessageInfo)
{

workingProcesses ++;

if(serverType == ServerState.Lobby)
{

for(var i : int = 0; i < PotentialPlayers.Length; i++)
{

if(PotentialPlayers[i] == info.sender)
{

//Update Racing Player
var copy = new Array();

if(RacingPlayers != null)
copy = RacingPlayers;

var nRacer = new Racer(true,-1,character,hat,kart,wheel,copy.length); 
var nNetworkRacer = new NetworkedRacer(nRacer,info.sender);

copy.Push(nNetworkRacer);

RacingPlayers = copy;

//Update Potential Player
copy = new Array();

if(PotentialPlayers != null)
copy = PotentialPlayers;

copy.RemoveAt(i);

PotentialPlayers = copy;

break;
}
}

}

workingProcesses --;

}

function RecievedLocalRacer(character : int, hat : int, kart : int, wheel : int)
{

workingProcesses ++;

//Update Racing Player
var copy = new Array();

if(RacingPlayers != null)
copy = RacingPlayers;

var nRacer = new Racer(true,-1,character,hat,kart,wheel,0); 
var nNetworkedRacer = new NetworkedRacer(nRacer,networkView.owner);

copy.Push(nNetworkedRacer);

RacingPlayers = copy;

transform.GetComponent(RaceBase).myRacer = nRacer;

//networkView.RPC("LoadMe",RPCMode.AllBuffered,gd.currentChoices[0].character,gd.currentChoices[0].hat,PlayerPrefs.GetString("playerName","Player"));

workingProcesses --;

}

function OnGUI(){

	var playerString : String = "Total Players : ";
	playerString += (Network.connections.Length+1);

	if(RacingPlayers != null)
		playerString += " Racing Players : " + RacingPlayers.Length;

	if(PotentialPlayers != null)
		playerString += " Potential Players: " + PotentialPlayers.Length;

	if(WaitingPlayers != null)
		playerString += " Waiting Players: " + WaitingPlayers.Length;

	GUI.Label(Rect(10,10,Screen.width-20,25),playerString);

	for(var i : int = 0; i < RacingPlayers.Length; i++)
	{
		//if(RacingPlayers[i].Human == true)
		GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"[CLIENT]");
		//else
		//GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"[BOT]");
	}

	if(serverType == ServerState.Lobby)
	{
		if(im.c[0].GetInput("Submit"))
		{
			serverType = ServerState.LoadingRace;
			LoadRace();
		}
	}

}

function LoadRace()
{
	
	for(var i : int = 0; i < RacingPlayers.Length; i++)
	{
		if(RacingPlayers[i].networkplayer.guid != networkView.owner.guid)
			networkView.RPC("YourID",RacingPlayers[i].networkplayer,i);
		else
			transform.GetComponent(RaceBase).networkID = i;
	}

	networkView.RPC("LoadNetworkLevel",RPCMode.AllBuffered,"Sjin's Farm",0);
	
	while(Application.loadedLevelName == "Lobby")
		yield;
	
	serverType = ServerState.Racing;
	transform.GetComponent(RaceLeader).NetworkRacers = RacingPlayers;
	transform.GetComponent(RaceLeader).type = RaceStyle.Online;
	transform.GetComponent(RaceLeader).OverallTimer = new Timer();
	transform.GetComponent(RaceLeader).enabled = true;
	transform.GetComponent(RaceLeader).LoadLibaries();
	
	yield;
	yield;
	
	transform.GetComponent(RaceLeader).StartRace();
}	
	