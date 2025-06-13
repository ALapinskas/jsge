# Javascript Game Engine

This engine was designed to simplify creating games on javascript. \
No external libraries are used for drawing, no TypeScript, strict OOP structure - no cycle dependencies. It is easy to use and debug. \
\
![Alt text](Debug.gif?raw=true "Title")

### Advantages:
* OPP modular structure.
* Webgl 1 under the hood, wide browser support.
* Masks and webgl [blend effects](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc).
* Assets manager for files preloading. Images, Audio, Image Atlas (Atlas.xml), etc.
* Tilemaps with tilesets support from [Tiled editor](https://www.mapeditor.org).
* Unlimited size tilesets. 800x800 cells, with 16x16 pixels [example] (https://codepen.io/yaalfred/pen/zYegGGb)
* Frame animations for sprites and tiles.
* Spine 2d skeletal animation as a plugin.
* Simple collision detector for tiles and objects.
* Collision shapes draw as a debug option.
![Collision shapes draw](collision_shapes_draw.png?raw=true "Collision shapes draw")

### Tilemaps support:
* Full file formats support: 
    - JSON (.tmj, .json)
    - XML (.tmx, .xml)
    - Internal tilesets (as part of tilemap file)
    - External JSON tilesets (.tsj, json)
    - External XML tilesets (.tsx, .xml)
    - Attached images uploading
* [Animated tiles support](https://doc.mapeditor.org/en/stable/manual/editing-tilesets/#tile-animation-editor)
* [Tiled collision shapes](https://doc.mapeditor.org/en/stable/manual/editing-tilesets/#tile-collision-editor).

### How to run examples:
1. npm i
2. npm start
3. visit localhost:9000

API docs and tutorials: [jsge.reslc.ru](https://jsge.reslc.ru) \
github: [https://github.com/ALapinskas/jsge](https://github.com/ALapinskas/jsge) \
issues: [https://github.com/ALapinskas/jsge/issues](https://github.com/ALapinskas/jsge/issues) \
npm: [https://www.npmjs.com/package/jsge](https://www.npmjs.com/package/jsge)