Assume you want to render an image ![image](../tutorials/images.jpg)
## Prepare:
1. jsge is a web application. To run it, you will need a webserver. 
2. In this tutorial we will use nodejs webserver. So first you will need to install nodejs and npm.
3. Then create a folder which will contain game files, put there an image with name "images.jpg".
4. Create a package.json file which will store information about the game and its main dependencies. It can be done with from command line(terminal):
```
npm init
```
5. After that install jsge:
```
npm i jsge
```
6. install a webserver:
```
npm i http-server
```
7. Put a command to run that server in the package.json:
```
"scripts": {
    "start": "http-server -c-1 -p 9000 -o /"
},
```
8. Now you can start the server from command line(terminal):
```
npm start
```
9. Check http://127.0.0.1:9000 in the browser, it will show your folder structure.

## App logic:
1. By default server runs index.html file, so lets create it:
```
<!DOCTYPE html>
<head>
    <script type="module" src="./index.js"></script>
</head>
<body>
    <div id="game_map"></div>
</body>
```
2. Then create index.js file, which will store app logic. 
3. Inside index.js create a {@link System} instance, passing game options, or a {@link SystemSettings} object and game canvas container:
```
import { System, SystemSettings } from "/node_modules/jsge/src/index.js";
const app = new System(SystemSettings, document.getElementById("game_map"));
```
4. Create you game pages using classes extended from {@link GameStage}:
```
import { ..., GameStage } from "/node_modules/jsge/src/index.js";

class CustomPage extends GameStage {
}
```
5. Add image passing image key and path to [CustomPage.iLoader]{@tutorial assets_manager}.addImage() in the stage [register() stage]{@tutorial stages_lifecycle}:
```
class CustomPage extends GameStage {
    register() {
        this.iLoader.addImage("image_key", "/images.jpg");
    }
}
```
6. Create an DrawImageObject and add it to the stage, use image key, added on step 5:
```
        ...
        this.player = this.draw.image(100, 200, 16, 28, "image_key", 0);
    }
}
```
7. Register pages in the application:
```
app.registerStage("CustomPageKey", CustomPage);
```
8. Run [preloadAllData()]{@link System#preloadAllData} to load all data you added on step 5:
```
app.preloadAllData().then(() => {
```
9. After preloadAllData() resolves, start the stage rendering with app.iSystem.startGameStage(pageKey):
```
app.preloadAllData().then(() => {
    app.iSystem.startGameStage("CustomPageKey");
});
```
10. Now visit http://127.0.0.1:9000
11. Your image now will be rendered! \
Use document.addEventListener to attach mouse or keyboard controllers and \
move attached object on the screen changing x, y, or rotation properties

## Live example:
<p class="codepen" data-height="500" data-default-tab="js,result" data-slug-hash="mdvgQyv" data-user="yaalfred" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/yaalfred/pen/mdvgQyv">
  JsGE basic example</a> by Arturas-Alfredas Lapinskas (<a href="https://codepen.io/yaalfred">@yaalfred</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>