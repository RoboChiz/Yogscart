#pragma strict
@script ExecuteInEditMode()
//TrackData Script - V0.1
//Created by Robert (Robo_Chiz)
//Do not edit this script, doing so may cause compatibility errors.

@HideInInspector
var Scale : float = 3f;

var TrackName : String;

var backgroundMusic : AudioClip;

var LoopedTrack : boolean = true;
var Laps : int = 3;

@HideInInspector
var PositionPoints : PositionPoint[];

var IntroPans : CameraPoint[];

enum Point{Position,Lap};

public class PositionPoint{

var rep : Transform;
var type : Point;
var RoadWidth : float;
}

public class CameraPoint{
 var StartPoint : Vector3;
 var EndPoint : Vector3;
 var StartRotation : Vector3;
 var EndRotation : Vector3;
 var TravelTime : float;
 }
 
 
 function Update(){
 
 transform.name = "Track Manager";
 
 if(PositionPoints != null && PositionPoints.Length > 0 && PositionPoints[0].type != Point.Lap){
 PositionPoints[0].type = Point.Lap;
 if(PositionPoints[0].rep.GetComponent(PositionPointHandler) != null)
 DestroyImmediate(PositionPoints[0].rep.GetComponent(PositionPointHandler));
 PositionPoints[0].rep.gameObject.AddComponent(LapPointHandler);
 PositionPoints[0].rep.name =  PositionPoints[0].type.ToString(); 
 }

if(PositionPoints != null)
for(var i : int = 0; i < PositionPoints.Length; i++){

if(PositionPoints[i].rep == null)
RemovePoint(i);

if(LoopedTrack == true && i > 0 && i < PositionPoints.Length && PositionPoints[i].type == Point.Lap){
 if(PositionPoints[i].rep.GetComponent(LapPointHandler) != null)
 DestroyImmediate(PositionPoints[i].rep.GetComponent(LapPointHandler));
 PositionPoints[i].rep.gameObject.AddComponent(PositionPointHandler);
 PositionPoints[i].rep.name =  Point.Position.ToString(); 
 PositionPoints[i].type = Point.Position;
}

}

 //Check that there's at least one lap point
 if(PositionPoints == null || PositionPoints.Length == 0){
 NewPoint();
 }
 
 if(LoopedTrack == false){
 if(PositionPoints != null &&  PositionPoints.Length < 2){
 NewPoint();
 }
 
 if(PositionPoints[PositionPoints.Length -1].type != Point.Lap){
 PositionPoints[PositionPoints.Length -1].type = Point.Lap;
 PositionPoints[PositionPoints.Length -1].rep.name = Point.Lap.ToString(); 
 if(PositionPoints[PositionPoints.Length -1].rep.GetComponent(PositionPointHandler) != null)
 DestroyImmediate(PositionPoints[PositionPoints.Length -1].rep.GetComponent(PositionPointHandler));
 PositionPoints[PositionPoints.Length -1].rep.gameObject.AddComponent(LapPointHandler);
 }
 
 
 }
 
 //render finish Line
 if(PositionPoints.Length > 3){
 var Position1 : Vector3 = PositionPoints[1].rep.position;
 var Position2 : Vector3 = PositionPoints[PositionPoints.Length -1].rep.position;
 
 var cross : Vector3 = (Position1 + Position2)/2f;
 
 var rot : Quaternion = Quaternion.Euler(0,90,0);
 var dir : Vector3 = (Position1-Position2).normalized;
 
 Debug.DrawRay(cross,rot*dir * 9f,Color.yellow);
 Debug.DrawRay(cross,rot*dir * -9f,Color.yellow);
 
 }
 
 if(transform.GetComponent(InEngineRender) == null)
 gameObject.AddComponent(InEngineRender);
 
 }
 
 function RemovePoint (removei : int){
 
 var copy = new Array();
 
 if(PositionPoints != null){
 for(var i : int = 0; i < PositionPoints.Length; i++)
 if(i != removei)
 copy.Push(PositionPoints[i]);
 
 PositionPoints = copy;
 }
 
 
 }
 
 function AddPoint (addat : int){
 
 var copy = new Array();
 
 if(PositionPoints != null){
 
 var obj = new GameObject();
 obj.transform.parent = GameObject.Find("Track Manager").transform;
 obj.name = Point.Position.ToString(); 
 
 var nPoint  = new PositionPoint();
 nPoint.type = Point.Position;
 nPoint.rep = obj.transform;
 
 var pos : Vector3;
 if(PositionPoints == null || PositionPoints.Length == 0)
  pos = Vector3(0,0,0);
  else
  pos = PositionPoints[addat].rep.position;
 
 obj.transform.position = pos;
 
 obj.AddComponent(PositionPointHandler);
 
 for(var i : int = 0; i < addat; i++)
 copy.Push(PositionPoints[i]);
 
 copy.Push(nPoint);
 
 for(i = addat; i < PositionPoints.Length; i++)
 copy.Push(PositionPoints[i]);
 
 PositionPoints = copy;
 }
 
 
 }
 
 function NewPoint(){
 
 var obj = new GameObject();
 
 obj.transform.parent = GameObject.Find("Track Manager").transform;
 obj.name = Point.Position.ToString();
 
 var pos : Vector3;
 if(PositionPoints == null || PositionPoints.Length == 0)
  pos = Vector3(0,0,0);
  else
  pos = PositionPoints[PositionPoints.Length-1].rep.position;
 
 obj.transform.position = pos;
 
 var copy = new Array();
 
 if(PositionPoints != null && LoopedTrack == true)
 copy = PositionPoints;
 
 if(PositionPoints != null && LoopedTrack == false)
 for(var i : int = 0; i < PositionPoints.Length-1; i++)
 copy.Push(PositionPoints[i]);
 
 var nPoint  = new PositionPoint();
 nPoint.type = Point.Position;
 nPoint.rep = obj.transform;
 
 obj.AddComponent(PositionPointHandler);

 copy.Push(nPoint);
 
 if(LoopedTrack == false)
 copy.Push(PositionPoints[PositionPoints.Length-1]);
 
 PositionPoints = copy;
 
 #if UNITY_EDITOR
	Selection.activeTransform = obj.transform; 
 #endif

 
 }
 
 function OnDrawGizmos() {
		Gizmos.color = Color.cyan;
		Gizmos.DrawCube(transform.position,Vector3(1,1,1));
	}