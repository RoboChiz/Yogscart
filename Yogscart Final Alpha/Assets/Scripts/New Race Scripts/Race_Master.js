#pragma strict

//Race Master - V1 
//Created By Robo_Chiz
//I AM RACE MASTER, MASTER OF ALL... THE RACES....FEAR ME!!!

enum Testing{Race,CharacterSpawning,CutScene,RaceInfo,Countdown,RaceGUI,ScoreBoard,NextMenu,Loading};
enum RaceStyle{GrandPrix,TimeTrial,CustomRace,Online};

var DebugMode : boolean;

var type : RaceStyle;
var State = Testing.CharacterSpawning;

private var td : TrackData;
private var gd : CurrentGameData;

private var CountdownText : int;
private var CountdownRect : Rect;
private var CountdownShow : boolean;
private var CountdownAlpha : float;

private var activeraceAlpha : boolean;
private var raceGUIAlpha : float;

@HideInInspector
var OverallTimer : Timer;

@System.NonSerialized
var SPRacers : PlayerRacer[];

@System.NonSerialized
var finishedSPRacers : int[];

@HideInInspector
var Players : int; //Counts human players, used mostly in SplitScreen Multiplayer! ;)
@HideInInspector
var finishedPlayers : int; //Counts human players, used mostly in SplitScreen Multiplayer! ;)
@HideInInspector
var finishedAI : int; //Used for debugging

@HideInInspector
var Player1 : int;

@HideInInspector
var currentSelection : int;
private var controlLock : boolean;
private var keyLock : boolean;

function Start(){
gd = transform.GetComponent(CurrentGameData);
td = GameObject.Find("Track Manager").GetComponent(TrackData);
//This section of code is for debugging each part of the Race Script, remember to remove all of the code relating to the Debug Mode when the alpha is released.
if(DebugMode){

if(td.IntroPans != null && td.IntroPans.Length > 0 && td.PositionPoints != null && td.PositionPoints.Length > 0){

if(State == Testing.Race){
SPRacers = new PlayerRacer[12];

for(var h : int = 0;h < 12;h++){
SPRacers[h] = new PlayerRacer();

if(h == 11){
SPRacers[h].Human = true;
SPRacers[h].HumanID = 0;
}else
SPRacers[h].Human = false;

var gd : CurrentGameData = GameObject.Find("GameData").GetComponent(CurrentGameData);

SPRacers[h].Character = Random.Range(0,gd.Characters.Length);
SPRacers[h].Hat = Random.Range(0,gd.Hats.Length);
SPRacers[h].Kart = Random.Range(0,gd.Karts.Length);
SPRacers[h].Wheel = Random.Range(0,gd.Wheels.Length);
SPRacers[h].timer = new Timer();

}

SinglePlayerRace();
}

if(State == Testing.CharacterSpawning)
if(type != RaceStyle.Online)
SetUpKarts();
//else
//SetupLocalKart();

if(State == Testing.CutScene)
PlayCutscene();

if(State == Testing.Countdown)
Countdown();

//if(State == Testing.ScoreBoard)

}else
Debug.Log("Track Error! Make sure everything is set up!");
}
//End of Debug Mode Section

if(Network.isServer || Network.isClient)
MultiplayerRace(transform.GetComponent(Race_Client).myPos);

}

function SinglePlayerRace(){
gd = transform.GetComponent(CurrentGameData);
td = GameObject.Find("Track Manager").GetComponent(TrackData);

//Remove crates for Time Trails
if(type == RaceStyle.TimeTrial){
var objs = GameObject.FindGameObjectsWithTag("Crate");
for(var i : int = 0;i < objs.Length;i++)
Destroy(objs[i]);
}

OverallTimer = new Timer();
addBoost = 0;
missOut = false;

yield;

SetUpKarts();
yield PlayCutscene();

if(type != RaceStyle.TimeTrial)
InvokeRepeating("SortArray",0,0.2);

yield Countdown();
BeginRace();

if(type == RaceStyle.TimeTrial){
SPRacers[0].rep.GetComponent(kartItem).inUse = true;
SPRacers[0].rep.GetComponent(kartItem).heldPowerUp = 3;
}

yield WaitForSeconds(1);
Destroy(transform.GetComponent(AudioSource));
}

function MultiplayerRace(pos : int){
gd = transform.GetComponent(CurrentGameData);
td = GameObject.Find("Track Manager").GetComponent(TrackData);

OverallTimer = new Timer();
addBoost = 0;
missOut = false;
SPRacers = new PlayerRacer[12];
yield;

SetUpMyKart(pos);
yield PlayCutscene();

if(Network.isClient)
networkView.RPC("ReadytoStart",RPCMode.Server);
else
transform.GetComponent(Race_Host).ReadytoStart();

}

private var addBoost : float;
private var missOut : boolean = false;

private var lastTime : float;

