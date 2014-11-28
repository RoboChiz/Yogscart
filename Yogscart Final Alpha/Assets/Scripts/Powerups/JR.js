#pragma strict

var target : Transform;
@HideInInspector
var parent : Transform;

private var closetDistance : float;
function Start()
{
	parent = transform.parent;
	
	closetDistance = Mathf.Infinity;

	var objs = GameObject.FindGameObjectsWithTag("Kart");
	
	for(var i : int; i < objs.Length; i++)
	{
		if(objs[i].transform != parent && Vector3.Distance(transform.position,objs[i].transform.position) < closetDistance)
		{
			target = objs[i].transform;
			closetDistance = Vector3.Distance(transform.position,objs[i].transform.position);
		}
	}

transform.parent = null;

}

function FixedUpdate () {

var egg : Egg = transform.GetComponent(Egg);

egg.direction = (target.position - transform.position).normalized;

}