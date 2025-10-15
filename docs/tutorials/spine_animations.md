To use Spine animations, you will need to enable the Spine module.
1. **Import the Spine module:**
   ```
      import SpineModuleInitialization from "../node_modules/jsge/modules/spine/dist/bundle.js";
   ```
2. **Install the module**, passing the module key, `spineModule`, and the spine assets folder:
   ```
      this.spineModule = this.iSystem.installModule(
      "spineModule",
      SpineModuleInitialization,
      "./spine/spine-assets");
   ```
3. **After installing the module(step 2)**, the [iLoader]{@tutorial assets_manager} will be expanded to include three new methods for loading Spine animation file:
   ```
   register() {
      ...
      this.iLoader.addSpineJson("spine-text-key", "./spine-file.json");
      this.iLoader.addSpineBinary("spine-binary-key", "./spine-file.skel");
      this.iLoader.addSpineAtlas("spine-atlas", "./spine-file.atlas");
      ...
   ```
4. **The GameStage.draw will have two new methods:** `stage.draw.spine(x,y, spine-text-key | spine-binary-key, spine-atlas)` and `stage.draw.texture(x, y, width, height, "texture-image-key")`:
   ```
   init() {
      const spineDrawObject = this.draw.spine(0, 0, "spine-text-key", "spine-atlas");
      ...
   ```
5. **These objects should be added to the stage** in the same way as other draw objects.  
   Spine specific methods will be available:
   ```
   spineDrawObject.scale(0.5);
   spineDrawObject.animationState.setAnimation(0, "run", true);
   spineDrawObject.setSkin("goblin");
   ```
6. **After that, Spine objects will be rendered.**

## Live example

<p class="codepen" data-height="500" data-default-tab="js,result" data-slug-hash="MWLRBjp" data-user="yaalfred" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/yaalfred/pen/MWLRBjp">
  JsGE - Spine animations</a> by Arturas-Alfredas Lapinskas (<a href="https://codepen.io/yaalfred">@yaalfred</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
<br />

### Ask a question
[https://github.com/ALapinskas/jsge/discussions/categories/q-a]{@link https://github.com/ALapinskas/jsge/discussions/categories/q-a}