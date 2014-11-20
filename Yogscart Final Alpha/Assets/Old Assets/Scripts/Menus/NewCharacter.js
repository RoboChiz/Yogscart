#pragma strict

var test : Texture;
var fanfare : AudioClip;

var newiconPercent : float;
var NormalPercent : float = 0.25f;
var MaxPercent : float = 0.3f;

var Done : boolean;
var InputLock : boolean = true;

function Start () {
NewIcon();
}

function NewIcon () {

audio.clip = fanfare;
audio.Play();

yield WaitForSeconds(0.5);

while(newiconPercent <= MaxPercent){
newiconPercent += Time.deltaTime/4f;
yield;
}

while(newiconPercent >= NormalPercent){
newiconPercent -= Time.deltaTime/5f;
yield;
}

Done = true;

}

function OnGUI () {

var newIconWidth : float = Screen.width*newiconPercent;
var ratio : float = newIconWidth/test.width;
var newIconHeight : float = (test.height * ratio);

var newIconRect : Rect = Rect(Screen.width/2f - newIconWidth/2f,Screen.height/2f - newIconHeight/2f,newIconWidth,newIconHeight);

GUI.DrawTexture(newIconRect,test);					
	
var gd = GameObject.Find("GameData").GetComponent(CurrentGameData);					

if(Input.GetAxis(gd.pcn[0] + "Submit") == 0 && Input.GetAxis(gd.pcn[0] + "Cancel") == 0)
InputLock = false;													
																																							
if(Done && (Input.GetAxis(gd.pcn[0] + "Submit") != 0 || Input.GetAxis(gd.pcn[0] + "Cancel") != 0) && !InputLock)
Destroy(this); 																											
}