using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.IO;

public class Replayer : MonoBehaviour
{

		public bool ReadMode;
		public bool WriteMode;
		public static List<float> Throttle = new List<float> ();
		public static List<float> Steering = new List<float> ();
		public static List<byte> Drift = new List<byte> ();
		public static List<Vector3> Pos = new List<Vector3> ();
		public static List<Vector3> Rot = new List<Vector3> ();
		public string fileName = "foo.txt";
		public bool done;

		// Use this for initialization
		void Start ()
		{
	
				if (ReadMode) {

						int counter = 0;

						foreach (string line in File.ReadAllLines(Application.dataPath + "/" + fileName)) {
								string[] Inputs = line.Split (',');
								Throttle.Add (float.Parse (Inputs [0]));
								Steering.Add (float.Parse (Inputs [1]));
								Drift.Add (byte.Parse (Inputs [2]));
				if(counter%60 == 0 && Inputs.Length > 3){
								Pos.Add (new Vector3 (float.Parse (Inputs [3]), float.Parse (Inputs [4]), float.Parse (Inputs [5])));
								Rot.Add (new Vector3 (float.Parse (Inputs [6]), float.Parse (Inputs [7]), float.Parse (Inputs [8])));
				}
								counter += 1;
						}

				}

		}

		public int Count = 0;
		public int timeCount = 0;
		// Update is called once per frame
		void Update ()
		{

				Application.targetFrameRate = 30;
	
		oldkartScript ks = transform.GetComponent<oldkartScript> ();


				if (ks != null) {
						if (WriteMode) {
								if (!done) {

										Throttle.Add (ks.throttle);
										Steering.Add (ks.steer);

										if (ks.drift == true)
												Drift.Add (1);
										else
												Drift.Add (0);
										if (timeCount >= 60) {
												Pos.Add (transform.position);
												Rot.Add (transform.rotation.eulerAngles);
												timeCount = 0;
										} else
												timeCount += 1;

								} else {
										WriteFile ();
										done = false;

								}
						}

						if (ReadMode && Count < Throttle.Count) {
								ks.throttle = Throttle [Count];
								ks.steer = Steering [Count];
								if (Drift [Count] == 1)
										ks.drift = true;
								else
										ks.drift = false;

								if (Count % 60 == 0) {
										transform.position = Pos [Count / 60];
										transform.rotation = Quaternion.Euler (Rot [Count / 60]);
										Count = 0;
								} else
										Count += 1;
						}

				}
		}

		void WriteFile ()
		{

				string[] StringList = new string[Throttle.Count];
		
				for (int i = 0; i <Throttle.Count; i++){
			if (i % 60 != 0 || (i/60) >= Pos.Count)
								StringList [i] = (Throttle [i] + "," + Steering [i] + "," + Drift [i]);
						else
								StringList [i] = (Throttle [i] + "," + Steering [i] + "," + Drift [i] + "," + Pos [i / 60].x + "," + Pos [i / 60].y + "," + Pos [i / 60].z + "," + Rot [i / 60].x + "," + Rot [i / 60].y + "," + Rot [i / 60].z);
		}

				File.WriteAllLines (Application.dataPath + "/" + fileName, StringList);

		}
}