function OnGUI () {

GUI.skin = Resources.Load("GUISkins/Main Menu", GUISkin);
var sps : SinglePlayer_Script = transform.GetComponent(SinglePlayer_Script);

if(Input.GetAxisRaw(gd.pcn[0]+"Submit") == 0)
controlLock = false;

if(activeraceAlpha)
raceGUIAlpha = Mathf.Lerp(raceGUIAlpha,256,Time.deltaTime * 5f);
else
raceGUIAlpha = Mathf.Lerp(raceGUIAlpha,0,Time.deltaTime * 5f);

if(State == Testing.CutScene){

GUI.color = new Color32(255, 255, 255, raceGUIAlpha);
if(gd.currentTrack != -1){
var previewTexture : Texture2D = gd.Tournaments[gd.currentCup].Tracks[gd.currentTrack].Preview;

var idealWidth : float = Screen.width/3f;
var previewRatio : float = idealWidth/previewTexture.width;

var previewRect : Rect = Rect(Screen.width - idealWidth - 20,Screen.height - (previewTexture.height*previewRatio*2f),idealWidth,previewTexture.height*previewRatio);

GUI.DrawTexture(previewRect,previewTexture);
}

}

if(State == Testing.RaceInfo){

if(!DebugMode){
GUI.color = new Color32(255, 255, 255, raceGUIAlpha);

if(type != RaceStyle.TimeTrial)
var raceTexture : Texture2D  = Resources.Load("UI Textures/Level Selection/" + (sps.totalRaces+1),Texture2D);
else
raceTexture = Resources.Load("UI Textures/Level Selection/TimeTrial",Texture2D);

idealWidth = Screen.width-20;
previewRatio = idealWidth/raceTexture.width;

var raceRect : Rect = Rect(10,Screen.height - raceTexture.height*previewRatio,Screen.width-20,raceTexture.height*previewRatio);

GUI.DrawTexture(raceRect,raceTexture);
}

}

if(State == Testing.Countdown){
GUI.color = new Color32(255, 255, 255, CountdownAlpha);

var texture : Texture2D;

if(CountdownText == 0)
texture = Resources.Load("UI Textures/CountDown/GO",Texture2D);
else if(CountdownText != -1)
texture = Resources.Load("UI Textures/CountDown/" + CountdownText.ToString(),Texture2D);

if(texture != null)
GUI.DrawTexture(CountdownRect,texture,ScaleMode.ScaleToFit);

CountdownRect.x = Mathf.Lerp(CountdownRect.x,Screen.width/2 - Screen.height/6f,Time.deltaTime);
CountdownRect.y = Mathf.Lerp(CountdownRect.y,Screen.height/2 - Screen.height/6f,Time.deltaTime);
CountdownRect.width = Mathf.Lerp(CountdownRect.width,Screen.height/3f,Time.deltaTime);
CountdownRect.height = Mathf.Lerp(CountdownRect.height,Screen.height/3f,Time.deltaTime);

if(CountdownShow)
CountdownAlpha = Mathf.Lerp(CountdownAlpha,256,Time.deltaTime*10f);
else
CountdownAlpha = Mathf.Lerp(CountdownAlpha,0,Time.deltaTime*10f);


//READD COUTNDOWN BOOST
//if(CountdownText >= 3)
//if(Input.GetAxis(pcn[0]+"Throttle") != 0)
//missOut = true;

//if(CountdownText <= 2){

//if(Input.GetAxis(pcn[0]+"Throttle") != 0){
//addBoost += Time.deltaTime/10f; 
//Debug.Log("Adding Boost!");
//}

//if(addBoost != 0 && Input.GetAxis(pcn[0]+"Throttle") == 0){
//missOut = true;
//Debug.Log("missOut!");
//}

//}

if(GameObject.Find("Music Holder").GetComponent(AudioSource).volume < 0.25f)
GameObject.Find("Music Holder").GetComponent(AudioSource).volume += Time.deltaTime/4f;

}

if(State == Testing.RaceGUI){

activeraceAlpha = true;

if(addBoost != 0 && missOut == false){
Debug.Log("START BOOST!");
SPRacers[Player1].rep.GetComponent(kartScript).Boost(addBoost);
missOut = true;
}
var style = new GUIStyle(GUI.skin.GetStyle("Special Box"));

var BoxWidth : float = Screen.width / 10f;
var BoxHeight : float = Screen.height / 16f;

if(type == RaceStyle.TimeTrial)
OutLineLabel(Rect(20 + BoxWidth/2f,Screen.height - 20 - (BoxHeight*1.5),BoxWidth*1.75f + 10,BoxHeight),OverallTimer.ToString(),2);

if(Input.GetAxisRaw(gd.pcn[0]+"Pause") != 0 && pausedLock == false){
Paused = !Paused;
pausedLock = true;
controlLock = true;

if(!Network.isClient && !Network.isServer){
if(Paused)
Time.timeScale = 0f;
else
Time.timeScale = 1f;
}
}

if(Input.GetAxisRaw(gd.pcn[0]+"Pause") == 0)
pausedLock = false;


}

if(State == Testing.ScoreBoard){

var BoardTexture : Texture2D = Resources.Load("UI Textures/GrandPrix Positions/Backing",Texture2D);
var BoardRect : Rect = Rect(Screen.width/2f - Screen.height/16f,Screen.height/16f,Screen.width/2f ,(Screen.height/16f)*14f);

GUI.DrawTexture(BoardRect,BoardTexture);

var OutlineColour : Color = Color.black;

if(type == RaceStyle.TimeTrial){
	var BestTimer = gd.Tournaments[sps.nextCup].Tracks[sps.nextTrack].BestTrackTime; 		
	
if((isEmpty(BestTimer) == true) || (OverallTimer.Minute < BestTimer.Minute) || (OverallTimer.Minute <= BestTimer.Minute && OverallTimer.Second < BestTimer.Second)
||(OverallTimer.Minute <= BestTimer.Minute && OverallTimer.Second <= BestTimer.Second && OverallTimer.milliSecond <= BestTimer.milliSecond)){
OutLineLabel2(Rect((Screen.width/2f),2f*(Screen.height/16f),Screen.width/2f-(Screen.height/16f),(Screen.height/16f)*14f),"New Best Time!!!",2,Color.green);
}else{
OutLineLabel2(Rect((Screen.width/2f),2f*(Screen.height/16f),Screen.width/2f-(Screen.height/16f),(Screen.height/16f)*14f),"You Lost!!!",2,Color.red);
}

OutLineLabel2(Rect((Screen.width/2f),3f*(Screen.height/16f),Screen.width/2f-(Screen.height/16f),(Screen.height/16f)*14f),"Best Time",2,OutlineColour);
OutLineLabel2(Rect((Screen.width/2f),4f*(Screen.height/16f),Screen.width/2f-(Screen.height/16f),(Screen.height/16f)*14f),BestTimer.ToString(),2,OutlineColour);

OutLineLabel2(Rect((Screen.width/2f),5f*(Screen.height/16f),Screen.width/2f-(Screen.height/16f),(Screen.height/16f)*14f),"Your Time",2,OutlineColour);
OutLineLabel2(Rect((Screen.width/2f),6f*(Screen.height/16f),Screen.width/2f-(Screen.height/16f),(Screen.height/16f)*14f),OverallTimer.ToString(),2,OutlineColour);

}

if(type == RaceStyle.GrandPrix || type == RaceStyle.CustomRace){

GUI.BeginGroup(BoardRect);

for(var f : int = 0; f < 12; f++){

var PosTexture : Texture2D = Resources.Load("UI Textures/GrandPrix Positions/" + (f+1).ToString(),Texture2D);
var SelPosTexture : Texture2D = Resources.Load("UI Textures/GrandPrix Positions/" + (f+1).ToString() + "_Sel",Texture2D);
var NameTexture : Texture2D = Resources.Load("UI Textures/GrandPrix Positions/" + gd.Characters[SPRacers[f].Character].Name,Texture2D);
var SelNameTexture : Texture2D = Resources.Load("UI Textures/GrandPrix Positions/" + gd.Characters[SPRacers[f].Character].Name + "_Sel",Texture2D);

var Ratio = (Screen.height/16f)/PosTexture.height;
var Ratio2 = (Screen.height/16f)/NameTexture.height;

if(SPRacers[f].Human == true){
GUI.DrawTexture(Rect(20,(f+1)*Screen.height/16f,PosTexture.width * Ratio,Screen.height/16f),SelPosTexture);
GUI.DrawTexture(Rect(20 + PosTexture.width * Ratio,(f+1)*Screen.height/16f,NameTexture.width * Ratio2,Screen.height/16f),SelNameTexture);
OutlineColour = Color.grey;
}else{
GUI.DrawTexture(Rect(20,(f+1)*Screen.height/16f,PosTexture.width * Ratio,Screen.height/16f),PosTexture);
GUI.DrawTexture(Rect(20 + PosTexture.width * Ratio,(f+1)*Screen.height/16f,NameTexture.width * Ratio2,Screen.height/16f),NameTexture);
OutlineColour = Color.black;
}

var CharacterIcon = gd.Characters[SPRacers[f].Character].Icon;

GUI.DrawTexture(Rect(10 + (PosTexture.width * Ratio) + (NameTexture.width * Ratio2),(f+1)*Screen.height/16f,Screen.height/16f,Screen.height/16f),CharacterIcon);

if(isEmpty(SPRacers[f].timer))
OutLineLabel2(Rect(20 + (PosTexture.width * Ratio) + (NameTexture.width * Ratio2 * 1.5f) ,3 + (f+1)*Screen.height/16f,NameTexture.width * Ratio2,Screen.height/16f),"-N/A-",2,OutlineColour);
else
OutLineLabel2(Rect(20 + (PosTexture.width * Ratio) + (NameTexture.width * Ratio2 * 1.5f) ,3 + (f+1)*Screen.height/16f,NameTexture.width * Ratio2,Screen.height/16f),SPRacers[f].timer.ToString(),2,OutlineColour);

OutLineLabel2(Rect(20 + (PosTexture.width * Ratio) + (NameTexture.width * Ratio2 * 2.5f) ,3 + (f+1)*Screen.height/16f,NameTexture.width * Ratio2,Screen.height/16f),SPRacers[f].points.ToString(),2,OutlineColour);

OutLineLabel2(Rect(20 + (PosTexture.width * Ratio) + (NameTexture.width * Ratio2 * 2.9f) ,3 + (f+1)*Screen.height/16f,NameTexture.width * Ratio2,Screen.height/16f),"+ " + (15 - f).ToString(),2,OutlineColour);
}

GUI.EndGroup();

}

var PressStart1 : Texture2D = Resources.Load("UI Textures/Main Menu/Press Start",Texture2D);
var PressStart2 : Texture2D = Resources.Load("UI Textures/Main Menu/Press A",Texture2D);

if(Input.GetJoystickNames().Length > 0)
GUI.DrawTexture(Rect(Screen.width/2f - Screen.height/16f,Screen.height/16f * 14.4,Screen.width/2f ,Screen.height/16f*1.75),PressStart2,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(Rect(Screen.width/2f - Screen.height/16f,Screen.height/16f * 14.4,Screen.width/2f ,Screen.height/16f*1.75),PressStart1,ScaleMode.ScaleToFit);

if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && controlLock == false){
State = Testing.NextMenu;
controlLock = true;
}

}

if(State == Testing.NextMenu){
if(!DebugMode){
BoardTexture = Resources.Load("UI Textures/GrandPrix Positions/Backing",Texture2D);
BoardRect = Rect(Screen.width/2f - Screen.height/16f,Screen.height/16f,Screen.width/2f ,(Screen.height/16f)*14f);

GUI.DrawTexture(BoardRect,BoardTexture);

var Options : String[];
if(type == RaceStyle.GrandPrix || type == RaceStyle.CustomRace){
if(sps.totalRaces + 1 < 4)
Options = ["Next Race","Replay","Quit"];
else
Options = ["Finish"];
}else
Options = ["Restart","Replay","Change Character","Change Course","Quit"];

var IdealHeight : float = Screen.height/8f;
var ratio = IdealHeight/100f;

for(var k : int = 0; k < Options.Length; k++){

var optionTexture : Texture2D = Resources.Load("UI Textures/Next Menu/" + Options[k],Texture2D);
var optionTextureSel : Texture2D = Resources.Load("UI Textures/Next Menu/" + Options[k] + "_Sel",Texture2D);
var optionRect : Rect = Rect(BoardRect.x + BoardRect.width/2f - ((300f*ratio)/2f),BoardRect.y + (IdealHeight*(k+1)),(300f*ratio),IdealHeight);

if(currentSelection == k)
GUI.DrawTexture(optionRect,optionTextureSel,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(optionRect,optionTexture,ScaleMode.ScaleToFit);

}

if(type != RaceStyle.Online){
if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && controlLock == false){

if(currentSelection == 0 && controlLock == false){
State = Testing.Loading;
StartNextRace();
}

if(type == RaceStyle.GrandPrix || type == RaceStyle.CustomRace){

if(currentSelection == 1 && controlLock == false){
}
if(currentSelection == 2 && controlLock == false){
State = Testing.Race;
gd.Exit();
controlLock = true;
}
}

if(type == RaceStyle.TimeTrial){

if(currentSelection == 4 && controlLock == false){
State = Testing.Race;
gd.Exit();
controlLock = true;
}

}


}

if(Input.GetAxis(gd.pcn[0]+"Vertical") != 0 && keyLock == false){

currentSelection -= Mathf.Sign(Input.GetAxis(gd.pcn[0]+"Vertical"));

if(currentSelection < 0)
currentSelection = Options.Length-1;

if(currentSelection >= Options.Length)
currentSelection = 0;

keyLock = true;
keyWait();
}

}
}
}

if(Paused){

BoardTexture = Resources.Load("UI Textures/GrandPrix Positions/Backing",Texture2D);
BoardRect = Rect(Screen.width/2f - Screen.width/4f,Screen.height/16f,Screen.width/2f,(Screen.height/16f)*14f);

GUI.DrawTexture(BoardRect,BoardTexture);

if(type == RaceStyle.TimeTrial)
Options = ["Resume","Restart","Options","Quit"];
else
Options = ["Resume","Options","Quit"];

IdealHeight = Screen.height/8f;
ratio = IdealHeight/100f;

for(k = 0; k < Options.Length; k++){

optionTexture = Resources.Load("UI Textures/Next Menu/" + Options[k],Texture2D);
optionTextureSel = Resources.Load("UI Textures/Next Menu/" + Options[k] + "_Sel",Texture2D);
optionRect = Rect(BoardRect.x + BoardRect.width/2f - ((300f*ratio)/2f),BoardRect.y + (IdealHeight*(k+1)),(300f*ratio),IdealHeight);

if(currentSelection == k)
GUI.DrawTexture(optionRect,optionTextureSel,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(optionRect,optionTexture,ScaleMode.ScaleToFit);

}

if(Input.GetAxisRaw(gd.pcn[0]+"Submit") != 0 && Input.GetAxisRaw(gd.pcn[0]+"Pause") == 0 && controlLock == false){

if(currentSelection == 0 && controlLock == false){
Paused = !Paused;
Time.timeScale = 1f;
controlLock = true;
}

if(type == RaceStyle.TimeTrial){

if(currentSelection == 1 && controlLock == false){
Time.timeScale = 1f;
State = Testing.Loading;
	
	CancelInvoke("CheckPlayer");

	if(type != RaceStyle.TimeTrial)
	CancelInvoke("SortArray");
	
	StopCoroutine("BeginTick");
	StopCoroutine("FinishPlayer");
	
	currentSelection = 0;

StartNextRace();
}

if(currentSelection == 3 && controlLock == false){
State = Testing.Race;
Time.timeScale = 1f;
gd.Exit();
controlLock = true;
}

}

if(type != RaceStyle.TimeTrial){

if(currentSelection == 2 && controlLock == false){
State = Testing.Race;
Time.timeScale = 1f;
gd.Exit();
controlLock = true;
}
}

}

if(Input.GetAxisRaw(gd.pcn[0]+"Vertical") != 0 && keyLock == false){

currentSelection -= Mathf.Sign(Input.GetAxisRaw(gd.pcn[0]+"Vertical"));

if(currentSelection < 0)
currentSelection = Options.Length-1;

if(currentSelection >= Options.Length)
currentSelection = 0;

keyLock = true;
}

if(Input.GetAxisRaw(gd.pcn[0]+"Vertical") == 0)
keyLock = false;

}

lastTime = Time.realtimeSinceStartup;

}

private var Paused : boolean = false;
private var pausedLock : boolean = false;;

//////////////////////////////////////////////////////////////////////////////////////////////Character Spawning Functions //////////////////////////////////////////////////////////////////////////////////////////////
function SetUpKarts(){ //Single Player Only

for(var i : int = 0; i < SPRacers.Length;i++){

SPRacers[i].timer = new Timer();

SPRacers[i].rep = SpawnKart(SPRacers[i].Character,SPRacers[i].Hat,SPRacers[i].Kart,SPRacers[i].Wheel,i);

if(type != RaceStyle.TimeTrial)
SPRacers[i].rep.GetComponent(Position_Finding).position = i;

if(SPRacers[i].Human == false){
SPRacers[i].rep.gameObject.AddComponent(Racer_AI);
}else{
//Add Script
SPRacers[i].rep.gameObject.AddComponent(kartInput);
SPRacers[i].rep.gameObject.AddComponent(kartInfo);
//Adjust Scripts
SPRacers[i].rep.GetComponent(kartInput).InputName = gd.pcn[SPRacers[i].HumanID];
//Add Camera
var IngameCam = Instantiate(Resources.Load("Prefabs/Cameras",Transform),td.PositionPoints[0].rep.position,Quaternion.identity);
IngameCam.name = "InGame Cams";

SPRacers[i].rep.GetComponent(kartInput).camLocked = true;
SPRacers[i].rep.GetComponent(kartInput).frontCamera = IngameCam.GetChild(1).camera;
SPRacers[i].rep.GetComponent(kartInput).backCamera = IngameCam.GetChild(0).camera;

IngameCam.GetChild(0).GetComponent(Kart_Camera).Target = SPRacers[i].rep;
IngameCam.GetChild(1).GetComponent(Kart_Camera).Target = SPRacers[i].rep;
SPRacers[i].cameras = IngameCam;

if(type != RaceStyle.TimeTrial){
if(gd.pcn.Length > 2){
if(SPRacers[i].HumanID == 0)
SPRacers[i].rep.GetComponent(kartInfo).screenPos = ScreenType.TopLeft;
if(SPRacers[i].HumanID == 1)
SPRacers[i].rep.GetComponent(kartInfo).screenPos = ScreenType.TopRight;
if(SPRacers[i].HumanID == 2)
SPRacers[i].rep.GetComponent(kartInfo).screenPos = ScreenType.BottomLeft;
if(SPRacers[i].HumanID == 3)
SPRacers[i].rep.GetComponent(kartInfo).screenPos = ScreenType.BottomRight;
}
if(gd.pcn.Length == 2){
if(SPRacers[i].HumanID == 0)
SPRacers[i].rep.GetComponent(kartInfo).screenPos = ScreenType.Top;
if(SPRacers[i].HumanID == 1)
SPRacers[i].rep.GetComponent(kartInfo).screenPos = ScreenType.Bottom;
}

if(gd.pcn.Length == 3){
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

obj.GetComponent(SpectatorCam).RandomSort();
obj.GetComponent(SpectatorCam).locked = true;
obj.transform.name = "SpectatorCam";

obj.camera.rect = Rect(0.5,0,0.5,0.5);

}

}
//SetUpCameras
var copy = new Array();
copy.Push(IngameCam.GetChild(0).camera);
copy.Push(IngameCam.GetChild(1).camera);

SPRacers[i].rep.GetComponent(kartInfo).cameras = copy;

Players += 1;
}

}

}

function SetUpMyKart(i : int){
SPRacers[i] = new PlayerRacer();
SPRacers[i].timer = new Timer();
SPRacers[i].Character = gd.currentCharacter;
SPRacers[i].Hat = gd.currentHat;
SPRacers[i].Kart = gd.currentKart;
SPRacers[i].Wheel = gd.currentWheel;


SPRacers[i].rep = SpawnKart(SPRacers[i].Character,SPRacers[i].Hat,SPRacers[i].Kart,SPRacers[i].Wheel,i);
		var viewID = Network.AllocateViewID();
		SPRacers[i].rep.GetComponent(NetworkView).viewID = viewID;
		
		//Add Script
SPRacers[i].rep.gameObject.AddComponent(kartInput);
//Add Camera
var IngameCam = Instantiate(Resources.Load("Prefabs/Cameras",Transform),td.PositionPoints[0].rep.position,Quaternion.identity);
IngameCam.name = "InGame Cams";
IngameCam.GetComponent(kartInput).camLocked = true;
IngameCam.GetChild(0).GetComponent(Kart_Camera).Target = SPRacers[i].rep;
IngameCam.GetChild(1).GetComponent(Kart_Camera).Target = SPRacers[i].rep;
SPRacers[i].cameras = IngameCam;
		
		networkView.RPC("KartSpawn",RPCMode.OthersBuffered,viewID,i,SPRacers[i].Character,SPRacers[i].Hat,SPRacers[i].Kart,SPRacers[i].Wheel);
		Players += 1;
}

function SpawnKart(character : int, hat : int, kart : int, wheel : int,pos : int){

//Find Position to spawn racer
var SpawnPosition : Vector3;
var rot : Quaternion = td.PositionPoints[0].rep.rotation;



	var centre : Vector3;
	centre = td.PositionPoints[0].rep.transform.position;
	

	var pos1 : Vector3;
	pos1 = centre + (rot*Vector3.forward*(td.Scale*1.5f)*1.5f);


if(type == RaceStyle.TimeTrial){ //Time Trial

var y1 : Vector3 = rot*(Vector3.right* td.Scale);

SpawnPosition = td.PositionPoints[0].rep.position + y1;  

}else{ //Normal Race

var startPos : Vector3 = td.PositionPoints[0].rep.position + (rot*Vector3.forward*(td.Scale*1.5f)*-1.5f);

var x2 : Vector3 = rot*(Vector3.forward*(pos%3)*(td.Scale*1.5f)+(Vector3.forward*.75f*td.Scale));
var y2 : Vector3 = rot*(Vector3.right*(pos + 1)* td.Scale);

SpawnPosition = startPos + x2 + y2;  

}

var clone : Transform;
clone = Instantiate(gd.Karts[kart].Models[character],SpawnPosition,td.PositionPoints[0].rep.rotation * Quaternion.Euler(0,-90,0));

td = GameObject.Find("Track Manager").GetComponent(TrackData);
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

//////////////////////////////////////////////////////////////////////////////////////////////Cut Scene Functions //////////////////////////////////////////////////////////////////////////////////////////////

function PlayCutscene() {
State = Testing.CutScene;

var CutsceneCam = new GameObject();
CutsceneCam.AddComponent(Camera);
CutsceneCam.AddComponent(AudioSource);
CutsceneCam.AddComponent(AudioListener);
CutsceneCam.GetComponent(AudioSource).audio.clip = Resources.Load("Music & Sounds/RaceStart",AudioClip);
CutsceneCam.GetComponent(AudioSource).audio.Play ();
CutsceneCam.transform.position = td.IntroPans[0].StartPoint;
CutsceneCam.transform.rotation = Quaternion.Euler(td.IntroPans[0].StartRotation);
gd.BlackOut = false;
yield WaitForSeconds(0.5);
activeraceAlpha = true;
 for(var i : int = 0; i < td.IntroPans.Length; i++){
    yield Play(CutsceneCam.transform,td.IntroPans[i]);
 }
 
gd.BlackOut = true;
activeraceAlpha = false;
yield WaitForSeconds(0.5);
//Spawn Player Cam
CutsceneCam.camera.depth = -5;
yield WaitForSeconds(0.5);
activeraceAlpha = true;
gd.BlackOut = false;
State = Testing.RaceInfo;
yield WaitForSeconds(2.5); //Wait for Gui to clear up
activeraceAlpha = true;
yield WaitForSeconds(0.5);
while(CutsceneCam.GetComponent(AudioSource).audio.volume > 0){
CutsceneCam.GetComponent(AudioSource).audio.volume -= Time.deltaTime;
yield;
}

activeraceAlpha = false;
yield WaitForSeconds(0.5);

Destroy(CutsceneCam);
State = Testing.Countdown;

}

function Play (cam : Transform,Clip : CameraPoint) {

var startTime = Time.realtimeSinceStartup;

while((Time.realtimeSinceStartup-startTime) < Clip.TravelTime){
cam.position = Vector3.Lerp(Clip.StartPoint,Clip.EndPoint,(Time.realtimeSinceStartup-startTime)/Clip.TravelTime);
cam.rotation = Quaternion.Slerp(Quaternion.Euler(Clip.StartRotation),Quaternion.Euler(Clip.EndRotation),(Time.realtimeSinceStartup-startTime)/Clip.TravelTime);
yield;
}

}

//////////////////////////////////////////////////////////////////////////////////////////////Countdown Functions //////////////////////////////////////////////////////////////////////////////////////////////
@RPC
function Countdown(){
activeraceAlpha = true;
//Create Background Music
var obj = new GameObject();
obj.name = "Music Holder";
obj.AddComponent(AudioSource);
obj.GetComponent(AudioSource).audio.clip = td.backgroundMusic;
obj.GetComponent(AudioSource).audio.Play ();
obj.GetComponent(AudioSource).volume = 0;
obj.GetComponent(AudioSource).audio.loop = true;

//Start CountDown
gameObject.AddComponent(AudioSource);
transform.GetComponent(AudioSource).audio.clip = Resources.Load("Music & Sounds/CountDown",AudioClip);
transform.GetComponent(AudioSource).audio.Play ();

for(var i : int = 3; i >= 0; i--){
CountdownText = i;
CountdownRect = Rect(Screen.width/2 - (Screen.height/1.5f)/2f,Screen.height/2 - (Screen.height/1.5f)/2f,Screen.height/1.5f,Screen.height/1.5f);
CountdownShow = true;
yield WaitForSeconds(0.8);
CountdownShow = false;
yield WaitForSeconds(0.3);
}

CountdownText = -1;

}

@RPC
function BeginRace(){
State = Testing.RaceGUI;
UnlockKarts();
StartCoroutine("BeginTick");

InvokeRepeating("CheckPlayer",0.1,0.2);

}

function SortArray(){

Debug.Log("Starting sort");

for(var d : int = 0;d < SPRacers.Length;d++){

SPRacers[d].TotalDistance = SPRacers[d].rep.GetComponent(Position_Finding).currentTotal;
SPRacers[d].NextDistance = SPRacers[d].rep.GetComponent(Position_Finding).currentDistance;

}

var arr = new Array();
var harr = SPRacers;

System.Array.Sort(harr, ComparePosition);

for(var t : int = 0; t < SPRacers.Length;t++)
SPRacers[t].rep.GetComponent(Position_Finding).position = t;

return harr;

}

function ComparePosition(itemA: PlayerRacer, itemB: PlayerRacer): int {
  var timeA = itemA.timer;
  var timeB = itemB.timer;
  
  var totalDistanceA = itemA.TotalDistance;
  var totalDistanceB = itemB.TotalDistance;
  var NextDistanceA = itemA.NextDistance;
  var NextDistanceB = itemB.NextDistance;
  
	if(!isEmpty(timeA) && !isEmpty(timeB) ){
  	if (timeA.Minute < timeB.Minute) return -1;
  	if (timeA.Minute >  timeB.Minute) return 1;
  
  	if(timeA.Minute == timeB.Minute && timeA.Second < timeB.Second) return -1;
  	if(timeA.Minute == timeB.Minute && timeA.Second > timeB.Second) return 1;
  
  	if(timeA.Minute == timeB.Minute && timeA.Second == timeB.Second && timeA.milliSecond < timeB.milliSecond) return -1;
  	if(timeA.Minute == timeB.Minute && timeA.Second == timeB.Second && timeA.milliSecond > timeB.milliSecond) return 1;
 	}
 	
 	if(!isEmpty(timeA) && isEmpty(timeB)) return -1;
  	if(isEmpty(timeA) && !isEmpty(timeB)) return 1;
  	
  	if(totalDistanceA > totalDistanceB) return -1;
  	if(totalDistanceA < totalDistanceB) return 1;
  	
  	if(totalDistanceA == totalDistanceB && NextDistanceA < NextDistanceB) return -1;
  	if(totalDistanceA == totalDistanceB && NextDistanceA > NextDistanceB) return 1;
  	
  return 0;
}

function sortArraybyPoint(){

Debug.Log("Starting point sort");

var harr = SPRacers;

System.Array.Sort(harr, CompareCondition);

return harr;

}

function CompareCondition(itemA: PlayerRacer, itemB: PlayerRacer): int {
  var valA = itemA.points;
  var valB = itemB.points;
  if (valA > valB) return -1;
  if (valA < valB) return 1;
  return 0;
}

function RemoveRacer(array : PlayerRacer[] ,player : int){

var arr = new Array();

if(array != null)
for(var i : int = 0; i < array.Length; i++){
	if(i != player)
    arr.Push(array[i]);
    }
 
return arr;   
   
}

function CheckPlayer(){

var copy = new Array();
if(finishedSPRacers != null && finishedSPRacers.Length > 0)
copy = finishedSPRacers;

for(var i : int = 0; i < SPRacers.Length;i++){
if(isEmpty(SPRacers[i].timer) == true && SPRacers[i].rep.GetComponent(Position_Finding).Lap == td.Laps){
copy.Push(i);
if(SPRacers[i].Human == true){
finishedPlayers += 1;
StartCoroutine("FinishPlayer",i);
}else{
FinishAI(i);
}

}
}

finishedSPRacers = copy;

if(type != RaceStyle.Online){
if(finishedPlayers == Players && State != Testing.NextMenu)
FinishRace();
}else{
if(Network.isServer){
//SetUp End Race Stuff


}
}
}

function FinishPlayer(i : int){
if(SPRacers[i].Human == false)
Debug.Log("This racer is an AI! Something's gone wrong!");
else{
Debug.Log("Player " + i.ToString() + " has finished the race");
SPRacers[i].timer = new Timer();
SPRacers[i].timer.Minute = OverallTimer.Minute;
SPRacers[i].timer.Second = OverallTimer.Second;
SPRacers[i].timer.milliSecond = OverallTimer.milliSecond;

SPRacers[i].rep.gameObject.AddComponent(Racer_AI);
Destroy(SPRacers[i].rep.GetComponent(kartInput));
SPRacers[i].rep.GetComponent(kartInfo).hidden = true;

yield WaitForSeconds(2);

SPRacers[i].cameras.GetChild(0).camera.enabled = false;
SPRacers[i].cameras.GetChild(1).camera.enabled = true;

while(SPRacers[i].cameras.GetChild(1).GetComponent(Kart_Camera).Distance > -6.5){
SPRacers[i].cameras.GetChild(1).GetComponent(Kart_Camera).Distance -= Time.fixedDeltaTime * 10;
SPRacers[i].cameras.GetChild(1).GetComponent(Kart_Camera).Height = Mathf.Lerp(SPRacers[i].cameras.GetChild(1).GetComponent(Kart_Camera).Height,1,Time.fixedDeltaTime);
SPRacers[i].cameras.GetChild(1).GetComponent(Kart_Camera).PlayerHeight = Mathf.Lerp(SPRacers[i].cameras.GetChild(1).GetComponent(Kart_Camera).PlayerHeight,1,Time.fixedDeltaTime);
SPRacers[i].cameras.GetChild(1).GetComponent(Kart_Camera).sideAmount = Mathf.Lerp(SPRacers[i].cameras.GetChild(1).GetComponent(Kart_Camera).sideAmount,-1.9,Time.fixedDeltaTime);
yield;
}

}
}

function FinishAI(i : int){
if(SPRacers[i].Human == true)
Debug.Log("This racer is HUMAN! Something's gone wrong!");
else{
Debug.Log("AI " + i.ToString() + " has finished the race");
SPRacers[i].timer = new Timer();
SPRacers[i].timer.Minute = OverallTimer.Minute;
SPRacers[i].timer.Second = OverallTimer.Second;
SPRacers[i].timer.milliSecond = OverallTimer.milliSecond;
}

finishedAI += 1;

}

@RPC
function FinishRace(){
	
	StopCoroutine("FinishPlayer");
	
	currentSelection = 0;
	
	if(type == RaceStyle.TimeTrial){
	
	var sps : SinglePlayer_Script = transform.GetComponent(SinglePlayer_Script);
	var BestTimer = gd.Tournaments[sps.nextCup].Tracks[sps.nextTrack].BestTrackTime; 		
							
	if((isEmpty(BestTimer) == true) || (OverallTimer.Minute < BestTimer.Minute) || (OverallTimer.Minute <= BestTimer.Minute && OverallTimer.Second < BestTimer.Second)
	||(OverallTimer.Minute <= BestTimer.Minute && OverallTimer.Second <= BestTimer.Second && OverallTimer.milliSecond < BestTimer.milliSecond)){
	
	var nTimeString = OverallTimer.ToString();
	gd.Tournaments[sps.nextCup].Tracks[sps.nextTrack].BestTrackTime = OverallTimer;
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Tracks[sps.nextTrack].Name,nTimeString);
	
	}		
		
	}
	
	controlLock = true;
	State = Testing.ScoreBoard;

}

	function UnlockKarts(){
	for(var i : int = 0; i < SPRacers.Length;i++){
	SPRacers[i].rep.GetComponent(kartScript).locked = false;
	
	if(SPRacers[i].rep.GetComponent(kartInfo) != null)
	SPRacers[i].rep.GetComponent(kartInfo).hidden = false;
	
	if(SPRacers[i].cameras != null)
	SPRacers[i].rep.GetComponent(kartInput).camLocked = false;
	}
	}

    function BeginTick(){
    var foo1 = OverallTimer.Minute;
	var foo2 = OverallTimer.Second;
	var foo3 = OverallTimer.milliSecond;

	while(true){
	
	foo3 += Time.deltaTime * 1000f;
	
	if(foo3 >= 1000){
	foo3 -= 1000;
	foo2 += 1;
	}
	
	if(foo2 >= 60){
	foo2 -= 60;
	foo1 += 1;
	}
	
	OverallTimer.Minute = foo1;
	OverallTimer.Second = foo2;
	OverallTimer.milliSecond = foo3;
	
	yield;
	
	}
	}
	
	function StopTick(){
	StopCoroutine("BeginTick");
	}
	
	function StartNextRace(){
	
	if(type != RaceStyle.TimeTrial)
	CancelInvoke("SortArray");
	
	CancelInvoke("CheckPlayer");
	StopCoroutine("BeginTick");
	
	for(var i : int = 0;i < SPRacers.Length;i++)
	SPRacers[i].points += (15 - i);
	
	var sps : SinglePlayer_Script = transform.GetComponent(SinglePlayer_Script);
	
	sps.totalRaces += 1;
	if(type == RaceStyle.TimeTrial || sps.totalRaces != 4){
	
	if(type == RaceStyle.GrandPrix)
	sps.nextTrack += 1;	
	
	if(type == RaceStyle.CustomRace){
	sps.nextTrack = -1;	
	transform.gameObject.AddComponent(Level_Select);
	yield;
	
	while(sps.nextTrack == -1){
	transform.GetComponent(Level_Select).hidden = false;
	yield;
	}
	
	Destroy(transform.GetComponent(Level_Select));
	}
	
	
	
	gd.BlackOut = true;
	yield WaitForSeconds(0.5);
	
	Debug.Log("SPRacers length:" + SPRacers.length);
	
	sps.RaceStarted = false;
	}else{
	
	SPRacers = sortArraybyPoint();
	
	if(type == RaceStyle.GrandPrix){
	for(i = 0; i < SPRacers.Length;i++){
	if(SPRacers[i].Human == true && SPRacers[i].HumanID == 0){
	Player1 = i;
	i = 13;
	}
	}
	
	if(Player1 == 0){
	
	if(SPRacers[Player1].points == 60){	
	if(sps.Difficulty == 0)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[50cc]","Perfect");
	if(sps.Difficulty == 1)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[100cc]","Perfect");
	if(sps.Difficulty == 2)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[150cc]","Perfect");
	if(sps.Difficulty == 3)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[Insane]","Perfect");
	}else if(gd.Tournaments[sps.nextCup].LastRank[sps.Difficulty] != "Perfect"){	
	if(sps.Difficulty == 0)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[50cc]","Gold");
	if(sps.Difficulty == 1)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[100cc]","Gold");
	if(sps.Difficulty == 2)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[150cc]","Gold");
	if(sps.Difficulty == 3)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[Insane]","Gold");
	}	
	
	}
	
	if(Player1 == 1){
	if(gd.Tournaments[sps.nextCup].LastRank[sps.Difficulty] != "Perfect" && gd.Tournaments[sps.nextCup].LastRank[sps.Difficulty] != "Gold"){	
	if(sps.Difficulty == 0)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[50cc]","Silver");
	if(sps.Difficulty == 1)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[100cc]","Silver");
	if(sps.Difficulty == 2)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[150cc]","Silver");
	if(sps.Difficulty == 3)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[Insane]","Silver");
	}	
	
	}
	
	if(Player1 == 2){
	if(gd.Tournaments[sps.nextCup].LastRank[sps.Difficulty] != "Perfect" && gd.Tournaments[sps.nextCup].LastRank[sps.Difficulty] != "Gold" && gd.Tournaments[sps.nextCup].LastRank[sps.Difficulty] != "Silver"){	
	if(sps.Difficulty == 0)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[50cc]","Bronze");
	if(sps.Difficulty == 1)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[100cc]","Bronze");
	if(sps.Difficulty == 2)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[150cc]","Bronze");
	if(sps.Difficulty == 3)
	PlayerPrefs.SetString(gd.Tournaments[sps.nextCup].Name+"[Insane]","Bronze");
	}	
	
	}
	}
	
	gd.BlackOut = true;
	yield WaitForSeconds(0.5);
	Debug.Log("You win!");
	Application.LoadLevel("WinScreen");
	yield WaitForSeconds(0.5);
	gd.BlackOut = false;
	
	}
	}
	
@RPC
function KartSpawn(viewID : NetworkViewID,pos : int, character : int, hat : int, kart : int, wheel : int,info : NetworkMessageInfo){

while(gd.BlackOut)
yield;

//Find Position to spawn racer
var SpawnPosition : Vector3;
var rot : Quaternion = td.PositionPoints[0].rep.rotation;

var x2 : Vector3 = rot*(Vector3.forward*(pos%3)*(td.Scale*1.5f)+(Vector3.forward*.75f*td.Scale));
var y2 : Vector3 = rot*(Vector3.right*(pos + 1)* td.Scale);

SpawnPosition = td.PositionPoints[0].rep.position + x2 + y2;  

var clone : Transform;
clone = Instantiate(gd.Karts[kart].Models[character],SpawnPosition,rot);
clone.tag = "Spectated";
clone.networkView.viewID = viewID;

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

clone.GetComponent(kartScript).locked = false;

SPRacers[pos] = new PlayerRacer();
SPRacers[pos].timer = new Timer();
SPRacers[pos].Character = character;
SPRacers[pos].Hat = hat;
SPRacers[pos].Kart = kart;
SPRacers[pos].Wheel = wheel;
}

	
	
//////////////////////////////////////////////////////////////////////////////////////////////Addiontal GUI Functions //////////////////////////////////////////////////////////////////////////////////////////////

function OutLineLabel(pos : Rect, text : String,Distance : float){
OutLineLabel(pos,text,Distance,Color.black);
}

function OutLineLabel(pos : Rect, text : String,Distance : float,Colour : Color){
Distance = Mathf.Clamp(Distance,1,Mathf.Infinity);

var style = new GUIStyle(GUI.skin.GetStyle("Special Label"));
style.normal.textColor = Colour;
GUI.Label(Rect(pos.x+Distance,pos.y,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x,pos.y+Distance,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x-Distance,pos.y,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x,pos.y-Distance,pos.width,pos.height),text,style);
var nstyle = new GUIStyle(GUI.skin.GetStyle("Special Label"));
nstyle.normal.textColor.a = Colour.a;
GUI.Label(pos,text,nstyle);

}

function OutLineLabel2(pos : Rect, text : String,Distance : float,Colour : Color){
Distance = Mathf.Clamp(Distance,1,Mathf.Infinity);

var style = new GUIStyle(GUI.skin.GetStyle("Label"));
style.normal.textColor = Colour;
GUI.Label(Rect(pos.x+Distance,pos.y,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x,pos.y+Distance,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x-Distance,pos.y,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x,pos.y-Distance,pos.width,pos.height),text,style);
var nstyle = new GUIStyle(GUI.skin.GetStyle("Label"));
nstyle.normal.textColor.a = Colour.a;
GUI.Label(pos,text,nstyle);

}

function WithinBounds(Area : Rect){

if(Input.mousePosition.x >= Area.x && Input.mousePosition.x <= Area.x + Area.width 
&&  Screen.height-Input.mousePosition.y >= Area.y &&  Screen.height-Input.mousePosition.y <= Area.y + Area.height)
return true;
else
return false;

}

    function isEmpty(timer : Timer){
    var foo1 = timer.Minute;
	var foo2 = timer.Second;
	var foo3 = timer.milliSecond;
	
    if(foo1 == 0 && foo2 == 0 && foo3 == 0)
    return true;
	else
    return false;
    
    }
    
function keyWait(){
yield WaitForSeconds(0.2);
keyLock = false;
}

class PlayerRacer {

var Human : boolean;
var HumanID : int = -1;

var Character : int;
var Hat : int;
var Kart : int;
var Wheel : int;

var rep : Transform;
var cameras : Transform;

var TotalDistance : int;
var NextDistance : float;
var timer : Timer;

var points : int;

//Networking Variables
var networkRep : NetworkPlayer;

}	