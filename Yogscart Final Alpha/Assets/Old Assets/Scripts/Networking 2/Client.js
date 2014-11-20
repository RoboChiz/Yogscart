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

	me.rep = SpawnKart(me.Character,me.Hat,me.Kart,me.Wheel,i);

	var viewID = Network.AllocateViewID();
	me.rep.GetComponent(NetworkView).viewID = viewID;
		
	//Add Script
	me.rep.gameObject.AddComponent(kartInput);
	me.rep.gameObject.AddComponent(kartInfo);
	me.rep.GetComponent(Position_Finding).position = i; 
	me.rep.GetComponent(kartInput).InputName = gd.pcn[0];
	
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

var toWatch = SpawnKart(character,hat,kart,wheel,0);
toWatch.tag = "Spectated";
toWatch.GetComponent(NetworkView).viewID = viewID;

if(Network.isServer){

while(transform.GetComponent(Race_Master) == null || transform.GetComponent(Race_Master).SPRacers == null)
yield;

Debug.Log("LENGTH: " + transform.GetComponent(Race_Master).SPRacers.Length);
transform.GetComponent(Race_Master).SPRacers[pos].rep = toWatch;
}

}

function SpawnKart(character : int, hat : int, kart : int, wheel : int,pos : int){

td = GameObject.Find("Track Manager").GetComponent(TrackData);
//Find Position to spawn racer
	var SpawnPosition : Vector3;
	var rot : Quaternion = td.PositionPoints[0].rep.rotation;
	
	var centre : Vector3;
	centre = td.PositionPoints[0].rep.transform.position;
	

	var pos1 : Vector3;
	pos1 = centre + (rot*Vector3.forward*(td.Scale*1.5f)*1.5f);


		var startPos : Vector3 = td.PositionPoints[0].rep.position + (rot*Vector3.forward*(td.Scale*1.5f)*-1.5f);

		var x2 : Vector3 = rot*(Vector3.forward*(pos%3)*(td.Scale*1.5f)+(Vector3.forward*.75f*td.Scale));
		var y2 : Vector3 = rot*(Vector3.right*(pos + 1)* td.Scale);

		SpawnPosition = startPos + x2 + y2;  

	var clone : Transform;
	clone = Instantiate(gd.Karts[kart].Models[character],SpawnPosition,td.PositionPoints[0].rep.rotation * Quaternion.Euler(0,-90,0));
	clone.localScale = Vector3(td.Scale,td.Scale,td.Scale);

	if(gd.Hats[hat].Model != null){
		var HatObject = Instantiate(gd.Hats[hat].Model,clone.position,Quaternion.identity);

		if(clone.GetComponent(QA).objects[0] != null){
			HatObject.position = clone.GetComponent(QA).objects[0].position;
			HatObject.rotation = clone.GetComponent(QA).objects[0].rotation;
			HatObject.parent = clone.GetComponent(QA).objects[0];
		}
	}

	var Wheels = new Transform[4];

	for(var j : int = 0; j < Wheels.Length;j++){
		Wheels[j] = clone.GetComponent(QA).objects[j+1];

		var nWheel : Transform = Instantiate(gd.Wheels[wheel].Models[j],Wheels[j].position,Wheels[j].rotation);
		nWheel.parent = Wheels[j].parent;
		nWheel.name = Wheels[j].name;
		nWheel.localScale = Wheels[j].localScale;

		clone.GetComponent(kartScript).MeshWheels[j] = nWheel;

		Destroy(Wheels[j].gameObject);

		clone.GetComponent(QA).objects[j+1] = nWheel;

	}

	return clone;

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

