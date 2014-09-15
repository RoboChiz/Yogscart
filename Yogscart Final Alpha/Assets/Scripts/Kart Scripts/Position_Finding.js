#pragma strict

var Lap : int;
var currentPos : int;
var currentTotal : int;
var currentDistance : float;

var locked : boolean;

private var tm : TrackData;

function Start(){
tm = GameObject.Find("Track Manager").transform.GetComponent(TrackData);
}

function Update () {

var closestDistance : float = Mathf.Infinity;
closestDistance = Vector3.Distance(transform.position,tm.PositionPoints[NumClamp(currentPos,0,tm.PositionPoints.Length)].rep.position);

CheckForward(closestDistance);
CheckBackwards(closestDistance);

currentPos = NumClamp(currentPos,0,tm.PositionPoints.Length);
currentTotal = Mathf.Clamp(currentTotal,Lap * tm.PositionPoints.Length,Mathf.Infinity);
currentDistance = Vector3.Distance(transform.position,tm.PositionPoints[NumClamp(currentPos + 1,0,tm.PositionPoints.Length)].rep.position);

var hit : RaycastHit;
if(currentTotal > (Lap+1)*tm.PositionPoints.Length-1){

var nKartStartRotation = tm.PositionPoints[0].rep.rotation * Quaternion.Euler(Vector3(180,0,0));

if((Physics.Raycast(tm.PositionPoints[0].rep.position,nKartStartRotation*Vector3.forward,hit,tm.Scale * 5f) && hit.transform == transform)||
(Physics.Raycast(tm.PositionPoints[0].rep.position,nKartStartRotation*-Vector3.forward,hit,tm.Scale * 5f) && hit.transform == transform))
Lap += 1;

}

if(locked){
StopCoroutine("UpdatePos");
}

}

function Awake(){
StartCoroutine("UpdatePos");
}

function UpdatePos(){
if(GameObject.Find("GameData") != null)
while(true){

if(Network.isClient == false)
if(transform.GetComponent(Racer_AI) != null){
GameObject.Find("GameData").GetComponent(Host_Script).MyPositionisAI(transform.name,currentTotal,currentDistance);
}else
GameObject.Find("GameData").GetComponent(Host_Script).MyPositionisServer(currentTotal,currentDistance);

yield WaitForSeconds(0.4);

}
}


function CheckForward(closestDistance : float){
for(var i : int = 1; i < 3; i++){
var newdistance = Vector3.Distance(transform.position,tm.PositionPoints[NumClamp(currentPos+i,0,tm.PositionPoints.Length)].rep.position);
if(newdistance < closestDistance){
closestDistance = newdistance;
currentPos += i;
if(currentPos == (currentTotal + i)-((tm.PositionPoints.Length)*Lap))
currentTotal += i;
}
}
}

function CheckBackwards(closestDistance : float){
for(var j : int = -1; j > -3; j--){
var newdistance = Vector3.Distance(transform.position,tm.PositionPoints[NumClamp(currentPos+j,0,tm.PositionPoints.Length)].rep.position);
if(newdistance < closestDistance){
closestDistance = newdistance;
currentPos += j;
if(currentTotal > Lap * tm.PositionPoints.Length-1)
currentTotal += j;
}
}
}

function NumClamp(val : int,min : int,max : int){

while(val > max-1)
val -= (max-min);

while(val < min)
val += (max-min);


return val;

}
