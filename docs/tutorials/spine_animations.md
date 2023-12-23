To use spine animations you will have to enable spine module.
1. To do that first import it:
```
    import SpineModuleInitialization from "../modules/spine/dist/bundle.js";
```
2. Than install, passing module key, spineModule and spine assets folder:
```
    this.spineModule = this.system.installModule(
        "spineModule",
        SpineModuleInitialization,
        "./spine/spine-assets");
```
3. After installing the module(step 2), [iLoader]{@tutorial assets_manager} will be expanded to have 3 new methods for loading spine animation files:
```
register() {
    ...
    this.iLoader.addSpineJson("spine-text-key", "./spine-file.json");
    this.iLoader.addSpineBinary("spine-binary-key", "./spine-file.skel");
    this.iLoader.addSpineAtlas("spine-atlas", "./spine-file.atlas");
    ...
```
4. GameStage.draw will have two new methods .spine(x,y, spine-text-key | spine-binary-key, spine-atlas) and .texture(x, y, width, height, "texture-image-key"):
```
init() {
    const spineDrawObject = this.draw.spine(0, 0, "spine-text-key", "spine-atlas");
    ...
```
5. This objects should be added to the stage same as the other draw objects. <br />
    Spine specific methods will be available:
```
    spineDrawObject.scale(0.5);
    spineDrawObject.animationState.setAnimation(0, "run", true);
    spineDrawObject.setSkin("goblin");
```
6. After that spine objects will be rendered.

## Live example

<p class="codepen" data-height="500" data-default-tab="js,result" data-slug-hash="MWLRBjp" data-user="yaalfred" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/yaalfred/pen/MWLRBjp">
  JsGE - Spine animations</a> by Arturas-Alfredas Lapinskas (<a href="https://codepen.io/yaalfred">@yaalfred</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>