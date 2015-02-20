﻿#pragma strict

/*
Race Base
V1.0
Holds functions used by the Client, and Host during Races.
*/

//Used in multiplayer to give server updates
var networkID : int = -1;
var myRacer : Racer;

//Used to load and show the correct GUI
enum GUIState{Blank,CutScene,RaceInfo,Countdown,RaceGUI,ScoreBoard,NextMenu};
var currentGUI : GUIState = GUIState.Blank;
private var guiAlpha : float = 255;
private var fading : boolean;
private var scrollTime : float = 0.5f;

//Countdown Variables
private var CountdownText : int;
private var CountdownRect : Rect;
private var CountdownShow : boolean;
private var CountdownAlpha : float;

//Create Libaries
private var gd : CurrentGameData;
private var im : InputManager;
private var td : TrackData;
private var sm : Sound_Manager;
private var km : KartMaker;


function Start()
{
	LoadLibaries();
}

function LoadLibaries () {

	//Load Libaries
	gd = transform.GetComponent(CurrentGameData);
	im = transform.GetComponent(InputManager);
	td = GameObject.Find("Track Manager").GetComponent(TrackData);
	sm = GameObject.Find("Sound System").GetComponent(Sound_Manager); 
	km = transform.GetComponent(KartMaker);
	
}

@RPC
function RaceEnded()
{

Network.RemoveRPCs(networkView.owner);

var nRacer = new Racer(true,-1,myRacer.character,myRacer.hat,myRacer.kart,myRacer.wheel,0);
myRacer = nRacer;

}

@RPC
function YourID(id : int)
{
	networkID = id;
}

@RPC
function SpawnMyKart()
{

	//Find Spawn Position
	var SpawnPosition : Vector3;
	var rot : Quaternion = td.PositionPoints[0].rep.rotation;
	var i : int = myRacer.position;
	
	var startPos : Vector3 = td.PositionPoints[0].rep.position + (rot*Vector3.forward*(3*1.5f)*-1.5f);
	var x2 : Vector3 = rot*(Vector3.forward*(i%3)*(3*1.5f)+(Vector3.forward*.75f*3));
	var y2 : Vector3 = rot*(Vector3.right*(i + 1)* 3);
	SpawnPosition = startPos + x2 + y2;  

	myRacer.ingameObj = km.SpawnKart(KartType.Online,SpawnPosition,rot * Quaternion.Euler(0,-90,0),myRacer.kart,myRacer.wheel,myRacer.character,myRacer.hat);
	
	//Add Camera
	var IngameCam = Instantiate(Resources.Load("Prefabs/Cameras",Transform),td.PositionPoints[0].rep.position,Quaternion.identity);
	IngameCam.name = "InGame Cams";

	myRacer.ingameObj.GetComponent(kartInput).camLocked = true;
	myRacer.ingameObj.GetComponent(kartInput).frontCamera = IngameCam.GetChild(1).camera;
	myRacer.ingameObj.GetComponent(kartInput).backCamera = IngameCam.GetChild(0).camera;
	
	IngameCam.GetChild(1).tag = "MainCamera";

	IngameCam.GetChild(0).transform.GetComponent(Kart_Camera).Target = myRacer.ingameObj;
	IngameCam.GetChild(1).transform.GetComponent(Kart_Camera).Target = myRacer.ingameObj;
	myRacer.cameras = IngameCam;
	
	var id = Network.AllocateViewID();
	
	myRacer.ingameObj.gameObject.AddComponent(NetworkView);
	myRacer.ingameObj.networkView.viewID = id;
	
	myRacer.ingameObj.gameObject.AddComponent(kartInfo);
		//SetUpCameras
	var copy = new Array();
	copy.Push(IngameCam.GetChild(0).camera);
	copy.Push(IngameCam.GetChild(1).camera);

	myRacer.ingameObj.GetComponent(kartInfo).cameras = copy;
	
	networkView.RPC("SpawnMe",RPCMode.OthersBuffered,PlayerPrefs.GetString("playerName","Player"),myRacer.kart,myRacer.wheel,myRacer.character,myRacer.hat,id);
	
	SendUpdates();
	
}

@RPC
function SpawnMe(name : String, kart : int, wheel : int, character : int, hat : int,id : NetworkViewID)
{

	while(GameObject.Find("Track Manager") == null)
		yield;

	if(km == null)
		LoadLibaries();
	
	var newKart = km.SpawnKart(KartType.Spectator,Vector3(0,1000,0),Quaternion.identity,kart,wheel,character,hat);
	
	newKart.FindChild("Canvas").GetChild(0).GetComponent(UI.Text).text = name;
	
	newKart.gameObject.AddComponent(NetworkView);
	newKart.networkView.viewID = id;
	
}

