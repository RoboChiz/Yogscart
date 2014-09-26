private var ks : kartScript;
private var ki : kartItem;

function FixedUpdate () {

if(ks == null)
ks = transform.GetComponent(kartScript);

if(ki == null)
ki = transform.GetComponent(kartItem);

ks.throttle = Input.GetAxis("Throttle");
ks.steer = Input.GetAxis("Horizontal");

if(Input.GetAxis("Drift")!=0)
ks.drift = true;
else
ks.drift = false;

if(Input.GetAxis("Use Item")!=0)
ki.input = true;
else
ki.input = false;

}

