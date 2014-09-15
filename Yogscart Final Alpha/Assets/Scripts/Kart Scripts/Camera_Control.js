#pragma strict

var frontCamera : Camera;
var backCamera : Camera;
var Locked : boolean;

function FixedUpdate () {

if(Input.GetAxis("Look Behind") != 0 && !Locked){
backCamera.enabled = true;
frontCamera.enabled = false;
}else{
backCamera.enabled = false;
frontCamera.enabled = true;
}
}
