﻿#pragma strict

private var gd : CurrentGameData;

var State : int = 0; //0 - Character, 1 - Hat, 2 - Kart

private var CharacterSelection : Vector2;
private var HatSelection : Vector2;

private var KartSelection : Vector2;
private var kartSelect : boolean = true;

private var CursorPosition : Vector2;
private var CursorKart : Rect;

private var loadedCharacter : int = 0;
private var loadedHat : int = 0;
private var loadedKart : int = 0;
private var loadedWheel : int = 0;

private var lastLoadedCharacter : int = -1;
private var lastLoadedHat : int = -1;
private var lastLoadedKart : int = -1;
private var lastLoadedWheel : int = -1;

private var loadedCharacterModel : Transform;
private var loadedHatModel : Transform;
private var loadedKartModel : Transform;

private var Wheels : Transform[];

var SpawnPosition : Transform;

private var controlLock : boolean = false;
@HideInInspector
var fireLock : boolean = true;

var rotSpeed : float = 15;

var spawnCharinKart : boolean;

function Awake(){

Wheels = new Transform[4];

if(GameObject.Find("GameData") != null)
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
else
Application.LoadLevel(0);
}

function OnGUI () {

GUI.skin = Resources.Load("GUISkins/Main Menu", GUISkin);

var yint : int;
var iconWidth : float = (Screen.width/2)/5f;

if(Input.GetAxis(gd.pcn[0]+"Submit") == 0 && Input.GetAxis(gd.pcn[0]+"Cancel") == 0)
fireLock = false;

if(State == 0){
if(Input.GetAxis(gd.pcn[0]+"Cancel") != 0 && fireLock == false){

transform.GetComponent(Main_Menu).Return();

fireLock = true;
this.enabled = false;
}
}

if(State > 0){

if(Input.GetAxis(gd.pcn[0]+"Cancel") != 0 && fireLock == false){
State -= 1;
if(State < 0)
State = 0;

loadedHat = -1;
loadedKart = -1;

fireLock = true;
}
}

var BoardTexture = Resources.Load("UI Textures/GrandPrix Positions/Backing2",Texture2D);
var BoardRect = Rect(10,10,iconWidth*5f + 10,iconWidth*6f + 10);

GUI.DrawTexture(BoardRect,BoardTexture);

///////////////////////////////////////////CHARACTER SELECT///////////////////////////////////////////
if(State == 0){

if(loadedHatModel != null){
Destroy(loadedHatModel.gameObject);
lastLoadedHat = -1;
}

for(var i : int = 0; i < gd.Characters.Length; i++){

if(i != 0 && i%5 == 0)
yint += 1;

//Render Texture
var TextureRect : Rect = Rect(20 + ((i%5)*iconWidth),20 + (yint*(Screen.width/2)/5f),iconWidth,iconWidth);
GUI.DrawTexture(TextureRect,gd.Characters[i].Icon);

//Get Input
if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && fireLock == false && gd.Characters[loadedCharacter].Unlocked == true){
State = 1;
fireLock = true;
}

}

//Input from Controller
if(Input.GetAxis(gd.pcn[0]+"Horizontal") != 0 && controlLock == false){
var HAction : int = Mathf.Sign(Input.GetAxis(gd.pcn[0]+"Horizontal"));

var tempCS = CharacterSelection;
tempCS += Vector2(HAction,0);
if(tempCS.x < 0)
tempCS.x = 4;
if(tempCS.x > 4)
tempCS.x = 0;

if(((tempCS.y*5) + tempCS.x) < gd.Characters.Length){

CharacterSelection += Vector2(HAction,0);

if(CharacterSelection.x < 0)
CharacterSelection.x = 4;

if(CharacterSelection.x > 4)
CharacterSelection.x = 0;

ButtonWait();
controlLock = true;

}
}

if(Input.GetAxis(gd.pcn[0]+"Vertical") != 0 && controlLock == false){
var VAction : int = Mathf.Sign(Input.GetAxis(gd.pcn[0]+"Vertical"));

CharacterSelection -= Vector2(0,VAction);

ButtonWait();
controlLock = true;
}

//Calculate Character
CharacterSelection.x = Mathf.Clamp(CharacterSelection.x,0,4);
CharacterSelection.y = Mathf.Clamp(CharacterSelection.y,0,(gd.Characters.Length/5));
loadedCharacter = (CharacterSelection.y*5) + CharacterSelection.x;

//Render Cursor
CursorPosition = Vector2.Lerp(CursorPosition,CharacterSelection,Time.deltaTime*5f);

var CursorRect : Rect = Rect(20 + CursorPosition.x * iconWidth,20 + CursorPosition.y * iconWidth,iconWidth,iconWidth);
var CursorTexture : Texture2D = Resources.Load("UI Textures/Cursors/Cursor_Blue",Texture2D);
GUI.DrawTexture(CursorRect,CursorTexture);

//Load Character
if(loadedCharacter != lastLoadedCharacter){

if(loadedCharacterModel != null)
Destroy(loadedCharacterModel.gameObject);

if(gd.Characters[loadedCharacter].Unlocked == true){
loadedCharacterModel = Instantiate(gd.Characters[loadedCharacter].CharacterModel_Standing,SpawnPosition.position,Quaternion.identity);

lastLoadedCharacter = loadedCharacter;
}
}

loadedCharacterModel.Rotate(Vector3.up,-Input.GetAxis(gd.pcn[0]+"Rotate") * Time.fixedDeltaTime * rotSpeed);

}
///////////////////////////////////////////HAT SELECT///////////////////////////////////////////
if(State == 1){ 

if(loadedKartModel != null){
Destroy(loadedKartModel.gameObject);
lastLoadedKart = -1;
}

for(i = 0; i < gd.Hats.Length; i++){

if(i != 0 && i%5 == 0)
yint += 1;

//Render Texture
TextureRect = Rect(20 + ((i%5)*iconWidth),20 + (yint*(Screen.width/2)/5f),iconWidth,iconWidth);
GUI.DrawTexture(TextureRect,gd.Hats[i].Icon);

//Get Input
if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && fireLock == false && gd.Hats[loadedHat].Unlocked == true){
State = 2;
fireLock = true;
}

}

