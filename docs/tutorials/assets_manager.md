Assets Manager is an [external module]{@link https://github.com/ALapinskas/assetsm}

It is used to load and hold game assets such as\
tilmaps(.tmg files)*, images and audio*.\
To attach data use in the [register() method]{@tutorial stages_lifecycle}:
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
after [preloadAllData()]{@link System#preloadAllData} promise will be resolved,
data will be available with on [init() and start() stages]{@tutorial stages_lifecycle}
```
start() {
    const audio = stage.iLoader.getAudio(key)
    const image = stage.iLoader.getImage(key)
    const tilemap = stage.iLoader.getTileMap(key)
    ...
}
```

*be careful with loading tilemaps and attached tilesets and images, everything should be in the same folder or subfolder. \
Or you can manage tilesets loading separately, passing false as 3d parameter to addTileMap and then \
adding addTileSet() calls:
```
    stage.iLoader.addTileMap(key, url, false);
    stage.iLoader.addTileSet(key, url, gui1);
    stage.iLoader.addTileSet(key, url, gui2);
```
*added audio files is better to register in the AudioInterface, {@tutorial how_to_add_and_use_audio}