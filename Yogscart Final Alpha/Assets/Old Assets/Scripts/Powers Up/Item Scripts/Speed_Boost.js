#pragma strict

function Start () {

var ks = transform.parent.GetComponent(kartScript);
ks.StartCoroutine("Boost",2);

}