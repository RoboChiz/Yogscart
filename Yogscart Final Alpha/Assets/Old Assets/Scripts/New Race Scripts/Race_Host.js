#pragma strict
private var lastLevelPrefix = 0;

var DebugMode : boolean;

//Only during the lobby phase will players be added to the race.
//During the Loading Phases, new players will be shown an connection screen until the race countdown has began.
var State : Phase;

var Bots : boolean;
var Automatic : boolean;
var MinPlayers : int;
var conscious : boolean;

var ReadyCount : int;

private var humanCount : int; //Used to give each new player and original Human ID.

@System.NonSerialized
var RacingPlayers : PlayerRacer[];

@System.NonSerialized
var WaitingRacers : PlayerRacer[];

private var Votes : Vector2[];

private var controlLock : boolean;

private var gd : CurrentGameData;
private var td : TrackData;
private var rc : Race_Client;

private var Ready : boolean;

function ResetServer(){

gd = transform.GetComponent(CurrentGameData);
rc = transform.GetComponent(Race_Client);

humanCount = 0;
finishedCount = 0;
controlLock = true;

Votes = new Vector2[0];

State = Phase.Lobby;

if(conscious){
AddRacer(gd.currentCharacter,gd.currentHat,gd.currentKart,gd.currentWheel);
rc.YoureRacing();
}

if(DebugMode)
CalculateFrameRate();

networkView.RPC("LoadNetworkLevel",RPCMode.All,"Lobby",lastLevelPrefix);

lastLevelPrefix += 1;

}

function rerunServer(){
humanCount = 0;
finishedCount = 0;
ReadyCount = 0;
Ready = false;
controlLock = true;

Votes = new Vector2[0];

State = Phase.Lobby;

finishedRestart = false;
ended = false;
finishedCount = 0;

networkView.RPC("LoadNetworkLevel",RPCMode.All,"Lobby",lastLevelPrefix);

lastLevelPrefix += 1;
}

function OnGUI(){

if(Input.GetAxis(gd.pcn[0]+"Submit") == 0 && Input.GetAxis(gd.pcn[0] + "Cancel") == 0)
controlLock = false;

//Debug GUI
if(DebugMode){
GUI.Label(Rect(420,10,250,25),"FPS: " + FPS.ToString());

if(RacingPlayers != null){
if(WaitingRacers != null)
GUI.Label(Rect(10,10,400,25),"Total Players : " + (Network.connections.Length+1) + " Racing Players : " + RacingPlayers.Length + " Waiting Players: " + WaitingRacers.Length);
else
GUI.Label(Rect(10,10,400,25),"Total Players : " + (Network.connections.Length+1) + " Racing Players : " + RacingPlayers.Length + " Waiting Players: 0");

for(var i : int = 0; i < RacingPlayers.Length; i++)

if(RacingPlayers[i].Human == true)
GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"[CLIENT]");
else
GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"[BOT]");

}

if(State == Phase.Lobby){

if(!Ready){
if(Input.GetAxis(gd.pcn[0] + "Submit") != 0 && controlLock == false){
Ready = true;
networkView.RPC ("Countdowner", RPCMode.All,5);
LevelSelectTimer();
controlLock = true;
}
}

if(Input.GetAxis(gd.pcn[0] + "Cancel") != 0 && controlLock == false){
CloseServer();
controlLock = true;
}

}

}
}

function LevelSelectTimer(){
yield WaitForSeconds(5.1);
Debug.Log("Select a level!");

if(conscious == true)
networkView.RPC ("SelectaLevel", RPCMode.All);
else{
networkView.RPC ("SelectaLevel", RPCMode.Others);
gameObject.AddComponent(VotingScreen);
transform.GetComponent(VotingScreen).hidden = false;
}
networkView.RPC ("Countdowner", RPCMode.All,30);
LevelSelectingTimer();
}

function LevelSelectingTimer(){
yield WaitForSeconds(30.1);
DetermineLevel();
}

function DetermineLevel(){
if(State == Phase.Lobby){

networkView.RPC ("ToTheVote", RPCMode.All);

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

State = Phase.BeginRaceLoading;

Network.RemoveRPCs(networkView.owner);
networkView.RPC ("LoadNetworkLevel", RPCMode.All, gd.Tournaments[cup].Tracks[track].SceneID,lastLevelPrefix);

for(var x : int = 0; x < RacingPlayers.Length; x++){
if(RacingPlayers[x].Human == true){
if(RacingPlayers[x].networkRep != networkView.owner)
networkView.RPC ("RaceSetup", RacingPlayers[x].networkRep, gd.Tournaments[cup].Tracks[track].SceneID,cup,track,x);
else
transform.GetComponent(Race_Client).RaceSetup(gd.Tournaments[cup].Tracks[track].SceneID,cup,track,x);
}
}

while(Application.loadedLevelName != gd.Tournaments[gd.currentCup].Tracks[gd.currentTrack].SceneID)
yield;

td = GameObject.Find("Track Manager").GetComponent(TrackData);

while(transform.GetComponent(Race_Master) == null)
yield;

transform.GetComponent(Race_Master).SPRacers = RacingPlayers;

}
}

