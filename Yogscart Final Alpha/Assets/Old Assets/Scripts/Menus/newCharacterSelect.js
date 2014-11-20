#pragma strict

var state : int;

var cursorSpeed : float = 2.5;
var rotSpeed : float = 15;

var Platforms : Transform[];

var hidden : boolean;

private var choice : LoadOut[];
private var ready : boolean[];
private var kartSelected : boolean[];
private var cursorPosition : Vector2[];

private var inputLock : boolean[];
private var submitinputLock : boolean[];
private var choicesPerColumn : int;

private var loadedCharacter : int[];
private var loadedHat : int[];
private var loadedKart : int[];
private var loadedWheel : int[];
private var loadedModels : Transform[];

private var gd : CurrentGameData;

function Start () {

choice = new LoadOut[4];
loadedModels = new Transform[4];

ResetEverything();

for(var i : int = 0; i < 4;i++){
choice[i] = new LoadOut();
submitinputLock[i] = true;

loadedCharacter[i] = -1;
loadedHat[i] = -1;
loadedKart[i] = -1;
loadedWheel[i] = -1;

}

state = 0;

yield WaitForSeconds(0.5);

}

function FixedUpdate(){
if(!hidden){

for(var i : int = 0;i < gd.pcn.Length;i++){

if(state == 0){

if(loadedCharacter[i] != choice[i].character){

var oldRot0 : Quaternion;

if(loadedModels[i] != null){
oldRot0 = loadedModels[i].rotation;
Destroy(loadedModels[i].gameObject);
}else
oldRot0 = Quaternion.identity;

if(gd.Characters[choice[i].character].Unlocked == true){
loadedModels[i] = Instantiate(gd.Characters[choice[i].character].CharacterModel_Standing,Platforms[i].FindChild("Spawn").position,oldRot0);
loadedModels[i].rigidbody.isKinematic = true;
}

loadedCharacter[i] = choice[i].character;

}

if(loadedModels[i] != null)
loadedModels[i].Rotate(Vector3.up,-Input.GetAxis(gd.pcn[i]+"Rotate") * Time.fixedDeltaTime * rotSpeed);

}

if(state == 1){

if(loadedHat[i] != choice[i].hat){

var oldRot1 : Quaternion = loadedModels[i].rotation;

if(loadedModels[i] != null)
Destroy(loadedModels[i].gameObject);

loadedModels[i] = Instantiate(gd.Characters[choice[i].character].CharacterModel_Standing,Platforms[i].FindChild("Spawn").position,oldRot1);
loadedModels[i].rigidbody.isKinematic = true;

if(gd.Hats[choice[i].hat].Unlocked == true && gd.Hats[choice[i].hat].Model != null){

var HatObject = Instantiate(gd.Hats[choice[i].hat].Model,loadedModels[i].position,Quaternion.identity);

if(loadedModels[i].GetComponent(QA).objects[0] != null){
HatObject.position = loadedModels[i].GetComponent(QA).objects[0].position;
HatObject.rotation = loadedModels[i].GetComponent(QA).objects[0].rotation;
HatObject.parent = loadedModels[i].GetComponent(QA).objects[0];

}
}

loadedHat[i] = choice[i].hat;

}

if(loadedModels[i] != null)
loadedModels[i].Rotate(Vector3.up,-Input.GetAxis(gd.pcn[i]+"Rotate") * Time.fixedDeltaTime * rotSpeed);

}

if(state == 2){

if(loadedKart[i] != choice[i].kart || loadedWheel[i] != choice[i].wheel){

if(loadedModels[i] != null){
var oldRot2 : Quaternion = loadedModels[i].rotation;
Destroy(loadedModels[i].gameObject);
}

var km = gd.transform.GetComponent(KartMaker);

loadedModels[i] = km.SpawnKart(KartType.Display,choice[i].kart,choice[i].wheel,choice[i].character,choice[i].hat);

loadedModels[i].position = Platforms[i].FindChild("Spawn").position + Vector3.up;
loadedModels[i].rotation = oldRot2;

loadedKart[i] = choice[i].kart;
loadedWheel[i] = choice[i].wheel;

}

if(loadedModels[i] != null)
loadedModels[i].Rotate(Vector3.up,-Input.GetAxis(gd.pcn[i]+"Rotate") * Time.fixedDeltaTime * rotSpeed);

}

}
}

var oldRect : Vector4;
var newRect : Vector4;
var nRect : Vector4;
var cam : Camera;

//Default off screen
if(gd.pcn.Length == 0 || hidden){
cam = Platforms[0].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(1.5,0,oldRect.z,oldRect.w);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);
}

