#pragma strict

private var gd : CurrentGameData;
private var sps : SinglePlayer_Script;

var version : String;

var State : int = 0;

var RenderLogo : boolean; //Use this to show a 2D image of the logo for Mobile Devices.

var controlLock : boolean;
var VerticalLock : boolean;
var HorizontalLock : boolean;

var currentSelection : int;

var Alpha : float = 1;

var Flashing : boolean;
var LockedColourAlpha : Color = Color.red;

private var www1 : WWW;
private var Error : boolean = false;

//Network Holding
private var HS : Host;
private var CS : Client;

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

function Update(){
var background = transform.GetChild(0).guiTexture;
background.pixelInset = Rect(0,0,Screen.width,Screen.height);

}

function Start(){
LockedColourAlpha.a = 0;

gd = GameObject.Find("GameData").GetComponent(CurrentGameData);
sps = gd.GetComponent(SinglePlayer_Script);
HS = GameObject.Find("GameData").GetComponent(Host);
CS = GameObject.Find("GameData").GetComponent(Client);

gd.allowedToChange = true;

playerName = PlayerPrefs.GetString("playerName","Player");


ConfirmSound = Resources.Load("Music & Sounds/SFX/confirm",AudioClip);
BackSound = Resources.Load("Music & Sounds/SFX/back",AudioClip);

var url = "https://db.tt/N51AaMhM";
www1 = new WWW (url);
yield www1;

if(!String.IsNullOrEmpty(www1.error))
Error = true;

for(var g : int = 0; g < Screen.resolutions.Length; g++){
if(Screen.resolutions[g] == Screen.currentResolution){
ScreenR = g;
break;
}
}

FullScreen = Screen.fullScreen;
Quality = QualitySettings.GetQualityLevel();

}

function OnGUI () {

if(State != 14)
Alpha = Mathf.Lerp(Alpha,1,Time.deltaTime*5);
else
Alpha = Mathf.Lerp(Alpha,0,Time.deltaTime*5);

GUI.skin = Resources.Load("GUISkins/Main Menu", GUISkin);
GUI.color = Color(256,256,256,Alpha);

if(State != 9){
var CharacterRender : Texture2D = Resources.Load("UI Textures/New Main Menu/Side Images/"+ Random.Range(0,1),Texture2D); 
GUI.DrawTexture(Rect(Screen.width/2f,10,Screen.width/2f,Screen.height-20),CharacterRender,ScaleMode.ScaleToFit);

var Logo : Texture2D = Resources.Load("UI Textures/Main Menu/Logo",Texture2D);

var LogoWidth : float = Screen.width/2f;
var Ratio : float = LogoWidth/Logo.width;

var LogoRect = Rect(Screen.width/20f,Screen.width/20f,LogoWidth,Logo.height * Ratio);
GUI.DrawTexture(LogoRect,Logo);
}

if(gd.pcn == null || gd.pcn.Length == 0){

var inputWidth : float = Screen.width/3f;
var inputRect = Rect(Screen.width/20f * 2.5f,Screen.height * (1f/6f),inputWidth,Screen.height * (2f/6f));

OutLineLabel2(inputRect,"Press Start on an Input Device!",2);

var keyboardIcon = Resources.Load("UI Textures/Controls/Keyboard",Texture2D);
var xboxIcon = Resources.Load("UI Textures/Controls/Xbox",Texture2D);

var keyRect = Rect(Screen.width/20f * 4f,Screen.height * (1.75f/6f),inputWidth/3f,Screen.height * (2f/6f));
var xboxRect = Rect(Screen.width/20f * 4f,Screen.height * (2.5f/6f),inputWidth/3f,Screen.height * (2f/6f));

GUI.DrawTexture(keyRect,keyboardIcon,ScaleMode.ScaleToFit);
GUI.DrawTexture(xboxRect,xboxIcon,ScaleMode.ScaleToFit);

controlLock = true;

}else{

if(Input.GetAxis(gd.pcn[0]+"Submit") == 0 && Input.GetAxis(gd.pcn[0]+"Cancel") == 0 )
controlLock = false;

if(State < 14){
if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && controlLock == false)
audio.PlayOneShot(ConfirmSound);

if(State > 0)
if(Input.GetAxis(gd.pcn[0]+"Cancel") != 0 && controlLock == false)
audio.PlayOneShot(BackSound);
}

if(State == 0){ //Title Screen

var PressStart : Texture2D = Resources.Load("UI Textures/New Main Menu/Press Start",Texture2D); 

var PressStartWidth : float = Screen.width/3f;
var PressStartRatio : float = PressStartWidth/PressStart.width;
var PressStartRect = Rect(Screen.width/20f * 2.5f,Screen.height * (4f/6f),PressStartWidth,PressStart.height * PressStartRatio);

GUI.DrawTexture(PressStartRect,PressStart);

//Update Version

var VersionRect : Rect = Rect(Screen.width/20f * 2.5f,Screen.height * (5f/6f),PressStartWidth,PressStart.height * PressStartRatio);

if(www1.isDone == false)
OutLineLabel(VersionRect,version + " [Checking]",2);
else if(Error)
OutLineLabel(VersionRect,version + " [NO Internet Connection]",2);
else if(version == www1.text)
OutLineLabel(VersionRect,www1.text,2);
else
OutLineLabel(VersionRect,version + " [UPDATE AVAILABLE]",2);

if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && controlLock == false){
State = 1;
controlLock = true;
}

}

