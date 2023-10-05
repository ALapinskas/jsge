In order to add a file, use page.loader.addAudio() in the [register stage]{@tutorial screen_pages_stages}:
```
register() {
    this.loader.addAudio("audio_key", "./audio.mp3");
    ...
}
```
## Using AudioInterface:
AudioInterface is a control center for all audio tracks, \
default AudioInterface is available via page.audio, \
you could add any other audio interfaces with 
```
this.music = new AudioInterface(this.loader);
```
### How to use tracks with AudioInterface
1. first, register the added and loaded audio file in [the init, or start stage]{@tutorial screen_pages_stages}:
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
4. In order to loop the audio track, set track.loop parameter to true:
```
const audioTrack = this.audio.getAudio("audio_key");
audioTrack.loop = true;
audioTrack.play();
```
5. If you want to take a copy of the track use getAudioCloned():
```
this.audio.getAudioCloned("audio_key").play();
```
6. In order to control the volume, set audio.volume from 0 to 1(this will affect only on registered tracks):
```
this.audio.volume = 0.5;
```
