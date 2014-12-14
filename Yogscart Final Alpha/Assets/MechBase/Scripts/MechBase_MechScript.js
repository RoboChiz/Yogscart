var Speed : float = 1.0; // Speed of Mech 
var Move : boolean = true; //For start and end game

function Start () {
Speed = 1.0;
}

function Update () {
 transform.position += new Vector3(0f, 0f, Speed * Time.deltaTime);
}

function SlowDown ( NewSpeed : float ) {
Speed = NewSpeed;

}

function SpeedUp (NewFastSpeed : float) {
Speed = NewFastSpeed;
}

function OnGUI(){
if(GUI.Button(Rect(10,30,100,30),"Slow")){
SlowDown(0.1f);
}

if(GUI.Button(Rect(10,70,100,30),"Fast")){
SpeedUp(0.5f);
}
}
