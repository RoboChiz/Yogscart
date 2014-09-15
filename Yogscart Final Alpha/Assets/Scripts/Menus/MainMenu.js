#pragma strict

var State : int = 0;
var Textures : Texture2D[];

private var currentSelection : int = 0;
private var largestcontrol : int;
private var controlLock : boolean;
var controlCatch : boolean;

private var InputMethod : int = 0; // 0 - Mouse , 1 - Keyboard/Xbox
private var XboxDetected : boolean;

private var gd : CurrentGameData;
private var PreviewTime : float = 0;
private var lastCup : int;

private var www1 : WWW;
private var www2 : WWW;
private var Error : boolean = false;

var Version : String;

var LockControls : boolean;

var Flashing : boolean;
var LockedColourAlpha : Color = Color.red;

//Options
private var ScreenR : int;
private var FullScreen : boolean;
private var Quality : int;

private var QuickPlay : boolean;

//Network Stuff Manual Import Cause I'm lazy
var HS : Host_Script;
var CS : Client_Script;

function Awake() {
UpdateHosts();
}

function UpdateHosts(){
while(true){
MasterServer.RequestHostList("YogscartRace");
yield WaitForSeconds(5);
}
}

function Start(){
LockControls = true;
var url = "https://db.tt/N51AaMhM";
www1 = new WWW (url);
url = "https://db.tt/xObXxAS5";
www2 = new WWW (url);

gd = GameObject.Find("GameData").GetComponent(CurrentGameData);

InputMethod = PlayerPrefs.GetInt("Input",0);

if(gd.RaceState != -1){

if(gd.RaceState == 0)
State = 5;
if(gd.RaceState == 1 || gd.RaceState == 2)
State = 6;
}

LockedColourAlpha.a = 0;
for(var i : int = 0; i < Screen.resolutions.Length; i++){
if(Screen.resolutions[i] == Screen.currentResolution)
ScreenR = i;
}

FullScreen = Screen.fullScreen;

Quality = QualitySettings.GetQualityLevel();

yield www1;
yield www2;

gd.BlackOut = false;
LockControls = false;

if(!String.IsNullOrEmpty(www1.error) && !String.IsNullOrEmpty(www2.error))
Error = true;

}

function FlashRed(){
if(Flashing == false){

Flashing = true;

while(LockedColourAlpha.a < 1){
LockedColourAlpha.a += Time.deltaTime * 2;
yield;
}

while(LockedColourAlpha.a > 0){
LockedColourAlpha.a -= Time.deltaTime * 2;
yield;
}

Flashing = false;

}

}

