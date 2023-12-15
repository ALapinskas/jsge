Assume you want to render an image ![image](../tutorials/images.jpg)
## Prepare:
1. jsge is nodejs application, first you will need to install nodejs and npm.
2. Then create a folder which will contain game files, put there an image with name "images.jpg".
3. Create a package.json file which will store information about the game and its main dependencies. It can be done with from command line(terminal):
```
npm init
```
4. After that install jsge:
```
npm i jsge
```
5. jsge is designed to work from browser so you will need a server to run it locally:
```
npm i http-server
```
6. Put a command to run that server in the package.json:
```
"scripts": {
    "start": "http-server -c-1 -p 9000 -o /"
},
```
7. Now you can start the server from command line(terminal):
```
npm start
```
8. Check http://127.0.0.1:9000 in the browser, it will show your folder structure.

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
4. Create you game pages using classes extended from {@link ScreenPage}:
```
import { ..., ScreenPage } from "/node_modules/jsge/src/index.js";

class CustomPage extends ScreenPage {
}
```
5. Add image passing image key and path to [CustomPage.loader]{@tutorial assets_manager}.addImage() in the page [register() stage]{@tutorial screen_pages_stages}:
```
class CustomPage extends ScreenPage {
    register() {
        this.loader.addImage("image_key", "/images.jpg");
    }
}
```
6. Create an DrawImageObject and add it to the page, use image key, added on step 5:
```
        ...
        this.player = this.draw.image(100, 200, 16, 28, "image_key", 0);
    }
}
```
7. Register pages in the application:
```
app.registerPage("CustomPageKey", CustomPage);
```
8. Run [preloadAllData()]{@link System#preloadAllData} to load all data you added on step 5:
```
app.preloadAllData().then(() => {
```
9. After preloadAllData() resolves, start the page rendering with app.system.startScreenPage(pageKey):
```
app.preloadAllData().then(() => {
    app.system.startScreenPage("CustomPageKey");
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