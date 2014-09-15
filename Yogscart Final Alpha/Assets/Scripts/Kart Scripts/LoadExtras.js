#pragma strict

private var gd : CurrentGameData;

function Awake(){
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
}

@RPC
function LoadObjects (hat : int,wheel : int) {

if(hat != 0 && hat < gd.Hats.length && gd.Hats[hat].Model != null){
var HatObject = Instantiate(gd.Hats[hat].Model,transform.position,Quaternion.identity);

if(transform.GetComponent(QA).objects[0] != null){
HatObject.position = transform.GetComponent(QA).objects[0].position;
HatObject.rotation = transform.GetComponent(QA).objects[0].rotation;
HatObject.parent = transform.GetComponent(QA).objects[0];
}
}

var Wheels = new Transform[4];

for(var j : int = 0; j < Wheels.Length;j++){
Wheels[j] = transform.GetComponent(QA).objects[j+1];

var nWheel : Transform = Instantiate(gd.Wheels[wheel].Models[j],Wheels[j].position,Wheels[j].rotation);
nWheel.parent = Wheels[j].parent;
nWheel.name = Wheels[j].name;
nWheel.localScale = Wheels[j].localScale;

transform.GetComponent(kartScript).MeshWheels[j] = nWheel;

Destroy(Wheels[j].gameObject);

transform.GetComponent(QA).objects[j+1] = nWheel;

}


}
