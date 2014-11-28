#pragma strict

enum User{Player,Backer,VIP};
var gameTag : User;

var overallLapisCount : int;
var lastoverallLapisCount : int;

//Tracks 
@HideInInspector
var currentCup : int = -1;
@HideInInspector
var currentTrack : int = -1;

//Delete Later!
var currentKart : int =-1;
var currentCharacter : int = -1;
var currentHat : int = -1;
var currentWheel : int = -1;
//Delete Later!

var type : RaceStyle;

//@HideInInspector
var currentChoices : LoadOut[];

@HideInInspector
var currentPosition : int = 0;
@HideInInspector
var Ingame : Transform;

var Tournaments : Tournament[];

@HideInInspector
var unlockedInsane : boolean;

//Characters 
var Characters : Character[];

//PowerUps
var PowerUps : PowerUp[];

//Karts
var Karts : Kart[];

//Wheels
var Wheels : Wheel[];

//Hats
var Hats : Hat[];

var RaceState : int = -1;
//0 - Grand Prix
//1 - Single Race
//2 - Time Trial
//3 - Multiplayer

var Difficulty : int;

var im : InputManager;

var popupText : String[];

//@HideInInspector
var BlackOut : boolean = true;
private var isPlaying : boolean;
var PlayBackSpeed : float = 0.5f;
private var currentFrame : int = 0;

