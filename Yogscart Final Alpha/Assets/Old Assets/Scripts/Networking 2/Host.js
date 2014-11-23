#pragma strict

//Host Script V8 (Probably)

var DebugMode : boolean;

enum Phase{Lobby,LobbyRunning,BeginRaceLoading,Racing,EndRaceLoading}
var State : Phase;

var Bots : boolean;
var Automatic : boolean;
var MinPlayers : int;
var conscious : boolean;

@System.NonSerialized
var RacingPlayers : PlayerRacer[];//Stack that holds the players racing.

var Ready : int;

@System.NonSerialized
var WaitingPlayers : NetworkPlayer[];//Stack that holds a way to access waiting players. When it's their turn to race they'll be asked to send more information.
private var SearchWait : boolean; //When this is true the waiting players List is being searched to delete a record. Nothing (i.e Race starting) should happen during this time.

private var lastLevelPrefix : int;

private var gd : CurrentGameData;

private var Votes : Vector2[];

private var cs : Client;

function ResetServer(){

gd = transform.GetComponent(CurrentGameData);
cs = transform.GetComponent(Client);

lastLevelPrefix += 1;
networkView.RPC("LoadNetworkLevel",RPCMode.All,"Lobby",lastLevelPrefix);

Votes = new Vector2[0];
Ready = 0;
ended = false;

State = Phase.Lobby;

//Cancel Exsisting Stuff
StopCoroutine("CalculateFrameRate");

if(DebugMode)
StartCoroutine("CalculateFrameRate");

InvokeRepeating("FalseUpdate",0,0.5);

}

private var ended : boolean;

function EndRace(){

State = Phase.EndRaceLoading;

yield StartCountdowner(15);

if(ended == false){
ended = true;

RacingPlayers = transform.GetComponent(Race_Master).SPRacers;

//Reset Server
Network.RemoveRPCs(networkView.owner);

ResetServer();

}
}

function FalseUpdate(){

if(State == Phase.Lobby || State == Phase.LobbyRunning){

//Fill Racing Players with waiting players
if(RacingPlayers != null && RacingPlayers.Length < 12){

var amountNeeded = 12 - RacingPlayers.Length;
var count : int = 0;

while(WaitingPlayers != null && WaitingPlayers.Length > 0 && count < WaitingPlayers.Length && count < amountNeeded){
if(WaitingPlayers[count] != networkView.owner)
networkView.RPC("ComePlay",WaitingPlayers[count]);
count += 1;
}

}

//Start Race for Automatic Server
if(Automatic == true && RacingPlayers != null && RacingPlayers.Length >= MinPlayers && State == Phase.Lobby)
StartCoroutine("StartLevelSelect");


}

if(State == Phase.Racing){

}

if(State == Phase.EndRaceLoading){

}



}

///////////////////////////////////////////////////////// Lobby Functions /////////////////////////////////////////////////////////
function StartLevelSelect(){
State = Phase.LobbyRunning;
yield StartCountdowner(5);

networkView.RPC ("ViewtheVotes",RPCMode.AllBuffered);

for(var i : int;i < RacingPlayers.Length; i++)
if(RacingPlayers[i].networkRep != networkView.owner)
networkView.RPC ("SelectaLevel",RacingPlayers[i].networkRep);
else
cs.SelectaLevel();

yield StartCountdowner(30);
DetermineLevel();
}


@RPC
function LevelChoose(cup : int, track : int){

var AddTo : int;
for(var i : int = 0; i < cup; i++){
AddTo += gd.Tournaments[i].Tracks.Length;
}
AddTo += track;

var copy = new Array();

if(Votes != null)
copy = Votes;

copy.Push(Vector2(cup,track));
Votes = copy;

networkView.RPC ("VoteUpdate", RPCMode.All,AddTo);

if(Votes.Length >= RacingPlayers.Length){
Debug.Log("Votes: " + Votes.Length + " RacingPlayers: " + RacingPlayers.Length);
StopCoroutine("StartLevelSelect");
networkView.RPC ("Countdowner", RPCMode.All,5);
DetermineLevel();

}

}

function DetermineLevel(){
if(State == Phase.LobbyRunning){

State = Phase.BeginRaceLoading;

var toRace : int = Random.Range(0,Votes.Length);
var cup : int;
var track : int;

if(Votes.Length > 0){
cup = Votes[toRace].x;
track = Votes[toRace].y;
networkView.RPC ("StartRoll",RPCMode.All,toRace);
}else{
cup = Random.Range(0,gd.Tournaments.Length);
track  = Random.Range(0,gd.Tournaments[cup].Tracks.Length);
}

yield WaitForSeconds(5.1);

while(SearchWait)
yield;

Network.RemoveRPCs(networkView.owner);
networkView.RPC ("LoadNetworkLevel", RPCMode.All, gd.Tournaments[cup].Tracks[track].SceneID,lastLevelPrefix);

for(var i : int; i < RacingPlayers.Length;i ++)
RacingPlayers[i].timer = new Timer();

for(var j : int;j < RacingPlayers.Length; j++)
if(RacingPlayers[j].networkRep != networkView.owner)
networkView.RPC ("SetupYourKart", RacingPlayers[j].networkRep,j);
//else
//cs.SetupYourKart(j);

networkView.RPC ("SetyourselfUp", RPCMode.All);

yield;

}
}

function StartCountdowner(time : int){

networkView.RPC ("Countdowner", RPCMode.All,time);
yield WaitForSeconds(time + 0.1);

}

/////////////////////////////////////////////////////////Racing Functions/////////////////////////////////////////////////////////