if(gd.pcn.Length <= 1 || hidden){
cam = Platforms[1].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(1.5,0,oldRect.z,oldRect.w);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);
}

if(gd.pcn.Length <= 2 || hidden){
cam = Platforms[2].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(1.5,0,oldRect.z,oldRect.w);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);
}

if(gd.pcn.Length <= 3 || hidden){
cam = Platforms[3].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(1.5,0,oldRect.z,oldRect.w);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);
}

if(!hidden){

if(gd.pcn.Length == 1){

cam = Platforms[0].FindChild("Camera").camera;

oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(0.5,0,0.5,1);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);

}

if(gd.pcn.Length == 2){

cam = Platforms[0].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(0.5,0.5,0.5,0.5);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);

cam = Platforms[1].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(0.5,0,0.5,0.5);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);


}



if(gd.pcn.Length == 3){

cam = Platforms[0].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(0.5,0.5,0.25,0.5);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);

cam = Platforms[1].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(0.75,0.5,0.25,0.5);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);

cam = Platforms[2].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(0.5,0,0.25,0.5);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);

}

if(gd.pcn.Length == 4){

cam = Platforms[0].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(0.5,0.5,0.25,0.5);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);

cam = Platforms[1].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(0.75,0.5,0.25,0.5);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);

cam = Platforms[2].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(0.5,0,0.25,0.5);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);

cam = Platforms[3].FindChild("Camera").camera;
oldRect = Vector4(cam.rect.x,cam.rect.y,cam.rect.width,cam.rect.height);
newRect = Vector4(0.75,0,0.25,0.5);
nRect = Vector4.Lerp(oldRect,newRect,Time.deltaTime*5f);
cam.rect = Rect(nRect.x,nRect.y,nRect.z,nRect.w);

}
}

}

