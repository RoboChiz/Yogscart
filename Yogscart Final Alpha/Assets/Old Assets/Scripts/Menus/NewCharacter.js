#pragma strict

var test : Texture;
var fanfare : AudioClip;

var newiconPercent : float;
var NormalPercent : float = 0.25f;
var MaxPercent : float = 0.3f;

var Done : boolean;

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
	
var im = GameObject.Find("GameData").GetComponent(InputManager);														
																																							
if(Done && (im.c[0].GetRawInput("Submit") != 0 || im.c[0].GetRawInput("Cancel") != 0))
{
Time.timeScale = 1f;
Destroy(this); 		
}else{
Time.timeScale = 0f;
}
																									
}