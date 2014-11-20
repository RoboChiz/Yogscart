#pragma strict

var spinTime : float = 1f;

function OnCollisionEnter(collision : Collision) {

transform.parent = null;

if(collision.transform.tag == "Kart" && collision.rigidbody != null){
transform.GetComponent(MeshRenderer).enabled = false;
transform.GetComponent(BoxCollider).enabled = false;

if(collision.transform.GetComponent(kartScript) != null && collision.transform.GetComponent(kartScript).locked == false){
collision.transform.GetComponent(kartScript).locked = true;

if(collision.transform.FindChild("Kart Body").localRotation == Quaternion.Euler(0,0,0)){
StartCoroutine("Spin",collision.transform);
yield WaitForSeconds(spinTime);
var Ani = collision.transform.FindChild("Kart Body").FindChild("Character").GetComponent(Animator);
Ani.SetBool("Hit",false);
StopCoroutine("Spin");


collision.transform.GetComponent(kartScript).locked = true;

collision.transform.FindChild("Kart Body").localRotation = Quaternion.Euler(0,0,0);
}

collision.transform.GetComponent(kartScript).locked = false;
}
	
Destroy(this.gameObject);	

}
}

function Spin(kart : Transform){

var Ani = kart.FindChild("Kart Body").FindChild("Character").GetComponent(Animator);
Ani.SetBool("Hit",true);

while(true){
kart.rigidbody.velocity = Vector3.Lerp(kart.rigidbody.velocity,Vector3(0,rigidbody.velocity.y,0),Time.deltaTime);
kart.FindChild("Kart Body").Rotate(kart.up,Time.deltaTime / (spinTime/360f));
yield;
}

Ani.SetBool("Hit",false);
}