var Options : String[];

if(State == 1){ // Main Menu

if(Input.GetAxis(gd.pcn[0]+"Cancel") != 0 && controlLock == false){
State = 0;
currentSelection = 0;
controlLock = true;
}

Options = ["SinglePlayer","Multiplayer","Options","Credits","Quit"];

for(var i : int = 0;i < Options.Length;i++){
var OptionsTexture : Texture2D = Resources.Load("UI Textures/New Main Menu/State 1/" + Options[i],Texture2D); 
var SelectedOptionsTexture : Texture2D = Resources.Load("UI Textures/New Main Menu/State 1/" + Options[i]+"_Sel",Texture2D); 

if(currentSelection == i)
GUI.DrawTexture(Rect(Screen.width/20f,(Screen.width/20f*(i+5)),Screen.width/4f,Screen.width/20f),SelectedOptionsTexture,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(Rect(Screen.width/20f,(Screen.width/20f*(i+5)),Screen.width/4f,Screen.width/20f),OptionsTexture,ScaleMode.ScaleToFit);

}

if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && controlLock == false){

if(currentSelection == 0){
State = 2;
currentSelection = 0;
}

if(currentSelection == 1){
gd.type = RaceStyle.Online;
State = 4;
currentSelection = 0;
}

if(currentSelection == 2){

for(var g : int = 0; g < Screen.resolutions.Length; g++){
if(Screen.resolutions[g] == Screen.currentResolution)
ScreenR = g;
g = Screen.resolutions.Length + 1;
}

FullScreen = Screen.fullScreen;
Quality = QualitySettings.GetQualityLevel();

State = 8;
currentSelection = 0;
}

if(currentSelection == 3){
State = 9;
creditsHeight = Screen.height;
}

if(currentSelection == 4){
Application.Quit();
currentSelection = 0;
}


controlLock = true;
}

}

if(State == 2){ //Single Player

if(Input.GetAxis(gd.pcn[0]+"Cancel") != 0 && controlLock == false){
State = 1;
currentSelection = 0;
controlLock = true;
}

Options = ["Grand Prix","Custom Race","Time Trial"];

for(i = 0;i < Options.Length;i++){
OptionsTexture = Resources.Load("UI Textures/New Main Menu/State 2/" + Options[i],Texture2D); 
SelectedOptionsTexture = Resources.Load("UI Textures/New Main Menu/State 2/" + Options[i]+"_Sel",Texture2D); 

if(currentSelection == i)
GUI.DrawTexture(Rect(Screen.width/20f,(Screen.width/20f*(i+5)),Screen.width/4f,Screen.width/20f),SelectedOptionsTexture,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(Rect(Screen.width/20f,(Screen.width/20f*(i+5)),Screen.width/4f,Screen.width/20f),OptionsTexture,ScaleMode.ScaleToFit);

}

if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && controlLock == false){

if(currentSelection == 0){
transform.GetComponent(Level_Select).GrandPrixOnly = true;
gd.transform.GetComponent(SinglePlayer_Script).type = RaceStyle.GrandPrix;
gd.type = RaceStyle.GrandPrix;
State = 3;
}
if(currentSelection == 1){
transform.GetComponent(Level_Select).GrandPrixOnly = false;
gd.transform.GetComponent(SinglePlayer_Script).type = RaceStyle.CustomRace;
gd.type = RaceStyle.CustomRace;
State = 3;
}
if(currentSelection == 2){
transform.GetComponent(Level_Select).GrandPrixOnly = false;
gd.transform.GetComponent(SinglePlayer_Script).type = RaceStyle.TimeTrial;
gd.type = RaceStyle.TimeTrial;
StartCoroutine("StartSinglePlayer");
State = 14;
}

currentSelection = 0;
controlLock = true;
}



}

