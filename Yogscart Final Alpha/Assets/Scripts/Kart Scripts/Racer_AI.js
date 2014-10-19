﻿#pragma strict

private var td : TrackData;
private var pf : Position_Finding;
private var ks : kartScript;
private var ki : kartItem;
private var gd : CurrentGameData;

var Difficulty : int;
//0 - 50cc, 1 - 100cc, 2 - 150cc, 3 - Insane
var Stupidity : int; //Bigger the number, stupider the AI.

var angleRequired : float = 10f;
private var steering : int;

private var nTarget : Vector3;
private var targestPos : int = -1;

private var usedItem : boolean = false;

function Awake(){
td = GameObject.Find("Track Manager").GetComponent(TrackData);
pf = transform.GetComponent(Position_Finding);
ks = transform.GetComponent(kartScript);
ki = transform.GetComponent(kartItem);
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
}

function Update () {
//Calculate Item

if(ki.heldPowerUp != -1 && usedItem == false){

if(Stupidity < 5 && gd.PowerUps[ki.heldPowerUp].type == ItemType.UsableAsShield){
useShield();
}else
useItemRandom();

usedItem = true;
}

//Calculate Steering
if(NumClamp(pf.currentPos+1,0,td.PositionPoints.Length) != targestPos ){

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

if(!ks.locked){
var NeededDirection : Vector3 = nTarget - transform.position;
var angle : float = Vector3.Angle(transform.right,NeededDirection);

Debug.DrawRay(transform.position,transform.forward*5,Color.red);
Debug.DrawRay(transform.position,NeededDirection,Color.green);


if(angle > 90+angleRequired)
steering = -1;
else if(angle < 90-angleRequired)
steering = 1;
else{
steering = 0;
ks.drift = false;
}

if(steering != 0)
ks.throttle = 0.75;

//Calculate Throttle
if(angle >= 120 || angle  <= 60){

if(Stupidity < 6)
ks.drift = true;
ks.throttle = 0.5;

}else{
ks.throttle = 1;
}

var testangle : float = Vector3.Angle(transform.forward,NeededDirection);
if(testangle >= 135){
steering = 1;
ks.throttle = 0.25;
}

var relativeVelocity : Vector3 = transform.InverseTransformDirection(rigidbody.velocity);

if(ks.ExpectedSpeed > 1 && relativeVelocity.z < 1) //Presume something is blocking the kart.
reversing = true;

if(reversing){

Debug.DrawRay(transform.position,transform.forward*6,Color.green);
Debug.DrawRay(transform.position + transform.right,transform.forward*6,Color.green);
Debug.DrawRay(transform.position - transform.right,transform.forward*6,Color.green);

if(!Physics.Raycast(transform.position,transform.forward,6)&&!Physics.Raycast(transform.position + transform.right,transform.forward,6)&&!Physics.Raycast(transform.position - transform.right,transform.forward,6))
reversing = false;

steering = -steering;
ks.throttle = -1;
}

ks.steer = steering;

}

if(ks.startBoosting != -1){
if(Stupidity < 4 && ks.startBoosting <= 2)
ks.throttle = 1;

if(Stupidity > 7 && ks.startBoosting <= 3)
ks.throttle = 1;
}

}

var reversing : boolean;

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

function useShield(){
Debug.Log("Started Iteming!");
ki.input = true;
while(ki.heldPowerUp != -1)
yield;
Debug.Log("Done Iteming!");
ki.input = false;
usedItem = false;
}

function NumClamp(val : int,min : int,max : int){

while(val > max-1)
val -= (max-min);

while(val < min)
val += (max-min);


return val;

}