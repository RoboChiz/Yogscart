#pragma strict

function Update () {

if(transform.particleSystem.isStopped)
Destroy(this.gameObject);


}