if(State == 3){ //Difficulty Selector

if(Input.GetAxis(gd.pcn[0]+"Cancel") != 0 && controlLock == false){
State = 2;
currentSelection = 0;
controlLock = true;
}

if(gd.unlockedInsane)
Options = ["50cc","100cc","150cc","Insane"];
else
Options = ["50cc","100cc","150cc"];

for(i = 0;i < Options.Length;i++){
OptionsTexture = Resources.Load("UI Textures/New Main Menu/State 3/" + Options[i],Texture2D); 
SelectedOptionsTexture = Resources.Load("UI Textures/New Main Menu/State 3/" + Options[i]+"_Sel",Texture2D); 

var ratio = (Screen.width/20f)/OptionsTexture.height;

if(currentSelection == i)
GUI.DrawTexture(Rect(Screen.width/10f,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),SelectedOptionsTexture,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(Rect(Screen.width/10f,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),OptionsTexture,ScaleMode.ScaleToFit);

}

if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && controlLock == false){

gd.transform.GetComponent(SinglePlayer_Script).Difficulty = currentSelection;

StartCoroutine("StartSinglePlayer");

State = 14;

controlLock = true;
}



}

if(State == 4){ //Multiplayer Menu

if(Input.GetAxis(gd.pcn[0]+"Cancel") != 0 && controlLock == false){
State = 1;
currentSelection = 0;
controlLock = true;
}

Options = ["Quick Race","Host","Join"];

for(i = 0;i < Options.Length;i++){
OptionsTexture = Resources.Load("UI Textures/New Main Menu/State 4/" + Options[i],Texture2D); 
SelectedOptionsTexture = Resources.Load("UI Textures/New Main Menu/State 4/" + Options[i]+"_Sel",Texture2D); 

ratio = (Screen.width/20f)/OptionsTexture.height;

if(currentSelection == i)
GUI.DrawTexture(Rect(Screen.width/10f,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),SelectedOptionsTexture,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(Rect(Screen.width/10f,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),OptionsTexture,ScaleMode.ScaleToFit);

}

if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && controlLock == false){

if(currentSelection == 1)
State = 5;

if(currentSelection == 2)
State = 6;

currentSelection = 0;
controlLock = true;
}



}

if(State == 5){ //Host Menu

if(Input.GetAxis(gd.pcn[0]+"Cancel") != 0 && controlLock == false){
State = 4;
currentSelection = 0;
controlLock = true;
}

if(!Automatic)
Options = ["Port","Password","Bots","AutomaticServer","Start Server"];
else
Options = ["Port","Password","Bots","AutomaticServer","MinPlayers","Start Server"];

for(i = 0;i < Options.Length;i++){
OptionsTexture = Resources.Load("UI Textures/New Main Menu/State 5/" + Options[i],Texture2D); 
SelectedOptionsTexture = Resources.Load("UI Textures/New Main Menu/State 5/" + Options[i]+"_Sel",Texture2D); 

ratio = (Screen.width/20f)/OptionsTexture.height;

if(currentSelection == i)
GUI.DrawTexture(Rect(Screen.width/10f,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),SelectedOptionsTexture,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(Rect(Screen.width/10f,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),OptionsTexture,ScaleMode.ScaleToFit);

if(i == 0){
if(currentSelection == i){
HostPortText = GUI.TextField(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),HostPort.ToString());
int.TryParse(HostPortText,HostPort);
}else
GUI.Label(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),HostPort.ToString());
}

if(i == 1){
if(currentSelection == i)
HostPassword = GUI.TextField(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),HostPassword);
else
GUI.Label(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),HostPassword.ToString());
}

