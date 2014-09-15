#pragma strict

var lobbyCamera : Transform;

var currentRoom : int;
var Rooms : Transform[];

var SpawnLocation : Transform;

var gd : CurrentGameData;

function Awake(){
if(GameObject.Find("GameData") == null)
Application.LoadLevel(0);
else
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
}

function Update(){
lobbyCamera.position = Vector3.Lerp(lobbyCamera.position,Rooms[currentRoom].position,Time.deltaTime*5);
lobbyCamera.rotation = Quaternion.Lerp(lobbyCamera.rotation,Rooms[currentRoom].rotation,Time.deltaTime*5);
}
