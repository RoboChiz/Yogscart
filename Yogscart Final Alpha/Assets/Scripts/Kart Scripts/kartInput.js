private var ks : kartScript;

function FixedUpdate () {

if(ks == null)
ks = transform.GetComponent(kartScript);

ks.throttle = Input.GetAxis("Throttle");
ks.steer = Input.GetAxis("Horizontal");

if(Input.GetAxis("Drift")!=0)
ks.drift = true;
else
ks.drift = false;

}


