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
t = 0;
transform.position = TestPan.StartPoint;
transform.rotation = Quaternion.Euler(TestPan.StartRotation);

Debug.Log("Pan Started!");
while(t < TestPan.TravelTime){
transform.position = Vector3.Lerp(transform.position,TestPan.EndPoint,Time.deltaTime/TestPan.TravelTime);
transform.rotation = Quaternion.Euler(Vector3.Lerp(transform.rotation.eulerAngles,TestPan.EndRotation,Time.deltaTime/TestPan.TravelTime));
t += Time.deltaTime/TestPan.TravelTime;
yield;
}
Debug.Log("Done!");
}


 //var StartPoint : Vector3;
 //var EndPoint : Vector3;
 //var StartRotation : Vector3;
 //var EndRotation : Vector3;
 //var TravelTime : float;