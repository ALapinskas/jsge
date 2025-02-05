# Javascript Game Engine

This engine was designed to simplify creating games on javascript. \
No external libs used for drawing, no typescript, easy to use and debug.
![Alt text](Debug.gif?raw=true "Title")

Advantages:
* Fresh codebase, depends on latest javascript features such as classes and privacy. 
* OPP modular structure.
* Webgl 1 under the hood. Wide browser support.
* Webgl [blend effects](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc).
* Images and tiles frame animations.
* Spine 2d skeletal animation.
* Tiles and objects collisions.

What you can do with it:
1. Draw primitives, texts, load images, audio and tilemaps with tilesets from [Tiled editor](https://www.mapeditor.org).
2. Render everything in a sequence.
3. Animate images, switching their frames.
4. Render tiles on top of each other using webgl blend effects.
5. Masks from primitives.
6. Map centering. Cutting off everything out off screen.
7. Custom boundaries(rect/polygon/circle) for image objects.
8. Collision detection.
9. Boundaries drawing as debug option.

Tilemaps support:
* Only json format(.tmj), not xml(.tmx)!
* Animated tiles
* Tiles boundaries(dot/ellipse/polygon)

How to run examples:
1. npm i
2. npm start
3. visit localhost:9000

API docs and tutorials: [jsge.reslc.ru](https://jsge.reslc.ru) \
github: [https://github.com/ALapinskas/jsge](https://github.com/ALapinskas/jsge) \
issues: [https://github.com/ALapinskas/jsge/issues](https://github.com/ALapinskas/jsge/issues) \
npm: [https://www.npmjs.com/package/jsge](https://www.npmjs.com/package/jsge) \

Feedback and Questions: 
[https://discord.com/channels/1246373335202398268](https://discord.com/channels/1246373335202398268)
Tg: @alapinskas