#pragma strict

private var inputLock : boolean; //Turns fall when a controller is being added.
var allowedToChange : boolean;

var c : InputController[]; //Holds controllers connected

private var showIcon : boolean[];
private var iconHeights : int[];

function Awake(){
showIcon = new boolean[4];
iconHeights = new int[4];
}


public class InputController
{

var inputName : String;
var buttonLock : boolean; //Used on Submit & Cancel Axis.
var pauseLock : boolean; //Used on Pause Axis.

function InputController (inputString : String)
{
	inputName = inputString;
	buttonLock = true;
	pauseLock = true;
}

function GetInput(axis : String)
{
var returnFloat : float = 0;

if(Time.timeScale != 0f){

if((axis != "Submit" && axis != "Cancel" && axis != "Pause")||((axis == "Submit" || axis == "Cancel")&&!buttonLock)||(axis == "Pause"&&!pauseLock))
returnFloat = Input.GetAxis(inputName + axis);

if((axis == "Submit" || axis == "Cancel") && returnFloat != 0)
buttonLock = true;

if(axis == "Pause" && returnFloat != 0)
{
pauseLock = true;
buttonLock = true;
}

}

return returnFloat;

}

function GetRawInput(axis : String)
{
var returnFloat : float = 0;

if((axis != "Submit" && axis != "Cancel" && axis != "Pause")||((axis == "Submit" || axis == "Cancel")&&!buttonLock)||(axis == "Pause"&&!pauseLock))
returnFloat = Input.GetAxisRaw(inputName + axis);

if((axis == "Submit" || axis == "Cancel") && returnFloat != 0)
buttonLock = true;

if(axis == "Pause" && returnFloat != 0)
{
pauseLock = true;
buttonLock = true;
}

return returnFloat;

}

}

function OnGUI()
{

	GUI.skin = Resources.Load("GUISkins/Main Menu", GUISkin);
	
	//Look for new Controllers
	if(!inputLock && allowedToChange){
		if((c == null || c.Length < 4)){
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
		
		if(c != null){
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

		for(var i : int = 0; i < 4; i++){
		
		var idealSize = Screen.height/6f;
		
		if(showIcon[i])
		iconHeights[i] = Mathf.Lerp(iconHeights[i],idealSize,Time.deltaTime * 3f);
		else
		iconHeights[i] = Mathf.Lerp(iconHeights[i],0,Time.deltaTime * 3f);
		
		var iconRect : Rect = Rect(10 + (i*idealSize),Screen.height - iconHeights[i],idealSize,idealSize);
		
		if(c!= null && c.Length > i){
		var Icon : Texture2D;
		if(c[i].inputName == "Key_")
		Icon = Resources.Load("UI Textures/Controls/Keyboard",Texture2D);
		else
		Icon = Resources.Load("UI Textures/Controls/Xbox",Texture2D);
		
		GUI.Box(iconRect,Icon);
		
		}else
		GUI.Box(iconRect,"Player " + (i+1) + " has left!");
		
		}
		
	//Calculate or Reset buttonLock on all controllers
	for(i = 0; i < c.Length; i++)
	{
	
		if(c[0].inputName != "Key_")
			Screen.lockCursor = true;
		else
			Screen.lockCursor = false;
	
		if(Input.GetAxisRaw(c[i].inputName + "Submit") == 0 && Input.GetAxisRaw(c[i].inputName + "Cancel") == 0)
			c[i].buttonLock = false;
			
		if(Input.GetAxisRaw(c[i].inputName + "Pause") == 0)
			c[i].pauseLock = false;
			
		
	}
		

}

function ShowInput(i : int)
{

showIcon[i] = true;

yield WaitForSeconds(1);

showIcon[i] = false;


}

function AddController(input : String){
	
	inputLock = true;
	
	var alreadyIn : boolean;
	
	for(var i : int = 0; i < c.Length; i++)
	{
		if(c[i].inputName == input)
		{
			alreadyIn = true;
			break;
		}
	}
	

	if(!alreadyIn){
		
		ShowInput(i);
	
		var copy = new Array();

		if(c != null)
			copy = c;

		var newInput = new InputController(input);
		copy.Push(newInput);
		c = copy;
	}
	
	inputLock = false;
	
}

function RemoveController(input : String){

	inputLock = true;

	var copy = new Array();
	var toShow : int = -1;
	
	for(var i : int = 0; i < c.Length; i++)
		if(c[i].inputName != input)
			copy.Push(c[i]);
		else
			toShow = i;
	
	if(toShow != -1)	
	ShowInput(toShow);

	c = copy;
	
	inputLock = false;

}

function RemoveOtherControllers()
{

for(var i : int = 1; i < c.Length; i++)
{
RemoveController(c[i].inputName);
}

}