@RPC
function LevelChoose(cup : int, track : int){

var AddTo : int;

for(var i : int = 0; i < cup; i++){

AddTo += gd.Tournaments[i].Tracks.Length;

}

AddTo += track;

var copy = new Array();
copy = Votes;
copy.Push(Vector2(cup,track));
Votes = copy;

networkView.RPC ("VoteUpdate", RPCMode.All,AddTo);

if(Votes.Length >= RacingPlayers.Length){
Debug.Log("Votes: " + Votes.Length + " RacingPlayers: " + RacingPlayers.Length);
StopCoroutine("Timer30");
networkView.RPC ("Countdowner", RPCMode.All,5);
DetermineLevel();

}

}


@RPC
function ReadytoStart(){
ReadyCount += 1;

if(ReadyCount >= RacingPlayers.Length){
networkView.RPC ("Countdown", RPCMode.All);
yield WaitForSeconds(4.4);
networkView.RPC ("BeginRace", RPCMode.All);
State = Phase.Racing; 
}

}

private var finishedRestart : boolean;
private var finishedCount : int;

function FinishRace(){

finishedCount += 1;

if(finishedRestart == false){
StartCoroutine("Timer60");
finishedRestart = true;
}


if(finishedCount >= RacingPlayers.Length){
StopCoroutine("Timer60");
EndRace();
}

}

private var ended : boolean;

function EndRace(){
if(ended == false){
ended = true;

//Reset Server
Network.RemoveRPCs(networkView.owner);
networkView.RPC ("LoadNetworkLevel",RPCMode.AllBuffered, "Lobby",lastLevelPrefix);
Ready = false;

rerunServer();

}
}

function Timer60(){
networkView.RPC ("Countdowner", RPCMode.All,60);
yield WaitForSeconds(60.1);
EndRace();
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

function CloseServer(){

Network.Disconnect();
MasterServer.UnregisterHost();

gd.Exit();

}

@RPC
function AddRacer(character : int,hat : int,kart : int,wheel : int, info : NetworkMessageInfo){

var nRacer = new PlayerRacer();

//Remove any variables which aren't needed.

nRacer.Human = true;
nRacer.HumanID = humanCount;
nRacer.Character = character;
nRacer.Hat = hat;
nRacer.Kart = kart;
nRacer.Wheel = wheel;
nRacer.networkRep = info.sender;

var copy = new Array();

if(State == Phase.Lobby && RacingPlayers != null && RacingPlayers.Length < 12){

if(RacingPlayers != null)
copy = RacingPlayers;

copy.Push(nRacer);
RacingPlayers = copy;

networkView.RPC("YoureRacing",info.sender);

}else{
copy = WaitingRacers;
copy.Push(nRacer);
WaitingRacers = copy;

}

humanCount += 1;

networkView.RPC("LoadNetworkLevel",info.sender,Application.loadedLevelName,lastLevelPrefix);

}

function AddRacer(character : int,hat : int,kart : int,wheel : int){

var nRacer = new PlayerRacer();

//Remove any variables which aren't needed.

nRacer.Human = true;
nRacer.HumanID = humanCount;
nRacer.Character = character;
nRacer.Hat = hat;
nRacer.Kart = kart;
nRacer.Wheel = wheel;
nRacer.networkRep = networkView.owner;

var copy = new Array();

if(State == Phase.Lobby){

if(RacingPlayers != null)
copy = RacingPlayers;

copy.Push(nRacer);
RacingPlayers = copy;
}else{
copy = WaitingRacers;
copy.Push(nRacer);
WaitingRacers = copy;
}

humanCount += 1;

}

function RemoveRacer(i : int, arr : PlayerRacer[]){
var copy = new Array();
copy = arr;
copy.RemoveAt(i);
return copy;
}

function OnPlayerConnected(player: NetworkPlayer) {

}

function OnPlayerDisconnected(player : NetworkPlayer) {
		Debug.Log("Clean up after player " +  player);
		
		var found : boolean;
		
		if(RacingPlayers != null)
		for(var i : int = 0; i < RacingPlayers.Length; i++){
		if(RacingPlayers[i].networkRep == player){
		RacingPlayers = RemoveRacer(i,RacingPlayers);
		i = RacingPlayers.Length;
		found = true;
		}
		}
		
		if(WaitingRacers != null && found == false)
		for(i = 0; i < WaitingRacers.Length; i++){
		if(WaitingRacers[i].networkRep == player){
		WaitingRacers = RemoveRacer(i,WaitingRacers);
		i = WaitingRacers.Length;
		}
		}
		
		Network.RemoveRPCs(player);
		Network.DestroyPlayerObjects(player);
		
	}
	
