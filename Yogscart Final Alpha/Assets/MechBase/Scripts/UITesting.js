var ScreenType : int;

//ScreenTypes
// 1 - leaderboard
// 2 - GameUI
// 3 - Win/Loose Screen

function Start () {

}

function Update () {

}

function OnGUI () {
var PlayerBox : Texture2D = Resources.Load("UI Textures/MechBase/" + "player_box",Texture2D);
var THBox : Texture2D = Resources.Load("UI Textures/MechBase/" + "team_honeydewinc_box",Texture2D);
var TSBox : Texture2D = Resources.Load("UI Textures/MechBase/" + "team_sipsco_box",Texture2D);
if(ScreenType == 1){
GUI.DrawTexture(new Rect(Screen.width / 2 - Screen.width / 2.5 - 2.5 , Screen.height / 2 - Screen.height / 4 ,Screen.width - Screen.width / 1.65 , Screen.height / 8),TSBox,ScaleMode.StretchToFill,true, 1.0f);

GUI.DrawTexture(new Rect(Screen.width / 2  + 2.5, Screen.height / 2 - Screen.height / 4 ,Screen.width - Screen.width / 1.65 , Screen.height / 8),THBox,ScaleMode.StretchToFill,true, 1.0f);

//Left
GUI.DrawTexture(new Rect(Screen.width / 2 - Screen.width / 2.5 - 2.5 , Screen.height / 2 - Screen.height / 6.5 ,Screen.width - Screen.width / 1.65 , Screen.height / 10),PlayerBox,ScaleMode.StretchToFill,true, 1.0f);
GUI.DrawTexture(new Rect(Screen.width / 2 - Screen.width / 2.5 - 2.5 , Screen.height / 2 - Screen.height / 11 ,Screen.width - Screen.width / 1.65 , Screen.height / 10),PlayerBox,ScaleMode.StretchToFill,true, 1.0f);
GUI.DrawTexture(new Rect(Screen.width / 2 - Screen.width / 2.5 - 2.5 , Screen.height / 2  ,Screen.width - Screen.width / 1.65 , Screen.height / 10),PlayerBox,ScaleMode.StretchToFill,true, 1.0f);

//Right
GUI.DrawTexture(new Rect(Screen.width / 2  + 2.5, Screen.height / 2 - Screen.height / 6.5 ,Screen.width - Screen.width / 1.65 , Screen.height / 10),PlayerBox,ScaleMode.StretchToFill,true, 1.0f);


}
if(ScreenType == 2){
GUI.Box(new Rect(Screen.width / 2 - Screen.width / 3 - 25 , 5 ,Screen.width - Screen.width / 3 , 50),"");
}
if(ScreenType == 3){

}



}