#pragma strict

var locked : boolean = true;
var isFalling : boolean;

//Inputs
@HideInInspector
var throttle : float;
@HideInInspector
var steer : float;
@HideInInspector
var drift : boolean;
private var driftLock : boolean;

var ExpectedSpeed : float;
var actualSpeed : float;

var Acceleration : float = 5f;
var MaxSpeed : float = 10f;
private var lastMaxSpeed : float;
var BrakeTime : float = 1f;

var Wheels : WheelCollider[];
var MeshWheels : Transform[];
var turnSpeed : float = 2;

var lapisAmount : int = 0;

@HideInInspector
var startBoosting : int = -1;

private var allowedBoost : boolean;
private var spinOut : boolean;
private var boostAmount : float;

private var spinning : boolean;

@HideInInspector
var spinTime : float = 2f;

private var MSdivided : float;
private var localScale : float;

var flameParticles : ParticleSystem[];

var engineSound : AudioClip;

var checkDistance : float = 0.4f;
var pushDistance : float = 0.25f;
var pushTime : float = 0.1f;
private var Pushing : boolean;

private var lastPosition : Vector3;

var fallingcatchCollider : Collider;

function Awake(){
//Precalulcate intensive constants
MSdivided = (1/MaxSpeed);
localScale = 3;
rigidbody.centerOfMass = transform.FindChild("Centre of Mass").localPosition;


}

private var tricking : boolean;

function Update(){

CheckGravity();

if(isFalling){
if(!tricking && drift && driftLock == false){
ApplyTrick();
tricking = true;
}

}else{
if(tricking){
Boost(0.25);
tricking = false;
}
}

if(drift && !driftLock)
driftLock = true;

if(!drift)
driftLock = false;

VisualUpdate();

//Calculate Start Boost
if(startBoosting == 3 && throttle > 0){
spinOut = true;
}
if(startBoosting == 2 && throttle > 0 && spinOut == false){
allowedBoost = true;
}

if(startBoosting < 2 && throttle == 0){
allowedBoost = false;
}

if(allowedBoost && throttle > 0)
boostAmount += Time.deltaTime * 0.1f;

if(startBoosting == 4 && allowedBoost){
Boost(boostAmount);
startBoosting = -1;
}

if(startBoosting == 4 && spinOut){
SpinOut();
startBoosting = -1;
}

}

function FixedUpdate () {

lapisAmount = Mathf.Clamp(lapisAmount,0,10);

if(fallingcatchCollider != null)
{
if(isFalling)
fallingcatchCollider.enabled = true;
else
fallingcatchCollider.enabled = false;
}

//Play engine Audio
if(engineSound != null){
if(!audio.isPlaying){
audio.clip = engineSound;
audio.Play();
audio.loop = true;
}

var es = ExpectedSpeed/4f;
audio.volume = Mathf.Lerp(audio.volume,Mathf.Abs(ExpectedSpeed),Time.deltaTime);
audio.pitch = Mathf.Lerp(audio.pitch,1 + Mathf.Abs(es),Time.deltaTime);

}

if(throttle == 0 || locked)
ApplyStopForce();
else
ApplyThrottle();

if(!locked && !isFalling){
ApplySteering();

ApplyDrift();

}

var nMaxSpeed : float = Mathf.Lerp(lastMaxSpeed,MaxSpeed-(1f-lapisAmount/10f),Time.fixedDeltaTime);

ExpectedSpeed = Mathf.Clamp(ExpectedSpeed,-nMaxSpeed,nMaxSpeed);

//Calculate if off track
var offTrack : int = 0;
for(var wheelCount : int = 0; wheelCount < Wheels.Length; wheelCount++)
{
var hit : RaycastHit;
if(Physics.Raycast(Wheels[wheelCount].transform.position,-Wheels[wheelCount].transform.up,hit,1) && hit.transform.tag == "NotDrivable"){
offTrack += 1;
}
}

if(offTrack >= Wheels.Length/2f)
ExpectedSpeed = Mathf.Clamp(ExpectedSpeed,-nMaxSpeed/4f,nMaxSpeed/4f);


if(isBoosting){
nMaxSpeed = MaxSpeed + BoostAddition;
ExpectedSpeed = MaxSpeed + BoostAddition;
}

var relativeVelocity : Vector3 = transform.InverseTransformDirection(rigidbody.velocity);
actualSpeed = relativeVelocity.z;

var nExpectedSpeed = ExpectedSpeed * localScale;
var nA  = (nExpectedSpeed-actualSpeed)/Time.fixedDeltaTime;

//AS Physics about Velocity :D Take note!
//V=U+AT
//(V-U)/T
//F=MA
//s = ut + 0.5at²

if(!isFalling)
rigidbody.AddForce(transform.forward * rigidbody.mass * nA);

lastMaxSpeed = nMaxSpeed;


var downHit : RaycastHit;
if(Physics.Raycast(transform.position,Vector3.down,hit,10))
if(Vector3.Angle(hit.normal,transform.up) > 45)
SnapUp();

}

