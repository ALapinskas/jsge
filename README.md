# JsGE

Javascript Game Engine

This engine was designed to work with maps from Tiled editor.

What you can do with it:
1. Draw primitives, texts, load images, audio and tilemaps with tilesets from Tiled editor.
2. Render everything in a sequence.
4. Images can be animated, switching their indexes.
5. Tiles can be rendered as layers on top of each other using webgl masks effects.
6. Boundaries could be extracted from tiles and used further.
7. Simple collision detection included.
8. Boundaries helper drawing as debug option.

How to start:

1. Create a System instance, passing game options, or a SystemSettings object:
```
import { System, SystemSettings } from "/index.es6.js";
const app = new System(SystemSettings, document.getElementById("game_map"));
```

2. Create you game pages using classes extended from ScreenPage:
```
import { ScreenPage } from "/index.es6.js";

export class MapPage extends ScreenPage {
}
```
3. Add data such as audio, images, tilesets with page.loader in page contractor(), or register() stage:
```
export class MapPage extends ScreenPage {
    register() {
        this.loader.addImage("image_key", "./car_black_small_12.png");
    }
}
```
4. Create view on page.init(), or page.start() stages:
```
init() {
    this.createCanvasView("view_key");
```
5. Retrieve data you added on step 3. with page.loader.getImage(key) .getAudio() method and attach it to the view:
```
    this.player = this.draw.image(100, 200, 16, 28, "image_key", 0);
    this.addRenderObject("view_key", this.player);
}
```
6. Register pages on application:
```
app.registerPage("MapPageKey", MapPage);
```
7. Run preloadAllData to load all data you added on step 3:
```
app.preloadAllData().then(() => {
```
8. After preloadAllData() resolves, start the page rendering with app.system.startScreenPage(pageKey):
```
app.preloadAllData().then(() => {
    app.system.startScreenPage("MapPageKey");
});
```
9. Thats it! Your image now should be rendered! \
You can move it on the screen changing x, y, or rotation properties