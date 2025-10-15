The Assets Manager is an [external module]{@link https://github.com/ALapinskas/assetsm}

It is used to load and hold game assets such as tilmaps(.tmg files), images and audio.  
To attach data use in the [GameStage.register()]{@tutorial stages_lifecycle}:
```
register() {
    stage.iLoader.addAudio(key, url)
    stage.iLoader.addImage(key, url)
    stage.iLoader.addTileMap(key, url)
}
```
then call
```
app.preloadAllData()
```
after [preloadAllData()]{@link System#preloadAllData} promise is resolved,  
the data will be available during the [GameStage.init() and GameStage.start() stages]{@tutorial stages_lifecycle}
```
start() {
    const audio = stage.iLoader.getAudio(key)
    const image = stage.iLoader.getImage(key)
    const tilemap = stage.iLoader.getTileMap(key)
    ...
}
```
*\*be careful with loading tilemaps and attached tilesets and images, everything should be in the same folder or subfolder.*  
  
Alternatively, you can manage tileset loading separately by passing `false` as the third parameter to `addTileMap`, and then adding `addTileSet()` calls:
```
    stage.iLoader.addTileMap(key, url, false);
    stage.iLoader.addTileSet(key, url, gui1);
    stage.iLoader.addTileSet(key, url, gui2);
```
*It is better to register added audio files in the AudioInterface. See {@tutorial how_to_add_and_use_audio}

### AtlasXML
Starting from jsge@1.3.0, iLoader supports AtlasXML files:
```
register() {
    stage.iLoader.addAtlasXML(key, url);
}

start() {
    // part of xml: <SubTexture name="tankBody_blue.png" x="257" y="42" width="38" height="38"/>
    stage.draw.image(100, 300, 38, 38, "tankBody_blue");
}
```
<br />

### Ask a question
[https://github.com/ALapinskas/jsge/discussions/categories/q-a]{@link https://github.com/ALapinskas/jsge/discussions/categories/q-a}