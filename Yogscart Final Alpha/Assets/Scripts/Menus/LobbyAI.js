#pragma strict

private var ExplorableAreaPos : Vector2;
var locked : boolean;

var TraveltoPos : Vector3;
var WalkDir : Vector3;

function Awake(){
Random.seed = (System.DateTime.Today.Year*1505) + (System.DateTime.Today.DayOfYear*23451) + (System.DateTime.Today.Second*1241);
}

function Start () {
ExplorableAreaPos = Vector2(-46,-27);

while(true){
if(locked == false){
newPos();
}
yield WaitForSeconds(Random.Range(5,20));

}
}

function newPos(){
TraveltoPos.x = Random.Range(ExplorableAreaPos.x,ExplorableAreaPos.x+20);
TraveltoPos.z = Random.Range(ExplorableAreaPos.y,ExplorableAreaPos.y+14);
}

function FixedUpdate(){

var nTraveltoPos = Vector3(TraveltoPos.x,0,TraveltoPos.z);
var ntransformposition = Vector3(transform.position.x,0,transform.position.z);

WalkDir = (nTraveltoPos - ntransformposition).normalized;

Debug.DrawRay(transform.position,WalkDir,Color.red);

if(Vector3.Distance(nTraveltoPos,ntransformposition) > 10){
rigidbody.velocity.x = WalkDir.x * 250 * Time.deltaTime;
rigidbody.velocity.z = WalkDir.z * 250 * Time.deltaTime;
transform.rotation = Quaternion.Lerp(transform.rotation,Quaternion.LookRotation(WalkDir,Vector3.up),Time.deltaTime*5f);
transform.GetComponent(Animator).SetFloat("Speed",2);
}else if(Vector3.Distance(nTraveltoPos,ntransformposition) > 0.1){
rigidbody.velocity.x = WalkDir.x * 100 * Time.deltaTime;
rigidbody.velocity.z = WalkDir.z * 100 * Time.deltaTime;
transform.rotation = Quaternion.Lerp(transform.rotation,Quaternion.LookRotation(WalkDir,Vector3.up),Time.deltaTime*5f);
transform.GetComponent(Animator).SetFloat("Speed",1);
}else{
rigidbody.velocity.x = 0;
rigidbody.velocity.z = 0;
transform.GetComponent(Animator).SetFloat("Speed",0);
}
}

