#pragma strict

private var ks : kartScript;

function FixedUpdate () {

if(!Network.isClient && !Network.isServer)
this.enabled = false;

if(ks == null)
ks = transform.GetComponent(kartScript);
else
if(networkView.isMine)
SendUpdate();
}

function Start(){
if(Network.isClient && Network.isServer)
if(networkView.isMine)
InvokeRepeating("PosUpdate",0.5,.3f);

}

function SendUpdate () {
if(networkView.isMine && ks.locked == false)
networkView.RPC("KartUpdate",RPCMode.Others,ks.throttle,ks.steer,ks.drift);

}

function PosUpdate () {
networkView.RPC("KartPosUpdate",RPCMode.Others,transform.position,transform.rotation);

}

@RPC
function KartUpdate(t : float, s : float, d : boolean){
if(!networkView.isMine){
ks.throttle = t;
ks.steer = s;
ks.drift = d;
}
}

@RPC
function KartPosUpdate(pos : Vector3, rot : Quaternion){
if(!networkView.isMine){
tpos = pos;
trot = rot;
unlocked = false;
yield WaitForSeconds(.1f);
unlocked = true;
}
}

private var tpos : Vector3;
private var trot : Quaternion;
private var unlocked : boolean = true;

var smoothTime : float = 5f;

function Update(){

if(!networkView.isMine && !unlocked){

if(Vector3.Distance(tpos,transform.position) > 10)
transform.position = tpos;
else
transform.position = Vector3.Lerp(transform.position,tpos,Time.deltaTime * smoothTime);

if(Quaternion.Angle(transform.rotation,trot) > 30)
transform.rotation = trot;
else
transform.rotation = Quaternion.Lerp(transform.rotation,trot,Time.deltaTime * smoothTime);;
}

}

