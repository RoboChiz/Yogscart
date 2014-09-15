#pragma strict

function Start () {

transform.GetComponent(LobbyAI).locked = true;

while(true){
transform.GetComponent(LobbyAI).TraveltoPos = Vector3(10,0,0);
yield WaitForSeconds(8);
transform.GetComponent(LobbyAI).TraveltoPos = Vector3(10,0,-0.75);
yield WaitForSeconds(3);

transform.GetComponent(LobbyAI).TraveltoPos = Vector3(0,0,0);
yield WaitForSeconds(8);
transform.GetComponent(LobbyAI).TraveltoPos = Vector3(0,0,-0.75);
yield WaitForSeconds(3);

}

}
