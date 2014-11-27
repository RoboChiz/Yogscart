#pragma strict

function OnTriggerEnter (other : Collider) {

if(other.transform.tag == "Kart"){
other.transform.GetComponent(kartScript).StartCoroutine("Boost",2);
}

}