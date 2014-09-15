#pragma strict

var timer : Timer;

var Started : boolean = false;
var Finished : boolean = false;

var Position : int;
private var LastPosition : int;

var KartObject : Transform;
private var IngameCam : Transform;

private var gd : CurrentGameData;
private var tm: TrackData;

private var CountdownText : int = -1;
private var CountdownTextSize : float = 25;

function Awake(){
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
tm = GameObject.Find("Track Manager").GetComponent(TrackData);
timer = new Timer();

}

function Start(){
if(Network.isServer == false || (Network.isServer == true && transform.GetComponent(Host_Script).conscious == true)){
SpawnKart(gd.currentCharacter,gd.currentKart,gd.currentHat,gd.currentWheel,Position);
PlayCutscene();
}
}


function LateUpdate() {

if(Network.isServer == false || (Network.isServer == true && transform.GetComponent(Host_Script).conscious == true)){
if(LastPosition > Position){ //If the kart has overtaken someone{
PlayTaunt();//Play an overtaking sound
Debug.Log("Over Taking!");
}

LastPosition = Position;//Reset th Last Position value

if(KartObject.GetComponent(Position_Finding).Lap == tm.Laps && Finished == false && Started == true){
EndRace();
KartObject.GetComponent(Position_Finding).locked = true;
Finished = true;
}


}
}


function SpawnKart(character : int, kart : int, hat : int, wheel : int, pos : int) {

var SpawnPosition : Vector3;
var rot : Quaternion = tm.PositionPoints[0].rep.rotation;

if(pos == -1){ //Time Trial

var x1 : Vector3 = rot*(Vector3.forward*2);
var y1 : Vector3 = rot*(Vector3.left);
SpawnPosition = tm.PositionPoints[0].rep.position + x1 + y1;  

}else{ //Normal Race

var x2 : Vector3 = rot*(Vector3.forward*(pos%3)*(tm.Scale*1.5f)+(Vector3.forward*.75f*tm.Scale));
var y2 : Vector3 = rot*(Vector3.right*(pos + 1)* tm.Scale);

SpawnPosition = tm.PositionPoints[0].rep.position + x2 + y2;  

}

if(Network.isClient == true || Network.isServer == true)
KartObject = Network.Instantiate(gd.Karts[gd.currentKart].Models[gd.currentCharacter],SpawnPosition,tm.PositionPoints[0].rep.rotation * Quaternion.Euler(0,-90,0),0);
else
KartObject = Instantiate(gd.Karts[gd.currentKart].Models[gd.currentCharacter],SpawnPosition,tm.PositionPoints[0].rep.rotation * Quaternion.Euler(0,-90,0));

KartObject.tag = "Kart";

if(gd.Hats[gd.currentHat].Model != null){
var HatObject = Instantiate(gd.Hats[gd.currentHat].Model,KartObject.position,Quaternion.identity);

if(KartObject.GetComponent(QA).objects[0] != null){
HatObject.position = KartObject.GetComponent(QA).objects[0].position;
HatObject.rotation = KartObject.GetComponent(QA).objects[0].rotation;
HatObject.parent = KartObject.GetComponent(QA).objects[0];
}
}

var Wheels = new Transform[4];

for(var j : int = 0; j < Wheels.Length;j++){
Wheels[j] = KartObject.GetComponent(QA).objects[j+1];

var nWheel : Transform = Instantiate(gd.Wheels[wheel].Models[j],Wheels[j].position,Wheels[j].rotation);
nWheel.parent = Wheels[j].parent;
nWheel.name = Wheels[j].name;
nWheel.localScale = Wheels[j].localScale;

KartObject.GetComponent(kartScript).MeshWheels[j] = nWheel;

Destroy(Wheels[j].gameObject);

KartObject.GetComponent(QA).objects[j+1] = nWheel;

}

var obj = Instantiate(gd.PUC,Vector3(0,-1000,0),Quaternion.identity);
KartObject.GetComponent(Item_Kart).ItemCrate = obj.FindChild("Item_Crate");

#if UNITY_ANDROID
KartObject.gameObject.AddComponent(mobileInput);
#else
KartObject.gameObject.AddComponent(kartInput);
#endif

KartObject.networkView.RPC("LoadObjects",RPCMode.Others,gd.currentHat,gd.currentWheel);

if(Network.isClient == true){
transform.GetComponent(Client_Script).Representation = KartObject;
transform.GetComponent(Client_Script).StartCoroutine("UpdatePos");
}

yield WaitForSeconds(0.2);

var objs = GameObject.FindGameObjectsWithTag("Untagged"); 
for(var i : int = 0; i < objs.Length; i++)
if((objs[i].GetComponent(kartInput) || objs[i].GetComponent(mobileInput)) && objs[i].GetComponent(kartScript) != null){
Destroy(objs[i].GetComponent(kartScript));
Destroy(objs[i].GetComponent(Position_Finding));
Destroy(objs[i].GetComponent(Item_Kart));
}

}

