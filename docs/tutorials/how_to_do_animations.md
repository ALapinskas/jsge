How to Create Animations with Sprite Indexes:

1. Take an image with animations.  
   Here is an example fireball 128x16 px image, each animation step is 16x16 px:  
![fireball](fireball128x16.png)

2. [Add and load it to the project]{@tutorial assets_manager}:
   ```
   this.iLoader.addImage("image_key", "./fireball128x16.png");
   ```
3. Create an 16x16 DrawImageObject with the same key:
   ```
   const posX = 100;
   const posY = 200;
   const imageW = 16;
   const imageH = 16;

   this.fireball = this.draw.image(posX, posY, imageW, imageH, "image_key");
   ```
4. Add an animation event: 
   ```
   this.fireball.addAnimation("startAnimation", [0,1,2,3], isLoop = false);
   ```
5. Start the animation by emitting the event:
   ```
   this.fireball.emit("startAnimation");
   ```
   This will run through the image indexes 0,1,2,3.

6. To loop the animation indexes, add a third parameter as `true`:
   ```
   this.fireball.addAnimation("startAnimation", [0,1,2,3], true);
   ```
   The animation will continue looping until `stopRepeatedAnimation()` is called or the object is destroyed:
   ```
   this.fireball.stopRepeatedAnimation("startAnimation");
   ```
7. The fourth parameter determines how many cycles each frame is shown.  
   The default value is 1. If you want to make the animation slower, increase this value:
   ```
   this.fireball.addAnimation("startAnimation", [0,1,2,3], true, 5);
   ```
8. In jsge@1.4.0, frame time support was added. Instead of an array of IDs,  
   you can now add an array of objects:
   ```
   this.fireball.addAnimation("startAnimation", [{duration: 150, id:0},{duration:100, id:1},{ duration:100, id:2},{duration:100, id:3}], true);
   ```
   Here, `duration` is the frame time in milliseconds.
  
[Tiled animations]{@tutorial how_to_load_and_use_tilemaps} support.

## Live example
<p class="codepen" data-height="500" data-default-tab="js,result" data-slug-hash="zYeQoGY" data-user="yaalfred" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/yaalfred/pen/zYeQoGY">
  Untitled</a> by Arturas-Alfredas Lapinskas (<a href="https://codepen.io/yaalfred">@yaalfred</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
<br />

### Ask a question
[https://github.com/ALapinskas/jsge/discussions/categories/q-a]{@link https://github.com/ALapinskas/jsge/discussions/categories/q-a}