#pragma strict

private var gd : CurrentGameData;
private var im : InputManager;
private var sps : SinglePlayer_Script;

var version : String;
var Logo : Texture2D;

enum Menu{StartScreen,MainMenu,LocalMenu,DifficultyMenu,Multiplayer,HostMenu,JoinMenu,TournamentMenu,Options,Credits,CharacterSelect};
var State : Menu = Menu.StartScreen;

var VerticalLock : boolean;
var HorizontalLock : boolean;

var currentSelection : int;

var Flashing : boolean;
var LockedColourAlpha : Color = Color.red;

private var www1 : WWW;
private var Error : boolean = false;

var scrolling : boolean;
private var sideScroll : int;
var scrollTime : float = 5f;

var titlesideScroll : int;
var animated : boolean;
var locked : boolean;

//Network Holding
var NetworkIP : String = "127.0.0.1";
var NetworkPort : int = 25000;
var NetworkPortText : String;
var NetworkPassword : String;

var HostPort : int = 25000;
var HostPortText : String;
var HostPassword : String;
var WithBots : boolean;
var Automatic : boolean;
var conscious : boolean = true;

var MinPlayers : int;
var MinPlayersText : String;

var playerName : String;

//Options
private var ScreenR : int;
private var FullScreen : boolean;
private var Quality : int;

private var creditsHeight : float;

private var ConfirmSound : AudioClip;
private var BackSound : AudioClip;

private var vertiLock : boolean;

function Update(){
var background = transform.GetChild(0).guiTexture;
background.pixelInset = Rect(0,0,Screen.width,Screen.height);

}

function Start(){

gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
im = GameObject.Find("GameData").GetComponent(InputManager);
sps = gd.GetComponent(SinglePlayer_Script);

im.allowedToChange = false;
gd.BlackOut = true;

LockedColourAlpha.a = 0;

GetOptionSettings();

ConfirmSound = Resources.Load("Music & Sounds/SFX/confirm",AudioClip);
BackSound = Resources.Load("Music & Sounds/SFX/back",AudioClip);

yield WaitForSeconds(1);
gd.BlackOut = false;
im.allowedToChange = true;

var url = "https://db.tt/N51AaMhM";
www1 = new WWW (url);
yield www1;

if(!String.IsNullOrEmpty(www1.error))
Error = true;

}


