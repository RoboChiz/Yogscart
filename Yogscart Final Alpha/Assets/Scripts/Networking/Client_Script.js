#pragma strict

var NetworkIP : String = "127.0.0.1";
var NetworkPort : int = 25000;
var NetworkPassword : String;

private var receivedInvite : boolean;

private var gd : CurrentGameData;
private var im : InputManager;

var LoadedCharacters : clientPlayer[];

function Awake()
{
	gd = transform.GetComponent(CurrentGameData);
	im = GameObject.Find("GameData").GetComponent(InputManager);
}

function Update()
{

var cancelInput : float = im.c[0].GetInput("Cancel");
var cancelBool = (cancelInput != 0);

if(cancelBool)
{
Network.Disconnect();
}


}

function StartConnection () {

	Network.SetLevelPrefix(0);

	var mm : Main_Menu = GameObject.Find("Menu Holder").GetComponent(Main_Menu);
	
	NetworkIP = mm.NetworkIP;
	NetworkPort = mm.NetworkPort;
	NetworkPassword = mm.NetworkPassword;

	if(NetworkPassword == null || NetworkPassword == "")
	Network.Connect(NetworkIP, NetworkPort);
	else
	Network.Connect(NetworkIP, NetworkPort,NetworkPassword);

}

function OnFailedToConnect(error: NetworkConnectionError) {

	gd.BlackOut = false;

	var mm : Main_Menu = GameObject.Find("Menu Holder").GetComponent(Main_Menu);
	mm.PopupText = error.ToString();
	mm.ChangeState(Menu.Popup);
		
}
	
function OnDisconnectedFromServer(info : NetworkDisconnection) {
	gd.Exit();
}
	

@RPC
function VersionCheck () {
networkView.RPC("VersionUpdate",RPCMode.Server,gd.version);
}

@RPC
function QuizNewRacer () {

if(!receivedInvite)
{
networkView.RPC("RecievedNewRacer",RPCMode.Server,gd.currentChoices[0].character,gd.currentChoices[0].hat,gd.currentChoices[0].kart,gd.currentChoices[0].wheel);
networkView.RPC("LoadMe",RPCMode.AllBuffered,gd.currentChoices[0].character,gd.currentChoices[0].hat,PlayerPrefs.GetString("playerName","Player"));
receivedInvite = true;
}

}


@RPC
function LoadMe (character : int, hat : int, name : String, info : NetworkMessageInfo) {

var loadedCharacter : boolean = false;

if(LoadedCharacters != null)
for(var i : int = 0; i < LoadedCharacters.Length;i++){
if(LoadedCharacters[i].networkRep.guid == info.sender.guid)
{
loadedCharacter = true;
break;
}
}

if(loadedCharacter == false){

while(Application.loadedLevelName != "Lobby")
yield;

var Char : Transform = Instantiate(gd.Characters[character].CharacterModel_Standing,Vector3(0,1,0),Quaternion.identity);
Char.gameObject.AddComponent(LobbyAI);
Char.gameObject.layer = 0;

if(Char.FindChild("Canvas").FindChild("PlayerName") != null)
{
var pn = Char.FindChild("Canvas").FindChild("PlayerName");
pn.GetComponent(UI.Text).text = name;
}

var copy = new Array();

if(LoadedCharacters != null)
copy = LoadedCharacters;

var nclientPlayer = new clientPlayer(info.sender,Char);

copy.Push(nclientPlayer);
LoadedCharacters = copy;

Char.name = "LoadedCharacter" + (LoadedCharacters.Length-1);

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

var toDelete : int;

for(var i : int = 0; i < LoadedCharacters.Length; i++)
{
if(LoadedCharacters[i].networkRep.guid == player.guid)
{
toDelete = i;
break;
}
}

Destroy(LoadedCharacters[toDelete].lobbyRep);

var copy = new Array();
copy = LoadedCharacters;
copy.RemoveAt(toDelete);
LoadedCharacters = copy;

//Add Animation HERE!

Debug.Log("Deleted Lobby Player");
}
}

@RPC
function LoadNetworkLevel(level : String, levelPrefix : int){

gd.BlackOut = true;

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

class clientPlayer
{

var networkRep : NetworkPlayer;
var lobbyRep : GameObject;

function clientPlayer(rep : NetworkPlayer, lob : Transform){
networkRep = rep;
lobbyRep = lob.gameObject;
}

}


			