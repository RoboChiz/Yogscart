#pragma strict
private var lastLevelPrefix = 0;

var Representation : Transform;

var LevelSelection : boolean;

private var gd : CurrentGameData;
private var LoadedCharacters : NetworkPlayer[];

function StartConnectionStuff(){

networkView.RPC ("WhatsOcurring", RPCMode.Server);

}

function Awake(){
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
}

function UpdatePos(){
var pf = Representation.GetComponent(Position_Finding);
while(true){
networkView.RPC ("MyPositionisClient", RPCMode.Server, pf.currentTotal,pf.currentDistance);
yield WaitForSeconds(0.2);
}
}

@RPC
function RaceSetup(track : String,cup : int, tracknum : int,pos : int){

gd.currentCup = cup;
gd.currentTrack = tracknum;

while(Application.loadedLevelName != track){
yield;
}

yield;

gameObject.AddComponent(RaceScript);
transform.GetComponent(RaceScript).Position = pos;

}

function ServerRaceSetup(track : String,cup : int, tracknum : int,pos : int){

gd.currentCup = cup;
gd.currentTrack = tracknum;

while(Application.loadedLevelName != track){
yield;
}

yield;

gameObject.AddComponent(RaceScript);
transform.GetComponent(RaceScript).Position = pos;

}



@RPC
function LoadNetworkLevel(level : String, levelPrefix : int){
gd.BlackOut = true;

LoadedCharacters = new NetworkPlayer[0];

if(level == "Lobby"){
if(transform.GetComponent(RaceScript) != null){
Debug.Log("PURGE IT'S SOUL!");
Destroy(transform.GetComponent(RaceScript));
}

if(transform.GetComponent(MasterRaceScript) != null){
Debug.Log("PURGE IT'S SOUL!");
Destroy(transform.GetComponent(MasterRaceScript));
}

}

if(transform.GetComponent(Countdown) != null){
Debug.Log("BURN IT!");
Destroy(transform.GetComponent(Countdown));
}

if(transform.GetComponent(VotingScreen) != null){
Debug.Log("BURN IT!");
Destroy(transform.GetComponent(VotingScreen));
}

if(transform.GetComponent(Level_Select) != null){
Debug.Log("BURN IT!");
Destroy(transform.GetComponent(Level_Select));
}

yield WaitForSeconds(0.6);

lastLevelPrefix = levelPrefix;
Network.SetSendingEnabled(0, false);    
Network.isMessageQueueRunning = false;
Network.SetLevelPrefix(levelPrefix);
Application.LoadLevel(level);
Network.isMessageQueueRunning = true;
Network.SetSendingEnabled(0, true);

for (var go in FindObjectsOfType(GameObject))
go.SendMessage("OnNetworkLoadedLevel", SendMessageOptions.DontRequireReceiver); 

yield;
yield;

if(level == "Lobby"){
if(gd.currentCharacter == -1 && gd.currentHat == -1){
GameObject.Find("Lobby Holder").GetComponent(Character_Select).enabled = true;
}else{
GameObject.Find("Lobby Holder").GetComponent(LobbyHandler).currentRoom = 1;
}

networkView.RPC("WhosHere",RPCMode.Others);

}else{
var obj = new GameObject();
obj.AddComponent(Camera);
obj.AddComponent(AudioListener);
obj.AddComponent(SpectatorCam);
obj.camera.depth = -5;
obj.transform.name = "SpectatorCam";
}

if(level == "Lobby" && gd.currentCharacter != -1 && gd.currentHat != -1)
GameObject.Find("GameData").networkView.RPC("ImHere",RPCMode.All,gd.currentCharacter,gd.currentHat);

yield WaitForSeconds(0.6);

gd.BlackOut = false;

}

function OnDisconnectedFromServer(info : NetworkDisconnection) {

Application.LoadLevel("Main Menu");
Destroy(this.gameObject);

}

@RPC
function Countdowner(time : int){

if(transform.GetComponent(Countdown) != null){
Debug.Log("BURN IT!");
Destroy(transform.GetComponent(Countdown));
}

yield;

gameObject.AddComponent(Countdown);

transform.GetComponent(Countdown).cdTime = time;
transform.GetComponent(Countdown).StartCountDown();

}

@RPC
function SelectaLevel(){

Debug.Log("Select me a Level");
LevelSelection = true;
gameObject.AddComponent(Level_Select);
gameObject.AddComponent(VotingScreen);
}

function Finished(){
networkView.RPC("PlayerFinished",RPCMode.Server);
StopCoroutine("UpdatePos");
}

function OnGUI () {

if(transform.GetComponent(Level_Select) != null){
if(GameObject.Find("Lobby Holder").GetComponent(Character_Select).enabled == false)
transform.GetComponent(Level_Select).hidden = false;
else
transform.GetComponent(Level_Select).hidden = true;

}
}

@RPC
function WhosHere(info : NetworkMessageInfo){

if(gd.currentKart != -1)
networkView.RPC("ImHere",info.sender,gd.currentCharacter,gd.currentHat);

}

@RPC
function ImHere(character : int,hat : int,info : NetworkMessageInfo){

Debug.Log("I'm Here");
var loadedCharacter : boolean;

if(LoadedCharacters != null)
for(var i : int = 0; i < LoadedCharacters.Length;i++){
if(LoadedCharacters[i].guid == info.sender.guid)
loadedCharacter = true;

}

if(loadedCharacter == false){
var Char : Transform = Instantiate(gd.Characters[character].CharacterModel_Standing,GameObject.Find("Lobby Holder").GetComponent(LobbyHandler).SpawnLocation.position,Quaternion.identity);
Char.gameObject.AddComponent(LobbyAI);
Char.gameObject.layer = 0;

if(LoadedCharacters != null)
Char.name = "LoadedCharacter" + LoadedCharacters.Length;
else
Char.name = "LoadedCharacter0";

var copy = new Array();

if(LoadedCharacters != null)
copy = LoadedCharacters;
copy.Push(info.sender);
LoadedCharacters = copy;

if(gd.Hats[hat].Model != null){
var CharHat = Instantiate(gd.Hats[hat].Model,Char.position,Quaternion.identity);
Debug.Log("Hat:" + gd.Hats[hat].Model.name);
CharHat.position = Char.GetComponent(QA).objects[0].position;
CharHat.rotation = Char.GetComponent(QA).objects[0].rotation;
CharHat.parent = Char.GetComponent(QA).objects[0];
}
}

}



@RPC
function DeletePlayer(player : NetworkPlayer){

if(LoadedCharacters != null){
Debug.Log("LoadedCharacters:"+ LoadedCharacters.Length.ToString());

var copy = new Array();
var ToDelete : int;


if(LoadedCharacters != null)
for(var i : int = 0; i < LoadedCharacters.Length; i++)
if(LoadedCharacters[i].guid != player.guid)
copy.Push(LoadedCharacters[i]);
else
ToDelete = i;


LoadedCharacters = copy;
Destroy(GameObject.Find("LoadedCharacter" + ToDelete));

//Add Animation HERE!

Debug.Log("Deleted Lobby Player");
}
}
