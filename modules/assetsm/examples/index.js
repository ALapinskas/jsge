import AssetsManager from "../dist/assetsm.min.js"
//import AssetsManager from "../src/AssetsManager.js"
// 1. Create a class instance
const assets = new AssetsManager()

// 2. Add files to the queue
assets.addAudio("default", "./knopka-schelchok-korotkii-chetkii-myagkii1.mp3")
assets.addImage("soldier", "./SpritesheetGuns.png")
assets.addTileMap("tilemap", "./map.tmj")

// 3. Subscribe for progress to track the loading progress status
assets.addEventListener("progress", (event) => {
    console.log("progress, loaded items: ", event.loaded);
    console.log("progress, items left: ", event.total);
});

// 4. Get current pending uploads if necessary
console.log("files, waiting for upload:", assets.filesWaitingForUpload)

// 5. Preload all files you added in the previous step
assets.preload().then(() => {

    // 6. Use 
    const audio = assets.getAudio("default"),
        imageBitmap = assets.getImage("soldier"),
        tilemap = assets.getTileMap("tilemap"),
        tilesets = tilemap.tilesets,
        tilesetImages = tilesets.map((tileset) => assets.getImage(tileset.data.name));

    audio.play()

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    //draw image
    ctx.drawImage(imageBitmap,0,0, imageBitmap.width, imageBitmap.height)
    //draw tilesets:
    tilesetImages.forEach((image, idx) => {
        const m = idx + 1;
        ctx.drawImage(image,m*100,m* 100, image.width, image.height)
    })

    document.body.appendChild(canvas) 
})