//Input from Controller
if(Input.GetAxis(gd.pcn[0]+"Horizontal") != 0 && controlLock == false){
HAction = Mathf.Sign(Input.GetAxis(gd.pcn[0]+"Horizontal"));

var tempHS = HatSelection;
tempHS += Vector2(HAction,0);
if(tempHS.x < 0)
tempHS.x = 4;
if(tempHS.x > 4)
tempHS.x = 0;

if(((tempHS.y*5) + tempHS.x) < gd.Hats.Length){


HatSelection += Vector2(HAction,0);

if(HatSelection.x < 0)
HatSelection.x = 4;

if(HatSelection.x > 4)
HatSelection.x = 0;

ButtonWait();
controlLock = true;
}
}

if(Input.GetAxis(gd.pcn[0]+"Vertical") != 0 && controlLock == false){
VAction = Mathf.Sign(Input.GetAxis(gd.pcn[0]+"Vertical"));

HatSelection -= Vector2(0,VAction);

ButtonWait();
controlLock = true;
}

//Calculate Character
HatSelection.x = Mathf.Clamp(HatSelection.x,0,4);
HatSelection.y = Mathf.Clamp(HatSelection.y,0,(gd.Hats.Length/5));
loadedHat = (HatSelection.y*5) + HatSelection.x;

//Render Cursor
CursorPosition = Vector2.Lerp(CursorPosition,HatSelection,Time.deltaTime*5f);

CursorRect = Rect(20 + CursorPosition.x * iconWidth,20 + CursorPosition.y * iconWidth,iconWidth,iconWidth);
CursorTexture = Resources.Load("UI Textures/Cursors/Cursor_Blue",Texture2D);
GUI.DrawTexture(CursorRect,CursorTexture);

//Load Character
if(loadedCharacterModel == null){
loadedCharacterModel = Instantiate(gd.Characters[loadedCharacter].CharacterModel_Standing,SpawnPosition.position,Quaternion.identity);
}