if(i >=2){
var YesTexture = Resources.Load("UI Textures/New Main Menu/State 5/Yes",Texture2D); 
var SelectedYesTexture = Resources.Load("UI Textures/New Main Menu/State 5/Yes_Sel",Texture2D); 

var NoTexture = Resources.Load("UI Textures/New Main Menu/State 5/No",Texture2D); 
var SelectedNoTexture = Resources.Load("UI Textures/New Main Menu/State 5/No_Sel",Texture2D); 

if(i == 2){
if(WithBots == true)
GUI.DrawTexture(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),YesTexture,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),NoTexture,ScaleMode.ScaleToFit);
}

if(i == 3){
if(Automatic == true)
GUI.DrawTexture(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),YesTexture,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),NoTexture,ScaleMode.ScaleToFit);
}

if(Automatic && i == 4){
if(currentSelection == i){
MinPlayersText = GUI.TextField(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),MinPlayers.ToString());
int.TryParse(MinPlayersText,MinPlayers);
}else
GUI.Label(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),MinPlayers.ToString());
}


}

}

if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && controlLock == false){

if(currentSelection == 2)
WithBots = !WithBots;

if(currentSelection == 3)
Automatic = !Automatic;

if(Options[currentSelection] == "Start Server")
StartCoroutine("StartServer");

controlLock = true;
}



}

if(State == 6){ //Join Menu

if(Input.GetAxis(gd.pcn[0]+"Cancel") != 0 && controlLock == false){
State = 4;
currentSelection = 0;
controlLock = true;
}

Options = ["IPAddress","Port","Password","Connect"];

for(i = 0;i < Options.Length;i++){
OptionsTexture = Resources.Load("UI Textures/New Main Menu/State 6/" + Options[i],Texture2D); 
SelectedOptionsTexture = Resources.Load("UI Textures/New Main Menu/State 6/" + Options[i]+"_Sel",Texture2D); 

ratio = (Screen.width/20f)/OptionsTexture.height;

if(currentSelection == i)
GUI.DrawTexture(Rect(Screen.width/10f,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),SelectedOptionsTexture,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(Rect(Screen.width/10f,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),OptionsTexture,ScaleMode.ScaleToFit);


if(i == 0)
if(currentSelection == i)
NetworkIP = GUI.TextField(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),NetworkIP);
else
GUI.Label(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),NetworkIP);

if(i == 1)
if(currentSelection == i){
NetworkPortText = GUI.TextField(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),NetworkPort.ToString());
int.TryParse(NetworkPortText,NetworkPort);
}else
GUI.Label(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),NetworkPort.ToString());

if(i == 2)
if(currentSelection == i)
NetworkPassword = GUI.TextField(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),NetworkPassword.ToString());
else
GUI.Label(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),NetworkPassword);


}

if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && controlLock == false){

if(currentSelection == 3){
if(NetworkPassword == "" || NetworkPassword == null)
Network.Connect(NetworkIP, NetworkPort);
else
Network.Connect(NetworkIP, NetworkPort,NetworkPassword);

State = 14;
}

currentSelection = 0;
controlLock = true;
}



}

if(State == 7){

var BoardTexture : Texture2D = Resources.Load("UI Textures/GrandPrix Positions/Backing",Texture2D);
var BoardRect : Rect = Rect(Screen.width/2f - Screen.width/4f,Screen.height/2f - ((Screen.height/16f)*3f)/2f,Screen.width/2f ,(Screen.height/16f)*3f);

GUI.DrawTexture(BoardRect,BoardTexture);

var OutlineRect : Rect = Rect(Screen.width/2f - Screen.width/4f,Screen.height/2f - ((Screen.height/16f)*1f),Screen.width/2f ,(Screen.height/16f)*2f);

OutLineLabel(OutlineRect,"Can't connect to Server! " + errorText,1);

if((Input.GetAxis(gd.pcn[0]+"Submit") != 0 || Input.GetAxis(gd.pcn[0]+"Cancel") != 0) && controlLock == false){
State = 6;
controlLock = true;
}


}

