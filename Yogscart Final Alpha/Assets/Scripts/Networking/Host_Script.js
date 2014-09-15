#pragma strict
private var lastLevelPrefix = 0;

var ServerState : int;
// 0 - Lobby(Waiting for Players) 1 - Lobby(Choosing a Track) 2 - In Game
var Bots : boolean;

var Automatic : boolean;
var MinPlayers : int;

var conscious : boolean;

@System.NonSerialized
var ConnectedRacers : Racer[];

var Votes : Vector2[];

var ReadyCount : int;
var HumanCount : int;

var finishedCount : int;
var frozen : boolean; 

var ControlLock : boolean;

private var gd : CurrentGameData;
private var tm : TrackData;

function Awake(){
ResetVotes();
}

function ResetVotes(){

StopAllCoroutines();

gd = GameObject.Find("GameData").GetComponent(CurrentGameData);

Votes = new Vector2[0];

ReadyCount = 0;
HumanCount = 0;
finishedCount = 0;
ServerState = 0;
frozen = false;
finishedRestart = false;

for(var j : int = 0; j < Network.connections.Length; j++){
var isthere : boolean;
for(var y : int = 0; y < ConnectedRacers.Length; y++){
if(ConnectedRacers[y].Human == true && ConnectedRacers[y].access.guid == Network.connections[j].guid)
isthere = true;
}
		if(!isthere){
		var nRacer = new Racer();
		nRacer.Human = true;
		nRacer.access = Network.connections[j];
		AddRacer(nRacer);
		}

}

}

@RPC
function ReadytoStart(){
ReadyCount += 1;

if(ReadyCount == HumanCount){
networkView.RPC ("PlayCountdown", RPCMode.All);
yield WaitForSeconds(3);
networkView.RPC ("UnlockKart", RPCMode.All);
transform.GetComponent(MasterRaceScript).ActivateAIKarts();
StartCoroutine("SortArray"); 
}


}


@RPC
function MyPositionisClient (total : int, distance : float, info : NetworkMessageInfo) {

for(var i : int = 0; i < ConnectedRacers.Length; i++){
if(ConnectedRacers[i].access.guid == info.sender.guid && ConnectedRacers[i].Human == true){

ConnectedRacers[i].TotalDistance = total;
ConnectedRacers[i].NextDistance = distance;
i = ConnectedRacers.Length;
}
}
      

}

function MyPositionisServer(total : int, distance : float) {

for(var i : int = 0; i < ConnectedRacers.Length; i++){
if(ConnectedRacers[i].access.guid == Network.player.guid && ConnectedRacers[i].Human == true){

ConnectedRacers[i].TotalDistance = total;
ConnectedRacers[i].NextDistance = distance;
i = ConnectedRacers.Length;
}
}

}

function MyPositionisAI(ID : String, total : int, distance : float) {

for(var i : int = 0; i < ConnectedRacers.Length; i++){
if(ConnectedRacers[i].id == ID && ConnectedRacers[i].Human == false){

ConnectedRacers[i].TotalDistance = total;
ConnectedRacers[i].NextDistance = distance;
i = ConnectedRacers.Length;
}
}

}


@RPC
function WhatsOcurring(info : NetworkMessageInfo){
if(ServerState < 2){
networkView.RPC ("LoadNetworkLevel", info.sender, "Lobby",lastLevelPrefix);

if(ServerState == 1){
networkView.RPC ("LoadNetworkLevel", info.sender, "Lobby",lastLevelPrefix);
networkView.RPC ("SelectaLevel", info.sender);
networkView.RPC ("Countdowner", info.sender,transform.GetComponent(Countdown).cdTime);
}


}else
networkView.RPC ("LoadNetworkLevel", info.sender, Application.loadedLevelName,lastLevelPrefix);
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

if(Votes.Length >= HumanCount){
StopCoroutine("Timer30");
networkView.RPC ("Countdowner", RPCMode.All,5);
DetermineLevel();

}

}

private var StartSelect : boolean;

function OnGUI () {

if(Application.loadedLevel == 1 && conscious == true && (gd.currentKart == -1 || gd.currentCharacter == -1 || gd.currentHat == -1 || gd.currentWheel == -1)){
GameObject.Find("Lobby Holder").GetComponent(Character_Select).enabled = true;
}else{
if(GameObject.Find("Lobby Holder") != null)
GameObject.Find("Lobby Holder").GetComponent(LobbyHandler).currentRoom = 1;
}

if(transform.GetComponent(Level_Select) != null)
if(GameObject.Find("Lobby Holder").GetComponent(Character_Select).enabled == false)
transform.GetComponent(Level_Select).hidden = false;
else
transform.GetComponent(Level_Select).hidden = true;

HumanCount = 0;
if(ConnectedRacers != null)
for(var i : int = 0; i < ConnectedRacers.Length; i++){
if(ConnectedRacers[i].Human == true)
HumanCount+= 1;
}


if(ServerState == 2 && HumanCount == 0 && frozen == false){
EndRace();
frozen = true;
}

GUI.Label(Rect(350,10,250,25),"FPS: " + (1f/Time.deltaTime));

if(ConnectedRacers != null){
GUI.Label(Rect(10,10,250,25),"Connected Players : " + Network.connections.Length + " Racing Players : " + ConnectedRacers.Length);
for(i = 0; i < ConnectedRacers.Length; i++)

if(ConnectedRacers[i].Human == true)
GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"[CLIENT] " +ConnectedRacers[i].TotalDistance + " " + ConnectedRacers[i].NextDistance);
else
GUI.Label(Rect(10,10 + 25 + (25*i),250,25),"[BOT] " + ConnectedRacers[i].TotalDistance + " " + ConnectedRacers[i].NextDistance + " " + ConnectedRacers[i].id);

if(ServerState == 0 && Automatic == true && StartSelect == false){
if(HumanCount >= MinPlayers){
networkView.RPC ("Countdowner", RPCMode.All,5);
StartSelect = true;
Timer5();
}
}

if(ServerState == 0 && Automatic == false && (Input.GetAxis("Submit") != 0  || Input.touchCount > 0) && ControlLock == false && StartSelect == false && gd.currentKart != -1 && gd.currentCharacter != -1 && gd.currentHat != -1 && gd.currentWheel != -1){
if(HumanCount >= MinPlayers){
networkView.RPC ("Countdowner", RPCMode.All,5);
StartSelect = true;
Timer5();
}
}
}