function OnGUI () {

GUI.skin = Resources.Load("GUISkins/Main Menu", GUISkin);

//Xbox Detection
if(Input.GetJoystickNames().Length > 0){
XboxDetected = true;
}else{
XboxDetected = false;
}

//Input Method Choosing
if(State > 0){
if(Input.GetAxis("Mouse X")!= 0 || Input.GetAxis("Mouse Y")!= 0){
InputMethod = 0;
PlayerPrefs.SetInt("Input",0);
}

if(Input.GetAxis("Vertical") != 0 || Input.GetAxis("Horizontal") != 0 || Input.GetAxis("Submit") != 0 || Input.GetAxis("Cancel") != 0  ){
InputMethod = 1;
PlayerPrefs.SetInt("Input",1);
}
}


//Detect Inputs
if(!LockControls){
if(InputMethod == 1){

if(Input.GetAxis("Vertical")<0 && controlLock == false){

if(currentSelection < largestcontrol -1)
currentSelection += 1;
else
currentSelection = 0;

ButtonWait();
controlLock = true;

}
if(Input.GetAxis("Vertical")>0 && controlLock == false){

if(currentSelection > 0)
currentSelection -= 1;
else
currentSelection = largestcontrol -1;

ButtonWait();
controlLock = true;

}


}

if(Input.GetAxis("Submit") == 0 && Input.GetAxis("Cancel") == 0){
controlCatch = false;
}
}

var lvlcam = GameObject.Find("LevelCamera").GetComponent(Blur);

//Press Start
if(State <= 0){

if(lvlcam.blur > 0)
lvlcam.blur -= Time.deltaTime * 5;

var PSTextureWidth : float = Screen.width / 6f;
var ratio : float = PSTextureWidth/Textures[0].width;

if(XboxDetected)
GUI.DrawTexture(Rect(Screen.width/2f - ((Screen.width/3f)/2f),Screen.height * (3f/4f),Screen.width/3f,((Screen.width/3f)/Textures[0].width) * Textures[0].height),Textures[1]);
else
GUI.DrawTexture(Rect(Screen.width/2f - ((Screen.width/3f)/2f),Screen.height * (3f/4f),Screen.width/3f,((Screen.width/3f)/Textures[0].width) * Textures[0].height),Textures[0]);

if((Input.GetAxis("Submit") != 0 || Input.touchCount > 0) && controlCatch == false){
controlCatch = true;
State = 1;
}

}else{
if(lvlcam.blur < 3)
lvlcam.blur += Time.deltaTime * 5;
}

var GUIPos : Vector2;
var GUISize : Vector2;

if(State == 1){ //Menu ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

GUISize = Vector2(Screen.width/5f,((Screen.height/2f) -40) / 5f);
GUIPos = Vector2(Screen.width/2f - GUISize.x/2f,Screen.height/2.5f);
largestcontrol = 5;

if(MultiButton(Rect(GUIPos.x,GUIPos.y,GUISize.x,GUISize.y),"Single Player",0)){
State = 2;
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 10 + GUISize.y,GUISize.x,GUISize.y),"Multiplayer",1)){
State = 3;
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 20 + (2*GUISize.y),GUISize.x,GUISize.y),"Options",2)){
State = 4;
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 30 + (3*GUISize.y),GUISize.x,GUISize.y),"Credits",3,true)){
//State = 7;
FlashRed();
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 40 + (4*GUISize.y),GUISize.x,GUISize.y),"Quit",4,true))
Application.Quit();

if(Input.GetAxis("Cancel") != 0 && controlCatch == false)
State = 0;

}

if(State == 2){ //Single Player ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

GUISize = Vector2(Screen.width/5f,((Screen.height/2f) -50) / 5f);
GUIPos = Vector2(Screen.width/2f - GUISize.x/2f,Screen.height/2.5f);
largestcontrol = 5;
gd.RaceState = -1;

if(MultiButton(Rect(GUIPos.x,GUIPos.y,GUISize.x,GUISize.y),"Grand Prix",0,true)){
//State = 8;
//gd.RaceState = 0;
FlashRed();
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 10 + GUISize.y,GUISize.x,GUISize.y),"Single Race",1,true)){
//State = 8;
//gd.RaceState = 1;
FlashRed();
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 20 + (2*GUISize.y),GUISize.x,GUISize.y),"Time Trial",2,true)){
//State = 5;
//gd.RaceState = 2;
FlashRed();
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 30 + (3*GUISize.y),GUISize.x,GUISize.y),"Yogtowers Tour",3,true)){
//State = 7;
FlashRed();
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 40 + (4*GUISize.y),GUISize.x,GUISize.y),"Cancel",4) || (Input.GetAxis("Cancel") != 0 && controlCatch == false)){
State = 1;
}

}

if(State == 3){ //Multiplayer ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

GUISize = Vector2(Screen.width/5f,((Screen.height/2f) -50) / 5f);
GUIPos = Vector2(Screen.width/2f - GUISize.x/2f,Screen.height/2.5f);
largestcontrol = 5;
gd.RaceState = -1;

if(MultiButton(Rect(GUIPos.x,GUIPos.y,GUISize.x,GUISize.y),"Splitscreen",0,true)){
//State = 13;
FlashRed();
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 10 + GUISize.y,GUISize.x,GUISize.y),"Quick Race",1,true)){

var data : HostData[] = MasterServer.PollHostList();
if(data.Length > 0){
Network.Connect(data[0]);     
State = 11;
}
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 20 + (2*GUISize.y),GUISize.x,GUISize.y),"Connect to a Game",2)){
State = 9;
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 30 + (3*GUISize.y),GUISize.x,GUISize.y),"Host a Game",3)){
State = 10;
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 40 + (4*GUISize.y),GUISize.x,GUISize.y),"Cancel",4) || (Input.GetAxis("Cancel") != 0 && controlCatch == false)){
State = 1;
}

}

