#pragma strict

//enums
enum KartType{Display,Local,Online,Spectator};

private var gd : CurrentGameData;

var DebugMode : boolean;
var DebugPositions : Vector3[];

function Start()
{

gd = transform.GetComponent(CurrentGameData);

if(DebugMode)
{
var holder : Transform = SpawnKart(KartType.Local,0,0,0,0);
holder.gameObject.AddComponent(kartInput);
holder.GetComponent(kartScript).locked = false;
holder.GetComponent(Position_Finding).enabled = false;
holder.GetComponent(Position_Finding).position = 11;
//Adjust Scripts
var im = GameObject.Find("GameData").GetComponent(InputManager);
holder.GetComponent(kartInput).InputName = im.c[0].inputName;
//Add Camera
var IngameCam = Instantiate(Resources.Load("Prefabs/Cameras",Transform),Vector3.zero,Quaternion.identity);
IngameCam.name = "InGame Cams";

holder.GetComponent(kartInput).frontCamera = IngameCam.GetChild(1).camera;
holder.GetComponent(kartInput).backCamera = IngameCam.GetChild(0).camera;

IngameCam.GetChild(0).GetComponent(Kart_Camera).Target = holder;
IngameCam.GetChild(1).GetComponent(Kart_Camera).Target = holder;

for(var i : int = 0; i < DebugPositions.Length; i++)
{
var OtherKart : Transform = SpawnKart(KartType.Local,0,0,0,0);
OtherKart.position = DebugPositions[i];
OtherKart.GetComponent(Position_Finding).enabled = false;
}

}

}

