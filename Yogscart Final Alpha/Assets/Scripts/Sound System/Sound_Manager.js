#pragma strict

var MusicVolume : int = 100;
var SFXVolume : int = 100;
var DialogueVolume : int = 100;

private var mSource : AudioSource;
private var sfxSource : AudioSource;
private var dSource : AudioSource;

function Awake ()
{
MusicVolume = Mathf.Clamp(PlayerPrefs.GetInt("MV",100),0,100);
SFXVolume = Mathf.Clamp(PlayerPrefs.GetInt("SFXV",100),0,100);
DialogueVolume = Mathf.Clamp(PlayerPrefs.GetInt("DV",100),0,100);

mSource = transform.FindChild("Music").audio;
sfxSource = transform.FindChild("SFX").audio;
dSource = transform.FindChild("Dialogue").audio;
}

function Update ()
{
var mv : float = MusicVolume/100f;
var sfxv : float = SFXVolume/100f;
var dv : float = DialogueVolume/100f;

if(mSource.volume != mv)
mSource.volume = mv;

if(sfxSource.volume != sfxv)
sfxSource.volume = sfxv;

if(dSource.volume != dv)
dSource.volume = dv;


}