@RPC
function ReadyToRace(){
Ready += 1;

if(Ready >= RacingPlayers.Length && State == Phase.BeginRaceLoading){
Race();

}
}

function Race(){
State = Phase.Racing;
networkView.RPC ("Countdown",RPCMode.All);
yield WaitForSeconds(4.3);
networkView.RPC("MultiplayerRace",RPCMode.All);
}

/////////////////////////////////////////////////////////New Player Functions/////////////////////////////////////////////////////////

@RPC
function ReadyPlayer(info: NetworkMessageInfo){
AddtoWait(info.sender);
networkView.RPC ("SetyourselfUp", info.sender);
networkView.RPC ("LoadNetworkLevel",info.sender,Application.loadedLevelName,lastLevelPrefix);
}

function AddtoWait(toAdd: NetworkPlayer){

var copy = new Array();

if(WaitingPlayers != null && WaitingPlayers.Length > 0)
copy = WaitingPlayers;

copy.Push(toAdd);

WaitingPlayers = copy;

}

@RPC
function AddtoPlay(character : int,hat : int,kart : int,wheel : int,  info : NetworkMessageInfo){

RemoveWait(info.sender);

var nRacer = new PlayerRacer();

nRacer.Human = true;
nRacer.Character = character;
nRacer.Hat = hat;
nRacer.Kart = kart;
nRacer.Wheel = wheel;
nRacer.points = 0;
nRacer.networkRep = info.sender;

var copy = new Array();

if(RacingPlayers != null && RacingPlayers.Length > 0)
copy = RacingPlayers;

copy.Push(nRacer);

RacingPlayers = copy;

}

function AddHost(character : int,hat : int,kart : int,wheel : int){
var nRacer = new PlayerRacer();

nRacer.Human = true;
nRacer.Character = character;
nRacer.Hat = hat;
nRacer.Kart = kart;
nRacer.Wheel = wheel;
nRacer.points = 0;
nRacer.networkRep = networkView.owner;

var copy = new Array();
copy.Push(nRacer);
RacingPlayers = copy;

}


/////////////////////////////////////////////////////////Leaving Player Functions/////////////////////////////////////////////////////////
function OnPlayerDisconnected(player : NetworkPlayer) {
		Debug.Log("Clean up after player " +  player);
		Network.RemoveRPCs(player);
		Network.DestroyPlayerObjects(player);
		
		var toDelete : int = -1;
		
		for(var i : int; i < RacingPlayers.Length;i++){
		if(RacingPlayers[i].networkRep == player){
		toDelete = i;
		break;
		}
		}
		
		if(State == Phase.BeginRaceLoading || State == Phase.Racing){
		if(transform.GetComponent(Race_Master) != null)
		transform.GetComponent(Race_Master).RemovePlay(player);
		} 
		
		if(toDelete >= 0)
		RemovePlay(toDelete);
		else{
		RemoveWait(player);
		}
		
	}
	
function RemovePlay(i : int){

var copy : Array;
copy = RacingPlayers;

copy.RemoveAt(i);

RacingPlayers = copy;
}	

function RemoveWait(player : NetworkPlayer){
	SearchWait = true;
	var toDelete : int = -1;
	
	var startTime = Time.realtimeSinceStartup;
	
	for(var i : int; i < WaitingPlayers.Length;i++){
		if(WaitingPlayers[i] == player){
			toDelete = i;
			break;
		}
		
		if(Time.realtimeSinceStartup - startTime > 1f/60f)
		yield;
	}

	var copy : Array;
	copy = WaitingPlayers;

	copy.RemoveAt(toDelete);

	WaitingPlayers = copy;

	SearchWait = false;
}	

/////////////////////////////////////////////////////////ONGUI Functions/////////////////////////////////////////////////////////
function OnGUI(){
//Debug GUI
if(DebugMode){
GUI.Label(Rect(420,10,250,25),"FPS: " + FPS.ToString());

if(RacingPlayers != null){
if(WaitingPlayers != null)
GUI.Label(Rect(10,10,400,25),"Total Players : " + (Network.connections.Length+1) + " Racing Players : " + RacingPlayers.Length + " Waiting Players: " + WaitingPlayers.Length);
else
GUI.Label(Rect(10,10,400,25),"Total Players : " + (Network.connections.Length+1) + " Racing Players : " + RacingPlayers.Length + " Waiting Players: 0");

if(transform.GetComponent(Race_Master) == null){

for(var i : int = 0; i < RacingPlayers.Length; i++){

if(RacingPlayers[i].Human == true){

if(RacingPlayers[i].networkRep == networkView.owner)
GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"[HOST]");

else
GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"[CLIENT]");

}else
GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"[BOT]");
}

}else{

var sp = transform.GetComponent(Race_Master).SPRacers;

for(i = 0; i < sp.Length; i++){

if(sp[i].Human == true){

if(sp[i].networkRep == networkView.owner)
GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"IN-RACE [HOST]");
else
GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"IN-RACE [CLIENT]");

}else
GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"IN-RACE [BOT]");
}

}

}

}

if(State == Phase.Lobby){

if(!Automatic && Input.GetAxis(gd.pcn[0] + "Submit") != 0)
StartCoroutine("StartLevelSelect");

}

}


private var FPS : int;

function CalculateFrameRate(){
var startTime = Time.realtimeSinceStartup;
var frameCount : int;

while(true){
yield;
frameCount +=1;

if(Time.realtimeSinceStartup-startTime > 1){
startTime = Time.realtimeSinceStartup;
FPS = frameCount;
frameCount = 0;
}

}
}

	