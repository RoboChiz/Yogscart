#pragma strict

var Version : String;

var RacingPlayers : NetworkRacer[];
var PotentialPlayers : NetworkPlayer[];
var WaitingPlayers : NetworkPlayer[];

var serverType : ServerState = ServerState.Lobby;

private var workingProcesses : int;

function Start()
{

        Network.InitializeServer(5000, 25002, !Network.HavePublicAddress());
        MasterServer.RegisterHost("YogscartTournament", "Main Server");

networkView.RPC("LoadNetworkLevel",RPCMode.AllBuffered,"Lobby",Application.loadedLevel);
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
if(verText != Version)
Network.CloseConnection(info.sender,true);
}

function OnPlayerDisconnected(player: NetworkPlayer) {

		workingProcesses ++;

		Debug.Log("Clean up after player " +  player);
		Network.RemoveRPCs(player);
		Network.DestroyPlayerObjects(player);
		
		var copy = new Array();
		
		if(PotentialPlayers != null)
		{
		copy = PotentialPlayers;
		copy.Remove(player);
		PotentialPlayers = copy;
		}
		
		if(WaitingPlayers != null)
		{
		copy = WaitingPlayers;
		copy.Remove(player);
		WaitingPlayers = copy;
		}
		
		workingProcesses --;
}

function Update () {

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

@RPC
function RecievedNewRacer(character : int, hat : int, kart : int, wheel : int,info : NetworkMessageInfo)
{

workingProcesses ++;

if(serverType != ServerState.Lobby)
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