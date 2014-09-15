#pragma strict

function OnDrawGizmos() {
		Gizmos.color = Color.white;
		Gizmos.DrawSphere (transform.position, 0.2);
	}