if(State == 4){ //Options ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
GUISize = Vector2(Screen.width/5f,((Screen.height/2f) -50) / 5f);
GUIPos = Vector2(Screen.width/2f - GUISize.x/2f,Screen.height/2.5f);
largestcontrol = 5;

OutLineLabel(Rect(GUIPos.x,GUIPos.y - 30,GUISize.x,30),"Resolution",2);

if(MultiButton(Rect(GUIPos.x,GUIPos.y,GUISize.x,GUISize.y),Screen.resolutions[ScreenR].width.ToString() + " x " + Screen.resolutions[ScreenR].height.ToString() ,0,true)){
if(ScreenR < Screen.resolutions.Length-1)
ScreenR += 1;
else
ScreenR = 0;
}

OutLineLabel(Rect(GUIPos.x,GUIPos.y + 10 + GUISize.y,GUISize.x,30),"Full Screen",2);

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 40 + GUISize.y,GUISize.x,GUISize.y),FullScreen.ToString(),1,true))
FullScreen = !FullScreen;

OutLineLabel(Rect(GUIPos.x,GUIPos.y + 50 + GUISize.y*2,GUISize.x,30),"Quality",2);

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 80 + GUISize.y*2,GUISize.x,GUISize.y),QualitySettings.names[Quality],2,true)){
if(Quality < QualitySettings.names.Length-1)
Quality += 1;
else
Quality = 0;
}


if(MultiButton(Rect(GUIPos.x,GUIPos.y + 30 + (4*GUISize.y),GUISize.x,GUISize.y),"Save changes and Exit",3)){
Screen.SetResolution(Screen.resolutions[ScreenR].width,Screen.resolutions[ScreenR].height,FullScreen);
QualitySettings.SetQualityLevel(Quality);
State = 1;
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 30 + (5*GUISize.y),GUISize.x,GUISize.y),"Don't Save changes and Exit",4) || (Input.GetAxis("Cancel") != 0 && controlCatch == false)){

for(var g : int = 0; g < Screen.resolutions.Length; g++){
if(Screen.resolutions[g] == Screen.currentResolution)
ScreenR = g;
g = Screen.resolutions.Length + 1;
}

FullScreen = Screen.fullScreen;
Quality = QualitySettings.GetQualityLevel();
State = 1;
}

}

