#pragma strict

private var rm : Race_Master;
private var gd : CurrentGameData;

var Pans : CameraPoint[];

var rep : Transform[];

private var skipScene : boolean;
var controlLock : boolean = true;

private var Alpha : float = 0;

function OnGUI () {

GUI.skin = Resources.Load("GUISkins/Main Menu", GUISkin);
GUI.color = new Color32(255, 255, 255, Alpha);

//Player 1 GUI
for(var i : int = 0; i < rm.SPRacers.Length;i++){
if(rm.SPRacers[i].Human == true && rm.SPRacers[i].HumanID == 0){
var Player1 = i;
i = 13;
}
}

if(skipScene == true && Input.GetAxisRaw("Submit") !=0  && controlLock == false){
gd.Exit();
controlLock = true;
}

if(skipScene == false && Input.GetAxisRaw("Submit") !=0 && controlLock == false){
skipScene = true;
controlLock = true;
}

if(Input.GetAxisRaw("Submit") == 0)
controlLock = false;

if(skipScene)
Alpha = Mathf.Lerp(Alpha,255,Time.deltaTime*10f);


var BoardTexture : Texture2D = Resources.Load("UI Textures/GrandPrix Positions/Backing",Texture2D);
var BoardRect : Rect = Rect(Screen.width/2f - Screen.height/16f,Screen.height/16f,Screen.width/2f ,(Screen.height/16f)*14f);

GUI.DrawTexture(BoardRect,BoardTexture);

var OutlineColour : Color = Color.black;

GUI.BeginGroup(BoardRect);

for(var f : int = 0; f < 12; f++){

var PosTexture : Texture2D = Resources.Load("UI Textures/GrandPrix Positions/" + (f+1).ToString(),Texture2D);
var SelPosTexture : Texture2D = Resources.Load("UI Textures/GrandPrix Positions/" + (f+1).ToString() + "_Sel",Texture2D);
var NameTexture : Texture2D = Resources.Load("UI Textures/GrandPrix Positions/" + gd.Characters[rm.SPRacers[f].Character].Name,Texture2D);
var SelNameTexture : Texture2D = Resources.Load("UI Textures/GrandPrix Positions/" + gd.Characters[rm.SPRacers[f].Character].Name + "_Sel",Texture2D);

var Ratio = (Screen.height/16f)/PosTexture.height;
var Ratio2 = (Screen.height/16f)/NameTexture.height;

if(f == Player1){
GUI.DrawTexture(Rect(20,(f+1)*Screen.height/16f,PosTexture.width * Ratio,Screen.height/16f),SelPosTexture);
GUI.DrawTexture(Rect(20 + PosTexture.width * Ratio,(f+1)*Screen.height/16f,NameTexture.width * Ratio2,Screen.height/16f),SelNameTexture);
OutlineColour = Color.grey;
}else{
GUI.DrawTexture(Rect(20,(f+1)*Screen.height/16f,PosTexture.width * Ratio,Screen.height/16f),PosTexture);
GUI.DrawTexture(Rect(20 + PosTexture.width * Ratio,(f+1)*Screen.height/16f,NameTexture.width * Ratio2,Screen.height/16f),NameTexture);
OutlineColour = Color.black;
}

var CharacterIcon = gd.Characters[rm.SPRacers[f].Character].Icon;

GUI.DrawTexture(Rect(10 + (PosTexture.width * Ratio) + (NameTexture.width * Ratio2),(f+1)*Screen.height/16f,Screen.height/16f,Screen.height/16f),CharacterIcon);

OutLineLabel(Rect(20 + (PosTexture.width * Ratio) + (NameTexture.width * Ratio2 * 1.5f) ,3 + (f+1)*Screen.height/16f,NameTexture.width * Ratio2,Screen.height/16f),rm.SPRacers[f].points.ToString(),2,OutlineColour);

}

GUI.EndGroup();

var RankRect : Rect = Rect(Screen.width/2f - Screen.height/16f,10,Screen.width/2f ,(Screen.height/16f)*14f);
OutLineLabel(RankRect,CalculateRank(),2,Color.black);

var PressStart1 : Texture2D = Resources.Load("UI Textures/Main Menu/Press Start",Texture2D);
var PressStart2 : Texture2D = Resources.Load("UI Textures/Main Menu/Press A",Texture2D);

if(Input.GetJoystickNames().Length > 0)
GUI.DrawTexture(Rect(Screen.width/2f - Screen.height/16f,Screen.height/16f * 14.4,Screen.width/2f ,Screen.height/16f*1.75),PressStart2,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(Rect(Screen.width/2f - Screen.height/16f,Screen.height/16f * 14.4,Screen.width/2f ,Screen.height/16f*1.75),PressStart1,ScaleMode.ScaleToFit);

}

function Start () {
rm = GameObject.Find("GameData").GetComponent(Race_Master);
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);

rep = new Transform[12];

SetUpCharacters();

 for(var i : int = 0; i < Pans.Length; i++){
 
 	if(i == 5){
 	rep[2].gameObject.AddComponent(LobbyAI);
 	rep[2].GetComponent(LobbyAI).locked = true;
 	rep[2].GetComponent(LobbyAI).cantRun = true;
 	rep[2].GetComponent(LobbyAI).TraveltoPos = Vector3(-2,1,3);
 	}
 	if(i == 6){
 	rep[1].gameObject.AddComponent(LobbyAI);
 	rep[1].GetComponent(LobbyAI).locked = true;
 	rep[1].GetComponent(LobbyAI).cantRun = true;
 	rep[1].GetComponent(LobbyAI).TraveltoPos = Vector3(2,1,3);
 	}
 	if(i == 7){
 	rep[0].gameObject.AddComponent(LobbyAI);
 	rep[0].GetComponent(LobbyAI).locked = true;
 	rep[0].GetComponent(LobbyAI).cantRun = true;
 	rep[0].GetComponent(LobbyAI).TraveltoPos = Vector3(0,1,3);
 	}
 	
    yield Play(transform,Pans[i]);
 }
 
 skipScene = true;
 
}

