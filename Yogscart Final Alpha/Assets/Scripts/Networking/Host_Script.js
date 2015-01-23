#pragma strict

private var gd : CurrentGameData;

var Port : int;
var Password : String;
var WithBots : boolean;
var Automatic : boolean;
var conscious : boolean = true;
var MinPlayers : int;

var RacingPlayers : NetworkRacer[];
var PotentialPlayers : NetworkPlayer[];
var WaitingPlayers : NetworkPlayer[];

var serverType : ServerState = ServerState.Lobby;
enum ServerState{Lobby,LoadingRace,Racing};

private var workingProcesses : int;

function Awake()
{
	gd = transform.GetComponent(CurrentGameData);
}

function Start () {

	var mm : Main_Menu = GameObject.Find("Menu Holder").GetComponent(Main_Menu);

	Port = mm.HostPort;
	Password = mm.HostPassword;
	WithBots = mm.WithBots;
	Automatic = mm.Automatic;
	conscious = mm.conscious;
	MinPlayers = mm.MinPlayers;
	
	Network.incomingPassword = Password;
	var useNat = !Network.HavePublicAddress();
	Network.InitializeServer(12, Port, useNat);
	
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
		if(RacingPlayers[i].networkRep == player)
		{
		RacingPlayers[i].disconnected = true;
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
if(!RacingPlayers[i].disconnected)
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

var nNetworkRacer = new NetworkRacer(character,hat,kart,wheel,info.sender,true); 

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

var nNetworkRacer = new NetworkRacer(character,hat,kart,wheel,networkView.owner,true); 

copy.Push(nNetworkRacer);

RacingPlayers = copy;

networkView.RPC("LoadMe",RPCMode.AllBuffered,gd.currentChoices[0].character,gd.currentChoices[0].hat,PlayerPrefs.GetString("playerName","Player"));

workingProcesses --;

}

class NetworkRacer {

var Human : boolean;
var disconnected : boolean;

var Character : int;
var Hat : int;
var Kart : int;
var Wheel : int;

var rep : Transform;
var cameras : Transform;

var TotalDistance : int;
var NextDistance : float;
var timer : Timer;

var points : int;

//Networking Variables
var networkRep : NetworkPlayer;

function  NetworkRacer(c : int, h : int, k : int, w : int, nr : NetworkPlayer,human : boolean)
{
Character = c;
Hat = h;
Kart = k;
Wheel = w;
networkRep = nr;
Human = human;
}

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
if(RacingPlayers[i].Human == true)
GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"[CLIENT]");
else
GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"[BOT]");

}		