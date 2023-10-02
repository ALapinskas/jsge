// import AssetsManager from "../dist/assetsm.min.js"
import AssetsManager from "../src/AssetsManager.js"
// 1. Create a class instance
const manager = new AssetsManager();

// 2. Add files to the queue
manager.addAudio("default", "./knopka-schelchok-korotkii-chetkii-myagkii1.mp3")
manager.addImage("soldier", "./SpritesheetGuns.png")
manager.addTileMap("tilemap", "./map.tmj")

// 3. Subscribe for progress to track the loading progress status
manager.addEventListener("progress", (event) => {
    console.log("progress, loaded items: ", event.loaded);
    console.log("progress, items left: ", event.total);
});

// 4. Get current pending uploads if necessary
console.log("files, waiting for upload:", manager.filesWaitingForUpload)

// 5. Preload all files you added in the previous step
manager.preload().then(() => {

    // 6. Use 
    const audio = manager.getAudio("default"),
        imageBitmap = manager.getImage("soldier"),
        tilemap = manager.getTileMap("tilemap"),
        tilesets = tilemap.tilesets,
        tilesetImages = tilesets.map((tileset) => manager.getImage(tileset.data.name));

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
});

/*** new functionality(from 0.1.0): adding custom file types */
const loaderMethodForSpineText = () => { console.log("upload SpineText"); return Promise.resolve("result spine text"); },
    loaderMethodForSpineAtlas = () => { console.log("upload SpineAtlas"); return Promise.resolve("result spine atlas"); };

manager.registerLoader("SpineText", loaderMethodForSpineText);
manager.registerLoader("SpineAtlas", loaderMethodForSpineAtlas);
//use default upload fetch method
manager.registerLoader("ReadmeText");

manager.addSpineText("defaultSpineText", "./spineText.json");
manager.addSpineAtlas("defaultSpineAtlas", "./spine.atlas");
manager.addReadmeText("defaultReadmeKey", "./readme.txt");

manager.preload().then(() => {
    console.log(manager.getSpineText("defaultSpineText"));
    console.log(manager.getSpineAtlas("defaultSpineAtlas"));
    manager.getReadmeText("defaultReadmeKey").text().then((result) => {
        console.log(result);
    });
});

// wait until other uploads will be finished
setTimeout(() => {
    const loaderWithIncorrectValue =  () => { console.log("upload and return incorrect value"); return {}; };

    manager.registerLoader("IncorrectValueLoader", loaderWithIncorrectValue);
    manager.addIncorrectValueLoader("default", "./spineText.json");
    manager.preload().catch((err) => {
        if (err.message.includes("uploadMethod should be instance of Promise")) {
            console.log("expected, incorrect upload method return value");
        }
    });
}, 1000);