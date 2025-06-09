# Javascript Game Engine

This engine was designed to simplify creating games on javascript. \
No external libraries are used for drawing, no TypeScript, no cycle dependencies, strict OOP structure, it is easy to use and debug. \
![Alt text](Debug.gif?raw=true "Title")

### Advantages:
* OPP modular structure.
* Webgl 1 under the hood, wide browser support.
* Masks and webgl [blend effects](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc).
* Tilemaps with tilesets support from [Tiled editor](https://www.mapeditor.org).
* Unlimited size tilesets. 800x800 cells, with 16x16 pixels [example] (https://codepen.io/yaalfred/pen/zYegGGb)
* Frame animations for sprites and tiles.
* Spine 2d skeletal animation as a plugin.
* Collisions for tiles and objects.
* Boundary drawing as a debug option.
![Boundaries draw](boundaries_draw.png?raw=true "Boundaries draw")

### Tilemaps support:
* Full file formats support: 
    - JSON (.tmj, .json)
    - XML (.tmx, .xml)
    - Internal tilesets (as part of tilemap file)
    - External JSON tilesets (.tsj, json)
    - External XML tilesets (.tsx, .xml)
    - Attached images load automatically
* Animated tiles.
* Tiles boundaries(dot/ellipse/polygon)

### How to run examples:
1. npm i
2. npm start
3. visit localhost:9000

API docs and tutorials: [jsge.reslc.ru](https://jsge.reslc.ru) \
github: [https://github.com/ALapinskas/jsge](https://github.com/ALapinskas/jsge) \
issues: [https://github.com/ALapinskas/jsge/issues](https://github.com/ALapinskas/jsge/issues) \
npm: [https://www.npmjs.com/package/jsge](https://www.npmjs.com/package/jsge) 

## Games build with jsge:
[Guess the word](https://github.com/ALapinskas/guessword) \
[Arcanoid](https://github.com/ALapinskas/arkanoid) \
[RTS Humans vs Goblins](https://github.com/ALapinskas/gh-rts)