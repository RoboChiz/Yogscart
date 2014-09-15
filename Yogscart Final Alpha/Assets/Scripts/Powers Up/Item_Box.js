#pragma strict

var PhysicsProp : Transform;

function OnTriggerEnter (other : Collider) {
Hit();
}

function Hit(){

var Particles = Instantiate(PhysicsProp,transform.position,transform.rotation);
var OriginalHeight : float = Particles.position.y;

renderer.enabled = false;
collider.enabled = false;

yield WaitForSeconds(1);

while(Particles.position.y > OriginalHeight - 0.3){
Particles.position.y -= Time.deltaTime/10f;
yield;
}

Destroy(Particles.gameObject);

renderer.enabled = true;
collider.enabled = true;

}