private var ColourAlpha : Color = Color.white;
	
	function Awake () {
		DontDestroyOnLoad (transform.gameObject);
		
		LoadEverything();
		
		im = transform.GetComponent(InputManager);
		
		}
		
		function PlayAnimation()
		{
		
		while(true)
		{
		yield WaitForSeconds(PlayBackSpeed);
		currentFrame += 1;
		
		if(currentFrame > 22)
		currentFrame = 0;
		
		}
		
		}
		
		function Start()
		{
		if(GameObject.Find("OldGameData") != null){
		var oldGD = GameObject.Find("OldGameData").GetComponent(CurrentGameData);
		im.c = oldGD.transform.GetComponent(InputManager).c;
		Destroy(oldGD.gameObject);
		}
		}
	
		private var iconHeights : int[];
		private var inputLock : boolean;
		
		function OnGUI () {
		
		GUI.skin = Resources.Load("GUISkins/Main Menu", GUISkin);
		
		GUI.depth = -5;
		//Black Out
		var texture = new Texture2D(1,1);
		if(BlackOut == false && ColourAlpha.a > 0)
		{
		ColourAlpha.a -= Time.deltaTime;
		}
		if(BlackOut == true && ColourAlpha.a < 1)
		{
		ColourAlpha.a += Time.deltaTime;
		}

		
		texture.SetPixel(0,0,Color.black);
		texture.Apply();
		
		GUI.color = ColourAlpha;
		
			GUI.DrawTexture(Rect(-5,-5,Screen.width +5,Screen.height + 5),texture);
		
			var aniSize : float = ((Screen.height + Screen.width)/2f)/8f;
			var aniRect : Rect = Rect(Screen.width - 10 - aniSize, Screen.height - 10 - aniSize,aniSize,aniSize);
					
			GUI.DrawTexture(aniRect,Resources.Load("UI Textures/Loading/" + (currentFrame+1)));
			
		GUI.color = Color.white;
		
		if(BlackOut)
		{
			
			if(!isPlaying)
			{
			StartCoroutine("PlayAnimation");
			isPlaying = true;
			}
		
		
		}else{
		
		if(isPlaying)
			{
			StopCoroutine("PlayAnimation");
			isPlaying = false;
			}
			
		}
		
		
		if(popupText != null && popupText.Length > 0)
		{
		
		Time.timeScale = 0f;
		
		var BoxWidth : int = Screen.width / 3f;
		var BoxHeight : int = Screen.height / 3f;
		
		var boxRect : Rect = Rect(Screen.width/2f - BoxWidth/2f,Screen.height/2f - BoxHeight/2f,BoxWidth,BoxHeight);
		
		GUI.Box(boxRect,popupText[0]);
		
		if(im.c != null && im.c.Length > 0){
		
		if(im.c[0].GetRawInput("Submit") != 0)
		{
			removePopUp();
		}
		}
		
		}
		
		}
		
		function LoadEverything(){
		
		var unlockInsane : boolean = true;
		
		for(var n = 0; n < Tournaments.Length; n++){
		Tournaments[n].LastRank = new String[4];
		Tournaments[n].LastRank[0] = PlayerPrefs.GetString(Tournaments[n].Name+"[50cc]","No Rank");
		Tournaments[n].LastRank[1] = PlayerPrefs.GetString(Tournaments[n].Name+"[100cc]","No Rank");
		Tournaments[n].LastRank[2] = PlayerPrefs.GetString(Tournaments[n].Name+"[150cc]","No Rank");
		Tournaments[n].LastRank[3] = PlayerPrefs.GetString(Tournaments[n].Name+"[Insane]","No Rank");
		
		if(Tournaments[n].LastRank[2] == "No Rank")
		unlockInsane = false;
		
		for(var k = 0; k < Tournaments[n].Tracks.Length; k++){
		var TimeString = PlayerPrefs.GetString(Tournaments[n].Tracks[k].Name,"0:0:0");
		var words = TimeString.Split(":"[0]);
		Tournaments[n].Tracks[k].BestTrackTime.Minute = System.Int32.Parse(words[0]);
		Tournaments[n].Tracks[k].BestTrackTime.Second = System.Int32.Parse(words[1]);
		Tournaments[n].Tracks[k].BestTrackTime.milliSecond = System.Int32.Parse(words[2]);
		}
		}
		
		unlockedInsane = unlockInsane;
		
		var foo : int = 0;
		
		for(n = 1; n < Characters.Length; n++){
		foo = PlayerPrefs.GetInt(Characters[n].Name,0);
		if(foo == 1){
		Characters[n].Unlocked = true;
		Debug.Log(Characters[n].Name + " is unlocked!");
		}else{
		Characters[n].Unlocked = false;
		Debug.Log(Characters[n].Name + " is not unlocked!");
		}
		}
		
		for(n = 1; n < Hats.Length; n++){
		foo = PlayerPrefs.GetInt(Hats[n].Name,0);
		if(foo == 1){
		Hats[n].Unlocked = true;
		}else{
		Hats[n].Unlocked = false;
		}
		}
		
		for(n = 1; n < Karts.Length; n++){
		foo = PlayerPrefs.GetInt(Karts[n].Name,0);
		if(foo == 1){
		Karts[n].Unlocked = true;
		}else{
		Karts[n].Unlocked = false;
		}
		}
		
		for(n = 1; n < Wheels.Length; n++){
		foo = PlayerPrefs.GetInt(Wheels[n].Name,0);
		if(foo == 1){
		Wheels[n].Unlocked = true;
		}else{
		Wheels[n].Unlocked = false;
		}
		}
		
		overallLapisCount = PlayerPrefs.GetInt("overallLapisCount",0);
		lastoverallLapisCount = PlayerPrefs.GetInt("lastoverallLapisCount",0);
				
		
}

function CheckforNewStuff()
{

		if(PlayerPrefs.GetFloat("NewCharacter?",0) == 1)
		{			
				while(BlackOut == true)
				yield;
		
				PlayerPrefs.SetFloat("NewCharacter?",0);
				UnlockNewCharacter();

		}

		if(overallLapisCount >= lastoverallLapisCount + 50)
		{
		
		while(BlackOut == true)
		yield;
		
		UnlockNewHat();
		PlayerPrefs.SetInt("lastoverallLapisCount",lastoverallLapisCount+50);
		}	
		
		LoadEverything();
}
		
function UnlockNewCharacter()
{
	//Unlock Character
	var copy = new Array();
	
	for(var n = 0; n < Characters.Length;n++){
	if(Characters[n].Unlocked == false)
	copy.Push(n);	
	}
	
	if(copy.length > 0){
		var unlockedCharacter = Random.Range(0,copy.length);
		PlayerPrefs.SetInt(Characters[copy[unlockedCharacter]].Name,1);
		
	Popup("You have unlocked a new Character!");
	}
}

