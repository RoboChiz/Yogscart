#pragma strict

private var currentCup : int;
private var currentTrack : int;
private var gd : CurrentGameData;

private var controlLock : boolean;
private var stickLockH : boolean;
private var stickLockV : boolean;

var TypeSelecion : boolean;

var hidden : boolean = true;

function Awake(){
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
}

function OnGUI () {

if(hidden == false){
//Do Input
if(Input.GetAxis("Vertical") != 0 && stickLockV == false){
stickLockV = true; 
ButtonWaitV();
TypeSelecion = !TypeSelecion;
} 

if(TypeSelecion){ //Track Selection

if(Input.GetAxis("Horizontal") != 0 && stickLockH == false){
currentTrack += Mathf.Sign(Input.GetAxis("Horizontal"));
if(currentTrack < 0)
currentTrack = 3;

if(currentTrack > 3)
currentTrack = 0;

stickLockH = true; 
ButtonWaitH();
} 

if(Input.GetAxis("Submit") != 0 && controlLock == false){
controlLock = true;
Finished();
}

}else{

if(Input.GetAxis("Horizontal") != 0 && stickLockH == false){
currentCup += Mathf.Sign(Input.GetAxis("Horizontal"));
if(currentCup < 0)
currentCup = gd.Tournaments.Length-1;

if(currentCup >= gd.Tournaments.Length)
currentCup = 0;

stickLockH = true; 
ButtonWaitH();
}

}

//Get Textures
var LevelHolder : Texture2D = Resources.Load("UI Textures/Level Selection/LevelHolder",Texture2D);
var Selected : Texture2D = Resources.Load("UI Textures/Level Selection/Selected",Texture2D);
var Tab : Texture2D = Resources.Load("UI Textures/Level Selection/Tab",Texture2D);
var SelectedTab : Texture2D = Resources.Load("UI Textures/Level Selection/SelectedTab",Texture2D);
var levelTab : Texture2D = Resources.Load("UI Textures/Level Selection/level_label",Texture2D);
//Get Width/Ratio/Height of Level Holder
var Width : float = Screen.width-150;
var Ratio : float = Width/LevelHolder.width;
var Height : int = LevelHolder.height * Ratio;

//Render Tracks
for(var j : int = 0; j < gd.Tournaments[currentCup].Tracks.Length; j++){
var OverallRect : Rect = Rect(75 + ((j+1)*14.5f*Ratio) + (j*238f*Ratio),Screen.height/2f + (16f*Ratio),239f*Ratio,210f*Ratio);

GUI.DrawTexture(OverallRect,gd.Tournaments[currentCup].Tracks[j].Logo);

//GUI.DrawTexture(OverallRect,levelTab);
if(TypeSelecion && currentTrack == j)
GUI.DrawTexture(OverallRect,Selected);

if(WithinBounds(OverallRect)){
currentTrack = j;
TypeSelecion = true;
}

}

if(Input.GetAxis("Fire1") != 0 && controlLock == false){
controlLock = true;
Finished();
}


//Render Tournaments
var TabSize : int = (Width-20-(gd.Tournaments.Length*10))/gd.Tournaments.Length;
TabSize = Mathf.Clamp(TabSize,0,(Width-20-(12*10))/12);

for(var i : int = 0; i < gd.Tournaments.Length; i++){
var TRect : Rect = Rect(85 + (i*10) + (i*TabSize),Screen.height/2f - TabSize,TabSize,TabSize);

if(currentCup == i && !TypeSelecion)
GUI.DrawTexture(TRect,SelectedTab);
else
GUI.DrawTexture(TRect,Tab);

GUI.DrawTexture(TRect,gd.Tournaments[i].Icon);

if(WithinBounds(TRect)){
TypeSelecion = false;
}

if(Input.GetAxis("Fire1") != 0 && WithinBounds(TRect))
currentCup = i;
}

//Render level holder
var LHRect : Rect = Rect(75,Screen.height/2,Width,Height);
GUI.DrawTexture(LHRect,LevelHolder);
}
}

function Finished(){
if(Network.isServer == true || Network.isClient == true){
SendRPC();
}

}

function SendRPC(){
Debug.Log("Send me a RPC");

if(Network.isClient == true)
networkView.RPC ("LevelChoose",RPCMode.Server,currentCup,currentTrack);
else
transform.GetComponent(Host_Script).LevelChoose(currentCup,currentTrack);

transform.GetComponent(VotingScreen).hidden = false;

Destroy(this);
}


function WithinBounds(Area : Rect){

if(Input.mousePosition.x >= Area.x && Input.mousePosition.x <= Area.x + Area.width 
&&  Screen.height-Input.mousePosition.y >= Area.y &&  Screen.height-Input.mousePosition.y <= Area.y + Area.height)
return true;
else
return false;

}


function ButtonWait(){
yield WaitForSeconds(0.5);
controlLock = false;
}

function ButtonWaitH(){
yield WaitForSeconds(0.5);
stickLockH = false;
}

function ButtonWaitV(){
yield WaitForSeconds(0.5);
stickLockV = false;
}