@RPC
function SetPosition(pos : int)
{
	myRacer.position = pos;
}

function FixedUpdate ()
{
	if(myRacer.ingameObj != null)
	{
		var pf : Position_Finding = myRacer.ingameObj.GetComponent(Position_Finding);
		if(pf.Lap >= td.Laps && !myRacer.finished)
		{
			myRacer.finished = true;
		}
	}
}

function SendUpdates()
{	

	CalculateSendUpdate();
	
	while(currentGUI != GUIState.RaceGUI)
	{
		yield;
	}

	while(!myRacer.finished)
	{	
		CalculateSendUpdate();	
		yield WaitForSeconds(0.5f);
	}
	
	if(Network.isClient)
		networkView.RPC("Finished",RPCMode.Server,networkID);
		
	if(Network.isServer)
		transform.GetComponent(RaceLeader).LocalFinish(networkID);
		
	myRacer.ingameObj.gameObject.AddComponent(Racer_AI);
	Destroy(myRacer.ingameObj.GetComponent(kartInput));
	myRacer.ingameObj.GetComponent(kartInfo).hidden = true;

	yield WaitForSeconds(2);

	myRacer.cameras.GetChild(0).camera.enabled = false;
	myRacer.cameras.GetChild(1).camera.enabled = true;

	while(myRacer.cameras.GetChild(1).GetComponent(Kart_Camera).Distance > -6.5){
	myRacer.cameras.GetChild(1).GetComponent(Kart_Camera).Distance -= Time.fixedDeltaTime * 10;
	myRacer.cameras.GetChild(1).GetComponent(Kart_Camera).Height = Mathf.Lerp(myRacer.cameras.GetChild(1).GetComponent(Kart_Camera).Height,1,Time.fixedDeltaTime);
	myRacer.cameras.GetChild(1).GetComponent(Kart_Camera).PlayerHeight = Mathf.Lerp(myRacer.cameras.GetChild(1).GetComponent(Kart_Camera).PlayerHeight,1,Time.fixedDeltaTime);
	myRacer.cameras.GetChild(1).GetComponent(Kart_Camera).sideAmount = Mathf.Lerp(myRacer.cameras.GetChild(1).GetComponent(Kart_Camera).sideAmount,-1.9,Time.fixedDeltaTime);
	yield;
	}
	
}

function CalculateSendUpdate()
{
	if(myRacer.ingameObj != null)
	{
		var pf : Position_Finding = myRacer.ingameObj.GetComponent(Position_Finding);
		
		myRacer.TotalDistance = pf.currentTotal;
		myRacer.NextDistance = pf.currentDistance;
		pf.position = myRacer.position;
			
		if(Network.isClient)
			networkView.RPC("PositionUpdate",RPCMode.Server,networkID,myRacer.TotalDistance,myRacer.NextDistance);
		else
			transform.GetComponent(RaceLeader).LocalPositionUpdate(networkID,myRacer.TotalDistance,myRacer.NextDistance);
	}
}

@RPC
function UnlockKart()
{
	
	if(myRacer.ingameObj)
	{
		myRacer.ingameObj.GetComponent(kartScript).locked = false;
		myRacer.ingameObj.GetComponent(kartInput).camLocked = false;
	}
}

@RPC
function Countdown(){

	if(Network.isClient || Network.isServer)
		myRacer.ingameObj.GetComponent(kartInfo).hidden = false;

	ChangeState(GUIState.Countdown);
	sm.PlaySFX(Resources.Load("Music & Sounds/CountDown",AudioClip));
	
	for(var i : int = 3; i >= 0; i--){
		CountdownText = i;
		setStartBoost(i);
		CountdownRect = Rect(Screen.width/2 - (Screen.height/1.5f)/2f,Screen.height/2 - (Screen.height/1.5f)/2f,Screen.height/1.5f,Screen.height/1.5f);
		CountdownShow = true;
		yield WaitForSeconds(0.8);
		CountdownShow = false;
		yield WaitForSeconds(0.3);
	}

	CountdownText = -1;
	setStartBoost(4);
	
	yield WaitForSeconds(1f);
	
	ChangeState(GUIState.RaceGUI);

}

