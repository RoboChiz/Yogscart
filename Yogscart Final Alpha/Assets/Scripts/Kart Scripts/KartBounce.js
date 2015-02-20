#pragma strict

var bounceForce : float = 5f;


function OnCollisionEnter(collision : Collision) {

var hitDistance : float = Vector3.Distance(transform.position,collision.contacts[0].point);

rigidbody.AddForce(collision.contacts[0].normal * hitDistance * bounceForce);

}
