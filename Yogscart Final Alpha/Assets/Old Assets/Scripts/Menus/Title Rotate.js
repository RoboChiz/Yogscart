#pragma strict

var Speed : float = 0.2;
private var NewRot : Quaternion;

function Start () {
while(true){
NewRot = Quaternion.Euler(Random.Range(-20,20),Random.Range(160,200),Random.Range(-20,20));
yield WaitForSeconds(3);
}
}

function Update(){
transform.rotation = Quaternion.Lerp(transform.rotation,NewRot,Speed * Time.deltaTime);
}