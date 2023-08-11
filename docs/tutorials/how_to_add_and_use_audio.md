To add a file use page.loader.addAudio() in the register stage:
```
this.loader.addAudio("audio_key", "./audio.mp3");
```
## Using AudioInterface:
AudioInterface is control center for all audio tracks, \
default AudioInterface is available via page.audio, \
you could any other audio interfaces with 
```
this.music = new AudioInterface(this.loader);
```
### How to use tracks with AudioInterface
1. first, register added and loaded audio file in the init, or start stage:
```
page.audio.registerAudio("audio_key");
```
2. then get the audio track:
```
const track = page.audio.getAudio("audio_key");
```
3. to play, or pause use:
```
track.play();
track.pause();
```
4. to loop audio track set track.loop parameter to true:
```
const audioTrack = this.audio.getAudio("audio_key");
audioTrack.loop = true;
audioTrack.play();
```
4. if you want to take a copy of the track use getAudioCloned():
```
this.audio.getAudioCloned("audio_key").play();
```
5. to control the volume, set audio.volume from 0 to 1(this will affect only on registered tracks):
```
this.audio.volume = 0.5;
```
