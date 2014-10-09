#pragma strict
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

@HideInInspector
var allowedToChange : boolean;
var pcn : String[];

//@HideInInspector
var BlackOut : boolean = true;
private var ColourAlpha : Color = Color.black;
	
	function Awake () {
		DontDestroyOnLoad (transform.gameObject);
		
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
		
		for(n = 0; n < Characters.Length; n++){
		var foo = true;
		foo = PlayerPrefs.GetInt(Characters[n].Name)==1;
		if(foo)
		Characters[n].Unlocked = true;
		}
		
		iconHeights = new int[4];
		showIcon = new boolean[4];
		
		}
	
		private var iconHeights : int[];
		private var showIcon : boolean[];
		private var inputLock : boolean;
		
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
		
		for(var i : int; i < 4; i++){
		
		var idealSize = Screen.height/6f;
		
		if(showIcon[i])
		iconHeights[i] = Mathf.Lerp(iconHeights[i],idealSize,Time.deltaTime * 3f);
		else
		iconHeights[i] = Mathf.Lerp(iconHeights[i],0,Time.deltaTime * 3f);
		
		var iconRect : Rect = Rect(10 + (i*idealSize),Screen.height - iconHeights[i],idealSize,idealSize);
		
		if(pcn!= null && pcn.Length > i){
		var Icon : Texture2D;
		if(pcn[i] == "Key_")
		Icon = Resources.Load("UI Textures/Controls/Keyboard",Texture2D);
		else
		Icon = Resources.Load("UI Textures/Controls/Xbox",Texture2D);
		
		GUI.Box(iconRect,Icon);
		
		}else
		GUI.Box(iconRect,"Player " + (i+1) + " has left!");
		
		}
		
		if(!inputLock && allowedToChange){
		if((pcn == null || pcn.Length < 4)){
		if(Input.GetAxis("Key_Submit")&&!inputLock)
		AddController("Key_");
		
		if(Input.GetAxis("C1_Submit")&&!inputLock)
		AddController("C1_");
		
		if(Input.GetAxis("C2_Submit")&&!inputLock)
		AddController("C2_");
		
		if(Input.GetAxis("C3_Submit")&&!inputLock)
		AddController("C3_");
		
		if(Input.GetAxis("C4_Submit")&&!inputLock)
		AddController("C4_");
		
		}
		
		if(pcn != null){
		if(Input.GetAxis("Key_Leave")&&!inputLock)
		RemoveController("Key_");
		
		if(Input.GetAxis("C1_Leave")&&!inputLock)
		RemoveController("C1_");
		
		if(Input.GetAxis("C2_Leave")&&!inputLock)
		RemoveController("C2_");
		
		if(Input.GetAxis("C3_Leave")&&!inputLock)
		RemoveController("C3_");
		
		if(Input.GetAxis("C4_Leave")&&!inputLock)
		RemoveController("C4_");
		
		}
		}
		
		
		}


function AddController(input : String){
inputLock = true;
var alreadyIn : boolean;
if(pcn != null)
for(var i : int = 0; i < pcn.Length; i++)
if(pcn[i] == input){
alreadyIn = true;
i = 5;
}


if(!alreadyIn){
var copy = new Array();

if(pcn != null)
copy = pcn;

copy.Push(input);


var toShow : int = copy.length-1;
while(showIcon[toShow] == true)
yield;

pcn = copy;

showIcon[toShow] = true;
yield WaitForSeconds(1);
showIcon[toShow] = false;

}
inputLock = false;
}

function RemoveController(input : String){
inputLock = true;

var copy = new Array();
var toShow : int = -1;

for(var i : int = 0; i < pcn.Length; i++)
if(pcn[i] != input)
copy.Push(pcn[i]);
else
toShow = i;

if(toShow != -1){
while(showIcon[toShow] == true)
yield;

pcn = copy;

showIcon[toShow] = true;
yield WaitForSeconds(1);
showIcon[toShow] = false;
}

inputLock = false;

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
 
enum ItemType{UsableAsShield,AffectsPlayer,AffectsOther,MultipleUses}; 
 
public class PowerUp
 {
    var Name : String;
    var Icon : Texture2D;
    var Model : Transform;
    
    var type : ItemType;
    
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

	var TimeString : String = foo1.ToString("00") + ":" + foo2.ToString("00") + ":" + (foo3/10).ToString("00");
	return TimeString;
    }
  
}

function Exit(){
BlackOut = true;

transform.name = "OldGameData";

yield WaitForSeconds(1);
Application.LoadLevel(1);
yield;

GameObject.Find("GameData").GetComponent(CurrentGameData).pcn = pcn;
Destroy(this.gameObject);
}
 
