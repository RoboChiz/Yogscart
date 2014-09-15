#pragma strict

var DeathParticles : ParticleSystem;

function OnTriggerEnter (other : Collider) {
if(other.name == "DeathCatch"){

DeathParticles.Play();

transform.GetComponent(kartScript).ExpectedSpeed = 0;

yield WaitForSeconds(0.75);

rigidbody.constraints = RigidbodyConstraints.FreezeAll;

var td = GameObject.Find("Track Manager").transform.GetComponent(TrackData);

var nPos = td.PositionPoints[transform.GetComponent(Position_Finding).currentPos].rep.position;
var n1Pos = td.PositionPoints[transform.GetComponent(Position_Finding).currentPos+1].rep.position;

var scale : float = (transform.localScale.x+transform.localScale.y+transform.localScale.z)/3f;

transform.position = nPos + Vector3(0,scale,0);

transform.rotation = Quaternion.Euler(0,0,0);
transform.rotation = Quaternion.LookRotation(n1Pos-nPos,Vector3.up);

rigidbody.velocity = Vector3(0,0,0);

yield;
yield;
yield;

rigidbody.constraints = RigidbodyConstraints.None;
DeathParticles.Stop();

}
}