if(State == 5 ){ //Grand Prix Selector ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

GUISize = Vector2(Screen.width/5f,((Screen.height/2f) -50) / 5f);
GUIPos = Vector2((Screen.width-((Screen.width/5f)*4f))/2f,Screen.height/2.5f);
largestcontrol = gd.Tournaments.Length + 1;

OutLineLabel(Rect(GUIPos.x-10,GUIPos.y - 35 ,GUISize.x,30),"Cups:",2);

for(var i : int = 0; i < gd.Tournaments.Length; i++){

if(gd.Tournaments[i].Icon != null)
GUI.DrawTexture(Rect(GUIPos.x -5 + GUISize.x,GUIPos.y + (10*i) + (i*GUISize.y),GUISize.y,GUISize.y),gd.Tournaments[i].Icon);

if(MultiButton(Rect(GUIPos.x -15,GUIPos.y + (10*i) + (i*GUISize.y),GUISize.x,GUISize.y),gd.Tournaments[i].Name,i)){
gd.currentCup = i;
gd.currentTrack = 0;
if(gd.RaceState != 0)
State = 6;
else{
LoadCharacterSelect();
}
}

//Show Tracks and Video
OutLineLabel(Rect(GUIPos.x + (10*2) +(3*GUISize.x),GUIPos.y - 35,GUISize.x,GUISize.y),"Tracks:",2);

if(currentSelection == i){
if(lastCup != i){
PreviewTime = 0;
lastCup = i;
}

largestcontrol = gd.Tournaments.Length + 1;

for(var j : int = 0; j < gd.Tournaments[i].Tracks.Length; j++){

//Render Preview
if(Mathf.RoundToInt((PreviewTime/20)) == j){
var Width : float = Screen.width - (GUIPos.x -15) - GUISize.x - (GUIPos.x +5 + GUISize.x + GUISize.y) ;
var Height : float = ((Screen.height/2f) -50);
GUI.DrawTexture(Rect(GUIPos.x +5 + GUISize.x + GUISize.y,GUIPos.y,Width,Height),gd.Tournaments[i].Tracks[j].Preview);
GUI.Box(Rect(GUIPos.x -15 + (10*3) +(3*GUISize.x),GUIPos.y + (10*j) + (j*GUISize.y),GUISize.x,GUISize.y),gd.Tournaments[i].Tracks[j].Name,GUI.skin.GetStyle("ClosedSelectedBox"));
}else
GUI.Box(Rect(GUIPos.x -15 + (10*3) +(3*GUISize.x),GUIPos.y + (10*j) + (j*GUISize.y),GUISize.x,GUISize.y),gd.Tournaments[i].Tracks[j].Name,GUI.skin.GetStyle("ClosedBox"));

}

if(gd.RaceState == 0){
GUI.Box(Rect(GUIPos.x +5 + GUISize.x + GUISize.y,GUIPos.y + Height + 10,Width,GUISize.y),gd.Tournaments[i].LastRank[gd.Difficulty]);
}

}

if(gd.Tournaments[i].Tracks.Length != 0){
if((PreviewTime/20)<gd.Tournaments[i].Tracks.Length-1)
PreviewTime += Time.deltaTime;
else
PreviewTime = 0;
}
}

if(MultiButton(Rect(GUIPos.x -15,GUIPos.y + (10*4) + (4*GUISize.y),GUISize.x,GUISize.y),"Cancel",gd.Tournaments.Length) || (Input.GetAxis("Cancel") != 0 && controlCatch == false)){
if(gd.RaceState != 2)
State = 8;
else
State = 2;

controlCatch = true;
}

}

if(State == 6){ //Race Selector ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

GUISize = Vector2(Screen.width/5f,((Screen.height/2f) -50) / 5f);
GUIPos = Vector2((Screen.width-((Screen.width/5f)*4f))/2f,Screen.height/2.5f);
largestcontrol = gd.Tournaments[gd.currentCup].Tracks.Length + 1;
for(i = 0; i < gd.Tournaments.Length; i++){
if(gd.Tournaments[i].Icon != null)
GUI.DrawTexture(Rect(GUIPos.x -5 + GUISize.x,GUIPos.y + (10*i) + (i*GUISize.y),GUISize.y,GUISize.y),gd.Tournaments[i].Icon);

if(gd.currentCup == i)
GUI.Box(Rect(GUIPos.x -15,GUIPos.y + (10*i) + (i*GUISize.y),GUISize.x,GUISize.y),gd.Tournaments[i].Name,GUI.skin.GetStyle("ClosedSelectedBox"));
else
GUI.Box(Rect(GUIPos.x -15,GUIPos.y + (10*i) + (i*GUISize.y),GUISize.x,GUISize.y),gd.Tournaments[i].Name,GUI.skin.GetStyle("ClosedBox"));
}


OutLineLabel(Rect(GUIPos.x-10,GUIPos.y - 35 ,GUISize.x,30),"Cups:",2);
OutLineLabel(Rect(GUIPos.x + (10*2) +(3*GUISize.x),GUIPos.y - 35,GUISize.x,GUISize.y),"Tracks:",2);


for(i = 0; i < gd.Tournaments[gd.currentCup].Tracks.Length; i++){
if(MultiButton(Rect(GUIPos.x -15 + (10*3) +(3*GUISize.x),GUIPos.y + (10*i) + (i*GUISize.y),GUISize.x,GUISize.y),gd.Tournaments[gd.currentCup].Tracks[i].Name,i)){
gd.currentTrack = i;
if(gd.RaceState != 1)
LoadCharacterSelect();
}

if(i == currentSelection){
Width = Screen.width - (GUIPos.x -15) - GUISize.x - (GUIPos.x +5 + GUISize.x + GUISize.y) ;
Height = ((Screen.height/2f) -50);
GUI.DrawTexture(Rect(GUIPos.x +5 + GUISize.x + GUISize.y,GUIPos.y,Width,Height),gd.Tournaments[gd.currentCup].Tracks[i].Preview);
if(gd.RaceState == 2)
GUI.Box(Rect(GUIPos.x +5 + GUISize.x + GUISize.y,GUIPos.y + Height + 10,Width,GUISize.y),gd.Tournaments[gd.currentCup].Tracks[i].BestTrackTime.ToString());
}



}

if(MultiButton(Rect(GUIPos.x -15,GUIPos.y + (10*4) + (4*GUISize.y),GUISize.x,GUISize.y),"Cancel",gd.Tournaments[gd.currentCup].Tracks.Length) || (Input.GetAxis("Cancel") != 0 && controlCatch == false)){
State = 5;
}

}

