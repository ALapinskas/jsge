In order to add a file, use stage.iLoader.addAudio() in the [register method]{@tutorial stages_lifecycle}:
```
register() {
    this.iLoader.addAudio("audio_key", "./audio.mp3");
    ...
}
```
## Using AudioInterface:
AudioInterface is a control center for all audio tracks, \
default AudioInterface is available via stage.audio, \
you could add any other audio interfaces with 
```
this.music = new AudioInterface(this.iLoader);
```
### How to use tracks with AudioInterface
1. first, register the added and loaded audio file in [the init, or start method]{@tutorial stages_lifecycle}:
```
stage.audio.registerAudio("audio_key");
```
2. then get the audio track:
```
const track = stage.audio.getAudio("audio_key");
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
## Live Example
<p class="codepen" data-height="500" data-default-tab="js,result" data-slug-hash="WNPBpgz" data-user="yaalfred" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/yaalfred/pen/WNPBpgz">
  JsGE - audio</a> by Arturas-Alfredas Lapinskas (<a href="https://codepen.io/yaalfred">@yaalfred</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>