#pragma strict

private var td : TrackData;
private var pf : Position_Finding;
private var ks : kartScript;

var angleRequired : float = 5f;

private var steering : int;

function Awake(){
td = GameObject.Find("Track Manager").GetComponent(TrackData);
pf = transform.GetComponent(Position_Finding);
ks = transform.GetComponent(kartScript);
}

private var nTarget : Vector3;

private var targestPos : int;

function Update () {

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

Debug.DrawRay(transform.position,transform.right*3);
Debug.DrawRay(transform.position,-transform.right*3);

if(Physics.Raycast(transform.position,transform.right,3)){
ks.steer = 1;
}

if(Physics.Raycast(transform.position,-transform.right,3)){
ks.steer = -1;
}



ks.throttle = 1;

}