#pragma strict

private var currentSelection : int = 0;
private var largestcontrol : int;
private var controlLock : boolean;
private var controlCatch : boolean;

private var InputMethod : int = 0; // 0 - Mouse , 1 - Keyboard/Xbox

private var State : int = 0;
var LockControls : boolean;
private var PreviewTime : float = 0;
private var lastCup : int;

var currentCup : int;
var currentTrack : int;

function OnGUI () {

var gd = GameObject.Find("GameData").GetComponent(CurrentGameData);

GUI.skin = Resources.Load("GUISkins/Main Menu", GUISkin);

//Input Method Choosing///////////////////////////////////////////////////////////////////
if(Input.GetAxis("Mouse X")!= 0 || Input.GetAxis("Mouse Y")!= 0){
InputMethod = 0;
PlayerPrefs.SetInt("Input",0);
}

if(Input.GetAxis("Vertical") != 0 || Input.GetAxis("Horizontal") != 0 || Input.GetAxis("Submit") != 0 || Input.GetAxis("Cancel") != 0  ){
InputMethod = 1;
PlayerPrefs.SetInt("Input",1);
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

if(InputMethod == 0)
Screen.showCursor = true;
else
Screen.showCursor = false;

if(State == 0 ){ //Grand Prix Selector ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

var GUISize = Vector2(Screen.width/5f,((Screen.height/2f) -50) / 5f);
var GUIPos = Vector2((Screen.width-((Screen.width/5f)*4f))/2f,Screen.height/2.5f);
largestcontrol = gd.Tournaments.Length;

OutLineLabel(Rect(GUIPos.x-10,GUIPos.y - 35 ,GUISize.x,30),"Cups:",2);

for(var i : int = 0; i < gd.Tournaments.Length; i++){

if(gd.Tournaments[i].Icon != null)
GUI.DrawTexture(Rect(GUIPos.x -5 + GUISize.x,GUIPos.y + (10*i) + (i*GUISize.y),GUISize.y,GUISize.y),gd.Tournaments[i].Icon);

if(MultiButton(Rect(GUIPos.x -15,GUIPos.y + (10*i) + (i*GUISize.y),GUISize.x,GUISize.y),gd.Tournaments[i].Name,i,false)){
currentCup = i;
currentTrack = 0;
State = 1;
}

//Show Tracks and Video
OutLineLabel(Rect(GUIPos.x + (10*2) +(3*GUISize.x),GUIPos.y - 35,GUISize.x,GUISize.y),"Tracks:",2);
if(currentSelection == i){
if(lastCup != i){
PreviewTime = 0;
lastCup = i;
}

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

}

if(State == 1){ //Race Selector ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

GUISize = Vector2(Screen.width/5f,((Screen.height/2f) -50) / 5f);
GUIPos = Vector2((Screen.width-((Screen.width/5f)*4f))/2f,Screen.height/2.5f);
largestcontrol = gd.Tournaments[currentCup].Tracks.Length + 1;
for(i = 0; i < gd.Tournaments.Length; i++){
if(gd.Tournaments[i].Icon != null)
GUI.DrawTexture(Rect(GUIPos.x -5 + GUISize.x,GUIPos.y + (10*i) + (i*GUISize.y),GUISize.y,GUISize.y),gd.Tournaments[i].Icon);

if(currentCup == i)
GUI.Box(Rect(GUIPos.x -15,GUIPos.y + (10*i) + (i*GUISize.y),GUISize.x,GUISize.y),gd.Tournaments[i].Name,GUI.skin.GetStyle("ClosedSelectedBox"));
else
GUI.Box(Rect(GUIPos.x -15,GUIPos.y + (10*i) + (i*GUISize.y),GUISize.x,GUISize.y),gd.Tournaments[i].Name,GUI.skin.GetStyle("ClosedBox"));
}


OutLineLabel(Rect(GUIPos.x-10,GUIPos.y - 35 ,GUISize.x,30),"Cups:",2);
OutLineLabel(Rect(GUIPos.x + (10*2) +(3*GUISize.x),GUIPos.y - 35,GUISize.x,GUISize.y),"Tracks:",2);


for(i = 0; i < gd.Tournaments[currentCup].Tracks.Length; i++){
if(MultiButton(Rect(GUIPos.x -15 + (10*3) +(3*GUISize.x),GUIPos.y + (10*i) + (i*GUISize.y),GUISize.x,GUISize.y),gd.Tournaments[currentCup].Tracks[i].Name,i,false)){
currentTrack = i;
SendRPC();
}

if(i == currentSelection){
Width = Screen.width - (GUIPos.x -15) - GUISize.x - (GUIPos.x +5 + GUISize.x + GUISize.y) ;
Height = ((Screen.height/2f) -50);
GUI.DrawTexture(Rect(GUIPos.x +5 + GUISize.x + GUISize.y,GUIPos.y,Width,Height),gd.Tournaments[currentCup].Tracks[i].Preview);
if(gd.RaceState == 2)
GUI.Box(Rect(GUIPos.x +5 + GUISize.x + GUISize.y,GUIPos.y + Height + 10,Width,GUISize.y),gd.Tournaments[currentCup].Tracks[i].BestTrackTime.ToString());
}



}

if(MultiButton(Rect(GUIPos.x -15,GUIPos.y + (10*4) + (4*GUISize.y),GUISize.x,GUISize.y),"Cancel",gd.Tournaments[currentCup].Tracks.Length,true) || (Input.GetAxis("Cancel") != 0 && controlCatch == false)){
State = 0;
currentSelection = lastCup;
}

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

//Button//////////////////////////////////////////////////////////////////

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

function ButtonWait(){
yield WaitForSeconds(0.3);
controlLock = false;
}