if(State == 7){ //Yogtowers ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}

if(State == 8 ){ //Difficulty Picking////////////////////////////////////////////////////////////////////////////////////////////////////
GUISize = Vector2(Screen.width/5f,((Screen.height/2f) -50) / 5f);
GUIPos = Vector2((Screen.width-((Screen.width/5f)*4f))/2f,Screen.height/2.5f);

var InsaneUnlocked : boolean = true;
for(var t : int = 0; t < gd.Tournaments.Length; t++){
if(gd.Tournaments[t].LastRank[2] == "No Rank")
InsaneUnlocked = false;
}

if(InsaneUnlocked)
largestcontrol = 5;
else
largestcontrol = 4;

OutLineLabel(Rect(GUIPos.x,GUIPos.y-40,GUISize.x,30),"Difficulty",2);

if(MultiButton(Rect(GUIPos.x,GUIPos.y,GUISize.x,GUISize.y),"50cc",0)){
gd.Difficulty = 0;
State = 5;
}

if(currentSelection == 0)
OutLineLabel(Rect(GUIPos.x + GUISize.x + 10,GUIPos.y + GUISize.y/4,GUISize.x*2,GUISize.y),"Only for little babby!",2);

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 10 + GUISize.y,GUISize.x,GUISize.y),"100cc",1)){
gd.Difficulty = 1;
State = 5;
}

if(currentSelection == 1)
OutLineLabel(Rect(GUIPos.x + GUISize.x + 10,GUIPos.y + 10 + GUISize.y + GUISize.y/4,GUISize.x*2,GUISize.y),"You mother trucker!",2);

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 20 + (2*GUISize.y),GUISize.x,GUISize.y),"150cc",2)){
gd.Difficulty = 2;
State = 5;
}

if(currentSelection == 2)
OutLineLabel(Rect(GUIPos.x + GUISize.x + 10,GUIPos.y + 20 + (2*GUISize.y) + GUISize.y/4,GUISize.x*2,GUISize.y),"Oh, what big strong muscles ...",2);

if(InsaneUnlocked){
if(MultiButton(Rect(GUIPos.x,GUIPos.y + 30 + (3*GUISize.y),GUISize.x,GUISize.y),"Insane",3)){
gd.Difficulty = 3;
State = 5;
}

if(currentSelection == 3)
OutLineLabel(Rect(GUIPos.x + GUISize.x + 10,GUIPos.y + 30 + (3*GUISize.y) + GUISize.y/4,GUISize.x*2,GUISize.y),"Prepare your butts!",2);

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 40 + (4*GUISize.y),GUISize.x,GUISize.y),"Cancel",4) || (Input.GetAxis("Cancel") != 0 && controlCatch == false))
State = 2;

}else{

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 30 + (3*GUISize.y),GUISize.x,GUISize.y),"Cancel",3) || (Input.GetAxis("Cancel") != 0 && controlCatch == false))
State = 2;
}

}

