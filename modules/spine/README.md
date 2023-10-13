## jsge-spine-module, spine module for jsge engine

Allows to use spine animations in jsge pages

# How to use:

1. import default module and it to the ScreenPage: 
```
import SpineModuleInitialization from "../modules/spine/dist/bundle.js";
```
2. Create new view for spine rendering, turn off view offset:
```
ScreenPage {
    ...
    register() {
        const spineView = this.createCanvasView(SPINE_VIEW_KEY, true);
        ...
    }
```
3. install module to the system with installModule() method, 
providing moduleKey, module initialization class, spine images folder and view from step 2:
```        
    ...
    this.system.installModule("spineModule", SpineModuleInitialization, "./spine-assets", spineView);
    ...
```
4. Add spine json, or binary and atlas key to the loader:
```
    this.loader.addSpineJson("spineTextKey", "./spine-assets/spineboy-pro.json");
    this.loader.addSpineBinary("spineBinaryKey", "./spine-assets/spineboy-pro.skel");
    this.loader.addSpineAtlas("spineAtlasKey", "./spine-assets/spineboy-pma.atlas");
```
5. Create spine draw object, passing spineJson key, or spineBinary key and spineAtlas key, added on step 2. Add it to the the view:
```
init() {
    ...
    const spineDrawObject = this.draw.spine(0, -300, null, null, "spineTextKey","spineAtlasKey");
    this.addRenderObject(SPINE_VIEW_KEY, spineDrawObject);
    ...
```
6. Change animationState to apply spine animations:
```
    spineDrawObject.animationState.setAnimation(0, "run", true);
```