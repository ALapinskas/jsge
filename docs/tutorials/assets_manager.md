Assets Manager is now {@link https://github.com/ALapinskas/assetsm} an external module

it is used to load and hold game assets such as\
tilmaps(.tmg files), images and audio\
to attach data use:
```
page.loader.addAudio(key, url)
page.loader.addImage(key, url)
page.loader.addTileMap(key, url)
```
after app.preloadAllData() promise will be resolved,
this data will be available with
```
const audio = page.loader.getAudio(key)
const image = page.loader.getImage(key)
const tilemap = page.loader.getTileMap(key)
```