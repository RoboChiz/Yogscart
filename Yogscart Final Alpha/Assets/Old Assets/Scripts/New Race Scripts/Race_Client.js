#pragma strict
private var lastLevelPrefix = 0;

var LevelSelection : boolean;

private var gd : CurrentGameData;

private var LoadedCharacters : NetworkPlayer[];

private var takingPart : boolean;

var me : PlayerRacer;

function Awake(){
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
}

function ConnectedToServer(){

networkView.RPC("AddRacer",RPCMode.Server,gd.currentCharacter,gd.currentHat,gd.currentKart,gd.currentWheel);

}

@RPC
function YoureRacing(){

while(Application.loadedLevelName == "Main MenuV2")
yield;

if(Application.loadedLevelName == "Lobby"){

me = new PlayerRacer();
me.Human = true;
me.Character = gd.currentChoices[0].character;
me.Hat = gd.currentChoices[0].hat;
me.Kart = gd.currentChoices[0].kart;
me.Wheel = gd.currentChoices[0].wheel;

networkView.RPC("SpawnMe_Lobby",RPCMode.AllBuffered,me.Character,me.Hat);

}else{
Debug.Log(Application.loadedLevelName);
}

takingPart = true;

}

@RPC
function YoureNotRacing(){

takingPart = false;

}

@HideInInspector
var myPos : int;

@RPC
function RaceSetup(track : String,cup : int, tracknum : int,pos : int){

gd.currentCup = cup;
gd.currentTrack = tracknum;

while(Application.loadedLevelName != track){
yield;
}

yield;
myPos = pos;
gameObject.AddComponent(Race_Master);
var rm = transform.GetComponent(Race_Master);

rm.type = RaceStyle.Online;

}

@RPC
function PosUpdate(i : int){
me.rep.GetComponent(Position_Finding).position = i;
}

@RPC
function LoadNetworkLevel(level : String, levelPrefix : int){

gd.BlackOut = true;

LoadedCharacters = new NetworkPlayer[0];

if(transform.GetComponent(Race_Master) != null){
Debug.Log("PURGE IT'S SOUL!");
Destroy(transform.GetComponent(Race_Master));
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

}else{

}

yield WaitForSeconds(0.6);

gd.BlackOut = false;

}

function OnDisconnectedFromServer(info : NetworkDisconnection) {

Application.LoadLevel("Main MenuV2");
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
transform.GetComponent(Level_Select).hidden = false;
gameObject.AddComponent(VotingScreen);
}

@RPC
function ToTheVote(){
transform.GetComponent(Level_Select).hidden = true;
transform.GetComponent(VotingScreen).hidden = false;
}

private var controlLock : boolean = true;

function OnGUI () {

if(Input.GetAxis("Submit") == 0 && Input.GetAxis("Cancel") == 0)
controlLock = false;

if(Application.loadedLevelName == "Lobby"){

if(Input.GetAxis("Cancel") != 0 && controlLock == false){

Network.CloseConnection(Network.connections[0], true);
controlLock = true;
}

}

}

@RPC
function SpawnMe_Lobby(character : int,hat : int,info : NetworkMessageInfo){

var loadedCharacter : boolean;

if(LoadedCharacters != null)
for(var i : int = 0; i < LoadedCharacters.Length;i++){
if(LoadedCharacters[i].guid == info.sender.guid)
loadedCharacter = true;

}

while(Application.loadedLevelName != "Lobby")
yield;

if(loadedCharacter == false){
Debug.Log(character);
var Char : Transform = Instantiate(gd.Characters[character].CharacterModel_Standing,Vector3(0,1,0),Quaternion.identity);
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

function OnPlayerDisconnected(player : NetworkPlayer) {
		if(Application.loadedLevelName == "Lobby"){
		Debug.Log("Clean up after player " +  player);
		
		DeletePlayer(player);
		
		if(Network.isClient){
		Network.RemoveRPCs(player);
		Network.DestroyPlayerObjects(player);
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

LoadedCharacters = copy;
Destroy(GameObject.Find("LoadedCharacter" + ToDelete));

//Add Animation HERE!

Debug.Log("Deleted Lobby Player");
}
}