function OnGUI () {

GUI.skin = Resources.Load("GUISkins/Main Menu", GUISkin);

var avg = ((Screen.height + Screen.width)/2f)/30f;

GUI.skin.label.fontSize = avg;
GUI.skin.customStyles[4].fontSize = avg;

//Render Character and Logo
var CharacterRender : Texture2D = Resources.Load("UI Textures/New Main Menu/Side Images/"+ Random.Range(0,1),Texture2D); 
GUI.DrawTexture(Rect(Screen.width/2f - titlesideScroll,10,Screen.width/2f,Screen.height-20),CharacterRender,ScaleMode.ScaleToFit);

var LogoWidth : float = Screen.width/2f;
var Ratio : float = LogoWidth/Logo.width;

var LogoRect = Rect(Screen.width/20f,Screen.width/20f + titlesideScroll,LogoWidth,Logo.height * Ratio);
GUI.DrawTexture(LogoRect,Logo);

if(State == Menu.Credits || State == Menu.CharacterSelect || State == Menu.TournamentMenu){
if(animated == false)
{
HideTitles(true);
animated = true;
}
}else{
if(animated == true)
{
HideTitles(false);
animated = false;
}
}

var specialLine : String;
if(gd.gameTag == User.Backer)
specialLine = "Jingle Jam Backer";
if(gd.gameTag == User.VIP)
specialLine = "VIP";

if(specialLine != null)
OutLineLabel2(Rect(Screen.width - 10 - (specialLine.Length*avg)/2f,Screen.height - Screen.height/20f - 10,(specialLine.Length*avg)/2f,Screen.height/20f),specialLine,2);

var Options : String[];
var stateLocation : String;

if(im.c == null || im.c.Length == 0)
{
var NoControllerRect : Rect = Rect(sideScroll + Screen.width/20f,(Screen.width/20f*(1+5)),Screen.width/2f,Screen.height/4f);
OutLineLabel2(NoControllerRect,"Press start on any controller or keyboard",2);
}

if(im.c != null && im.c.Length > 0){

if(!locked && !scrolling){
var submitInput : float = im.c[0].GetInput("Submit");
var submitBool = (submitInput != 0);

var cancelInput : float = im.c[0].GetInput("Cancel");
var cancelBool = (cancelInput != 0);
}


if(submitBool)
transform.FindChild("Background").audio.PlayOneShot(Resources.Load("Music & Sounds/SFX/confirm",AudioClip));

if(cancelBool)
transform.FindChild("Background").audio.PlayOneShot(Resources.Load("Music & Sounds/SFX/back",AudioClip));

switch(State) {
	
    case Menu.StartScreen:
    
    	Options = [];
    
        var PressStart : Texture2D = Resources.Load("UI Textures/New Main Menu/Press Start",Texture2D); 
		var PressStartWidth : float = Screen.width/3f;
		var PressStartRatio : float = PressStartWidth/PressStart.width;
		var PressStartRect = Rect(sideScroll + Screen.width/20f * 2.5f,Screen.height * (4f/6f),PressStartWidth,PressStart.height * PressStartRatio);

		GUI.DrawTexture(PressStartRect,PressStart);

		//Update Version

		var VersionRect : Rect = Rect(sideScroll +  Screen.width/20f * 2.5f,Screen.height * (5f/6f),PressStartWidth,PressStart.height * PressStartRatio);
		if(www1 != null ){
			if(www1.isDone == false)
				OutLineLabel(VersionRect,version + " [Checking]",2);
			else if(Error)
				OutLineLabel(VersionRect,version + " [NO Internet Connection]",2);
			else if(version == www1.text)
				OutLineLabel(VersionRect,www1.text,2);
			else
				OutLineLabel(VersionRect,version + " [UPDATE AVAILABLE]",2);
		}else{
				OutLineLabel(VersionRect,version + " I AM ERROR!",2);
		}
		
		if(submitBool)
			ChangeState(Menu.MainMenu);

	break;
	
	case Menu.MainMenu:
		Options = ["SinglePlayer","Multiplayer","Options","Credits","Quit"];
		stateLocation = "State 1";
		
		if(cancelBool)
			ChangeState(Menu.StartScreen);
			
		if(submitBool)
		{
			switch(currentSelection){
			case 0:
			ChangeState(Menu.LocalMenu);		
			break;
			case 1:
			FlashRed();	
			break;
			case 2:
			ChangeState(Menu.Options);		
			break;
			case 3:
			creditsHeight = Screen.height;
			ChangeState(Menu.Credits);		
			break;
			case 4:
			Application.Quit();	
			break;
			}
		
		}
		
	break;
	
	case Menu.LocalMenu:
		Options = ["Grand Prix","Custom Race","Time Trial","Back"];
		stateLocation = "State 2";
		
		if(cancelBool)
			ChangeState(Menu.MainMenu);
			
		if(submitBool)
		{
			switch(currentSelection){
			case 0:
			transform.GetComponent(Level_Select).GrandPrixOnly = true;
			gd.transform.GetComponent(SinglePlayer_Script).type = RaceStyle.GrandPrix;
			ChangeState(Menu.DifficultyMenu);
			break;
			case 1:
			transform.GetComponent(Level_Select).GrandPrixOnly = false;
			gd.transform.GetComponent(SinglePlayer_Script).type = RaceStyle.CustomRace;
			ChangeState(Menu.DifficultyMenu);
			break;
			case 2:
			transform.GetComponent(Level_Select).GrandPrixOnly = false;
			gd.transform.GetComponent(SinglePlayer_Script).type = RaceStyle.TimeTrial;
			im.RemoveOtherControllers();
			im.allowedToChange = false;
			StartCoroutine("StartSinglePlayer");
			locked = true;
			ChangeState(Menu.CharacterSelect);
			break;
			case 3:
			ChangeState(Menu.MainMenu);	
			break;			
			}
		
		}
		
	break;
	
		case Menu.Multiplayer:
		Options = ["Quick Race","Back"];
		stateLocation = "State 4";
		
		if(cancelBool)
			ChangeState(Menu.MainMenu);
			
		if(submitBool)
		{
			switch(currentSelection){
			case 0:

			break;
			case 1:
			ChangeState(Menu.MainMenu);
			break;	
			}
		}
		
	break;
	
	case Menu.DifficultyMenu:
		
		if(gd.unlockedInsane)
		Options = ["50cc","100cc","150cc","Insane","Back"];
		else
		Options = ["50cc","100cc","150cc","Back"];
		
		stateLocation = "State 3";
		
		if(cancelBool)
			ChangeState(Menu.LocalMenu);
			
		if(submitBool)
		{
		
			if((gd.unlockedInsane && currentSelection != 4) || (!gd.unlockedInsane && currentSelection != 3))
			{
				gd.transform.GetComponent(SinglePlayer_Script).Difficulty = currentSelection;
				StartCoroutine("StartSinglePlayer");
				locked = true;
				ChangeState(Menu.CharacterSelect);
			}
			else
			{
				ChangeState(Menu.LocalMenu);
			}
		
		}
		
	break;
	
	case Menu.CharacterSelect:
		Options = [];
		stateLocation = "State 14";
	break;
	
	case Menu.Credits:
		Options = [];
		stateLocation = "State 9";
		
		if(cancelBool)
			ChangeState(Menu.MainMenu);
			
		if(submitBool)
			ChangeState(Menu.MainMenu);
			
		var Credits : String[] = ["Ross - Project Manager / Developer","Robo_Chiz - Lead Programmer / Networking",
		"Mysca - Level Design / UI","Beardbotnik - Character Design / Graphics Designer", "Tom - Animation", "Pico - Music",
		"Yogscart is a non-profit fan game and is in no way affiliated with the Yogscast or the Youth Olympic Games", "We hope you enjoyed the alpha"];
		
		LogoWidth = Screen.width/2f;
		Ratio = LogoWidth/Logo.width;
		LogoRect = Rect(Screen.width/2f - LogoWidth/2f,creditsHeight,LogoWidth,Logo.height * Ratio);

		GUI.DrawTexture(LogoRect,Logo);

		for(var cred : int = 0; cred < Credits.Length; cred++)
			OutLineLabel(Rect(Screen.width/2f - LogoWidth/2f,creditsHeight + (Logo.height * Ratio * (cred+1)) ,LogoWidth,Logo.height * Ratio),Credits[cred],2);

		creditsHeight -= Time.deltaTime*40f;
		
	break;
	
	case Menu.Options:
		Options = ["Resolution","FullScreen","Quality","PlayerName","ResetEverything","SaveChanges","Back"];
		stateLocation = "State 8";
		
		if(cancelBool)
		{
			GetOptionSettings();
			ChangeState(Menu.MainMenu);
		}	
		if(submitBool)
		{
			switch(currentSelection){
			case 1:
			if(FullScreen)
			FullScreen = false;
			else
			FullScreen = true;
			break;
			case 4:
			gd.ResetEverything();
			PlayerPrefs.SetString("playerName","Player");
			GetOptionSettings();
			gd.Popup("All Grand Prix, Time Trial, Character, Hat, Kart, Wheel and Player data has been reset.");
			Debug.Log("Deleted!");
			break;
			case 5:
			Screen.SetResolution(Screen.resolutions[ScreenR].width,Screen.resolutions[ScreenR].height,FullScreen);
			QualitySettings.SetQualityLevel(Quality);
			PlayerPrefs.SetString("playerName",playerName);
			
			PlayerPrefs.SetInt("overallLapisCount",gd.overallLapisCount);
			
			gd.Popup("Your changes have been saved!");
			Debug.Log("Done!");
			break;
			case 6:
			GetOptionSettings();
			ChangeState(Menu.MainMenu);
			break;
		
			}
		
		}
		
	break;

}

	if(im.c[0].GetInput("Vertical") != 0 && VerticalLock == false){

		VerticalLock = true;

		var vinput = -Mathf.Sign(im.c[0].GetInput("Vertical"));

		currentSelection += vinput;
		
		if(currentSelection < 0)
			currentSelection = Options.Length - 1;
		
		if(currentSelection >= Options.Length)
			currentSelection = 0;
		
		
	}
	
	if(im.c[0].GetInput("Vertical") == 0)
		VerticalLock = false;

	
	for(var i : int = 0;i < Options.Length;i++){
		
		var OptionsTexture : Texture2D = Resources.Load("UI Textures/New Main Menu/" + stateLocation + "/" + Options[i],Texture2D); 
		var SelectedOptionsTexture : Texture2D = Resources.Load("UI Textures/New Main Menu/" + stateLocation + "/" + Options[i]+"_Sel",Texture2D); 
		var ratio = (Screen.width/20f)/OptionsTexture.height;
		
		var drawRect : Rect = Rect(sideScroll + Screen.width/20f,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f);

		if(currentSelection == i)
			GUI.DrawTexture(drawRect,SelectedOptionsTexture,ScaleMode.ScaleToFit);
		else
			GUI.DrawTexture(drawRect,OptionsTexture,ScaleMode.ScaleToFit);
			
		if(im.WithinBounds(drawRect,true))
		currentSelection = i;
		
		if(State == Menu.Options)
		{
			var IconHeight = Screen.width/20f;
		
			if(im.c[0].GetInput("Horizontal") != 0 && HorizontalLock == false){

				HorizontalLock = true;

				var hinput = Mathf.Sign(im.c[0].GetInput("Horizontal"));
				
				if(currentSelection == 0){
					ScreenR += hinput;
			
					if(ScreenR < 0)
						ScreenR = Screen.resolutions.Length - 1;
			
					if(ScreenR >= Screen.resolutions.Length)
						ScreenR = 0;
				}
				
				if(currentSelection == 2){
					Quality += hinput;
			
					if(Quality < 0)
						Quality = QualitySettings.names.Length - 1;
			
					if(Quality >=  QualitySettings.names.Length)
						Quality = 0;
				}
		
		
			}
	
			if(im.c[0].GetInput("Horizontal") == 0)
				HorizontalLock = false;

		
		
		
			if(i == 0){
				var resRect : Rect = Rect(sideScroll + Screen.width/10f + OptionsTexture.width * ratio,(IconHeight*(i+5)),OptionsTexture.width * ratio,IconHeight);
				
				if(im.WithinBounds(resRect,true))
					currentSelection = 0;
					
				OutLineLabel2(resRect,Screen.resolutions[ScreenR].width + " x " + Screen.resolutions[ScreenR].height,2,Color.black);
				
				var leftarrowResRect : Rect = Rect(sideScroll + Screen.width/10f + OptionsTexture.width * ratio - IconHeight,(IconHeight*(i+5)),IconHeight,IconHeight);
				var rightarrowResRect : Rect = Rect(sideScroll + Screen.width/10f + (OptionsTexture.width * ratio)*2 - IconHeight,(IconHeight*(i+5)),IconHeight,IconHeight);
				
				if(im.WithinBounds(leftarrowResRect,true) && submitBool)
				{
					ScreenR -= 1;
					
					if(ScreenR < 0)
					ScreenR = Screen.resolutions.Length - 1;
					
				}
				
				if(im.WithinBounds(rightarrowResRect,true) && submitBool)
				{
					ScreenR += 1;
					
					if(ScreenR >= Screen.resolutions.Length)
					ScreenR = 0;
					
				}
				
				GUI.DrawTexture(leftarrowResRect,Resources.Load("UI Textures/New Main Menu/Left_Arrow",Texture2D));
				GUI.DrawTexture(rightarrowResRect,Resources.Load("UI Textures/New Main Menu/Right_Arrow",Texture2D));
				
			}
			
			if(i == 1){

				var YesTexture = Resources.Load("UI Textures/New Main Menu/State 5/Yes",Texture2D); 
				var NoTexture = Resources.Load("UI Textures/New Main Menu/State 5/No",Texture2D); 
				var yesnoRect : Rect = Rect(sideScroll + Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f);

				if(im.WithinBounds(yesnoRect,true))
					currentSelection = 1;
					

				if(FullScreen == true)
					GUI.DrawTexture(yesnoRect,YesTexture,ScaleMode.ScaleToFit);
				else
					GUI.DrawTexture(yesnoRect,NoTexture,ScaleMode.ScaleToFit);

			}
			
			if(i == 2){
			
				var qualityRect : Rect = Rect(sideScroll + Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f);
			
				if(im.WithinBounds(qualityRect,true))
					currentSelection = 2;
			
				OutLineLabel2(qualityRect,QualitySettings.names[Quality],2,Color.black);
				
				var leftarrowqualityRect : Rect = Rect(sideScroll + Screen.width/10f + OptionsTexture.width * ratio - IconHeight,(IconHeight*(i+5)),IconHeight,IconHeight);
				var rightarrowqualityRect : Rect = Rect(sideScroll + Screen.width/10f + (OptionsTexture.width * ratio)*2 - IconHeight,(IconHeight*(i+5)),IconHeight,IconHeight);
				
				if(im.WithinBounds(leftarrowqualityRect,true) && submitBool)
				{
					Quality -= 1;
					
					if(Quality < 0)
					Quality = QualitySettings.names.Length - 1;
					
				}
				
				if(im.WithinBounds(rightarrowqualityRect,true) && submitBool)
				{
					Quality += 1;
					
					if(Quality >= QualitySettings.names.Length)
					Quality = 0;
					
				}
				
				GUI.DrawTexture(leftarrowqualityRect,Resources.Load("UI Textures/New Main Menu/Left_Arrow",Texture2D));
				GUI.DrawTexture(rightarrowqualityRect,Resources.Load("UI Textures/New Main Menu/Right_Arrow",Texture2D));
				
			}
			
			if(i == 3){
			
				var playerNameRect : Rect = Rect(sideScroll + Screen.width/10f + (OptionsTexture.width * ratio),(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f);
			
				if(im.WithinBounds(playerNameRect,true))
					currentSelection = 3;
				
				if(currentSelection == 3)
					playerName = GUI.TextField(playerNameRect,playerName.ToString());
				else
					GUI.Label(playerNameRect,playerName);
			}

		}
		

	}


//if(submitBool && controlLock == false)
//audio.PlayOneShot(ConfirmSound);

//if(State > 0)
//if(cancelBool && controlLock == false)
///audio.PlayOneShot(BackSound);


}

OutLineLabel(Rect(Screen.width/20f,(Screen.width/20f*(i+5)),100,Screen.width/20f),"[Locked]",2,LockedColourAlpha);

}

function FlashRed(){
if(Flashing == false){

Flashing = true;

while(LockedColourAlpha.a < 1){
LockedColourAlpha.a += Time.deltaTime * 2;
yield;
}

while(LockedColourAlpha.a > 0){
LockedColourAlpha.a -= Time.deltaTime * 2;
yield;
}

Flashing = false;

}

}

function Return()
{
locked = false;
StopCoroutine("StartSinglePlayer");
im.allowedToChange = true;
transform.GetComponent(newCharacterSelect).hidden = true;
transform.GetComponent(Level_Select).hidden = true;
ChangeState(Menu.LocalMenu);
}

function StartSinglePlayer(){

gd.CheckforNewStuff();

while(gd.currentChoices.Length == 0){
transform.GetComponent(newCharacterSelect).hidden = false;
transform.GetComponent(Level_Select).hidden = true;
yield;
}

while(sps.nextTrack == -1){
transform.GetComponent(Level_Select).hidden = false;
yield;
}

sps.enabled = true;

gd.BlackOut = true;	
			
}
	

function OutLineLabel(pos : Rect, text : String,Distance : float){
OutLineLabel(pos,text,Distance,Color.black);
}

function OutLineLabel(pos : Rect, text : String,Distance : float,Colour : Color){
Distance = Mathf.Clamp(Distance,1,Mathf.Infinity);

var style = new GUIStyle(GUI.skin.GetStyle("Label"));
style.normal.textColor = Colour;
GUI.Label(Rect(pos.x+Distance,pos.y,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x,pos.y+Distance,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x-Distance,pos.y,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x,pos.y-Distance,pos.width,pos.height),text,style);
var nstyle = new GUIStyle(GUI.skin.GetStyle("Label"));
nstyle.normal.textColor.a = Colour.a;
GUI.Label(pos,text,nstyle);

}

function OutLineLabel2(pos : Rect, text : String,Distance : float){
OutLineLabel2(pos,text,Distance,Color.black);
}

function OutLineLabel2(pos : Rect, text : String,Distance : float,Colour : Color){
Distance = Mathf.Clamp(Distance,1,Mathf.Infinity);

var style = new GUIStyle(GUI.skin.GetStyle("Special Label"));
style.normal.textColor = Colour;
GUI.Label(Rect(pos.x+Distance,pos.y,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x,pos.y+Distance,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x-Distance,pos.y,pos.width,pos.height),text,style);
GUI.Label(Rect(pos.x,pos.y-Distance,pos.width,pos.height),text,style);
var nstyle = new GUIStyle(GUI.skin.GetStyle("Special Label"));
nstyle.normal.textColor.a = Colour.a;
GUI.Label(pos,text,nstyle);

}


function GetOptionSettings()
{

for(var i : int = 0; i < Screen.resolutions.Length; i++)
{
if(Screen.resolutions[i] == Screen.currentResolution){
ScreenR = i;
break;
}
}

FullScreen = Screen.fullScreen;
Quality = QualitySettings.GetQualityLevel();
playerName = PlayerPrefs.GetString("playerName","Player");

}

function HideTitles(hide : boolean)
{

var startTime = Time.realtimeSinceStartup;

var toScroll : float;
var fromScroll : float;

if(hide)
{
toScroll = -Screen.width/2f - Screen.width/20f;
fromScroll = 0;
}
else
{
toScroll = 0;
fromScroll = -Screen.width/2f - Screen.width/20f;
}

while(Time.realtimeSinceStartup-startTime  < scrollTime){
titlesideScroll = Mathf.Lerp(fromScroll,toScroll,(Time.realtimeSinceStartup-startTime)/scrollTime);
yield;
}

}

function ChangeState(nextStage : Menu)
{

scrolling = true;

var startTime = Time.realtimeSinceStartup;

var toScroll = -Screen.width/2f;

while(Time.realtimeSinceStartup-startTime  < scrollTime){
sideScroll = Mathf.Lerp(0,toScroll,(Time.realtimeSinceStartup-startTime)/scrollTime);
yield;
}

sideScroll = toScroll;

State = nextStage;
currentSelection = 0;

startTime = Time.realtimeSinceStartup;

while(Time.realtimeSinceStartup-startTime  < scrollTime){
sideScroll = Mathf.Lerp(toScroll,0,(Time.realtimeSinceStartup-startTime)/scrollTime);
yield;
}

sideScroll = 0;

scrolling = false;

}