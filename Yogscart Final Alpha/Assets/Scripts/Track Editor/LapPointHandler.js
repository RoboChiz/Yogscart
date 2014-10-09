#pragma strict

private var td : TrackData;

function OnDrawGizmos() {
		Gizmos.color = Color.green;
		
		td = GameObject.Find("Track Manager").GetComponent(TrackData);
		
		var rot : Quaternion = transform.rotation;
		var x : Vector3 = rot*(Vector3.forward*(td.Scale*1.5f)+(Vector3.forward*.75f*td.Scale));

		Gizmos.DrawSphere (transform.position + x, 0.2);
	}