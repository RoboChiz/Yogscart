#pragma strict

var specObjects : GameObject[];
var currentSpec : int = 0;

private var velocity = Vector3.zero;
private var gd : CurrentGameData;

@HideInInspector
var locked : boolean;

private var controlLock : boolean;

function Start(){
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
}

function RandomSort(){
while(true){
yield WaitForSeconds(Random.Range(5,20));
currentSpec += 1;

if(currentSpec >= specObjects.Length)
currentSpec = 0;
}
}

function Update () {

if(specObjects == null || specObjects.Length == 0){
specObjects = GameObject.FindGameObjectsWithTag("Spectated");
transform.GetComponent(Kart_Camera).enabled = false;
}else{

transform.GetComponent(Kart_Camera).enabled = true;

var Target = specObjects[currentSpec].transform;

transform.GetComponent(Kart_Camera).Target = Target;

if(!locked){
if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && controlLock == false){
currentSpec += 1;

if(currentSpec >= specObjects.Length)
currentSpec = 0;

controlLock = true;
}

if(Input.GetAxis(gd.pcn[0]+"Submit") == 0)
controlLock = false;
}

transform.GetComponent(Kart_Camera).Angle += Time.deltaTime*20;

if(transform.GetComponent(Kart_Camera).Angle >360)
transform.GetComponent(Kart_Camera).Angle = 0;

}
}