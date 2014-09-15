#pragma strict

function Start () {

var ks = transform.parent.GetComponent(kartScript);
ks.StartCoroutine("Boost",2);

Debug.Log("Boosting");

Destroy(this.gameObject);
}