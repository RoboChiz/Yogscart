#pragma strict

var ItemFrame : Texture2D;
private var HeldItem : Transform;
private var HeldItemNum : int = -1;
private var Iteming : boolean;
@HideInInspector
var ItemCrate : Transform;
var PhysicsProp : Transform;

var ScrollingSound : AudioClip;
var DoneSound : AudioClip;

private var ControlLock : boolean;

var ItemSpawnDistance : float = 1.5;

private var gd : CurrentGameData;

function Awake(){
Random.seed = System.DateTime.Now.Hour * System.DateTime.Now.Minute * System.DateTime.Now.Second;
}

function OnGUI () {

if(gd == null)
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);

var sw : float = Screen.width;
var sh : float = Screen.height;

var FrameRect : Rect = Rect(sw*0.825f,0,sw*0.15f,sh*0.2f);

if(ItemFrame != null)
GUI.DrawTexture(FrameRect,ItemFrame);

#if UNITY_ANDROID

if(WithinBounds(FrameRect) && ControlLock == false){
UseItem();
ControlLock = true;
}

if(Input.touches.Length == 0)
ControlLock = false;

#else
if(Input.GetAxis("Fire1") != 0 && HeldItemNum != -1 && ControlLock == false){
UseItem();
ControlLock = true;
}

if(Input.GetAxis("Fire1") == 0 && ControlLock == true)
ControlLock = false;
#endif


}

function UseItem(){

var Drop : Transform;

if((Network.isServer == true || Network.isClient == true) && gd.PowerUps[HeldItemNum].ItemEffect == false)
Drop = Network.Instantiate(gd.PowerUps[HeldItemNum].Model,transform.position - (transform.forward*ItemSpawnDistance),transform.rotation,0);
else
Drop = Instantiate(gd.PowerUps[HeldItemNum].Model,transform.position - (transform.forward*ItemSpawnDistance),transform.rotation);

if(gd.PowerUps[HeldItemNum].CanHoldBehindKart == true){
if(Drop.rigidbody != null)
Drop.rigidbody.isKinematic = true;

while(Input.GetAxis("Fire1") != 0){
Drop.position = transform.position - (transform.forward*ItemSpawnDistance);
yield;
}

if(Drop.rigidbody != null)
Drop.rigidbody.isKinematic = false;


}

if(gd.PowerUps[HeldItemNum].ItemEffect == true){
Drop.parent = transform;
}

Destroy(HeldItem.gameObject);
HeldItemNum = -1;
Iteming = false;

ItemCrate.renderer.enabled = true;

}

function BoxHit(){

var Particles = Instantiate(PhysicsProp,ItemCrate.position,ItemCrate.rotation);
var OriginalHeight : float = Particles.position.y;

for( var child : Transform in Particles ){
       child.gameObject.layer = 11;
}
    
    
ItemCrate.renderer.enabled = false;

audio.clip = ScrollingSound;
audio.Play();



var ItemNum = Random.Range(0,gd.PowerUps.Length);

var counter : int;

StartCoroutine("Down",Particles);

while(audio.isPlaying){
var item : Transform = Instantiate(gd.PowerUps[counter].DisplayModel,ItemCrate.position + Vector3(0,.5f,0),Quaternion.identity);
yield WaitForSeconds(0.2);
Destroy(item.gameObject);

if(counter+1<gd.PowerUps.Length)
counter += 1;
else
counter = 0;

Debug.Log("Iteming");

}

Debug.Log("DONE!");

StopCoroutine("Down");

Destroy(Particles.gameObject);
audio.clip = DoneSound;
audio.Play();

HeldItem = Instantiate(gd.PowerUps[ItemNum].DisplayModel,ItemCrate.position + Vector3(0,.5f,0),Quaternion.identity);

HeldItemNum = ItemNum;


}

function Down(Particles : Transform){
yield WaitForSeconds(0.3);
while(true){
Particles.position.y -= Time.deltaTime/2f;
yield;
}
}

function OnTriggerEnter (other : Collider) {
if(other.name == "Crate" && Iteming == false && transform.GetComponent(Racer_AI) == null){//Adjust to allow AI Items
Iteming = true;
BoxHit();
}

}

function WithinBounds(Area : Rect){
for(var i : int = 0; i < Input.touches.Length; i++){
if(Input.GetTouch(i).position.x >= Area.x && Input.GetTouch(i).position.x <= Area.x + Area.width 
&&  Screen.height-Input.GetTouch(i).position.y >= Area.y &&  Screen.height-Input.GetTouch(i).position.y <= Area.y + Area.height){
return true;
}
}
return false;

}