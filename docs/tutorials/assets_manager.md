Assets Manager is now an [external module]{@link https://github.com/ALapinskas/assetsm}

It is used to load and hold game assets such as\
tilmaps(.tmg files)*, images and audio*.\
To attach data use:
```
page.loader.addAudio(key, url)
page.loader.addImage(key, url)
page.loader.addTileMap(key, url)
```
then call
```
app.preloadAllData()
```
after [preloadAllData()]{@link System#preloadAllData} promise will be resolved,
data will be available with
```
const audio = page.loader.getAudio(key)
const image = page.loader.getImage(key)
const tilemap = page.loader.getTileMap(key)
```

*be careful with loading tilemaps and attached tilesets and images, everything should be in the same folder or subfolder.\
*added audio files is better to register in the AudioInterface, {@tutorial how_to_add_and_use_audio}