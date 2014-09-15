#pragma strict

function OnDrawGizmos() {
		Gizmos.color = Color.green;
		Gizmos.DrawSphere (transform.position, 0.2);
	}