To use spine animations you will have to enable spine module.
1. To do that first import it:
```
    import SpineModuleInitialization from "../modules/spine/dist/bundle.js";
```
2. Than install, passing module key, spineModule, spine assets folder and renderInterface:
```
    this.spineModule = this.system.installModule(
        "spineModule",
        SpineModuleInitialization,
        "./spine/spine-assets");
```
3. After installing the module(step 2), [loader]{@tutorial assets_manager} will be expanded to have 3 new methods for loading spine animation files:
```
register() {
    ...
    loader.addSpineJson("spine-text-key", "./spine-file.json");
    loader.addSpineBinary("spine-binary-key", "./spine-file.skel");
    loader.addSpineAtlas("spine-atlas", "./spine-file.atlas");
    ...
```
4. ScreenPage.draw will have two new methods .spine(x,y, spine-text-key | spine-binary-key, spine-atlas) and .texture(x, y, width, height, "texture-image-key"):
```
init() {
    const spineDrawObject = this.draw.spine(0, 0, "spine-text-key", "spine-atlas");
    ...
```
5. This objects should be added to the page same as the other draw objects. <br />
    Spine specific methods will be available:
```
    spineDrawObject.scale(0.5);
    spineDrawObject.animationState.setAnimation(0, "run", true);
    spineDrawObject.setSkin("goblin");
```
6. After that spine objects will be rendered.