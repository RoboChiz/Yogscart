#pragma strict

function OnCollisionEnter(collision : Collision) {

if(collision.other.tag == "Kart"){
transform.parent = null;
collision.other.GetComponent(kartScript).SpinOut();

this.collider .enabled = false;
this.renderer.enabled = false;

yield WaitForSeconds(2f);

Destroy(this.gameObject);
}

}