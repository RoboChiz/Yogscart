#pragma strict

function OnCollisionEnter(collision : Collision) {

if(collision.rigidbody != null){
Debug.Log(collision.rigidbody != null);
transform.GetComponent(MeshRenderer).enabled = false;
transform.GetComponent(BoxCollider).enabled = false;

if(collision.transform.GetComponent(kartScript) != null){
collision.transform.GetComponent(kartScript).locked = false;

if(collision.transform.FindChild("Kart Body").localRotation == Quaternion.Euler(0,0,0)){
StartCoroutine("Spin",collision.transform);
yield WaitForSeconds(3);
var Ani = collision.transform.FindChild("Kart Body").FindChild("Character").GetComponent(Animator);
Ani.SetBool("Hit",false);
StopCoroutine("Spin");


collision.transform.GetComponent(kartScript).locked = true;

collision.transform.FindChild("Kart Body").localRotation = Quaternion.Euler(0,0,0);
}
}
	
Destroy(this.gameObject);	

}
}

function Spin(kart : Transform){

var Ani = kart.FindChild("Kart Body").FindChild("Character").GetComponent(Animator);
Ani.SetBool("Hit",true);

while(true){
kart.rigidbody.velocity = Vector3.Lerp(kart.rigidbody.velocity,Vector3(0,rigidbody.velocity.y,0),Time.deltaTime);
kart.FindChild("Kart Body").Rotate(kart.up,Time.deltaTime / (3f/360f));
yield;
}

Ani.SetBool("Hit",false);
}