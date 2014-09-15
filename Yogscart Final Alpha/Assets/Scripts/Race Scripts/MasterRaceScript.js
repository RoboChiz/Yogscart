#pragma strict

private var gd : CurrentGameData;
private var tm: TrackData;
private var HS : Host_Script;

function Awake(){
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
tm = GameObject.Find("Track Manager").GetComponent(TrackData);
HS = transform.GetComponent(Host_Script);
}

function Setup(){

if(Network.isServer == true){

for(var i : int = 0; i < HS.ConnectedRacers.Length; i++){
if(HS.ConnectedRacers[i].Human == false){
HS.ConnectedRacers[i].id = SpawnAIKart(0,0,1,0,i).name;
yield;
}
}

}
} 

function ActivateAIKarts(){
for(var i : int = 0; i < 12; i++){
if(GameObject.Find("AIKart " + i.ToString()) != null)
GameObject.Find("AIKart " + i.ToString()).GetComponent(kartScript).locked = false;
}
}

function ArraySort(array : Racer[],finishedCount : int){

var arr = new Array();
var harr = array;

if(harr != null && harr.Length > 0){
for(var j : int = 0; j < finishedCount; j++){
if(j < harr.Length){
arr.push(harr[j]);
harr = RemoveRacer(harr,j);
}
}

while(harr.length > 0){

var LargestRecord : int;
for(var i : int = 1; i < harr.length; i++){
//Debug.Log("Length:" + harr.Length + " I:" + i + " Largest Record:" + LargestRecord);
if((harr[i].TotalDistance > harr[LargestRecord].TotalDistance) || ((harr[i].TotalDistance >= harr[LargestRecord].TotalDistance) && (harr[i].NextDistance < harr[LargestRecord].NextDistance)))
LargestRecord = i;
}

if(LargestRecord < harr.length){
arr.push(harr[LargestRecord]);

harr = RemoveRacer(harr,LargestRecord);
}

}

return arr;
}else{
return array;
}
}


function AddRacer(array : Racer[] ,player : Racer){

var arr = new Array();
if(array != null){

arr = array;

}

arr.Push(player);
return arr;


}  

function RemoveRacer(array : Racer[] ,player : int){

var arr = new Array();

if(array != null)
for(var i : int = 0; i < array.Length; i++){
	if(i != player)
    arr.Push(array[i]);
    }
 
return arr;   
   
}

function SpawnAIKart(character : int, kart : int, hat : int, wheel : int, pos : int) {
var SpawnPosition : Vector3;
var rot : Quaternion = tm.PositionPoints[0].rep.rotation;

var x : Vector3 = rot*((Vector3.forward*(pos%3)*(tm.Scale*1.5f))+(Vector3.forward*.75f*tm.Scale));
var y : Vector3 = rot*(Vector3.right*(pos+1)*tm.Scale);

SpawnPosition = tm.PositionPoints[0].rep.position + x + y;  

var KartSpawn : Transform;

if(Network.isClient == true || Network.isServer == true)
KartSpawn = Network.Instantiate(gd.Karts[kart].Models[character],SpawnPosition,tm.PositionPoints[0].rep.rotation * Quaternion.Euler(0,-90,0),0);
else
KartSpawn = Instantiate(gd.Karts[kart].Models[character],SpawnPosition,tm.PositionPoints[0].rep.rotation * Quaternion.Euler(0,-90,0));

if(gd.Hats[hat].Model != null){
if(Network.isClient == true || Network.isServer == true)
var HatObject = Instantiate(gd.Hats[hat].Model,KartSpawn.position,Quaternion.identity);

if(KartSpawn.GetComponent(QA).objects[0] != null){
HatObject.position = KartSpawn.GetComponent(QA).objects[0].position;
HatObject.rotation = KartSpawn.GetComponent(QA).objects[0].rotation;
HatObject.parent = KartSpawn.GetComponent(QA).objects[0];
}
}

var Wheels = new Transform[4];

for(var j : int = 0; j < Wheels.Length;j++){
Wheels[j] = KartSpawn.GetComponent(QA).objects[j+1];

var nWheel : Transform = Instantiate(gd.Wheels[wheel].Models[j],Wheels[j].position,Wheels[j].rotation);
nWheel.parent = Wheels[j].parent;
nWheel.name = Wheels[j].name;
nWheel.localScale = Wheels[j].localScale;

KartSpawn.GetComponent(kartScript).MeshWheels[j] = nWheel;

Destroy(Wheels[j].gameObject);

KartSpawn.GetComponent(QA).objects[j+1] = nWheel;

}

KartSpawn.gameObject.AddComponent(Racer_AI);
KartSpawn.name = "AIKart " + pos.ToString();

return KartSpawn;

}
