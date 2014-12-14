#pragma strict

var Version : String;

private var gd : CurrentGameData;

function Start()
{
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
MasterServer.RequestHostList("YogscartTournament");
}

@RPC
function VersionCheck () {
networkView.RPC("VersionUpdate",RPCMode.Server,Version);
}

@RPC
function QuizNewRacer () {

networkView.RPC("RecievedNewRacer",RPCMode.Server,gd.currentChoices[0].character,gd.currentChoices[0].hat,gd.currentChoices[0].kart,gd.currentChoices[0].wheel);

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