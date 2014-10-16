#pragma strict

var state : int;

var cursorSpeed : float = 2.5;

private var choice : LoadOut[];
private var ready : boolean[];
private var cursorPosition : Vector2[];

private var inputLock : boolean[];
private var submitinputLock : boolean[];
private var choicesPerColumn : int;

private var gd : CurrentGameData;

function Start () {

choice = new LoadOut[4];
ready = new boolean[4];
inputLock = new boolean[4];
submitinputLock = new boolean[4];
cursorPosition = new Vector2[4];

for(var i : int = 0; i < 4;i++){
choice[i] = new LoadOut();
submitinputLock[i] = true;
}

gd = GameObject.Find("GameData").GetComponent(CurrentGameData);

var counter : int;

for(i = 0; i < gd.Characters.Length;i++)
if(i%5 == 0)
choicesPerColumn += 1;

}

function OnGUI () {

var stateTexture : Texture2D;

var iconWidth : float = (Screen.width/2f)/5;

var BoardTexture = Resources.Load("UI Textures/GrandPrix Positions/Backing2",Texture2D);
var BoardHeight : float = iconWidth*6f + 10;
var BoardRect = Rect(10,Screen.height/2f - BoardHeight/2f,iconWidth*5f + 20 ,BoardHeight);

GUI.DrawTexture(BoardRect,BoardTexture);

if(gd.pcn.Length == 0)
for(var g : int = 0; g < 4;g++)
submitinputLock[g] = true;

if(state == 0){ //Character Select

gd.allowedToChange = true;

stateTexture = Resources.Load("UI Textures/New Character Select/char",Texture2D);

var startHeight = Screen.height/2f - BoardHeight/2f + 10;

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
this.enabled = false;
}

}

choice[c].character = NumClamp(choice[c].character,0,gd.Characters.Length);

if(Input.GetAxis(gd.pcn[c] + "Horizontal") == 0 && Input.GetAxis(gd.pcn[c] + "Vertical") == 0 &&  Input.GetAxis(gd.pcn[c] + "Submit") == 0 )
inputLock[c] = false;

}
}


////////////////////////////////////////////////////////////////////////////////////Pointless Divider//////////////////////////////////////////////////////////////////////////


if(state == 1){ //Hat Select

gd.allowedToChange = false;

stateTexture = Resources.Load("UI Textures/New Character Select/hat",Texture2D);

startHeight = Screen.height/2f - BoardHeight/2f + 10;

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

}

choice[c].hat = NumClamp(choice[c].hat,0,gd.Hats.Length);

if(Input.GetAxis(gd.pcn[c] + "Horizontal") == 0 && Input.GetAxis(gd.pcn[c] + "Vertical") == 0 &&  Input.GetAxis(gd.pcn[c] + "Submit") == 0 )
inputLock[c] = false;

}
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

function Resetready(){

for(var i : int = 0; i < 4;i++)
ready[i] = false;

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