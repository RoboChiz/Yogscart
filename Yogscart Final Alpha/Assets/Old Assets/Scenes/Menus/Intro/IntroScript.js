#pragma strict

var AIs : LobbyAI[];

var BlackOut : boolean = true;
private var BlackOutC : int;

function Start () {

yield WaitForSeconds(0.5);
BlackOut = false;

for(var i : int = 0; i < AIs.Length; i++)
AIs[i].TraveltoPos = AIs[i].transform.position + Vector3 (100,0,0);

yield WaitForSeconds(7);

BlackOut = true;

yield WaitForSeconds(1);
Application.LoadLevel(1);
}

function OnGUI () {

GUI.skin = Resources.Load("GUISkins/Main Menu", GUISkin);

var Disclaimer : Texture2D = Resources.Load("UI Textures/Disclaimer",Texture2D); 

GUI.color = new Color32(255, 255, 255, BlackOutC);

var DisclaimerRect : Rect = Rect(20,20,Screen.width-40,Screen.height/2f);
GUI.DrawTexture(DisclaimerRect,Disclaimer,ScaleMode.ScaleToFit);

if(!BlackOut)
BlackOutC = Mathf.Lerp(BlackOutC,256,Time.deltaTime);
else
BlackOutC = Mathf.Lerp(BlackOutC,0,Time.deltaTime);
}