#pragma strict

var direction : Vector3;
var flightSpeed : float = 10f;

var nextHeight : float;

function Start()
{

direction = (transform.position - transform.parent.position);
direction.y = 0;

if(transform.GetComponent(JR) == null)
transform.parent = null;

nextHeight = transform.position.y;

yield WaitForSeconds(15);
Destroy(this.gameObject);

}

function FixedUpdate () {

transform.position.y = nextHeight;

transform.position += direction.normalized*flightSpeed*Time.fixedDeltaTime;
transform.rotation *= Quaternion.Euler(Vector3(1,1,1)*flightSpeed*Time.fixedDeltaTime*5f);

var hit : RaycastHit;
if(Physics.Raycast(transform.position + (direction.normalized*flightSpeed*Time.fixedDeltaTime),Vector3.down,hit,15))
nextHeight = hit.point.y + 1;

}



function OnTriggerEnter (other : Collider) {

if(transform.GetComponent(JR) == null || other.transform != transform.GetComponent(JR).parent)
{
if(other.tag == "Kart"){
other.transform.GetComponent(kartScript).SpinOut();
}

Destroy(this.gameObject);
}

}
