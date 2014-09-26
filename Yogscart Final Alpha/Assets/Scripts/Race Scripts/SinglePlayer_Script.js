#pragma strict

var nextCup : int = -1;
var nextTrack : int = -1;

var totalRaces : int = 0;

var type : RaceStyle;

var Difficulty : int;

private var gd : CurrentGameData;

function Awake(){
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
}

@HideInInspector
var RaceStarted : boolean;

function Update(){

if(RaceStarted == false){
StartRacing();
RaceStarted = true;
}

}

function StartRacing () {

yield WaitForSeconds(0.5);

Application.LoadLevel(gd.Tournaments[nextCup].Tracks[nextTrack].SceneID);
gd.currentCup = nextCup;
gd.currentTrack = nextTrack;
yield WaitForSeconds(0.2);

if(transform.GetComponent(Race_Master) == null){
//First time SetUp
gameObject.AddComponent(Race_Master);

var rm = transform.GetComponent(Race_Master);
rm.DebugMode = false;
rm.type = type;

var copy = new Array();

if(type != RaceStyle.TimeTrial){
for(var i : int = 0;i < 11;i++){
var AIRacer = new PlayerRacer();
AIRacer.Human = false;
AIRacer.HumanID = -1;
AIRacer.Character = Random.Range(0,gd.Characters.Length);
AIRacer.Kart = Random.Range(0,gd.Karts.Length);
AIRacer.Hat = Random.Range(0,gd.Hats.Length);
AIRacer.Wheel = Random.Range(0,gd.Wheels.Length);
AIRacer.timer = new Timer();
copy.Push(AIRacer);
}
}

var nRacer = new PlayerRacer();
nRacer.Human = true;
nRacer.HumanID = 0;
nRacer.Character = gd.currentCharacter;
nRacer.Hat = gd.currentHat;
nRacer.Kart = gd.currentKart;
nRacer.Wheel = gd.currentWheel;
nRacer.timer = new Timer();

copy.Push(nRacer);

rm.SPRacers = copy;

}

rm = transform.GetComponent(Race_Master);
rm.finishedSPRacers = new int[0];
rm.Players = 0;
rm.finishedPlayers = 0;

rm.currentSelection = 0;

rm.SinglePlayerRace();

Debug.Log("Done the RACE loading!");

}

