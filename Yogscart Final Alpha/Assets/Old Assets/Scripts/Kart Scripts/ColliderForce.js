#pragma strict

var farther : Transform;

function OnCollisionEnter(collision : Collision) {

var forceDir : Vector3;
forceDir = -(collider.transform.position-transform.position).normalized;

farther.rigidbody.velocity = forceDir * farther.rigidbody.mass * 100;

}