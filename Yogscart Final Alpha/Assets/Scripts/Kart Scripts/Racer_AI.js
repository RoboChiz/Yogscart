#pragma strict

private var td : TrackData;
private var pf : Position_Finding;
private var ks : kartScript;
private var ki : kartItem;

var Difficulty : int;
//0 - 50cc, 1 - 100cc, 2 - 150cc, 3 - Insane

var angleRequired : float = 2f;
private var steering : int;

private var nTarget : Vector3;
private var targestPos : int;

private var usedItem : boolean = false;

function Awake(){
td = GameObject.Find("Track Manager").GetComponent(TrackData);
pf = transform.GetComponent(Position_Finding);
ks = transform.GetComponent(kartScript);
ki = transform.GetComponent(kartItem);
}

function Update () {

//Calculate Throttle
ks.throttle = 1;

//Calculate Item

if(Difficulty == 0){
if(ki.heldPowerUp != -1 && usedItem == false){
useItemRandom();
usedItem = true;
}
}


//Calculate Steering
if(pf.currentPos+1 != targestPos){

var nextChump : int;
if(pf.currentPos+1 < td.PositionPoints.Length)
nextChump = pf.currentPos+1;
else
nextChump = 0;

var Target : Vector3 = td.PositionPoints[nextChump].rep.position;
var lastTarget : Vector3 = td.PositionPoints[pf.currentPos].rep.position;
var Adjuster = Vector3.Cross((Target-lastTarget).normalized,transform.up) * Random.Range(-1f,1f) * td.Scale;

nTarget = Target + Adjuster;

targestPos = nextChump;

}

var NeededDirection : Vector3 = nTarget - transform.position;
var angle : float = Vector3.Angle(transform.right,NeededDirection);

Debug.DrawRay(transform.position,transform.forward*5,Color.red);
Debug.DrawRay(transform.position,NeededDirection,Color.green);


if(angle > 90+angleRequired) 
steering = -1;
else if(angle < 90-angleRequired) 
steering = 1;
else
steering = 0;

ks.steer = steering;


}

function useItemRandom(){
Debug.Log("Started Iteming!");
yield WaitForSeconds(Random.Range(0,15));
ki.input = true;
yield;
yield;
Debug.Log("Done Iteming!");
ki.input = false;
usedItem = false;
}