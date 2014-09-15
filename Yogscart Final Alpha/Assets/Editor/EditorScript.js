#pragma strict

//EditorScript Script - V0.1
//Created by Robert (Robo_Chiz)

@CustomEditor (TrackData)
public class TrackDataEditor extends Editor{

	//Readd this secion of code when a nicer Camera System has been added
    //function OnInspectorGUI(){
	
	//var td : TrackData = target;
	
	//td.TrackName = EditorGUILayout.TextField("Track Name:",td.TrackName);
	//td.Scale = EditorGUILayout.FloatField("Kart Scale:",td.Scale);
	//td.Scale = Mathf.Clamp(td.Scale,0.01,Mathf.Infinity);
	
	//td.LoopedTrack = EditorGUILayout.Toggle("Looped Track:",td.LoopedTrack);
	//if(td.LoopedTrack == true)
	//td.Laps = EditorGUILayout.IntField("Number of Laps:",td.Laps);
	//td.Laps = Mathf.Clamp(td.Laps,1,Mathf.Infinity);
	
	//if(GUI.changed)
	//EditorUtility.SetDirty(target);
        
   // }
    
    @MenuItem ("Track Editor/Create Track Manager")
    static function CTM () {
    if(GameObject.Find("Track Manager") == null){
    
    var obj = new GameObject();
    
    obj.AddComponent(TrackData);
    
    }
    }
    
    @MenuItem ("Track Editor/Create Position Point at end of queue")
    static function CPP () {
        if(GameObject.Find("Track Manager") != null && GameObject.Find("Track Manager").GetComponent(TrackData) != null)
        GameObject.Find("Track Manager").GetComponent(TrackData).NewPoint();
        else
        Debug.Log("Something's gone wrong! Make sure that you have setup a track in this scene."); 
    }
    
    @MenuItem ("Track Editor/Create Position Point after selection")
    static function CPPAS() {
        if(GameObject.Find("Track Manager") != null && GameObject.Find("Track Manager").GetComponent(TrackData) != null){
        var td = GameObject.Find("Track Manager").GetComponent(TrackData);
        for(var i : int = 0; i < td.PositionPoints.Length; i++){
        if(td.PositionPoints[i].rep == Selection.activeTransform){
        GameObject.Find("Track Manager").GetComponent(TrackData).AddPoint(i);
        i =  td.PositionPoints.Length;  
        }
        
        }
        
        
        }else
        Debug.Log("Something's gone wrong! Make sure that you have setup a track in this scene."); 
    }
    
    
    function OnGUI () {

    }

}