if(State == 9){ //Join a Game Screen ///////////////////////////////////////////////////////////////////////////////////////////////////////////

GUISize = Vector2(Screen.width/5f,((Screen.height/2f) -50) / 5f);
GUIPos = Vector2(Screen.width/2f - GUISize.x/2f,Screen.height/2.5f);
largestcontrol = 2;
gd.RaceState = -1;

GUI.skin.label.fontSize = 15;

GUI.Label(Rect(GUIPos.x,GUIPos.y + 40 ,GUISize.x,GUISize.y/2),"IP Address:");
NetworkIP = GUI.TextField(Rect(GUIPos.x,GUIPos.y + 40 + (0.5*GUISize.y),GUISize.x,GUISize.y/2),NetworkIP);

var NetworkPortString : String;

GUI.Label(Rect(GUIPos.x,GUIPos.y + 40 + (1*GUISize.y),GUISize.x,GUISize.y/2),"Port:");
NetworkPortString = GUI.TextField(Rect(GUIPos.x,GUIPos.y + 40 + (1.5*GUISize.y),GUISize.x,GUISize.y/2),NetworkPort.ToString());

int.TryParse(NetworkPortString,NetworkPort); 

GUI.Label(Rect(GUIPos.x,GUIPos.y + 40 + (2*GUISize.y),GUISize.x,GUISize.y/2),"Password:");
NetworkPassword = GUI.TextField(Rect(GUIPos.x,GUIPos.y + 40 + (2.5*GUISize.y),GUISize.x,GUISize.y/2),NetworkPassword);


GUI.skin.label.fontSize = 27;

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 40 + (3*GUISize.y),GUISize.x,GUISize.y),"Join",0,true)){

if(NetworkPassword == "" || NetworkPassword == null)
Network.Connect(NetworkIP, NetworkPort);
else
Network.Connect(NetworkIP, NetworkPort,NetworkPassword);

State = 11;
}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 40 + (4*GUISize.y),GUISize.x,GUISize.y),"Cancel",1) || (Input.GetAxis("Cancel") != 0 && controlCatch == false)){
State = 3;
}


}

if(State == 10){ //Host a Game Screen ///////////////////////////////////////////////////////////////////////////////////////////////////////////

GUISize = Vector2(Screen.width/5f,((Screen.height/2f) -50) / 5f);
GUIPos = Vector2(Screen.width/2f - GUISize.x/2f,Screen.height/3f);
largestcontrol = 2;
gd.RaceState = -1;

GUI.skin.label.fontSize = 15;

var HostPortString : String;
GUI.Label(Rect(GUIPos.x,GUIPos.y,GUISize.x,GUISize.y/2),"Port:");
HostPortString = GUI.TextField(Rect(GUIPos.x,GUIPos.y + (0.5*GUISize.y),GUISize.x,GUISize.y/2),HostPort.ToString());
int.TryParse(HostPortString,HostPort); 

GUI.Label(Rect(GUIPos.x,GUIPos.y + 10 + (1*GUISize.y),GUISize.x,GUISize.y/2),"Password:");
HostPassword = GUI.TextField(Rect(GUIPos.x,GUIPos.y + 10 + (1.5*GUISize.y),GUISize.x,GUISize.y/2),HostPassword);

WithBots = GUI.Toggle(Rect(GUIPos.x,GUIPos.y + 10 + (2.3*GUISize.y),GUISize.x,GUISize.y/2),WithBots," Fill spaces with Bots: ");

Automatic = GUI.Toggle(Rect(GUIPos.x,GUIPos.y + 10 + (2.7*GUISize.y),GUISize.x,GUISize.y/2),Automatic," Automatic Server: ");

QuickPlay = GUI.Toggle(Rect(GUIPos.x,GUIPos.y + 10 + (3.1*GUISize.y),GUISize.x,GUISize.y/2),QuickPlay,"Main Server?"); //Use for main sevrer's only
//conscious = GUI.Toggle(Rect(GUIPos.x,GUIPos.y + 10 + (3.1*GUISize.y),GUISize.x,GUISize.y/2),conscious,"Host Playing:"); //Use for main sevrer's only

if(Automatic == true){

GUI.Label(Rect(GUIPos.x,GUIPos.y + 10 + (3.2*GUISize.y),GUISize.x,GUISize.y),"Minimum Players required to advance: " + MinPlayers.ToString());
MinPlayers = GUI.HorizontalSlider(Rect(GUIPos.x,GUIPos.y + (4*GUISize.y),GUISize.x,GUISize.y/2),MinPlayers,1,12);

}

GUI.skin.label.fontSize = 27;

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 40 + (4*GUISize.y),GUISize.x,GUISize.y),"Start Server",0,true)){

gd.BlackOut = true;

StartServer();

}

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 40 + (5*GUISize.y),GUISize.x,GUISize.y),"Cancel",1) || (Input.GetAxis("Cancel") != 0 && controlCatch == false)){
State = 3;
}

}

