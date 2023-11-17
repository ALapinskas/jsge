To use spine animations you will have to enable spine module.
1. To do that first import it:
```
    import SpineModuleInitialization from "../modules/spine/dist/bundle.js";
```
2. Than install, passing module key, spineModule, and spine assets folder:
```
    this.spineModule = this.system.installModule("spineModule", SpineModuleInitialization, "./spine/spine-assets");
```
3. If the module was already installed, you can use systems.modules.get to retrieve it:
```
    this.spineModule = this.system.modules.get("spineModule");
```
4. Then canvasView should be created and registered in the module:
```
    const canvasView = this.createCanvasView('spine-view-key');
    this.spineModule.registerView(canvasView);
```
5. After installing the module(step 2), [loader]{@tutorial assets_manager} will be expanded to have 3 new methods for loading spine animation files:
```
register() {
    ...
    loader.addSpineJson("spine-text-key", "./spine-file.json");
    loader.addSpineBinary("spine-binary-key", "./spine-file.skel");
    loader.addSpineAtlas("spine-atlas", "./spine-file.atlas");
    ...
```
6. ScreenPage.draw will have two new methods .spine(x,y, spine-text-key | spine-binary-key, spine-atlas) and .texture(x, y, width, height, "texture-image-key"):
```
init() {
    const spineDrawObject = this.draw.spine(0, 0, "spine-text-key", "spine-atlas");
    ...
```
7. This objects should be added to the spine view registered in the step 4:
```
    ...
    this.addRenderObject('spine-view-key', spineDrawObject);
    ...
```
8. Spine specific methods will be available:
```
    spineDrawObject.scale(0.5);
    spineDrawObject.animationState.setAnimation(0, "run", true);
    spineDrawObject.setSkin("goblin");
```
9. For each ScreenPage different canvasView should be created and registered in the module.
Each time page starts this view should be activated:
```
start() {
    this.spineModule.activateSpineRender('spine-view-key');
    ...
```
10. After that spine objects will be rendered.