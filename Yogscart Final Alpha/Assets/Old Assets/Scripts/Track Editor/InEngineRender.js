#pragma strict
@script ExecuteInEditMode()

private var td : TrackData;

//@HideInInspector
var DebugMode : boolean;

function Update () {

if(GameObject.Find("Track Manager") != null && GameObject.Find("Track Manager").GetComponent(TrackData) != null){
td = GameObject.Find("Track Manager").GetComponent(TrackData);

//Draw Main Lap Point
 try {
 
	var rot : Quaternion;
	rot = td.PositionPoints[0].rep.transform.rotation;
	
	var centre : Vector3;
	centre = td.PositionPoints[0].rep.transform.position;
	
	var pos : Vector3;
	pos = centre + (rot*Vector3.forward*(td.Scale*1.5f)*-1.5f);

	var pos1 : Vector3;
	pos1 = centre + (rot*Vector3.forward*(td.Scale*1.5f)*1.5f);
	
	var pos2 : Vector3;
	pos2 = pos1 + (rot*Vector3.right *td.Scale*13f);
	var pos3 : Vector3;
	pos3 = pos + (rot*Vector3.right *td.Scale*13f);	
	
	Debug.DrawLine(pos,pos1,Color.blue);
	Debug.DrawLine(pos1,pos2,Color.blue);
	Debug.DrawLine(pos2,pos3,Color.blue);
	Debug.DrawLine(pos3,pos,Color.blue);
	
	Debug.DrawLine((pos+pos1)/2f,(pos2+pos3)/2f,Color.red);

//Render Track Lines
	
	if(td.PositionPoints != null){
	if(td.PositionPoints.Length >=2){
	for(var i : int = 1; i < td.PositionPoints.Length; i++){
	if(i == 1){
	Debug.DrawLine((pos+pos1)/2f,td.PositionPoints[1].rep.position,Color.red);	
	}else if(td.PositionPoints[i] != null && td.PositionPoints[i-1] != null)
	Debug.DrawLine(td.PositionPoints[i].rep.position,td.PositionPoints[i-1].rep.position,Color.red);
	if(td.PositionPoints[td.PositionPoints.Length-1] != null && td.LoopedTrack == true){
	Debug.DrawLine((pos2+pos3)/2f,td.PositionPoints[td.PositionPoints.Length-1].rep.position,Color.red);
	}
	}
	}
}
}catch(err){

}
}
}