if(State == 11){

GUISize = Vector2(Screen.width/3f,((Screen.height/2f) -50) / 3f);
GUIPos = Vector2(Screen.width/2f - GUISize.x/2f,Screen.height/3f);
largestcontrol = 0;

OutLineLabel(Rect(GUIPos.x,GUIPos.y + 40 + (1*GUISize.y),GUISize.x,GUISize.y),"Connecting... ",1);

}

if(State == 12){

GUISize = Vector2(Screen.width/3f,((Screen.height/2f) -50) / 3f);
GUIPos = Vector2(Screen.width/2f - GUISize.x/2f,Screen.height/3f);
largestcontrol = 1;

OutLineLabel(Rect(GUIPos.x,GUIPos.y + 40 + (1*GUISize.y),GUISize.x,GUISize.y),"Can't connect to Server! " + errorText,1);

if(MultiButton(Rect(GUIPos.x,GUIPos.y + 40 + (2*GUISize.y),GUISize.x,GUISize.y),"Cancel",0) || (Input.GetAxis("Cancel") != 0 && controlCatch == false)){
errorText = "";
State = 9;
}

}

if(State == 13){//SplitScreen Input Setup
GUISize = Vector2(Screen.width/5f,((Screen.height/2f) -50) / 5f);
GUIPos = Vector2(Screen.width/2f - GUISize.x/2f,Screen.height/2.5f);
largestcontrol = 0;

//Render Inputs
for(var f : int = 0; f < Inputs.Length; f++){

var InputTexture : Texture2D;
InputTexture = Resources.Load("UI Textures/Main Menu/Inputs/" + f.ToString(),Texture2D);

GUI.DrawTexture(Rect(GUIPos.x + (i*(GUISize.x/Inputs.Length)),GUIPos.y,(GUISize.x/Inputs.Length),GUISize.y),InputTexture);

}

if(Input.GetAxis("Submit") != 0){
var copy = new Array();

if(Inputs != null)
copy = Inputs;

//if(Input.
//copy.Push();

Inputs = copy;

}


}

if(Input.GetAxis("Cancel") != 0 && controlCatch == false){
controlCatch = true;
}

OutLineLabel(Rect(10,Screen.height - 65,Screen.width - 20,34),"[Locked]",2,LockedColourAlpha);

//Update Version
if(www1.isDone == false)
OutLineLabel(Rect(10,Screen.height - 35,Screen.width - 20,34),Version + " [Checking]",2);
else if(Error)
OutLineLabel(Rect(10,Screen.height - 35,Screen.width - 20,34),Version + " [NO Internet Connection]",2);
else if(Version == www1.text)
OutLineLabel(Rect(10,Screen.height - 35,Screen.width - 20,34),www1.text,2);
else
OutLineLabel(Rect(10,Screen.height - 35,Screen.width - 20,34),Version + " [UPDATE AVAILABLE]",2);

}

private var Inputs : int[];

//Network Holding
var NetworkIP : String = "127.0.0.1";
var NetworkPort : int = 25000;
var NetworkPassword : String;

var HostPort : int = 25000;
var HostPassword : String;
var WithBots : boolean;
var Automatic : boolean;
var conscious : boolean = true;

var MinPlayers : int;

