#pragma strict

private var gd : CurrentGameData;
private var td : TrackData;

private var lastLevelPrefix : int;

var loadingLevel : boolean = true;
var Racing : boolean;

@HideInInspector
var me : PlayerRacer;

function Awake(){
gd = transform.GetComponent(CurrentGameData);
}

@RPC
function LoadNetworkLevel(level : String, levelPrefix : int){

loadingLevel = true;

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

lastLevelPrefix = levelPrefix;
Network.SetSendingEnabled(0, false);    
Network.isMessageQueueRunning = false;
Network.SetLevelPrefix(levelPrefix);
Application.LoadLevel(level);
Network.isMessageQueueRunning = true;
Network.SetSendingEnabled(0, true);

for (var go in FindObjectsOfType(GameObject))
go.SendMessage("OnNetworkLoadedLevel", SendMessageOptions.DontRequireReceiver); 

yield WaitForSeconds(0.6);

if(GameObject.Find("Track Manager") != null)
td = GameObject.Find("Track Manager").GetComponent(TrackData);

gd.BlackOut = false;

loadingLevel = false;

}

@RPC
function ComePlay () {

Racing = true;
networkView.RPC("AddtoPlay",RPCMode.Server,gd.currentChoices[0].character,gd.currentChoices[0].hat,gd.currentChoices[0].kart,gd.currentChoices[0].wheel);

me.Character = gd.currentChoices[0].character;
me.Hat = gd.currentChoices[0].hat;
me.Kart = gd.currentChoices[0].kart;
me.Wheel = gd.currentChoices[0].wheel;

}

@RPC
function StopPlaying(){
Racing = false;
}

@RPC
function SetyourselfUp(){
	
	while(loadingLevel)
	yield;
	
	Debug.Log("Racing is: " + Racing);
	if(!Racing){ 
	Debug.Log("Racing is: " + Racing);
		SetupSpectatorCam();
	}

}

///////////////////////////////////////////////////////// Racing Functions /////////////////////////////////////////////////////////

function SetupSpectatorCam(){
var obj = new GameObject();
obj.AddComponent(Camera);
obj.AddComponent(AudioListener);
obj.AddComponent(SpectatorCam);

obj.AddComponent(Kart_Camera);

obj.GetComponent(Kart_Camera).Distance = 7;
obj.GetComponent(Kart_Camera).Height = 1;
obj.GetComponent(Kart_Camera).PlayerHeight = 1;
obj.GetComponent(Kart_Camera).smoothTime = 0;
obj.GetComponent(Kart_Camera).rotsmoothTime = 100;

obj.camera.depth = -5;
obj.transform.name = "SpectatorCam";
}

@RPC
function PosUpdate(i : int){
me.rep.GetComponent(Position_Finding).position = i;
}

@RPC
function SetupYourKart(i : int){

	while(loadingLevel)
	yield;

	gameObject.AddComponent(Race_Master);
	transform.GetComponent(Race_Master).type = RaceStyle.Online;

	var viewID = Network.AllocateViewID();
	me.rep.GetComponent(NetworkView).viewID = viewID;
		
	//Add Script
	me.rep.gameObject.AddComponent(kartInput);
	me.rep.gameObject.AddComponent(kartInfo);
	me.rep.GetComponent(Position_Finding).position = i; 
	//me.rep.GetComponent(kartInput).InputName = gd.pcn[0].inputName;
	
	if(Network.isServer){
	transform.GetComponent(Race_Master).SPRacers = transform.GetComponent(Host).RacingPlayers;
	transform.GetComponent(Race_Master).SPRacers[i].rep = me.rep;
	
	}
	
	//Add Camera
	var IngameCam = Instantiate(Resources.Load("Prefabs/Cameras",Transform),td.PositionPoints[0].rep.position,Quaternion.identity);
		IngameCam.name = "InGame Cams";

		me.rep.GetComponent(kartInput).camLocked = true;
		me.rep.GetComponent(kartInput).frontCamera = IngameCam.GetChild(1).camera;
		me.rep.GetComponent(kartInput).backCamera = IngameCam.GetChild(0).camera;

		IngameCam.GetChild(0).GetComponent(Kart_Camera).Target = me.rep;
		IngameCam.GetChild(1).GetComponent(Kart_Camera).Target = me.rep;
		me.cameras = IngameCam;
		me.cameras = IngameCam;
		
	networkView.RPC("KartSpawn",RPCMode.OthersBuffered,viewID,me.Character,me.Hat,me.Kart,me.Wheel,i);
	
	yield transform.GetComponent(Race_Master).PlayCutscene();

	if(Network.isClient)
	networkView.RPC("ReadyToRace",RPCMode.Server);	
	else
	transform.GetComponent(Host).ReadyToRace();
	
}

@RPC
function KartSpawn(viewID : NetworkViewID,character : int, hat : int, kart : int, wheel : int,pos : int){

while(loadingLevel)
yield;

var toWatch : Transform;
toWatch.tag = "Spectated";
toWatch.GetComponent(NetworkView).viewID = viewID;

if(Network.isServer){

while(transform.GetComponent(Race_Master) == null || transform.GetComponent(Race_Master).SPRacers == null)
yield;

Debug.Log("LENGTH: " + transform.GetComponent(Race_Master).SPRacers.Length);
transform.GetComponent(Race_Master).SPRacers[pos].rep = toWatch;
}

}


///////////////////////////////////////////////////////// Useful Functions /////////////////////////////////////////////////////////

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
gameObject.AddComponent(Level_Select);
transform.GetComponent(Level_Select).hidden = false;
transform.GetComponent(VotingScreen).hidden = true;
}

@RPC
function ViewtheVotes(){
gameObject.AddComponent(VotingScreen);
transform.GetComponent(VotingScreen).hidden = false;
}

function OnDisconnectedFromServer(info : NetworkDisconnection) {
gd.Exit();

}

