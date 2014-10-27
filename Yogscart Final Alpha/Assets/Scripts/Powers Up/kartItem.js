 #pragma strict

var input : boolean;

var inUse : boolean;
var heldPowerUp : int = -1;

var ControlLock : boolean;

private var GUIAlpha : float = 0;

private var renderItem : Texture2D;
var renderItemHeight : int;

private var gd : CurrentGameData;
private var ki : kartInfo;
private var pf : Position_Finding;

private var size : float;

function Awake(){
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
size = Screen.width/8f;

}

function Update(){
if(ki == null)
ki = transform.GetComponent(kartInfo);
if(pf == null)
pf = transform.GetComponent(Position_Finding);
}

function OnTriggerEnter (other : Collider) {
if(other.tag == "Crate" && inUse == false){
decidePowerUp();
inUse = true;
}
}

function decidePowerUp(){

var TotalChance : int;

for(var i : int =0; i < gd.PowerUps.Length; i++)
TotalChance += gd.PowerUps[i].likelihood[pf.position];

var nItemChance : int = Random.Range(0,TotalChance);

for(i = 0; i < gd.PowerUps.Length; i++){
nItemChance -= gd.PowerUps[i].likelihood[pf.position];

if(nItemChance <= 0){
var nItem = i;
i = gd.PowerUps.Length;
}

}

if(transform.GetComponent(kartInput) != null){

transform.GetComponent(kartScript).KartBody.audio.clip = Resources.Load("Music & Sounds/Powerup",AudioClip);
transform.GetComponent(kartScript).KartBody.audio.Play();

renderItemHeight = -size ;

var counter : int = 0;
var startTime : float = Time.realtimeSinceStartup;

while((Time.realtimeSinceStartup-startTime) < 1.7){

renderItem = gd.PowerUps[counter].Icon;

yield Scroll();

if(counter+1<gd.PowerUps.Length)
counter += 1;
else
counter = 0;

}

renderItem = gd.PowerUps[nItem].Icon;
yield Stop();

}else
yield WaitForSeconds(2);

heldPowerUp = nItem;

}

function UsePowerUp(){
var clone : Transform ;

clone = Instantiate(gd.PowerUps[heldPowerUp].Model,transform.GetComponent(QA).objects[6].position,transform.rotation);

clone.parent = transform;

if(gd.PowerUps[heldPowerUp].type == ItemType.UsableAsShield){

clone.parent = transform.GetComponent(QA).objects[5];

clone.rigidbody.isKinematic = true;

heldPowerUp = -1;

while(input == true && clone.parent != null){
yield;
}

if(clone != null){
clone.parent = null;
clone.rigidbody.isKinematic = false;
}

renderItem = null;
inUse = false;
}

if(heldPowerUp != -1)
if(gd.PowerUps[heldPowerUp].type != ItemType.MultipleUses){
heldPowerUp = -1;
inUse = false;
}else{
heldPowerUp -= 1;
}

if(heldPowerUp != -1)
if(gd.PowerUps[heldPowerUp].type != ItemType.UsableAsShield){
yield;
Destroy(clone.gameObject);
}

}


function Scroll(){

var nstartTime : float = Time.realtimeSinceStartup;

while((Time.realtimeSinceStartup-nstartTime) < 0.2 ){

renderItemHeight = Mathf.Lerp(-size,size,(Time.realtimeSinceStartup-nstartTime)/0.2);

yield;

}

}

function Stop(){

transform.GetComponent(kartScript).KartBody.audio.clip = Resources.Load("Music & Sounds/Powerup2",AudioClip);
transform.GetComponent(kartScript).KartBody.audio.Play();

var nstartTime : float = Time.realtimeSinceStartup;

while((Time.realtimeSinceStartup-nstartTime) < 0.2 ){

renderItemHeight = Mathf.Lerp(-size,0,(Time.realtimeSinceStartup-nstartTime)/0.2);

yield;

}

}

function OnGUI () {

if(transform.GetComponent(kartInput) != null){
GUI.color = Color32(255,255,255,GUIAlpha);

var Frame : Texture2D = Resources.Load("UI Textures/Power Ups/item frame",Texture2D);
var FrameRect : Rect;

if(ki != null){

if(ki.screenPos == ScreenType.Full)
size = Screen.width/8f;
else
size = Screen.width/16f;

if(ki.screenPos == ScreenType.Full)
FrameRect = Rect(Screen.width - 20 - size,20,size,size);

if(ki.screenPos == ScreenType.TopLeft)
FrameRect = Rect(Screen.width/2f - 20 - size,20,size,size);

if(ki.screenPos == ScreenType.TopRight || ki.screenPos == ScreenType.Top)
FrameRect = Rect(Screen.width - 20 - size,20,size,size);

if(ki.screenPos == ScreenType.BottomLeft)
FrameRect = Rect(Screen.width/2f - 20 - size,20 + Screen.height/2f,size,size);

if(ki.screenPos == ScreenType.BottomRight || ki.screenPos == ScreenType.Bottom)
FrameRect = Rect(Screen.width - 20 - size,20 + Screen.height/2f,size,size);

}else
FrameRect = Rect(Screen.width - 20 - size,20,size,size);

GUI.BeginGroup(FrameRect);

if(heldPowerUp != -1)
renderItem = gd.PowerUps[heldPowerUp].Icon;

if(renderItem!= null){
var ItemRect : Rect = Rect(5,5+renderItemHeight,size - 10,size- 10);
GUI.DrawTexture(ItemRect,renderItem);
}

GUI.EndGroup();

GUI.DrawTexture(FrameRect,Frame);

if(inUse)
GUIAlpha = Mathf.Lerp(GUIAlpha,256,Time.deltaTime*5f);
else
GUIAlpha = Mathf.Lerp(GUIAlpha,0,Time.deltaTime*5f);

}

if(inUse == true && heldPowerUp != -1 && input == true && ControlLock == false){
UsePowerUp();
ControlLock = true;
}

if(input == false)
ControlLock = false;

}