function OnCollisionEnter(collision : Collision) {

if(collision.other.tag == "Kart")
{

var dir = transform.TransformDirection(transform.position - collision.other.transform.position);
var ndir = transform.InverseTransformDirection(Vector3(Mathf.Sign(dir.x),0,0)).normalized;

Push(ndir);

}

}

function ApplyThrottle(){

if(HaveTheSameSign(throttle,ExpectedSpeed) == false)
ExpectedSpeed += (throttle * Acceleration * 2) *  Time.fixedDeltaTime;
else{
var percentage : float = MSdivided * Mathf.Abs(ExpectedSpeed);
ExpectedSpeed += (throttle * Acceleration * (1f-percentage)) *  Time.fixedDeltaTime;
}				
												
}

function ApplyStopForce (){

var cacceleration : float = -ExpectedSpeed/BrakeTime;
ExpectedSpeed += (cacceleration * Time.fixedDeltaTime);

if(Mathf.Abs(ExpectedSpeed) <= 0.02)
ExpectedSpeed = 0;

}

function ApplySteering(){

if(!applyingDrift){

var speedVal = Mathf.Clamp((MaxSpeed - Mathf.Abs(ExpectedSpeed))/3f,1,Mathf.Infinity);

Wheels[0].steerAngle = Mathf.Lerp(Wheels[0].steerAngle,steer * turnSpeed * speedVal,Time.fixedDeltaTime*10);
Wheels[1].steerAngle = Mathf.Lerp(Wheels[1].steerAngle,steer * turnSpeed * speedVal,Time.fixedDeltaTime*10);
}else{
Wheels[0].steerAngle = Mathf.Lerp(Wheels[0].steerAngle,DriftVal,Time.fixedDeltaTime);
Wheels[1].steerAngle = Mathf.Lerp(Wheels[1].steerAngle,DriftVal,Time.fixedDeltaTime);
}


}

var driftAmount : float = 20;

private var driftTime : float;
var blueTime : float = 3;
var orangeTime : float = 6;

var DriftParticles : Transform[];

private var driftSteer : int;
private var driftStarted : boolean;

private var applyingDrift : boolean;
private var DriftVal : float;

function ApplyDrift(){

var KartBody : Transform = transform.FindChild("Kart Body");

if(drift && ExpectedSpeed > MaxSpeed*0.75f && !isFalling){
if(!applyingDrift && Mathf.Abs(steer) > 0.2 && driftStarted == false ){
driftStarted = true;
driftSteer = Mathf.Sign(steer);
}
}else{
if(driftStarted == true){
DriftVal = driftSteer*Quaternion.Angle(transform.localRotation,KartBody.rotation);
applyingDrift = true;
driftStarted = false;
ResetDrift();
}
}

if(driftStarted == true){
driftTime += Time.fixedDeltaTime + (Time.fixedDeltaTime * Mathf.Abs(driftSteer+steer));
KartBody.localRotation = Quaternion.Slerp(KartBody.localRotation,Quaternion.Euler(0,driftAmount * driftSteer,0),Time.fixedDeltaTime*2);
Wheels[0].steerAngle = Mathf.Lerp(Wheels[0].steerAngle,driftSteer * turnSpeed*1.25f,Time.fixedDeltaTime*10);
Wheels[1].steerAngle = Mathf.Lerp(Wheels[1].steerAngle,driftSteer * turnSpeed*1.25f,Time.fixedDeltaTime*10);

for(var f : int = 0; f < 2; f++){

if(driftTime >= orangeTime){

DriftParticles[f].renderer.material = Resources.Load("Particles/Drift Particles/Spark_Orange", Material);

}else if(driftTime >= blueTime){

DriftParticles[f].particleSystem.Play();
DriftParticles[f].renderer.material = Resources.Load("Particles/Drift Particles/Spark_Blue", Material);

}
}

}else{
KartBody.localRotation = Quaternion.Slerp(KartBody.localRotation,Quaternion.Euler(0,0,0),Time.fixedDeltaTime*2);

if(throttle > 0){
if(driftTime >= orangeTime)
Boost(1);
else if(driftTime >= blueTime)
Boost(0.5);
}

driftTime = 0f;
DriftParticles[0].particleSystem.Stop();
DriftParticles[1].particleSystem.Stop();
}

}

