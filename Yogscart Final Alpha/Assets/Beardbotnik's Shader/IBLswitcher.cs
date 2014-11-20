using UnityEngine;
using System.Collections;

[ExecuteInEditMode]
public class IBLswitcher : MonoBehaviour {
	
	public float smooth  = 2F;
	private float ibl = 0f;
	private bool Active;
	
	void Update () {

		if(Active){
			if(smooth >= 0)
				ibl = Mathf.Lerp (ibl, 1 , smooth * Time.deltaTime);
			else
				ibl = 1;
		}else{
			if(smooth >= 0)
				ibl = Mathf.Lerp (ibl, 0 , smooth * Time.deltaTime);
			else
				ibl = 0;
		}

			Shader.SetGlobalFloat ("_InOutIBL", ibl);

		}


	
	void OnTriggerEnter(Collider other) {
				if (other.name == "IndoorTrigger") {
					Active = true;
				}
		}
	

	void OnTriggerExit(Collider other) {
				if (other.name == "IndoorTrigger") {
					Active = false;
				}
		}


}