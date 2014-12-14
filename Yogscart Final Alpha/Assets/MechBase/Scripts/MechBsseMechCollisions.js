#pragma strict

function Start () {

}

function Update () {

}

function OnCollisionEnter(collision : Collision) {
if(collision.collider.tag=="MBEND"){ 
print("hit");
 }
}