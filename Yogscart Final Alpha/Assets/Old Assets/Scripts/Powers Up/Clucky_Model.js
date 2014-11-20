#pragma strict

var Clucky : Transform;

function Update () {

var input : Vector3 = Vector3(Input.GetAxis("Horizontal"),0,Input.GetAxis("Vertical"));
if(input.magnitude < 0.1)
input = Vector3(0,0,1);

var AimDir : Vector3 = transform.TransformDirection(input).normalized;

Clucky.LookAt(transform.position + Vector3(0,0.5,0) + AimDir*2f);
Clucky.position = Vector3.Lerp(Clucky.position,transform.position + Vector3(0,0.5,0) + AimDir*1.5f,Time.deltaTime*3f);

}