function OnGUI () {
if(!hidden){

GUI.skin = Resources.Load("GUISkins/Main Menu",GUISkin);

var stateTexture : Texture2D;

var iconWidth : float = (Screen.width/2f)/5;

var Heightratio : float = ((Screen.width/3f)/1000f)*200f;

var BoardTexture = Resources.Load("UI Textures/GrandPrix Positions/Backing2",Texture2D);
var BoardHeight : float = iconWidth*6f + 10;
var BoardRect = Rect(10,Screen.height/2f - BoardHeight/2f + Heightratio,iconWidth*5f + 20 ,BoardHeight - Heightratio);
var startHeight = Screen.height/2f - BoardHeight/2f + 10 + Heightratio;

GUI.DrawTexture(BoardRect,BoardTexture);

if(gd.pcn.Length == 0)
for(var g : int = 0; g < 4;g++)
submitinputLock[g] = true;

if(state == 0){ //Character Select

if(gd.type != RaceStyle.TimeTrial && gd.type != RaceStyle.Online){
gd.allowedToChange = true;
}else{
gd.allowedToChange = false;
while(gd.pcn.Length > 1)
gd.RemoveController(gd.pcn[1]);
}

stateTexture = Resources.Load("UI Textures/New Character Select/char",Texture2D);

var characterCounter : int;

for(var i : int = 0; i < choicesPerColumn;i++){
for(var j : int = 0; j < 5;j++){

if((i*5) + j < gd.Characters.Length){

var iconRect : Rect = Rect(20 + (j*iconWidth),startHeight + (i*iconWidth),iconWidth,iconWidth);

var icon : Texture2D;
if(gd.Characters[characterCounter].Unlocked == true)
icon = gd.Characters[characterCounter].Icon;
else
icon = Resources.Load("UI Textures/Character Icons/question_mark",Texture2D);

GUI.DrawTexture(iconRect,icon);

characterCounter += 1;

}else{
break;
}

}
}

//Render Cursor
for(var c : int = 0; c < gd.pcn.Length;c++){

if(Input.GetAxis(gd.pcn[c] + "Submit") == 0 && Input.GetAxis(gd.pcn[c] + "Cancel") == 0 )
submitinputLock[c] = false;

var selectedchar = choice[c].character;

var CharacterSelection : Vector2 = Vector2(selectedchar%5,selectedchar/5);

cursorPosition[c] = Vector2.Lerp(cursorPosition[c],CharacterSelection,Time.deltaTime*cursorSpeed);

var CursorRect : Rect = Rect(20 + cursorPosition[c].x * iconWidth,startHeight + cursorPosition[c].y * iconWidth,iconWidth,iconWidth);
var CursorTexture : Texture2D = Resources.Load("UI Textures/Cursors/Cursor_"+c,Texture2D);
GUI.DrawTexture(CursorRect,CursorTexture);


//Get new Input
if(ready[c] == false){
if(Input.GetAxis(gd.pcn[c] + "Horizontal") != 0 && inputLock[c] == false){

inputLock[c] = true;

var hinput = Mathf.Sign(Input.GetAxis(gd.pcn[c] + "Horizontal"));

var iconsInRow : int;
if((CharacterSelection.y+1)*5 <= gd.Characters.length)
iconsInRow = 5;
else
iconsInRow = (gd.Characters.Length-(CharacterSelection.y*5));

if(choice[c].character+hinput < (CharacterSelection.y*5) + iconsInRow && choice[c].character+hinput >= (CharacterSelection.y*5))
choice[c].character += hinput;
else{

if(choice[c].character+hinput >= (CharacterSelection.y*5))
choice[c].character = (CharacterSelection.y)*5;
else
choice[c].character = (CharacterSelection.y)*5 + iconsInRow - 1;

}

}

if(Input.GetAxis(gd.pcn[c] + "Vertical") != 0 && inputLock[c] == false){

inputLock[c] = true;

var vinput = -Mathf.Sign(Input.GetAxis(gd.pcn[c] + "Vertical"));

if(vinput > 0){
if(CharacterSelection.y == choicesPerColumn-1 || choice[c].character + 5 >= gd.Characters.Length)
choice[c].character = (vinput*(choice[c].character%5));
else 
choice[c].character += (vinput*5);
}

if(vinput < 0){

if(CharacterSelection.y == 0){

if(choice[c].character >= (gd.Characters.Length%5))
choice[c].character -= 5;

choice[c].character += (vinput*(gd.Characters.Length%5));

}else{
choice[c].character += (vinput*5);
}

}
}


if(Input.GetAxis(gd.pcn[c] + "Submit") != 0 && gd.Characters[choice[c].character].Unlocked == true && submitinputLock[c] == false){
ready[c] = true;
submitinputLock[c] = true;
}

if(Input.GetAxis(gd.pcn[c] + "Cancel") != 0 && submitinputLock[c] == false){
Resetready();
submitinputLock[c] = true;
transform.GetComponent(Main_Menu).Return();
hidden = true;
}

}else{

if(Input.GetAxis(gd.pcn[c] + "Cancel") != 0 && submitinputLock[c] == false){
ready[c] = false;
submitinputLock[c] = true;
}

}

choice[c].character = NumClamp(choice[c].character,0,gd.Characters.Length);

if(Input.GetAxis(gd.pcn[c] + "Horizontal") == 0 && Input.GetAxis(gd.pcn[c] + "Vertical") == 0)
inputLock[c] = false;

}
}


////////////////////////////////////////////////////////////////////////////////////Pointless Divider//////////////////////////////////////////////////////////////////////////


if(state == 1){ //Hat Select

gd.allowedToChange = false;

stateTexture = Resources.Load("UI Textures/New Character Select/hat",Texture2D);

var hatCounter : int;

for(i = 0; i < choicesPerColumn;i++){
for(j = 0; j < 5;j++){

if((i*5) + j < gd.Hats.Length){

var haticonRect : Rect = Rect(20 + (j*iconWidth),startHeight + (i*iconWidth),iconWidth,iconWidth);

var haticon : Texture2D;
if(gd.Hats[hatCounter].Unlocked == true)
haticon = gd.Hats[hatCounter].Icon;
else
haticon = Resources.Load("UI Textures/Character Icons/question_mark",Texture2D);

GUI.DrawTexture(haticonRect,haticon);

hatCounter += 1;

}else{
break;
}

}
}

//Render Cursor
for(c = 0; c < gd.pcn.Length;c++){

if(Input.GetAxis(gd.pcn[c] + "Submit") == 0 && Input.GetAxis(gd.pcn[c] + "Cancel") == 0 )
submitinputLock[c] = false;

var selectedhat = choice[c].hat;

var HatSelection : Vector2 = Vector2(selectedhat%5,selectedhat/5);

cursorPosition[c] = Vector2.Lerp(cursorPosition[c],HatSelection,Time.deltaTime*cursorSpeed);

CursorRect = Rect(20 + cursorPosition[c].x * iconWidth,startHeight + cursorPosition[c].y * iconWidth,iconWidth,iconWidth);
CursorTexture = Resources.Load("UI Textures/Cursors/Cursor_"+c,Texture2D);
GUI.DrawTexture(CursorRect,CursorTexture);


//Get new Input
if(ready[c] == false){
if(Input.GetAxis(gd.pcn[c] + "Horizontal") != 0 && inputLock[c] == false){

inputLock[c] = true;

hinput = Mathf.Sign(Input.GetAxis(gd.pcn[c] + "Horizontal"));

if((HatSelection.y+1)*5 <= gd.Hats.length)
iconsInRow = 5;
else
iconsInRow = (gd.Hats.Length-(HatSelection.y*5));

if(choice[c].hat +hinput < (HatSelection.y*5) + iconsInRow && choice[c].hat+hinput >= (HatSelection.y*5))
choice[c].hat += hinput;
else{

if(choice[c].hat+hinput >= (HatSelection.y*5))
choice[c].hat = (HatSelection.y)*5;
else
choice[c].hat = (HatSelection.y)*5 + iconsInRow - 1;

}

}

if(Input.GetAxis(gd.pcn[c] + "Vertical") != 0 && inputLock[c] == false){

inputLock[c] = true;

vinput = -Mathf.Sign(Input.GetAxis(gd.pcn[c] + "Vertical"));

if(vinput > 0){
if(HatSelection.y == choicesPerColumn-1 || choice[c].hat + 5 >= gd.Hats.Length)
choice[c].hat = (vinput*(choice[c].hat%5));
else 
choice[c].hat += (vinput*5);
}

if(vinput < 0){

if(HatSelection.y == 0){

if(choice[c].hat >= (gd.Hats.Length%5))
choice[c].hat -= 5;

choice[c].hat += (vinput*(gd.Hats.Length%5));

}else{
choice[c].hat += (vinput*5);
}

}
}


if(Input.GetAxis(gd.pcn[c] + "Submit") != 0 && gd.Hats[choice[c].hat].Unlocked == true && submitinputLock[c] == false){
ready[c] = true;
submitinputLock[c] = true;
}

if(Input.GetAxis(gd.pcn[c] + "Cancel") != 0 && submitinputLock[c] == false){
Resetready();
submitinputLock[c] = true;

state = 0;
}

}else{

if(Input.GetAxis(gd.pcn[c] + "Cancel") != 0 && submitinputLock[c] == false){
ready[c] = false;
submitinputLock[c] = true;
}
}

choice[c].hat = NumClamp(choice[c].hat,0,gd.Hats.Length);

if(Input.GetAxis(gd.pcn[c] + "Horizontal") == 0 && Input.GetAxis(gd.pcn[c] + "Vertical") == 0)
inputLock[c] = false;

}
}

if(state == 2){

for(i = 0; i < gd.pcn.Length;i++){

if(gd.pcn.Length == 1)
kartSelect(i,0);

if(gd.pcn.Length == 2)
kartSelect(i,i+1);

if(gd.pcn.Length > 2)
kartSelect(i,3 + i);

}
}

if(state == 3){

gd.currentChoices = choice;
hidden = true;

}

if(stateTexture != null){

var ratio : float = (Screen.width/3f)/stateTexture.width;

GUI.DrawTexture(Rect(10,10,Screen.width/3f,stateTexture.height*ratio),stateTexture,ScaleMode.ScaleToFit);

}

if(gd.pcn.Length > 0){
var allReady : boolean = true;

for( i = 0; i < gd.pcn.Length;i++)
if(ready[i] == false)
allReady = false;

if(allReady){
Resetready();
state += 1;
}
}else
Resetready();

}
}

