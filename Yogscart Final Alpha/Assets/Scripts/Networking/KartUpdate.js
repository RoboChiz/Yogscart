#pragma strict

private var pos : Vector3;
private var rot : Quaternion;

private var ready : boolean;

@RPC
function IhaveMoved(position : Vector3,rotation : Quaternion, info : NetworkMessageInfo){

if(info.sender !=  Network.player){
pos = position;
rot = rotation;
}

if(ready == false)
ready = true;
}

function FixedUpdate(){
if(ready){
 
transform.position = Vector3.Slerp(transform.position,pos,Time.deltaTime);
transform.rotation = Quaternion.Slerp(transform.rotation,rot,Time.deltaTime);
}

}

function Awake(){
StartCoroutine("SendUpdate");
}

function SendUpdate(){

while(true){

if(networkView.owner == Network.player)
networkView.RPC("IhaveMoved",RPCMode.Others,transform.position,transform.rotation);

yield;
yield;
yield;
yield;
yield;

}
}