if(Input.GetAxis("Submit") != 0)
ControlLock = true;
else
ControlLock = false;

}

function Timer5(){
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
ServerState = 1;
Timer30();
}

function Timer60(){
networkView.RPC ("Countdowner", RPCMode.All,60);
yield WaitForSeconds(60.1);
EndRace();
}

function Timer30(){
yield WaitForSeconds(30.1);
DetermineLevel();
}

function DetermineLevel(){
if(ServerState != 2){

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

networkView.RPC ("LoadNetworkLevel", RPCMode.All, gd.Tournaments[cup].Tracks[track].SceneID,lastLevelPrefix);
ServerState = 2;

for(var x : int = 0; x < ConnectedRacers.Length; x++){
if(ConnectedRacers[x].Human == true){
if(ConnectedRacers[x].access != Network.player)
networkView.RPC ("RaceSetup", ConnectedRacers[x].access, gd.Tournaments[cup].Tracks[track].SceneID,cup,track,x);
else
transform.GetComponent(Client_Script).ServerRaceSetup(gd.Tournaments[cup].Tracks[track].SceneID,cup,track,x);
}
}

if(conscious == false)
transform.GetComponent(Client_Script).ServerRaceSetup(gd.Tournaments[cup].Tracks[track].SceneID,cup,track,x);

while(Application.loadedLevelName != gd.Tournaments[gd.currentCup].Tracks[gd.currentTrack].SceneID)
yield;

tm = GameObject.Find("Track Manager").GetComponent(TrackData);

gameObject.AddComponent(MasterRaceScript);
transform.GetComponent(MasterRaceScript).Setup();



//Send over Racers
yield WaitForSeconds(2);
if(HumanCount == 0)
EndRace();
}

}

function SortArray(){
while(true){

ConnectedRacers = transform.GetComponent(MasterRaceScript).ArraySort(ConnectedRacers,finishedCount);

for(var i : int = 0; i < ConnectedRacers.Length; i++){
if(ConnectedRacers[i].access != Network.player)
networkView.RPC ("YourPos", ConnectedRacers[i].access,i);
else if(ConnectedRacers[i].Human == true)
if(transform.GetComponent(RaceScript)!=null){
transform.GetComponent(RaceScript).Position = i;

}
}

yield WaitForSeconds(0.3f);

}

}

function OnPlayerConnected(player: NetworkPlayer) {

		if(ServerState != 2){
		var nRacer = new Racer();
		nRacer.Human = true;
		nRacer.access = player;
		AddRacer(nRacer);
		}
	}

function OnPlayerDisconnected(player : NetworkPlayer) {
		Debug.Log("Clean up after player " +  player);
		
		for(var i : int = 0; i < ConnectedRacers.Length; i++){
		if(ConnectedRacers[i].access == player){
		RemoveRacer(i);
		i = ConnectedRacers.Length;
		}
		}
		
		Network.RemoveRPCs(player);
		Network.DestroyPlayerObjects(player);
		
		if(Application.loadedLevel == 1){
		networkView.RPC("DeletePlayer",RPCMode.All,player);
		}
	}
	
function AddRacer(player : Racer){

var arr = new Array();
if(ConnectedRacers != null){

if(Bots == true && player.Human == true){
//Find Last AI
var LastAI : int = -1;
for(var i : int = 0; i < ConnectedRacers.Length; i++){
if(ConnectedRacers[i].Human == false)
LastAI = i;
}

RemoveRacer(LastAI);
}

arr = ConnectedRacers;

}

arr.Push(player);
ConnectedRacers = arr;

Debug.Log("ConnectedRacers now has " + ConnectedRacers.Length.ToString() + " racers!");

}  	

function RemoveRacer(player : int){

var arr = new Array();

if(ConnectedRacers != null)
for(var i : int = 0; i < ConnectedRacers.Length; i++){
	if(i != player)
    arr.Push(ConnectedRacers[i]);
    }

if(ConnectedRacers[player].Human == true && Bots == true && ServerState != 2){
var BotRacer = new Racer();
BotRacer.Human = false;
arr.Push(BotRacer);
}
    
ConnectedRacers = arr;
   
Debug.Log("Deleted Player " + player);   
   
}

private var finishedRestart : boolean;

@RPC
function PlayerFinished(){

finishedCount += 1;

if(finishedRestart == false){
StartCoroutine("Timer60");
finishedRestart = true;
}


if(finishedCount >= HumanCount){
StopCoroutine("Timer60");
EndRace();
}

}

function EndRace(){
networkView.RPC ("StopRacing", RPCMode.All);
networkView.RPC ("Countdowner", RPCMode.All,10);
yield WaitForSeconds(10);
//Reset Server
StopCoroutine("SortArray");
networkView.RPC ("LoadNetworkLevel",RPCMode.All, "Lobby",lastLevelPrefix);
StartSelect = false;

ResetVotes();

}

class Racer {

var Human : boolean;
var access : NetworkPlayer;
var id : String;
var TotalDistance : int;
var NextDistance : float;

}	