using UnityEngine;
using System.Collections;

[ExecuteInEditMode]
public class IBLswitcher : MonoBehaviour {
	
	public float smooth  = 2F;
	private float ibl = 0f;
	private bool Active;
	
	void Update () {

		if(Active)
			ibl = Mathf.Lerp (ibl, 1, smooth * Time.deltaTime);
		else
			ibl = Mathf.Lerp (ibl, 0, smooth * Time.deltaTime);
			Shader.SetGlobalFloat ("_InOutIBL", ibl);
		}


	
	void OnTriggerEnter(Collider other) {
				if (other.name == "IndoorTrigger") {
					Active = true;
					Debug.Log ("Object Entered the Trigger");
				}
		}
	

	void OnTriggerExit(Collider other) {
				if (other.name == "IndoorTrigger") {
					Active = false;
					Debug.Log ("Object Exited the Trigger");
				}
		}


}