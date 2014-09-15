#pragma strict

function Start () {

while(transform.GetComponent(Animator) == null)
yield;

var ani : Animator;

ani = transform.GetComponent(Animator);

while(true){

yield WaitForSeconds(Random.Range(5,15));

ani.SetBool("Blink",true);
yield;
yield;
yield;
ani.SetBool("Blink",false);

}

}

