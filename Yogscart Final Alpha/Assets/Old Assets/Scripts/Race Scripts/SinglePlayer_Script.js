#pragma strict

var nextCup : int = -1;
var nextTrack : int = -1;

var totalRaces : int = 0;

var type : RaceStyle;

var Difficulty : int;

private var gd : CurrentGameData;
private var im : InputManager;

function Awake(){
gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
im = GameObject.Find("GameData").GetComponent(InputManager);
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
rm.type = type;

var copy = new Array();

if(type != RaceStyle.TimeTrial){
for(var i : int = 0;i < 12 - im.c.Length;i++){
var AIRacer = new PlayerRacer();
AIRacer.Human = false;
AIRacer.HumanID = -1;
//0 - 50cc, 1 - 100cc, 2 - 150cc, 3 - Insane
if(Difficulty == 0)
AIRacer.aiStupidity = Random.Range(5,10);
if(Difficulty == 1)
AIRacer.aiStupidity = Random.Range(3,8);
if(Difficulty == 2)
AIRacer.aiStupidity = Random.Range(1,5);
if(Difficulty == 3)
AIRacer.aiStupidity = 1;

AIRacer.Character = Random.Range(0,gd.Characters.Length);
AIRacer.Kart = Random.Range(0,gd.Karts.Length);
AIRacer.Hat = Random.Range(0,gd.Hats.Length);
AIRacer.Wheel = Random.Range(0,gd.Wheels.Length);
AIRacer.timer = new Timer();
copy.Push(AIRacer);
}
}

for(i = 0;i < im.c.Length;i++){
if(type != RaceStyle.TimeTrial || (type == RaceStyle.TimeTrial && i == 0)){
var nRacer = new PlayerRacer();
nRacer.Human = true;
nRacer.HumanID = i;
nRacer.Character = gd.currentChoices[i].character;
nRacer.Hat = gd.currentChoices[i].hat;
nRacer.Kart = gd.currentChoices[i].kart;
nRacer.Wheel = gd.currentChoices[i].wheel;
nRacer.timer = new Timer();

copy.Push(nRacer);
}
}

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
