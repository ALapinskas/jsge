How to do animations with sprite indexes:

1. Take an image with animations, for example:

![fireball](../tutorials/fireball32x16.png)

2. [Add and load it to the project]{@tutorial assets_manager}:
```
this.iLoader.addImage("image_key", "./fireball32x16.png");
```
3. Then create an 16x16 DrawImageObject with the same key:
```
const posX = 100;
const posY = 200;
const imageW = 16;
const imageH = 16;

this.fireball = this.draw.image(posX, posY, imageW, imageH, "image_key");
```
4. Then add an animation event: 
```
this.fireball.addAnimation("startAnimation", [0,1,2,3], isLoop = false);
```
5. And start it, emitting the event:
```
this.fireball.emit("startAnimation");
```
This will run through the image indexes 0,1,2,3 on next render cycles.

6. Adding 3d parameter as true will loop animation indexes:
```
this.fireball.addAnimation("startAnimation", [0,1,2,3], true);
```
until stopRepeatedAnimation() will be called, or object will be destroyed.
```
this.fireball.stopRepeatedAnimation("startAnimation");
```
7. 4th parameter determines how many cycles will each frame shown <br />
  The default value is 1, if you want to make animation slower increase the value:
```
this.fireball.addAnimation("startAnimation", [0,1,2,3], true, 5);
```
8. In jsge@1.4.0 added:
- frame time. Instead of array of ids, add
Array of objects: 
```
this.fireball.addAnimation("startAnimation", [{duration: 150, id:0},{duration:100, id:1},{ duration:100, id:2},{duration:100, id:3}], true);
```
duration - is frame time in ms.
<br />
- [Tiled animations]{@tutorial how_to_load_and_use_tilemaps} support.

## Live example
<p class="codepen" data-height="500" data-default-tab="js,result" data-slug-hash="zYeQoGY" data-user="yaalfred" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/yaalfred/pen/zYeQoGY">
  Untitled</a> by Arturas-Alfredas Lapinskas (<a href="https://codepen.io/yaalfred">@yaalfred</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>