@RPC
function PlayCutscene()
{

	ChangeState(GUIState.CutScene);
	var CutsceneCam = new GameObject();
	CutsceneCam.AddComponent(Camera);
	CutsceneCam.tag = "MainCamera";
	
	sm.PlayMusic(Resources.Load("Music & Sounds/RaceStart",AudioClip));
	
	CutsceneCam.transform.position = td.IntroPans[0].StartPoint;
	CutsceneCam.transform.rotation = Quaternion.Euler(td.IntroPans[0].StartRotation);
	
	gd.BlackOut = false;
	yield WaitForSeconds(0.5);
	
	for(var i : int = 0; i < td.IntroPans.Length; i++){
		yield Play(CutsceneCam.transform,td.IntroPans[i]);
	}
	 
	ChangeState(GUIState.RaceInfo);
	 
	gd.BlackOut = true;
	yield WaitForSeconds(0.5);
	//Spawn Player Cam
	CutsceneCam.camera.depth = -5;
	
	yield WaitForSeconds(0.5);
	gd.BlackOut = false;
	
	Destroy(CutsceneCam);
	sm.PlayMusic(td.backgroundMusic);
	
	if(Network.isClient)
		networkView.RPC("Finished",RPCMode.Server,networkID);
		
	if(Network.isServer)
		transform.GetComponent(RaceLeader).LocalFinish(networkID);

}

function Play (cam : Transform,Clip : CameraPoint) {

	var startTime = Time.realtimeSinceStartup;

	while((Time.realtimeSinceStartup-startTime) < Clip.TravelTime){
		cam.position = Vector3.Lerp(Clip.StartPoint,Clip.EndPoint,(Time.realtimeSinceStartup-startTime)/Clip.TravelTime);
		cam.rotation = Quaternion.Slerp(Quaternion.Euler(Clip.StartRotation),Quaternion.Euler(Clip.EndRotation),(Time.realtimeSinceStartup-startTime)/Clip.TravelTime);
		yield;
	}

}

function ChangeState(nState : GUIState)
{

fading = true;

var startTime = Time.realtimeSinceStartup;

while(Time.realtimeSinceStartup-startTime  < scrollTime){
guiAlpha = Mathf.Lerp(1,0,(Time.realtimeSinceStartup-startTime)/scrollTime);
yield;
}

guiAlpha = 0;
startTime = Time.realtimeSinceStartup;
currentGUI = nState;

while(Time.realtimeSinceStartup-startTime  < scrollTime){
guiAlpha = Mathf.Lerp(0,1,(Time.realtimeSinceStartup-startTime)/scrollTime);
yield;
}

guiAlpha = 1;

fading = false;

}


function OnGUI ()
{
	GUI.skin = Resources.Load("GUISkins/Main Menu", GUISkin);
	GUI.color.a = guiAlpha;
	
	switch(currentGUI)
	{
	
		case GUIState.CutScene:
		
			var idealWidth : float = Screen.width/3f;
			var previewTexture : Texture2D = gd.Tournaments[gd.currentCup].Tracks[gd.currentTrack].Preview;
			var previewRatio : float = idealWidth/previewTexture.width;
			var previewRect : Rect = Rect(Screen.width - idealWidth - 20,Screen.height - (previewTexture.height*previewRatio*2f),idealWidth,previewTexture.height*previewRatio);

			GUI.DrawTexture(previewRect,previewTexture);
			
		break;
		case GUIState.RaceInfo:
			
			var raceTexture : Texture2D;
			
			if(Network.isClient || Network.isServer)
			{
				raceTexture = Resources.Load("UI Textures/Level Selection/Online",Texture2D);	
			}
			else
			{
			
			
			}

			GUI.DrawTexture(Rect(10,10,Screen.width-20,Screen.height),raceTexture,ScaleMode.ScaleToFit);

		
		break;
		case GUIState.Countdown:
		
			var texture : Texture2D;
			GUI.color.a = CountdownAlpha;

			if(CountdownText == 0)
				texture = Resources.Load("UI Textures/CountDown/GO",Texture2D);
			else if(CountdownText != -1)
				texture = Resources.Load("UI Textures/CountDown/" + CountdownText.ToString(),Texture2D);

			if(texture != null)
				GUI.DrawTexture(CountdownRect,texture,ScaleMode.ScaleToFit);

			CountdownRect.x = Mathf.Lerp(CountdownRect.x,Screen.width/2 - Screen.height/6f,Time.deltaTime);
			CountdownRect.y = Mathf.Lerp(CountdownRect.y,Screen.height/2 - Screen.height/6f,Time.deltaTime);
			CountdownRect.width = Mathf.Lerp(CountdownRect.width,Screen.height/3f,Time.deltaTime);
			CountdownRect.height = Mathf.Lerp(CountdownRect.height,Screen.height/3f,Time.deltaTime);

			if(CountdownShow)
				CountdownAlpha = Mathf.Lerp(CountdownAlpha,256,Time.deltaTime*10f);
			else
				CountdownAlpha = Mathf.Lerp(CountdownAlpha,0,Time.deltaTime*10f);

		break;
	
	}
}	

function setStartBoost(val : int){

	if(!Network.isServer && !Network.isClient){

	}else{
		myRacer.ingameObj.GetComponent(kartScript).startBoosting = val;
	}
}
	
	
	
	
	