#pragma strict

private var ks : kartScript;

var IconSize : int = 200;

function OnGUI () {

IconSize = Screen.height/5;

if(ks == null)
ks = transform.GetComponent(kartScript);

ks.throttle = 0;

var ThrottleRect = Rect(Screen.width - IconSize-10,Screen.height - IconSize - 10,IconSize,IconSize);
GUI.Box(ThrottleRect,"GO!");

var BrakeRect = Rect(Screen.width - (IconSize*2) - 20,Screen.height - IconSize -10,IconSize,IconSize);
GUI.Box(BrakeRect,"Stop!");

var DriftRect = Rect(10,Screen.height - IconSize - 10,IconSize,IconSize);
GUI.Box(DriftRect,"DRIFT!");

if(WithinBounds(ThrottleRect))
ks.throttle = 1;

if(WithinBounds(BrakeRect))
ks.throttle = -1;

if(WithinBounds(DriftRect))
ks.drift = true;
else
ks.drift = false;

var steerInput = Input.acceleration.x;
steerInput = Mathf.Clamp(steerInput,-1,1);
ks.steer = steerInput * 3f;

}

function WithinBounds(Area : Rect){
for(var i : int = 0; i < Input.touches.Length; i++){
if(Input.GetTouch(i).position.x >= Area.x && Input.GetTouch(i).position.x <= Area.x + Area.width 
&&  Screen.height-Input.GetTouch(i).position.y >= Area.y &&  Screen.height-Input.GetTouch(i).position.y <= Area.y + Area.height){
return true;
}
}
return false;

}