if(loadedHatModel == null || loadedHat != lastLoadedHat){

if(loadedHatModel != null)
Destroy(loadedHatModel.gameObject);

if(loadedHat != 0 && gd.Hats[loadedHat].Unlocked == true){
loadedHatModel = Instantiate(gd.Hats[loadedHat].Model,loadedCharacterModel.position,Quaternion.identity);
if(loadedCharacterModel.gameObject.Find("Hat Holder") != null){
loadedHatModel.position = loadedCharacterModel.gameObject.Find("Hat Holder").transform.position;
loadedHatModel.rotation = loadedCharacterModel.gameObject.Find("Hat Holder").transform.rotation;
loadedHatModel.parent = loadedCharacterModel.gameObject.Find("Hat Holder").transform;
}else{
Debug.Log("The onscreen character needs a Hat Holder Game Object!");
}
}
lastLoadedHat = loadedHat;
}


loadedCharacterModel.Rotate(Vector3.up,-Input.GetAxis(gd.pcn[0]+"Rotate") * Time.fixedDeltaTime * rotSpeed);

}



if(State == 2){ //Kart Select

iconWidth = (Screen.width/2)/6f;

//Get rid of Character
if(!spawnCharinKart){
if(loadedCharacterModel.GetComponent(LobbyAI) == null){
loadedCharacterModel.gameObject.AddComponent(LobbyAI);
loadedCharacterModel.GetComponent(LobbyAI).locked = true;
loadedCharacterModel.GetComponent(LobbyAI).TraveltoPos = SpawnPosition.position + Vector3(-2,0,1.5f);
}
}else
if(loadedCharacterModel != null)
Destroy(loadedCharacterModel.gameObject);

//Render Kart Icon
var KartIcon : Texture2D = gd.Karts[KartSelection.x].Icon;
var WheelIcon : Texture2D = gd.Wheels[KartSelection.y].Icon;
var Ratio : float = (iconWidth*2f)/KartIcon.height;

var Overallrect : Rect = Rect(20,Screen.height/2 - iconWidth/2,(WheelIcon.width * Ratio)+10,iconWidth*2f);
var OverallClickrect : Rect = Rect(20,Screen.height/2 - iconWidth/2,(WheelIcon.width * Ratio)+10+iconWidth*2f,iconWidth*4f);

GUI.DrawTexture(Rect(20,Screen.height/2 - iconWidth/2,KartIcon.width * Ratio,iconWidth*2f),KartIcon);
GUI.DrawTexture(Rect(30 + KartIcon.width * Ratio,Screen.height/2 - iconWidth/2,iconWidth*2f,iconWidth*2f),WheelIcon);


var upArrow1 : Rect = Rect(20,Screen.height/2 - iconWidth/2 -60,KartIcon.width * Ratio,50);
var upArrow2 : Rect = Rect(30 + KartIcon.width * Ratio,Screen.height/2 - iconWidth/2 -60,iconWidth*2f,50);

var downArrow1 : Rect = Rect(20,Screen.height/2 + iconWidth*1.5f + 10,KartIcon.width * Ratio,50);
var downArrow2 : Rect = Rect(30 + KartIcon.width * Ratio,Screen.height/2 + iconWidth*1.5f +10,iconWidth*2f,50);


GUI.Box(upArrow1,"Up");
GUI.Box(upArrow2,"Up");

GUI.Box(downArrow1,"Down");
GUI.Box(downArrow2,"Down");

//Input from Controller
if(Input.GetAxis(gd.pcn[0]+"Vertical") != 0 && controlLock == false){
VAction = Mathf.Sign(Input.GetAxis(gd.pcn[0]+"Vertical"));

if(kartSelect)
KartSelection.x -= VAction;
else
KartSelection.y -= VAction;

ButtonWait();
controlLock = true;
}

if(Input.GetAxis(gd.pcn[0]+"Horizontal") != 0 && controlLock == false){
VAction = Mathf.Sign(Input.GetAxis(gd.pcn[0]+"Horizontal"));

kartSelect = !kartSelect;

ButtonWait();
controlLock = true;
}


if(KartSelection.x < 0)
KartSelection.x = gd.Karts.Length-1;

if(KartSelection.x > gd.Karts.Length-1)
KartSelection.x = 0;

if(KartSelection.y < 0)
KartSelection.y = gd.Wheels.Length-1;

if(KartSelection.y > gd.Wheels.Length-1)
KartSelection.y = 0;

loadedKart = KartSelection.x;
loadedWheel = KartSelection.y;

//Render Cursor

if(kartSelect)
CursorRect = Rect(20,Screen.height/2 - iconWidth/2,KartIcon.width * Ratio,iconWidth*2);
else
CursorRect = Rect(30 + KartIcon.width * Ratio,Screen.height/2 - iconWidth/2,iconWidth*2f,iconWidth*2);

CursorKart.x = Mathf.Lerp(CursorKart.x,CursorRect.x,Time.deltaTime * 5f);
CursorKart.y = Mathf.Lerp(CursorKart.y,CursorRect.y,Time.deltaTime * 5f);
CursorKart.width = Mathf.Lerp(CursorKart.width,CursorRect.width,Time.deltaTime * 5f);
CursorKart.height = Mathf.Lerp(CursorKart.height,CursorRect.height,Time.deltaTime * 5f);

CursorTexture = Resources.Load("UI Textures/Cursors/Cursor_Blue",Texture2D);//Add wide option
GUI.DrawTexture(CursorKart,CursorTexture);

//Load Kart
if(loadedKartModel == null || loadedKart != lastLoadedKart || loadedWheel != lastLoadedWheel){
if(loadedKart != lastLoadedKart){

//Load Kart

if(loadedKartModel != null)
Destroy(loadedKartModel.gameObject);

var toSpawn : Transform;
if(spawnCharinKart)
toSpawn = gd.Karts[loadedKart].Models[loadedCharacter];
else
toSpawn = gd.Karts[loadedKart].Model;

if(gd.Karts[loadedKart].Unlocked == true)
loadedKartModel = Instantiate(toSpawn,SpawnPosition.position + Vector3.up,Quaternion.Euler(0,30,0));

loadedKartModel.localScale = Vector3(3,3,3);

if(spawnCharinKart){
//Delete Component
Destroy(loadedKartModel.GetComponent(kartScript));
Destroy(loadedKartModel.GetComponent(AudioSource));
Destroy(loadedKartModel.networkView);
loadedKartModel.rigidbody.isKinematic = true;
Destroy(loadedKartModel.GetComponent(Position_Finding));
Destroy(loadedKartModel.GetComponent(DeathCatch));
Destroy(loadedKartModel.GetComponent(NetworkUpdate));

//Change Hat
if(gd.Hats[loadedHat].Model != null){
var HatObject = Instantiate(gd.Hats[loadedHat].Model,loadedKartModel.position,Quaternion.identity);

if(loadedKartModel.GetComponent(QA).objects[0] != null){
HatObject.position = loadedKartModel.GetComponent(QA).objects[0].position;
HatObject.rotation = loadedKartModel.GetComponent(QA).objects[0].rotation;
HatObject.parent = loadedKartModel.GetComponent(QA).objects[0];
}
}

}

lastLoadedKart = loadedKart;

}
//Load Wheels
var Wheels = new Transform[4];

for(var j : int = 0; j < Wheels.Length;j++){
Wheels[j] = loadedKartModel.GetComponent(QA).objects[j+1];

var nWheel : Transform = Instantiate(gd.Wheels[loadedWheel].Models[j],Wheels[j].position,Wheels[j].rotation);
nWheel.parent = Wheels[j].parent;
nWheel.name = Wheels[j].name;
nWheel.localScale = Wheels[j].localScale;

Destroy(Wheels[j].gameObject);

loadedKartModel.GetComponent(QA).objects[j+1] = nWheel;

}

lastLoadedWheel = loadedWheel;

}

loadedKartModel.Rotate(Vector3.up,-Input.GetAxis(gd.pcn[0]+"Rotate") * Time.fixedDeltaTime * rotSpeed);

//Finish Character Select
if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && fireLock == false && gd.Karts[loadedKart].Unlocked == true && gd.Wheels[loadedWheel].Unlocked == true){

gd.currentCharacter = loadedCharacter;
gd.currentHat = loadedHat;
gd.currentKart = loadedKart;
gd.currentWheel = loadedWheel;

this.enabled = false;

}



}
}



function WithinBounds(Area : Rect){

if(Input.mousePosition.x >= Area.x && Input.mousePosition.x <= Area.x + Area.width 
&&  Screen.height-Input.mousePosition.y >= Area.y &&  Screen.height-Input.mousePosition.y <= Area.y + Area.height)
return true;
else
return false;

}

function ButtonWait(){
yield WaitForSeconds(0.2);
controlLock = false;
}
