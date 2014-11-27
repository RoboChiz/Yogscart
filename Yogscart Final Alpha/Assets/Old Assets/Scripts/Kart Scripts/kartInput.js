private var ks : kartScript;
private var ki : kartItem;

var InputName : String;

var camLocked : boolean;
var frontCamera : Camera;
var backCamera : Camera;

function FixedUpdate () {

if(ks == null && transform.GetComponent(kartScript))
ks = transform.GetComponent(kartScript);

if(ki == null)
ki = transform.GetComponent(kartItem);

ks.throttle = Input.GetAxis(InputName+ "Throttle");
ks.steer = Input.GetAxis(InputName+ "Horizontal");

if(Input.GetAxis(InputName+ "Drift")!=0)
ks.drift = true;
else
ks.drift = false;

if(Input.GetAxis(InputName + "Look Behind") != 0 && !camLocked){
backCamera.enabled = true;
frontCamera.enabled = false;
}else{
backCamera.enabled = false;
frontCamera.enabled = true;
}

if(ki != null)
{
if(Input.GetAxis(InputName+ "Use Item")!=0)
ki.input = true;
else
ki.input = false;

ki.CluckyInput = Vector3(Input.GetAxis(InputName+ "Horizontal"),0,Input.GetAxis(InputName+ "Vertical"));

}
}

