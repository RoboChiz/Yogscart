 #pragma strict

var input : boolean;
var CluckyInput : Vector3 = Vector3(0,0,1);

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
var spawnDistance : float;

var loadedClucky : Transform;

function Awake(){
if(this.enabled == true){
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
size = Screen.width/8f;
}
}

function Update(){
if(ki == null)
ki = transform.GetComponent(kartInfo);
if(pf == null)
pf = transform.GetComponent(Position_Finding);
}

function FixedUpdate()
{

if(loadedClucky != null)
{
if(CluckyInput != Vector3.zero)
{
loadedClucky.position = transform.position + transform.TransformDirection(CluckyInput.normalized*spawnDistance);
loadedClucky.rotation = Quaternion.LookRotation(loadedClucky.position-transform.position,Vector3.up);
}
}

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

transform.FindChild("Kart Body").audio.clip = Resources.Load("Music & Sounds/Powerup",AudioClip);
transform.FindChild("Kart Body").audio.Play();

renderItemHeight = -size ;

var counter : int = 0;
var startTime : float = Time.timeSinceLevelLoad;

while((Time.timeSinceLevelLoad-startTime) < 1.7){

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

if(heldPowerUp >= 5)
{
loadedClucky = Instantiate(Resources.Load("Prefabs/Power Ups/Clucky",Transform),transform.position - (transform.forward*spawnDistance),transform.rotation);
loadedClucky.parent = transform;
loadedClucky.name = "Clucky";
}

}

function UsePowerUp()
{
var clone : Transform ;
if(loadedClucky != null)
clone = Instantiate(gd.PowerUps[heldPowerUp].Model,loadedClucky.position,transform.rotation);
else
clone = Instantiate(gd.PowerUps[heldPowerUp].Model,transform.position - (transform.forward*spawnDistance),transform.rotation);

clone.parent = transform;

if(gd.PowerUps[heldPowerUp].type == ItemType.UsableAsShield){

clone.parent = transform.FindChild("Kart Body");
clone.rigidbody.isKinematic = true;

while(input == true && clone != null){
yield;
}

if(clone != null){
clone.rigidbody.isKinematic = false;
clone.parent = null;
}

}

if(gd.PowerUps[heldPowerUp].type != ItemType.MultipleUses){
heldPowerUp = -1;
inUse = false;

if(loadedClucky != null)
Destroy(loadedClucky.gameObject);

}
else
{
heldPowerUp -= 1;
}

}


function Scroll(){

var nstartTime : float = Time.timeSinceLevelLoad;

while((Time.timeSinceLevelLoad-nstartTime) < 0.2 ){

renderItemHeight = Mathf.Lerp(-size,size,(Time.timeSinceLevelLoad-nstartTime)/0.2);

yield;

}

}

function Stop(){

transform.FindChild("Kart Body").audio.clip = Resources.Load("Music & Sounds/Powerup2",AudioClip);
transform.FindChild("Kart Body").audio.Play();

var nstartTime : float = Time.timeSinceLevelLoad;

while((Time.timeSinceLevelLoad-nstartTime) < 0.2 ){

renderItemHeight = Mathf.Lerp(-size,0,(Time.timeSinceLevelLoad-nstartTime)/0.2);

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