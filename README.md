# JsGE@1.4.2

Javascript Game Engine

This engine was designed to work with maps from Tiled editor.

Advantages:
* Fresh codebase, depends on latest javascript features such as classes and privacy. 
* OPP modular structure.
* Webgl 1 under the hood.
* Webgl [blend effects](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc).
* Images and tiles animations.
* Spine 2d skeletal animation.
* Tiles and objects collisions.

What you can do with it:
1. Draw primitives, texts, load images, audio and tilemaps with tilesets from [Tiled editor](https://www.mapeditor.org).
2. Render everything in a sequence.
3. Animate images, switching their frames.
4. Animate tiles.
5. Render tiles on top of each other using webgl blend effects.
6. Masks from primitives.
7. Map centering. Cutting off everything out off screen.
8. Extract boundaries(dot/ellipse/polygon) from tiles.
9. Custom boundaries(rect/polygon/circle) for image objects.
10. Collision detection.
11. Boundaries drawing as debug option.

How to run examples:
1. npm i
2. npm start
3. visit localhost:9000

API docs and tutorials: [jsge.reslc.ru](https://jsge.reslc.ru) \
Files: [https://github.com/ALapinskas/jsge](https://github.com/ALapinskas/jsge)