function StartServer(){

yield WaitForSeconds(0.6);

if(HostPassword != "" || HostPassword != null)
Network.incomingPassword = HostPassword;

var useNat = !Network.HavePublicAddress();
Network.InitializeServer(12, 25000, true);
if(conscious == false || QuickPlay == true)
MasterServer.RegisterHost("YogscartRace", "Surprise Server", "Best game ever!");

HS.Bots = WithBots;
HS.Automatic = Automatic;
HS.MinPlayers = MinPlayers;
HS.conscious = conscious;
HS.enabled = true;

if(WithBots){

for(var i : int = 0; i < 12; i++){
var BotRacer = new Racer();
BotRacer.Human = false;
BotRacer.id = i.ToString();
HS.AddRacer(BotRacer);
}

}

if(conscious == true){
var MyRacer = new Racer();
MyRacer.Human = true;
MyRacer.access = Network.player;

HS.AddRacer(MyRacer);
}

Application.LoadLevel("Lobby");

gd.BlackOut = false;

}

//OTHER STUFF////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function ButtonWait(){
yield WaitForSeconds(0.3);
controlLock = false;
}

//GUI Button Replacement
function OutLineLabel(pos : Rect, text : String,Distance : float){
Distance = Mathf.Clamp(Distance,1,Mathf.Infinity);

var style = new GUIStyle(GUI.skin.GetStyle("label"));
style.normal.textColor = Color.black;
GUI.Label(Rect(pos.x+Distance,pos.y,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x,pos.y+Distance,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x-Distance,pos.y,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x,pos.y-Distance,pos.width,pos.height),text,style);

GUI.Label(pos,text);

}

function OutLineLabel(pos : Rect, text : String,Distance : float,Colour : Color){
Distance = Mathf.Clamp(Distance,1,Mathf.Infinity);

var style = new GUIStyle(GUI.skin.GetStyle("label"));
style.normal.textColor = Colour;
GUI.Label(Rect(pos.x+Distance,pos.y,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x,pos.y+Distance,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x-Distance,pos.y,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x,pos.y-Distance,pos.width,pos.height),text,style);
var nstyle = new GUIStyle(GUI.skin.GetStyle("label"));
nstyle.normal.textColor.a = Colour.a;
GUI.Label(pos,text,nstyle);

}

function MultiButton(pos : Rect, text : String, place : int){

if(largestcontrol > 0){

if(InputMethod == 0){
if(Input.mousePosition.x > pos.x && Screen.height-Input.mousePosition.y > pos.y && Input.mousePosition.x < pos.x + pos.width && Screen.height-Input.mousePosition.y <  pos.y + pos.height){
currentSelection = place;
}

if(GUI.Button(pos,text)){
currentSelection = 0;
return true;
}else{
return false;
}

}

if(InputMethod == 1){

if(currentSelection == place){
GUI.Box(pos,text,GUI.skin.GetStyle("SelectedBox"));

if(Input.GetAxis("Submit") != 0 && controlCatch == false){
controlCatch = true;
currentSelection = 0;
return true;
}

}else
GUI.Box(pos,text);

}

}
return false;
}

function MultiButton(pos : Rect, text : String, place : int, dontreset : boolean){

if(largestcontrol > 0){

if(InputMethod == 0){
if(Input.mousePosition.x > pos.x && Screen.height-Input.mousePosition.y > pos.y && Input.mousePosition.x < pos.x + pos.width && Screen.height-Input.mousePosition.y <  pos.y + pos.height){
currentSelection = place;
}

if(GUI.Button(pos,text)){
currentSelection = 0;
return true;
}else{
return false;
}

}

if(InputMethod == 1){

if(currentSelection == place){
GUI.Box(pos,text,GUI.skin.GetStyle("SelectedBox"));

if(Input.GetAxis("Submit") != 0 && controlCatch == false){
controlCatch = true;
return true;
}

}else
GUI.Box(pos,text);

}

}
return false;
}

function LoadCharacterSelect(){
State = -1;
}


function OnConnectedToServer() {
CS.enabled = true;
CS.StartConnectionStuff();
}

var errorText : String;

function OnFailedToConnect(error: NetworkConnectionError) {
		errorText = error.ToString();
		State = 12;
	}

