How to do animations with sprite indexes:

1. Take an image with animations, for example:

![fireball](../tutorials/fireball32x16.png)

2. [Add and load it to the project]{@tutorial assets_manager}:
```
this.loader.addImage("image_key", "./fireball32x16.png");
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
this.fireball.addAnimation("startAnimation", [0,1,2,3]);
```
5. And start it, emitting the event:
```
this.fireball.emit("startAnimation");
```
This will run through the image indexes 0,1,2,3 on next render circles.

6. Adding last parameter as true will loop animation indexes:
```
this.fireball.addAnimation("startAnimation", [0,1,2,3], true);
```
until stopRepeatedAnimation() will be called, or object will be destroyed.
```
this.fireball.stopRepeatedAnimation("startAnimation");
```