function UnlockNewHat()
{
	//Unlock Character
	var copy = new Array();
	
	for(var n = 0; n < Hats.Length;n++){
	if(Hats[n].Unlocked == false)
	copy.Push(n);	
	}
	
	if(copy.length > 0){
		var unlockedHat = Random.Range(0,copy.length);
		PlayerPrefs.SetInt(Hats[copy[unlockedHat]].Name,1);
		
	Popup("You have unlocked a new Hat!");
	}
}
		
		function ResetEverything(){
		
		for(var n = 0; n < Tournaments.Length; n++){
		PlayerPrefs.SetString(Tournaments[n].Name+"[50cc]","No Rank");
		PlayerPrefs.SetString(Tournaments[n].Name+"[100cc]","No Rank");
		PlayerPrefs.SetString(Tournaments[n].Name+"[150cc]","No Rank");
		PlayerPrefs.SetString(Tournaments[n].Name+"[Insane]","No Rank");
		
		for(var k = 0; k < Tournaments[n].Tracks.Length; k++){
		PlayerPrefs.SetString(Tournaments[n].Tracks[k].Name,"0:0:0");
		}
		}
		
		unlockedInsane = false;
		
		for(n = 1; n < Characters.Length; n++){
		PlayerPrefs.SetInt(Characters[n].Name,0);
		}
		
		for(n = 1; n < Hats.Length; n++){
		PlayerPrefs.SetInt(Hats[n].Name,0);
		}
		
		for(n = 1; n < Karts.Length; n++){
		PlayerPrefs.SetInt(Karts[n].Name,0);
		}
		
		for(n = 1; n < Wheels.Length; n++){
		PlayerPrefs.SetInt(Wheels[n].Name,0);
		}
		
		PlayerPrefs.SetInt("overallLapisCount",0);
		PlayerPrefs.SetInt("lastoverallLapisCount",0);
		
		LoadEverything();
		
		}

function Popup(promptText : String)
{

var copy = new Array();

if(popupText != null)
copy = popupText;

copy.Push(promptText);
popupText = copy;

}

function removePopUp()
{
var copy = new Array();

copy = popupText;
copy.RemoveAt(0);
popupText = copy;

Time.timeScale = 1f;

}

//Classes
public class Character
 {
    var Name : String;
    var model : Transform;
    
    //Delete Later////
    var CharacterModel_Standing : Transform;
    //Delete Later////
    
    var selectedSound : AudioClip;

	var hitSounds : AudioClip[];
	var tauntSounds : AudioClip[];
	var Unlocked : boolean = false;
	var Icon : Texture2D;
 }

 public class Kart
 {
    var Name : String;
    var Icon : Texture2D;
    var model : Transform;
    var Unlocked : boolean = false;
 }

public class Track
 {	
    var Name : String;
    var Logo : Texture2D;
    var Preview : Texture2D;
    var BestTrackTime : Timer;
    var SceneID : String;
 }
 
enum ItemType{UsableAsShield,AffectsPlayer,AffectsOther,Projectile}; 
 
public class PowerUp
 {
    var Name : String;
    var Icon : Texture2D;
    var Model : Transform;
    
    var type : ItemType;
    var MultipleUses : boolean;
    
	var likelihood : int[];

 }

public class Tournament
 {
    var Name : String;
    var Icon : Texture2D;
    var TrophyModels : Transform[];
    var LastRank : String[];
    var Tracks : Track[];
    var Unlocked : boolean = false;
 }
 
public class Hat
 {
    var Name : String;
    var Icon : Texture2D;
    var Model : Transform;
    var Unlocked : boolean = false;

 } 
 
public class Wheel
{  
    var Name : String;
    var Icon : Texture2D;
    var model : Transform;
    var Unlocked : boolean = false;
}
 
public class Timer
{ 	
    var milliSecond : int;
    var Second : int;
    var Minute : int; 
    
    function ToString(){
    var foo1 = Minute;
	var foo2 = Second;
	var foo3 = milliSecond;

	var TimeString : String = foo1.ToString("00") + ":" + foo2.ToString("00") + ":" + (foo3/10).ToString("00");
	return TimeString;
    }
  
}

function Exit(){
Time.timeScale = 1f;
BlackOut = true;

Network.SetLevelPrefix(0);

transform.name = "OldGameData";

yield WaitForSeconds(1);
Application.LoadLevel(1);
yield;

}
 
