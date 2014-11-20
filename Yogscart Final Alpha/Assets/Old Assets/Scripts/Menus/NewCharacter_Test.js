#pragma strict

var test : Texture;
var fanfare : AudioClip;

var newiconPercent : float;
var NormalPercent : float = 0.25f;
var MaxPercent : float = 0.3f;

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

}

function OnGUI () {

var newIconWidth : float = Screen.width*newiconPercent;
var ratio : float = newIconWidth/test.width;
var newIconHeight : float = (test.height * ratio);

var newIconRect : Rect = Rect(Screen.width/2f - newIconWidth/2f,Screen.height/2f - newIconHeight/2f,newIconWidth,newIconHeight);

GUI.DrawTexture(newIconRect,test);					
																		
}