function SpawnKart(kartType : KartType, kart : int, wheel : int, character : int, hat : int)
{

//Spawn Kart & Wheels
var kartBody : Transform = Instantiate(gd.Karts[kart].model,Vector3(0,0,0),Quaternion.identity);
var kartSkel : KartSkeleton = kartBody.GetComponent(KartSkeleton);

var frontlWheel : Transform = Instantiate(gd.Wheels[wheel].model,kartSkel.FrontLPosition,Quaternion.Euler(0,0,0));
frontlWheel.parent = kartBody.FindChild("Kart Body");
frontlWheel.name = "FrontL Wheel";

var frontrWheel : Transform = Instantiate(gd.Wheels[wheel].model,kartSkel.FrontRPosition,Quaternion.Euler(0,180,0));
frontrWheel.parent = kartBody.FindChild("Kart Body");
frontrWheel.name = "FrontR Wheel";

var backlWheel : Transform = Instantiate(gd.Wheels[wheel].model,kartSkel.BackLPosition,Quaternion.Euler(0,0,0));
backlWheel.parent = kartBody.FindChild("Kart Body");
backlWheel.name = "BackL Wheel";

var backrWheel : Transform = Instantiate(gd.Wheels[wheel].model,kartSkel.BackRPosition,Quaternion.Euler(0,180,0));
backrWheel.parent = kartBody.FindChild("Kart Body");
backrWheel.name = "BackR Wheel";

//Spawn Character & Hat
var characterMesh : Transform = Instantiate(gd.Characters[character].model,Vector3(0,0,0),Quaternion.identity);
characterMesh.name = "Character";

var charSkel : CharacterSkeleton = characterMesh.GetComponent(CharacterSkeleton);

characterMesh.position = kartSkel.SeatPosition - charSkel.SeatPosition;
characterMesh.parent = kartBody.FindChild("Kart Body");

if(hat != 0){

var hatMesh : Transform = Instantiate(gd.Hats[hat].Model,charSkel.HatHolder.position,Quaternion.identity);
hatMesh.parent = charSkel.HatHolder;
hatMesh.localRotation = Quaternion.Euler(0,0,0);

}

if(kartType != kartType.Display){

var kb : GameObject = kartBody.gameObject;

kb.AddComponent(Rigidbody);
kb.rigidbody.mass = 10;
kb.rigidbody.collisionDetectionMode = CollisionDetectionMode.ContinuousDynamic;
kb.rigidbody.interpolation = RigidbodyInterpolation.Interpolate;
kb.rigidbody.angularDrag = 10;

kb.AddComponent(AudioSource);
kartBody.FindChild("Kart Body").gameObject.AddComponent(AudioSource);
kb.GetComponent(AudioSource).playOnAwake = false;
kartBody.GetComponent(AudioSource).playOnAwake = false;

kb.AddComponent(DeathCatch);
kb.GetComponent(DeathCatch).DeathParticles = kartBody.FindChild("Kart Body").FindChild("Particles").FindChild("Death Particles").particleSystem;

var frontlWheelCollider : Transform = Instantiate(gd.Wheels[wheel].model,kartSkel.FrontLPosition,Quaternion.Euler(0,0,0));
frontlWheelCollider.name = "FrontL Wheel";
frontlWheelCollider.parent = kartBody.FindChild("Colliders");
SetUpWheelCollider(frontlWheelCollider);

var frontrWheelCollider : Transform = Instantiate(gd.Wheels[wheel].model,kartSkel.FrontRPosition,Quaternion.Euler(0,180,0));
frontrWheelCollider.parent = kartBody.FindChild("Colliders");
frontrWheelCollider.name = "FrontR Wheel";
SetUpWheelCollider(frontrWheelCollider);

var backlWheelCollider : Transform = Instantiate(gd.Wheels[wheel].model,kartSkel.BackLPosition,Quaternion.Euler(0,0,0));
backlWheelCollider.parent = kartBody.FindChild("Colliders");
backlWheelCollider.name = "BackL Wheel";
SetUpWheelCollider(backlWheelCollider);

var backrWheelCollider : Transform = Instantiate(gd.Wheels[wheel].model,kartSkel.BackRPosition,Quaternion.Euler(0,180,0));
backrWheelCollider.parent = kartBody.FindChild("Colliders");
backrWheelCollider.name = "BackR Wheel";
SetUpWheelCollider(backrWheelCollider);

kb.AddComponent(kartAnimation);
kb.GetComponent(kartAnimation).ani = characterMesh.GetComponent(Animator);

kb.AddComponent(kartScript);

var ks = kb.GetComponent(kartScript);

if(kb.transform.FindChild("Colliders").FindChild("FloorCatch") != null)
ks.fallingcatchCollider = kb.transform.FindChild("Colliders").FindChild("FloorCatch").collider;

ks.engineSound = kartSkel.engineSound;

ks.Wheels = new WheelCollider[4];
ks.Wheels[0] = frontlWheelCollider.GetComponent(WheelCollider);
ks.Wheels[1] = frontrWheelCollider.GetComponent(WheelCollider);
ks.Wheels[2] = backlWheelCollider.GetComponent(WheelCollider);
ks.Wheels[3] = backrWheelCollider.GetComponent(WheelCollider);

ks.MeshWheels = new Transform[4];
ks.MeshWheels[0] = frontlWheel;
ks.MeshWheels[1] = frontrWheel;
ks.MeshWheels[2] = backlWheel;
ks.MeshWheels[3] = backrWheel;

var kp : Transform = kartBody.FindChild("Kart Body").FindChild("Particles");

ks.flameParticles = new ParticleSystem[2];
ks.flameParticles[0] = kp.FindChild("Left Flame").particleSystem;
ks.flameParticles[1] = kp.FindChild("Right Flame").particleSystem;

ks.DriftParticles = new Transform[2];
ks.DriftParticles[0] = kp.FindChild("Left Spark");
ks.DriftParticles[1] = kp.FindChild("Right Spark");

if(kartType != KartType.Spectator){
kb.AddComponent(Position_Finding);
kb.AddComponent(kartItem);
kb.GetComponent(kartItem).spawnDistance = kartSkel.ItemDrop;
}

}

//Clear Up
Destroy(kartSkel);
Destroy(charSkel);

return kartBody;

}

function SetUpWheelCollider(collider : Transform)
{

collider.gameObject.AddComponent(WheelCollider);

var wheelCollider = collider.GetComponent(WheelCollider);

//Setup Collider Settings
wheelCollider.mass = 15;
wheelCollider.suspensionDistance = 3;

wheelCollider.suspensionSpring.spring = 2;
wheelCollider.suspensionSpring.damper = 15;
wheelCollider.suspensionSpring.targetPosition = 0;

wheelCollider.forwardFriction.extremumSlip = 0.02;
wheelCollider.forwardFriction.extremumValue = 1;
wheelCollider.forwardFriction.asymptoteSlip = 0.04;
wheelCollider.forwardFriction.asymptoteValue = 0.6;
wheelCollider.forwardFriction.stiffness = 50000;

wheelCollider.sidewaysFriction.extremumSlip = 0.01;
wheelCollider.sidewaysFriction.extremumValue = 1;
wheelCollider.sidewaysFriction.asymptoteSlip = 0.04;
wheelCollider.sidewaysFriction.asymptoteValue = 0.6;
wheelCollider.sidewaysFriction.stiffness = 50000;

Destroy(collider.GetComponent(MeshFilter));
Destroy(collider.GetComponent(MeshRenderer));


}