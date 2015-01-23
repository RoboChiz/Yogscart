#pragma strict

var MasterVolume : int = 100;
var MusicVolume : int = 100;
var SFXVolume : int = 100;
//var DialogueVolume : int = 100;

var fadeSpeed : float = 10f;

private var lastMav : float;

private var mSource : AudioSource;
private var mbeingUsed : boolean;

private var sfxSource : AudioSource;
private var dSource : AudioSource;

function Awake ()
{

MasterVolume = Mathf.Clamp(PlayerPrefs.GetInt("MAV",100),0,100);
MusicVolume = Mathf.Clamp(PlayerPrefs.GetInt("MV",50),0,100);
SFXVolume = Mathf.Clamp(PlayerPrefs.GetInt("SFXV",100),0,100);
//DialogueVolume = Mathf.Clamp(PlayerPrefs.GetInt("DV",100),0,100);

mSource = transform.FindChild("Music").audio;
sfxSource = transform.FindChild("SFX").audio;
//dSource = transform.FindChild("Dialogue").audio;

mSource.loop = true;
}

function Update ()
{
var mav : float = MasterVolume/100f;
var mv : float = MusicVolume/100f;
var sfxv : float = SFXVolume/100f;
//var dv : float = DialogueVolume/100f;

if(!mbeingUsed && (mSource.volume != mv || lastMav != mav))
{
PlayerPrefs.SetInt("MAV",MasterVolume);
PlayerPrefs.SetInt("MV",MusicVolume);
mSource.volume = mav * mv;
}

if(sfxSource.volume != sfxv || lastMav != mav)
{
PlayerPrefs.SetInt("MAV",MasterVolume);
PlayerPrefs.SetInt("SFXV",SFXVolume);
sfxSource.volume = mav * sfxv;
}
/*if(dSource.volume != dv)
dSource.volume = dv;*/

lastMav = mav;

}

function PlaySFX(nMusic : AudioClip)
{
sfxSource.PlayOneShot(nMusic,1f);
}

function PlayMusic(nMusic : AudioClip)
{

//Wait for current track swap to finish
while(mbeingUsed)
yield;

mbeingUsed = true;

if(mSource.isPlaying)
while(mSource.volume > 0)
{
mSource.volume -= Time.deltaTime * fadeSpeed;
yield;
}

mSource.Stop();
mSource.clip = nMusic;
mSource.Play();

while(mSource.volume < 1)
{
mSource.volume += Time.deltaTime * fadeSpeed;
yield;
}

mbeingUsed = false;

}
