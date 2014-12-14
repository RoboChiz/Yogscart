﻿
@script RequireComponent(Camera)
@script ExecuteInEditMode()

 enum Type {Fixed, PathCamera, FreeCamera, Spectator}
 enum RotationType {Fixed, Spinning , Follow}

public class DynamiCamera extends MonoBehaviour {

public var cameraType : Type = Type.Fixed;

//Fixed Camera Variables
public var FixedRotaton : boolean = false;

//Path Camera Variables
public var PathStart : Vector3;
public var PathEnd : Vector3;

public var Automatic : boolean = false;

public var FixedSpeed : float = 3;

//Free Camera Variables

public var TravelAreaCentre : Vector3;
public var TravelAreaScale : Vector3 = Vector3(1,1,1);

public var RotationTypes : RotationType = RotationType.Fixed;

public var RotateSpeed : float = 3;

var interested : boolean;
var target : Transform;


}

function FixedUpdate () 
{
if(target != null)
{

if(cameraType != Type.Spectator)
{

var hit : RaycastHit;
if(Physics.Raycast(transform.position,(target.position-transform.position).normalized,hit))
{

if(hit.transform == target)
interested = true;
else
interested = false;

}
else
interested = false;

}
else
interested = false;

}
}

function LateUpdate()
{

if(!FixedRotaton && target != null)
transform.LookAt(target.position);

if(cameraType == Type.Spectator)
{

transform.GetComponent(Kart_Camera).Target = target;

transform.GetComponent(Kart_Camera).Angle += Time.deltaTime*20;

if(transform.GetComponent(Kart_Camera).Angle >360)
transform.GetComponent(Kart_Camera).Angle = 0;

}

}

function Update () {

	if(transform.name != "DynamiCamera"){
	transform.name = "DynamiCamera";
	}
	
}