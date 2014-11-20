#pragma strict

private var td : TrackData;

function OnDrawGizmos() {
		Gizmos.color = Color.green;
		Gizmos.DrawSphere (transform.position, 0.2);
	}