function SetUpCharacters(){

for(var i : int = 0; i < 12;i++){

rep[i] = SpawnCharacter(rm.SPRacers[i].Character,rm.SPRacers[i].Hat,i);

}
}

function SpawnCharacter(character : int, hat : int,pos:int){

var spawnPosition : Vector3;
var spawnRotation : Vector3;

if(pos < 3){

if(pos == 0)
spawnPosition = Vector3(0,1,-21);
if(pos == 1)
spawnPosition = Vector3(2,1,-21);
if(pos == 2)
spawnPosition = Vector3(-2,1,-21);

spawnRotation = Vector3(0,0,0);
}else{
if(pos > 6){
spawnPosition = Vector3(-4,1,(pos%5)*-2);
spawnRotation = Vector3(0,90,0);
}else{
spawnPosition = Vector3(4,1,(pos%4)*-2);
spawnRotation = Vector3(0,-90,0);
}
}


var loadedCharacterModel = Instantiate(gd.Characters[character].CharacterModel_Standing,spawnPosition,Quaternion.Euler(spawnRotation));

if(hat != 0){
var loadedHatModel = Instantiate(gd.Hats[hat].Model,loadedCharacterModel.position,Quaternion.identity);
loadedHatModel.position = loadedCharacterModel.GetComponent(QA).objects[0].position;
loadedHatModel.rotation = loadedCharacterModel.GetComponent(QA).objects[0].rotation;
loadedHatModel.parent = loadedCharacterModel.GetComponent(QA).objects[0];
}

if(pos > 2)
loadedCharacterModel.GetComponent(Animator).SetBool("Clap",true);

return loadedCharacterModel;

}


function Play (cam : Transform,Clip : CameraPoint) {

var startTime = Time.realtimeSinceStartup;

while((Time.realtimeSinceStartup-startTime) < Clip.TravelTime){
cam.position = Vector3.Lerp(Clip.StartPoint,Clip.EndPoint,(Time.realtimeSinceStartup-startTime)/Clip.TravelTime);
cam.rotation = Quaternion.Slerp(Quaternion.Euler(Clip.StartRotation),Quaternion.Euler(Clip.EndRotation),(Time.realtimeSinceStartup-startTime)/Clip.TravelTime);
yield;
}

}

function CalculateRank(){

var RankString : String;

	for(var i : int = 0; i < rm.SPRacers.Length;i++){
	if(rm.SPRacers[i].Human == true && rm.SPRacers[i].HumanID == 0){
	var Player1 = i;
	i = 13;
	}
	}
	
	RankString = "No Rank";		
	
	if(Player1 == 0){
	
	if(rm.SPRacers[Player1].points == 60)
	RankString = "Perfect";
	else
	RankString = "Gold";	
	
	}
	
	if(Player1 == 1)	
	RankString = "Silver";	
	
	if(Player1 == 2)	
	RankString = "Bronze";

	return RankString;

	}

function OutLineLabel(pos : Rect, text : String,Distance : float,Colour : Color){
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