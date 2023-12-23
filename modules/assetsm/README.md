# assetsm
Assets Manager.
Tilemaps(.tmj/.json), images and audio files loading and managing.

# How to use
1. Install module
```
npm i assetsm
```
2. Import and create a class instance
```
import AssetsManager from "assetsm"

const assets = new AssetsManager()
```
3. Register files
```
assets.addAudio(key, url)
assets.addImage(key, url)
assets.addTileMap(key, url)
```
4. Subscribe for progress to track the loading progress status
```
assets.addEventListener("progress", (event) => {
    console.log("progress, loaded items: ", event.loaded);
    console.log("progress, items left: ", event.total);
});
```
5. Get current pending uploads if necessary
```
assets.filesWaitingForUpload
```
6. Preload all files you registered in the previous step
```
assets.preload().then(() => {
```
7. Use files
```
{
    const audio = assets.getAudio(key)
    const image = assets.getImage(key)
    const tilemap = assets.getTileMap(key)
}
```
7. To check the process you can subscribe for ProgressEvent.type event
```
// fires when uploading is starting
assets.addEventListener("loadstart", () =>
// fires when uploading is in progress
assets.addEventListener("progress", () =>
// fires when uploading is over
assets.addEventListener("load", () =>
```
# Run examples from ./examples folder
```
npm i --save-dev
npm start
```
# Other Notes

* Images are loaded as ImageBitmaps
* When loading tilemaps, it also process tileset files and loads images inside them, attached images could be retrieved by tileset.name key, check examples/index.js how to do that
* ES6 only

# Version 0.1.0 functionality:
# adding new loaders
1. Register a iLoader and uploadMethod using registerLoader(loaderType, loaderMethod)
2. Add upload item to the queue using add[loaderName](fileKey, url), or addFile(loaderName, fileKey, url).
3. Executing preload(), will upload all items where added in step2 with loaderMethod provided in step1 and save them temporary.
4. After that uploadingResults will be available with get[loaderName](fileKey), or getFile(loaderName, fileKey, url)

# Notes
* loaderMethod should return Promise with uploading result value
* loaderMethod is optional, by default it will return fetch result