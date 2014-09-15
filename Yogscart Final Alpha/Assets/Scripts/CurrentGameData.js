#pragma strict

var PUC : Transform;
var Cams : Transform; 

//Tracks 
@HideInInspector
var currentCup : int = -1;
@HideInInspector
var currentTrack : int = -1;

var currentKart : int =-1;
var currentCharacter : int = -1;
var currentHat : int = -1;
var currentWheel : int = -1;

@HideInInspector
var currentPosition : int = 0;
@HideInInspector
var Ingame : Transform;

var Tournaments : Tournament[];

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


//@HideInInspector
var BlackOut : boolean = true;
private var ColourAlpha : Color = Color.black;
	
	function Awake () {
		DontDestroyOnLoad (transform.gameObject);
		
		for(var n = 0; n < Tournaments.Length; n++){
		Tournaments[n].LastRank = new String[4];
		Tournaments[n].LastRank[0] = PlayerPrefs.GetString(Tournaments[n].Name+"[50cc]","No Rank");
		Tournaments[n].LastRank[1] = PlayerPrefs.GetString(Tournaments[n].Name+"[100cc]","No Rank");
		Tournaments[n].LastRank[2] = PlayerPrefs.GetString(Tournaments[n].Name+"[150cc]","No Rank");
		Tournaments[n].LastRank[3] = PlayerPrefs.GetString(Tournaments[n].Name+"[Insane]","No Rank");
		
		for(var k = 0; k < Tournaments[n].Tracks.Length; k++){
		var TimeString = PlayerPrefs.GetString(Tournaments[n].Tracks[k].Name,"0:0:0");
		var words = TimeString.Split(":"[0]);
		Tournaments[n].Tracks[k].BestTrackTime.Minute = System.Int32.Parse(words[0]);
		Tournaments[n].Tracks[k].BestTrackTime.Second = System.Int32.Parse(words[1]);
		Tournaments[n].Tracks[k].BestTrackTime.milliSecond = System.Int32.Parse(words[2]);
		}
		}
		
		for(n = 0; n < Characters.Length; n++){
		var foo = true;
		foo = PlayerPrefs.GetInt(Characters[n].Name)==1;
		if(foo)
		Characters[n].Unlocked = true;
		}
		

		
		}
		
	
		function OnGUI () {
		GUI.depth = -5;
		//Black Out
		var texture = new Texture2D(1,1);
		if(BlackOut == false && ColourAlpha.a > 0)
		ColourAlpha.a -= Time.deltaTime;
		if(BlackOut == true && ColourAlpha.a < 1)
		ColourAlpha.a += Time.deltaTime;
		texture.SetPixel(0,0,ColourAlpha);
		texture.Apply();
		GUI.DrawTexture(Rect(-5,-5,Screen.width +5,Screen.height + 5),texture);
		}



//Classes
public class Character
 {
    var Name : String;
    var CharacterModel_Standing : Transform;
    var StartRaceSound : AudioClip;
	var EndRaceSound : AudioClip; 
	var hitSounds : AudioClip[];
	var tauntSounds : AudioClip[];
	var Unlocked : boolean = false;
	var Icon : Texture2D;
 }

 public class Kart
 {
    var Name : String;
    var Icon : Texture2D;
    var Model : Transform;
    var Models : Transform[];
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
 
public class PowerUp
 {
    var Name : String;
    var Model : Transform;
    var DisplayModel : Transform;
    
    var CanHoldBehindKart : boolean;
    var ItemEffect : boolean;
    var MinimumPosition : int = -1; //eg 2nd
    var MaximumPosition : int = -1;// 7th
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
    var Models : Transform[];
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

	var TimeString = foo1.ToString("00") + ":" + foo2.ToString("00") + ":" + foo3.ToString("00");
	return TimeString;
    }
  
}
 
