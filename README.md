# JsGE@0.1.22

Javascript Game Engine

This engine was designed to work with maps from Tiled editor.

Advantages:
* Fresh codebase, depends latest javascript features such as classes and privacy.
* Webgl 1 under the hood, fast rendering on desktop and mobile screens.
* Strict OPP structure, no circle dependencies.
* Multilayer design, easy to create fog-of-war, or background effects.

What you can do with it:
1. Draw primitives, texts, load images, audio and tilemaps with tilesets from Tiled editor.
2. Render everything in a sequence.
4. Images can be animated, switching their indexes.
5. Tiles can be rendered as layers on top of each other using webgl masks effects.
6. Map centering. Cutting off everything out off screen.
7. Boundaries could be extracted from tiles and used further.
8. Map objects supports boundaries(dot, polygon).
9. Collision detection for dots, lines and polygons included.
10. Boundaries helper drawing as debug option.

How to run examples:
1. npm i
2. npm start
3. visit localhost:9000

API docs and tutorials: [jsge.reslc.ru](https://jsge.reslc.ru) \
Files: [https://github.com/ALapinskas/jsge](https://github.com/ALapinskas/jsge)