function ResetDrift(){
yield WaitForSeconds(0.1f);
applyingDrift = false;
}

function CheckGravity(){

Debug.DrawRay(transform.position,Physics.gravity.normalized*1);

if((!Wheels[0].isGrounded && !Wheels[1].isGrounded && !Wheels[2].isGrounded && !Wheels[3].isGrounded)||
!Physics.Raycast(transform.position,Physics.gravity.normalized,3))
isFalling = true;
else
isFalling = false;

}

private var isBoosting : boolean;
var BoostAddition : int = 5;

function Boost(t : float){

isBoosting = true;

StopCoroutine("StartBoost");
StartCoroutine("StartBoost",t);

}

function StartBoost(t : float){

var BoostSound = Resources.Load("Music & Sounds/SFX/boost",AudioClip);

audio.PlayOneShot(BoostSound,3);

for(var i : int = 0; i < flameParticles.Length; i++)
flameParticles[i].Play();

yield WaitForSeconds(t);

for(i = 0; i < flameParticles.Length; i++)
flameParticles[i].Stop();

isBoosting = false;

}

function CancelBoost()
{

StopCoroutine("Boost");

for(var i : int = 0; i < flameParticles.Length; i++)
flameParticles[i].Stop();

isBoosting = false;
}

function SnapUp(){

transform.rotation = Quaternion.Slerp(transform.rotation,Quaternion.Euler(0,transform.rotation.eulerAngles.y,0),Time.deltaTime*5f);

}

function ApplyTrick(){
Debug.Log("Tricked");
//Play Animation
}

function VisualUpdate(){
if(MeshWheels != null)
for(var i : int = 0; i < MeshWheels.Length; i++)
MeshWheels[i].Rotate(Vector3(Wheels[i].rpm/30f,0,0));
}

function SpinOut(){
StartCoroutine("StartSpinOut");
}


function StartSpinOut(){
if(!spinning)
{

spinning = true;

CancelBoost();

locked = true;

var t : float = 0;

var Ani = transform.FindChild("Kart Body").FindChild("Character").GetComponent(Animator);
Ani.SetBool("Hit",true);

while(t < spinTime){
transform.rigidbody.velocity = Vector3.Lerp(transform.rigidbody.velocity,Vector3(0,rigidbody.velocity.y,0),Time.deltaTime);
transform.FindChild("Kart Body").Rotate(transform.up,Time.deltaTime / (spinTime/360f));
yield;
t += Time.deltaTime;
}

Ani.SetBool("Hit",false);
locked = false;

spinning = false;

}

}

function Push(dir : Vector3)
{

rigidbody.constraints = RigidbodyConstraints.FreezePositionY;
rigidbody.freezeRotation = true;

var startTime = Time.realtimeSinceStartup;
var lastMove : Vector3;

while((Time.realtimeSinceStartup - startTime) < pushTime)
{

Debug.DrawRay(transform.position,dir * 10);

yield WaitForEndOfFrame;

var toMove = Vector3.Slerp(Vector3.zero,dir*pushDistance,(Time.realtimeSinceStartup-startTime)/pushTime);

transform.position += toMove-lastMove;

lastMove = toMove;

}

Pushing = false;

rigidbody.constraints = RigidbodyConstraints.None;

}

function HaveTheSameSign(first : float, second : float) : boolean
{
	if (Mathf.Sign(first) == Mathf.Sign(second))
		return true;
	else
		return false;
}