if(State == 8){ //Options ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

if(Input.GetAxis(gd.pcn[0]+"Cancel") != 0 && controlLock == false){

for(g = 0; g < Screen.resolutions.Length; g++){
if(Screen.resolutions[g] == Screen.currentResolution){
ScreenR = g;
break;
}
}

FullScreen = Screen.fullScreen;
Quality = QualitySettings.GetQualityLevel();

State = 1;
currentSelection = 0;
controlLock = true;
}

Options = ["Resolution","FullScreen","Quality","PlayerName","ResetEverything","SaveChanges","Back"];

for(i = 0;i < Options.Length;i++){
OptionsTexture = Resources.Load("UI Textures/New Main Menu/State 8/" + Options[i],Texture2D); 
SelectedOptionsTexture = Resources.Load("UI Textures/New Main Menu/State 8/" + Options[i]+"_Sel",Texture2D); 

ratio = (Screen.width/20f)/OptionsTexture.height;

if(currentSelection == i)
GUI.DrawTexture(Rect(Screen.width/10f,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),SelectedOptionsTexture,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(Rect(Screen.width/10f,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),OptionsTexture,ScaleMode.ScaleToFit);

if(i == 0){

OutLineLabel2(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),Screen.resolutions[ScreenR].width + " x " + Screen.resolutions[ScreenR].height,2,Color.black);

}

if(i == 3){
if(currentSelection == 3)
playerName = GUI.TextField(Rect(Screen.width/10f + (OptionsTexture.width * ratio),(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),playerName.ToString());
else
GUI.Label(Rect(Screen.width/10f + (OptionsTexture.width * ratio),(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),playerName);
}

if(currentSelection == 0){
if(Input.GetAxis(gd.pcn[0]+"Horizontal") != 0 && HorizontalLock == false){

ScreenR += Mathf.Sign(Input.GetAxis(gd.pcn[0]+"Horizontal"));

if(ScreenR >= Screen.resolutions.Length)
ScreenR = 0;

if(ScreenR < 0)
ScreenR = Screen.resolutions.Length-1;

HorizontalLock = true;
HoriWait();
}
}

if(i == 1){

YesTexture = Resources.Load("UI Textures/New Main Menu/State 5/Yes",Texture2D); 
NoTexture = Resources.Load("UI Textures/New Main Menu/State 5/No",Texture2D); 

if(FullScreen == true)
GUI.DrawTexture(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),YesTexture,ScaleMode.ScaleToFit);
else
GUI.DrawTexture(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),NoTexture,ScaleMode.ScaleToFit);

}

if(i == 2){

OutLineLabel2(Rect(Screen.width/10f + OptionsTexture.width * ratio,(Screen.width/20f*(i+5)),OptionsTexture.width * ratio,Screen.width/20f),QualitySettings.names[Quality],2,Color.black);

}

if(currentSelection == 2){
if(Input.GetAxis(gd.pcn[0]+"Horizontal") != 0 && HorizontalLock == false){

Quality += Mathf.Sign(Input.GetAxis(gd.pcn[0]+"Horizontal"));

if(Quality >= QualitySettings.names.Length)
Quality = 0;

if(Quality < 0)
Quality = QualitySettings.names.Length - 1;

HorizontalLock = true;
HoriWait();
}
}

if(Input.GetAxis(gd.pcn[0]+"Submit") != 0 && controlLock == false){

if(currentSelection == 1)
FullScreen = !FullScreen;

if(currentSelection == 4){
gd.ResetEverything();
}

if(currentSelection == 5){
Screen.SetResolution(Screen.resolutions[ScreenR].width,Screen.resolutions[ScreenR].height,FullScreen);
QualitySettings.SetQualityLevel(Quality);
}

if(currentSelection == 6){
for(g = 0; g < Screen.resolutions.Length; g++){
if(Screen.resolutions[g] == Screen.currentResolution)
ScreenR = g;
g = Screen.resolutions.Length + 1;
}

FullScreen = Screen.fullScreen;
Quality = QualitySettings.GetQualityLevel();

PlayerPrefs.SetString("playerName",playerName);

State = 1;
currentSelection = 0;
controlLock = true;
}

controlLock = true;
}
}




}