function kartSelect(c : int,pos : int){

var iconWidth : float = (Screen.width/2f)/5;
var Heightratio : float = ((Screen.width/3f)/1000f)*200f;
var BoardHeight : float = iconWidth*6f + 10 - Heightratio;

//0 = full screen, 1 = 2 player (vertical) top, 2 = 2 player (vertical) bottom, 3 = 4 player (top left), 4  = 4 player (top right), 5  = 4 player (bottom left), 6 = 4 player (bottom right)
var areaRect : Rect;
if(pos == 0)
areaRect = Rect(20,10 + Heightratio/2f + Screen.height/2f - BoardHeight/2f,iconWidth*5f,BoardHeight - 20);

if(pos == 1)
areaRect = Rect(20,10 + Heightratio/2f + (Screen.height/2f - BoardHeight/2f),iconWidth*5f ,BoardHeight/2f - 20);

if(pos == 2)
areaRect = Rect(20,10 + Heightratio/2f + Screen.height/2f,iconWidth*5f,BoardHeight/2f - 20);

if(pos == 3)
areaRect = Rect(20,10 + Heightratio/2f + (Screen.height/2f - BoardHeight/2f),(iconWidth*5f + 20)/2f  - 20,BoardHeight/2f - 20);

if(pos == 4)
areaRect = Rect(20 + (iconWidth*5f + 20)/2f,10 + Heightratio/2f + (Screen.height/2f - BoardHeight/2f),(iconWidth*5f + 20)/2f  - 20,BoardHeight/2f - 20);

if(pos == 5)
areaRect = Rect(20,10 + Heightratio/2f + Screen.height/2f ,(iconWidth*5f + 20)/2f  - 20,BoardHeight/2f - 20);

if(pos == 6)
areaRect = Rect(20 + (iconWidth*5f + 20)/2f,10 + Heightratio/2f + Screen.height/2f ,(iconWidth*5f + 20)/2f  - 20,BoardHeight/2f - 20);


GUI.BeginGroup(areaRect);

var kartIcon : Texture2D = gd.Karts[choice[c].kart].Icon;
var wheelIcon : Texture2D = gd.Wheels[choice[c].wheel].Icon;

var idealWidth : float = areaRect.width/2f;
var nRatio : float = idealWidth/kartIcon.width;
var idealheight = kartIcon.height * nRatio;

var kartRect : Rect = Rect(0,areaRect.height/2f - idealheight/2f,idealWidth,idealheight);
var wheelRect : Rect = Rect(areaRect.width/2f,areaRect.height/2f - idealheight/2f,idealWidth,idealheight);

GUI.DrawTexture(kartRect,kartIcon,ScaleMode.ScaleToFit);
GUI.DrawTexture(wheelRect,wheelIcon,ScaleMode.ScaleToFit);

//Render Cursor
var CursorTexture : Texture2D = Resources.Load("UI Textures/Cursors/Cursor_"+c,Texture2D);

if(!kartSelected[c])
GUI.DrawTexture(kartRect,CursorTexture);
else
GUI.DrawTexture(wheelRect,CursorTexture);

GUI.EndGroup();

if(Input.GetAxis(gd.pcn[c] + "Vertical") != 0 && inputLock[c] == false && ready[c] == false){

inputLock[c] = true;

var vinput = -Mathf.Sign(Input.GetAxis(gd.pcn[c] + "Vertical"));

if(!kartSelected[c]){

choice[c].kart -= vinput;
choice[c].kart = NumClamp(choice[c].kart,0,gd.Karts.Length);

}else{

choice[c].wheel -= vinput;
choice[c].wheel = NumClamp(choice[c].wheel,0,gd.Wheels.Length);

}
}

if(Input.GetAxis(gd.pcn[c] + "Submit") != 0 && submitinputLock[c] == false){

if(kartSelected[c] == false)
kartSelected[c] = true;
else
ready[c] = true;

submitinputLock[c] = true;

}



if(Input.GetAxis(gd.pcn[c] + "Horizontal") == 0 && Input.GetAxis(gd.pcn[c] + "Vertical") == 0)
inputLock[c] = false;

if(Input.GetAxis(gd.pcn[c] + "Submit") == 0 && Input.GetAxis(gd.pcn[c] + "Cancel") == 0 )
submitinputLock[c] = false;

if(Input.GetAxis(gd.pcn[c] + "Cancel") != 0 && submitinputLock[c] == false){
if(ready[c] == true)
ready[c] = false;
else{
if(kartSelected[c])
kartSelected[c] = false;
else{
Resetready();
state = 1;
}
}

submitinputLock[c] = true;

}

}



function Resetready(){

for(var i : int = 0; i < 4;i++){
ready[i] = false;
kartSelected[i] = false;
loadedCharacter[i] = -1;
loadedHat[i] = -1;
loadedKart[i] = -1;
loadedWheel[i] = -1;
}

}

function ResetEverything(){

state = 2;

ready = new boolean[4];
inputLock = new boolean[4];
submitinputLock = new boolean[4];
kartSelected = new boolean[4];
cursorPosition = new Vector2[4];

loadedCharacter = new int[4];
loadedHat = new int[4];
loadedKart = new int[4];
loadedWheel = new int[4];

gd = GameObject.Find("GameData").GetComponent(CurrentGameData);

var counter : int;

for(var i : int = 0; i < gd.Characters.Length;i++){
if(i%5 == 0)
choicesPerColumn += 1;
}

for(var j : int = 0; j < 4;j++)
submitinputLock[j] = true;

}

class LoadOut{

var character : int = 0;
var hat : int = 0;
var wheel : int= 0;
var kart : int = 0;

}

function NumClamp(val : int,min : int,max : int){

while(val > max-1)
val -= (max-min);

while(val < min)
val += (max-min);


return val;

}