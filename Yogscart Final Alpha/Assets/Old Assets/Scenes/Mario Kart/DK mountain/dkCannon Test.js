#pragma strict

var targetPos : Vector3;
var cannonTime : float = 5f;

function OnTriggerEnter (other : Collider) {
		if(other.transform.parent.parent.GetComponent(kartScript) != null){
		Debug.Log("PUSH!");
		other.transform.parent.parent.GetComponent(kartScript).locked = true;
		Push(other.transform.parent.parent);
		}
	}
	
	function Push(obj : Transform){
	
	var t = Time.realtimeSinceStartup;
		
	while(Vector3.Distance(obj.position,targetPos) > 0.5){
	obj.position = Vector3.Lerp(transform.position,targetPos,(Time.realtimeSinceStartup-t)/cannonTime);	
	obj.GetComponent(kartScript).ExpectedSpeed = 0;
	obj.LookAt(targetPos);
		obj.rigidbody.velocity = Vector3(0,0,0);
	yield;
	}
	obj.GetComponent(kartScript).locked = false;
	
	}