function PlayCutscene() {

var CutsceneCam = new GameObject();
CutsceneCam.AddComponent(Camera);

CutsceneCam.transform.position = tm.IntroPans[0].StartPoint;
CutsceneCam.transform.rotation = Quaternion.Euler(tm.IntroPans[0].StartRotation);
CutsceneCam.AddComponent(AudioSource);
CutsceneCam.AddComponent(AudioListener);
CutsceneCam.GetComponent(AudioSource).audio.clip = Resources.Load("Music & Sounds/RaceStart",AudioClip);
CutsceneCam.GetComponent(AudioSource).audio.Play ();
gd.BlackOut = false;

yield WaitForSeconds(0.25);

 for(var i : int = 0; i < tm.IntroPans.Length; i++){
    yield Play(CutsceneCam.transform,tm.IntroPans[i]);
 }
 
gd.BlackOut = true;
while(CutsceneCam.GetComponent(AudioSource).audio.volume > 0){
CutsceneCam.GetComponent(AudioSource).audio.volume -= Time.deltaTime;
yield;
}

yield WaitForSeconds(0.5);

Destroy(CutsceneCam);

//Spawn Ingame Camera
IngameCam = Instantiate(gd.Cams,tm.IntroPans[0].StartPoint,Quaternion.Euler(tm.IntroPans[0].StartRotation));
IngameCam.name = "InGame Cams";
IngameCam.GetComponent(Camera_Control).Locked = true;
IngameCam.GetChild(0).GetComponent(Kart_Camera).Target = KartObject;
IngameCam.GetChild(1).GetComponent(Kart_Camera).Target = KartObject;

yield WaitForSeconds(0.5);
gd.BlackOut = false;

if(Network.isClient == true)
networkView.RPC ("ReadytoStart", RPCMode.Server);
else
transform.GetComponent(Host_Script).ReadytoStart();

}

function Play (cam : Transform,Clip : CameraPoint) {
var t : float = 0;
cam.position = Clip.StartPoint;
cam.rotation = Quaternion.Euler(Clip.StartRotation);

while(t < Clip.TravelTime){
cam.position = Vector3.Lerp(cam.position,Clip.EndPoint,Time.deltaTime/Clip.TravelTime);
cam.rotation = Quaternion.Euler(Vector3.Lerp(cam.rotation.eulerAngles,Clip.EndRotation,Time.deltaTime/Clip.TravelTime));
t += Time.deltaTime/Clip.TravelTime;
yield;
}
}



@RPC
function PlayCountdown() {

var objs = GameObject.FindObjectsOfType(GameObject);

if(Network.isClient == true){
for(var i : int = 0; i < objs.Length; i++){
if(objs[i] != KartObject){
if(objs[i].GetComponent(Racer_AI) == true)
Destroy(objs[i].GetComponent(Racer_AI));
if(objs[i].GetComponent(kartScript) == true)
Destroy(objs[i].GetComponent(kartScript));
if(objs[i].GetComponent(kartInput) == true)
Destroy(objs[i].GetComponent(kartInput));
if(objs[i].GetComponent(Position_Finding) == true)
Destroy(objs[i].GetComponent(Position_Finding));
if(objs[i].GetComponent(Item_Kart) == true)
Destroy(objs[i].GetComponent(Item_Kart));
}
}
}

gameObject.AddComponent(AudioSource);
transform.GetComponent(AudioSource).audio.clip = Resources.Load("Music & Sounds/CountDown",AudioClip);
transform.GetComponent(AudioSource).audio.Play ();

for(i = 3; i >= 0; i--){

CountdownText = i;
yield WaitForSeconds(1);
}

CountdownText = -1;

}

