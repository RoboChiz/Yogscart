#pragma strict

var forceAmount : float = 2f;

function OnCollisionEnter(collision : Collision) {
		
		if(collision.other.tag == "Wall"){
		
		var dir = transform.position - collision.contacts[0].point;
		rigidbody.AddForce(rigidbody.mass *dir*forceAmount);

		}

}

function OnCollisionExit(collision : Collision){
	if(collision.other.tag == "Wall"){

	}
}