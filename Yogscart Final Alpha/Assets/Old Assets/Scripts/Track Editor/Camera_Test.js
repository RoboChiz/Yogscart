#pragma strict
@script RequireComponent(Camera)
@script ExecuteInEditMode()

var TestPan : CameraPoint;

//Private variables
private var t : float;

function Update(){
if(GameObject.Find("Test Camera") == null)
transform.name = "Test Camera";
else if(transform.name != "Test Camera"){
Debug.Log("You may only have one Test Camera per scene.");
DestroyImmediate(this);
}
}

function Start(){
if(Application.isPlaying == true){
while(true){
Play();
yield WaitForSeconds(TestPan.TravelTime);
}
}
}

function Play () {

Debug.Log(TestPan.TravelTime);

var startTime = Time.realtimeSinceStartup;

while((Time.realtimeSinceStartup-startTime) < TestPan.TravelTime){
transform.position = Vector3.Lerp(TestPan.StartPoint,TestPan.EndPoint,(Time.realtimeSinceStartup-startTime)/TestPan.TravelTime);
transform.rotation = Quaternion.Slerp(Quaternion.Euler(TestPan.StartRotation),Quaternion.Euler(TestPan.EndRotation),(Time.realtimeSinceStartup-startTime)/TestPan.TravelTime);
yield;
}

Debug.Log(Time.realtimeSinceStartup-startTime);

}
 //var StartPoint : Vector3;
 //var EndPoint : Vector3;
 //var StartRotation : Vector3;
 //var EndRotation : Vector3;
 //var TravelTime : float;