@RPC
function UnlockKart(){
var objs = GameObject.FindObjectsOfType(GameObject);

for(var i : int = 0; i < objs.Length; i++){
if(objs[i].GetComponent(kartScript) != null)
objs[i].GetComponent(kartScript).locked = false;
}

if(Network.isServer == false || (Network.isServer == true && transform.GetComponent(Host_Script).conscious == true))
KartObject.GetComponent(Position_Finding).enabled = true;

IngameCam.GetComponent(Camera_Control).Locked = false;

StartTimer(); 
Started = true;

}

@RPC
function YourPos(pos : int){
if(Network.isClient && Finished == false)
Position = pos;
}

function PlayTaunt() {

if(KartObject.audio.isPlaying == false){
if(gd.Characters[gd.currentCharacter].tauntSounds.Length > 0 && KartObject.audio != null){
var ToPlay : int = Random.Range(0,gd.Characters[gd.currentCharacter].tauntSounds.Length);
var Speaker = KartObject.audio;

Speaker.clip = gd.Characters[gd.currentCharacter].tauntSounds[ToPlay];  
Speaker.Play();

}
}
}

function PlayHitSound() {

if(KartObject.audio.isPlaying == false){
if(gd.Characters[gd.currentCharacter].hitSounds.Length > 0 && KartObject.audio != null){
var ToPlay : int = Random.Range(0,gd.Characters[gd.currentCharacter].hitSounds.Length);
var Speaker = KartObject.audio;

Speaker.clip = gd.Characters[gd.currentCharacter].hitSounds[ToPlay];  
Speaker.Play();

}
}
}

//Timer Stuff
    function StartTimer(){
    StartCoroutine("TimerTick");
    }
    
    function StopTimer(){
	StopCoroutine("TimerTick");
    }
    
    function TimerTick(){
    while(true){
    yield;
    timer.milliSecond += (Time.deltaTime * 1000f);
    
    if(timer.milliSecond > 100){
    timer.Second += 1;
    timer. milliSecond = 0;
    }
    
    if(timer.Second > 60){
    timer.Minute += 1;
    timer.Second = 0;
    }
    
    
    }
    }

function OnGUI () {
if(Network.isServer == false || (Network.isServer == true && transform.GetComponent(Host_Script).conscious == true)){
//Render COUNTDOWN
CountdownTextSize = Screen.height/2;
var texture : Texture2D;

if(CountdownText == 0)
texture = Resources.Load("UI Textures/CountDown/GO",Texture2D);
else if(CountdownText != -1)
texture = Resources.Load("UI Textures/CountDown/" + CountdownText.ToString(),Texture2D);

if(texture != null)
GUI.DrawTexture(Rect(Screen.width/2 - CountdownTextSize/2,Screen.height/2 - CountdownTextSize/2,CountdownTextSize,CountdownTextSize),texture,ScaleMode.ScaleToFit);

//Render Position
if(Started == true){
var postexture = Resources.Load("UI Textures/Positions/" + (Position+1).ToString(),Texture2D);
GUI.DrawTexture(Rect(Screen.width - 10 - CountdownTextSize/4,Screen.height - 10 - CountdownTextSize/4,CountdownTextSize/4,CountdownTextSize/4),postexture,ScaleMode.ScaleToFit);
}

}
}

@RPC
function ShowResults(){
Debug.Log("You came " + Position.ToString());
}

@RPC
function StopRacing(){

KartObject.gameObject.AddComponent(Racer_AI);
KartObject.GetComponent(kartInput).enabled = false;

IngameCam.GetComponent(Camera_Control).Locked = true;
while(IngameCam.GetChild(1).GetComponent(Kart_Camera).Distance > -6){
IngameCam.GetChild(1).GetComponent(Kart_Camera).Distance -= Time.fixedDeltaTime * 10;
yield;
}

}


function EndRace(){

KartObject.gameObject.AddComponent(Racer_AI);
KartObject.GetComponent(kartInput).enabled = false;

IngameCam.GetComponent(Camera_Control).Locked = true;
while(IngameCam.GetChild(1).GetComponent(Kart_Camera).Distance > -6){
IngameCam.GetChild(1).GetComponent(Kart_Camera).Distance -= Time.fixedDeltaTime * 10;
yield;
}

if(Network.isClient == true)
transform.GetComponent(Client_Script).Finished();

if(Network.isServer == true)
transform.GetComponent(Host_Script).PlayerFinished();

}

