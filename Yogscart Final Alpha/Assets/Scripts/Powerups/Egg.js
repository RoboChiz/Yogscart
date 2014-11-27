#pragma strict

var direction : Vector3;
var flightSpeed : float = 10f;

function Start()
{
direction = (transform.parent.FindChild("Clucky").position - transform.parent.position);

transform.parent = null;

yield WaitForSeconds(15);
Destroy(this.gameObject);

}

function FixedUpdate () {

transform.position += direction.normalized*flightSpeed*Time.fixedDeltaTime;
transform.rotation *= Quaternion.Euler(direction*flightSpeed);
}

function OnTriggerEnter (other : Collider) {

if(other.tag == "Kart"){
other.transform.parent.parent.GetComponent(kartScript).SpinOut();
}

}
