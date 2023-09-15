How to create your own game:

1. Create a {@link System} instance, passing game options, or a {@link SystemSettings} object and game canvas container name:
```
import { System, SystemSettings } from "jsge";
const app = new System(SystemSettings, document.getElementById("game_map"));
```

2. Create you game pages using classes extended from {@link ScreenPage}:
```
import { ScreenPage } from "jsge";

export class CustomPage extends ScreenPage {
}
```
3. Add data such as audio, images, tilemaps(.tmj files) using CustomPage.loader in page [register() stage]{@tutorial screen_pages_stages}:
```
export class CustomPage extends ScreenPage {
    register() {
        this.loader.addImage("image_key", "./car_black_small_12.png");
    }
}
```
4. Create {@link CanvasView} on CustomPage.init(), or CustomPage.start() [stages]{@tutorial screen_pages_stages}:
```
init() {
    this.createCanvasView("view_key");
```
5. Attach data you added on step 3.to the view:
```
    this.player = this.draw.image(100, 200, 16, 28, "image_key", 0);
    this.addRenderObject("view_key", this.player);
}
```
6. Register pages in the application:
```
app.registerPage("MapPageKey", MapPage);
```
7. Run [preloadAllData()]{@link System#preloadAllData} to load all data you added on step 3:
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
Use document.addEventListener to attach mouse or keyboard controllers and \
move attached object on the screen changing x, y, or rotation properties