if(State == 9){

var Credits : String[] = ["Ross - Project Manager / Developer","Robo_Chiz - Lead Programmer / Networking",
"Mysca - Level Design / UI","Beardbotnik - Character Design / Graphics Designer", "Tom - Animation", "Pico - Music",
"Yogscart is a non-profit fan game and is in no way affiliated with the Yogscast or the Youth Olympic Games", "We hope you enjoyed the alpha"];

Logo = Resources.Load("UI Textures/Main Menu/Logo",Texture2D);
LogoWidth = Screen.width/2f;
Ratio = LogoWidth/Logo.width;
LogoRect = Rect(Screen.width/2f - LogoWidth/2f,creditsHeight,LogoWidth,Logo.height * Ratio);

GUI.DrawTexture(LogoRect,Logo);

for(var cred : int = 0; cred < Credits.Length; cred++)
GUI.Label(Rect(Screen.width/2f - LogoWidth/2f,creditsHeight + (Logo.height * Ratio * (cred+1)) ,LogoWidth,Logo.height * Ratio),Credits[cred]);

creditsHeight -= Time.deltaTime*30f;

if(Input.GetAxis(gd.pcn[0] + "Cancel") != 0 && !controlLock){
controlLock = true;
State = 1;
}


}

if(State == 14){//Single Player Race

			
}	

//Get Vertical Input
if(Options != null && Options.Length > 0){
if(Input.GetAxis(gd.pcn[0]+"Vertical") != 0&& VerticalLock == false){

currentSelection -= Mathf.Sign(Input.GetAxis(gd.pcn[0]+"Vertical"));


if(currentSelection >= Options.Length)
currentSelection = 0;

if(currentSelection < 0)
currentSelection = Options.Length-1;

VerticalLock = true;
VertWait();
}
}

OutLineLabel(Rect(Screen.width/10f,(Screen.width/20f*(i+5)),300,Screen.width/20f),"[Locked]",2,LockedColourAlpha);

}
}

function VertWait(){
yield WaitForSeconds(0.2);
VerticalLock = false;
}

function HoriWait(){
yield WaitForSeconds(0.2);
HorizontalLock = false;
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

function Return(){
StopCoroutine("StartSinglePlayer");

controlLock = true;

if(sps.type != RaceStyle.TimeTrial)
State = 3;
else
State = 2;

gd.allowedToChange = true;

}

function StartSinglePlayer(){

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

function StartServer(){

State = 14;

gd.allowedToChange = false;

while(gd.pcn.Length > 1)
gd.RemoveController(gd.pcn[1]);

while(gd.currentChoices.Length == 0){
transform.GetComponent(newCharacterSelect).hidden = false;
transform.GetComponent(Level_Select).hidden = true;
yield;
}

gd.BlackOut = true;

yield WaitForSeconds(0.6);

if(HostPassword != "" || HostPassword != null)
Network.incomingPassword = HostPassword;

var useNat = !Network.HavePublicAddress();
Network.InitializeServer(200, 25000, useNat);

if(!conscious)
MasterServer.RegisterHost("YogscartRace", "Surprise Server", "Best game ever!");

HS.Bots = WithBots;
HS.Automatic = Automatic;
HS.MinPlayers = MinPlayers;
HS.conscious = conscious;
HS.enabled = true;
HS.ResetServer();

if(conscious)
HS.AddHost(gd.currentChoices[0].character,gd.currentChoices[0].hat,gd.currentChoices[0].kart,gd.currentChoices[0].wheel);

}	

function OnConnectedToServer() {
StartConnection();
}

function StartConnection(){

gd.allowedToChange = false;

while(gd.currentChoices.Length == 0){
transform.GetComponent(newCharacterSelect).hidden = false;
yield;
}

gd.transform.networkView.RPC("ReadyPlayer",RPCMode.Server);

CS.enabled = true;
}

var errorText : String;

function OnFailedToConnect(error: NetworkConnectionError) {
		errorText = error.ToString();
		State = 7;
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


function WithinBounds(Area : Rect){

if(Input.mousePosition.x >= Area.x && Input.mousePosition.x <= Area.x + Area.width 
&&  Screen.height-Input.mousePosition.y >= Area.y &&  Screen.height-Input.mousePosition.y <= Area.y + Area.height)
return true;
else
return false;

}