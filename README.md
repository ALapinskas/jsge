# JavaScript Game Engine

This engine was designed to simplify creating games in JavaScript.
No external libraries are used for drawing, no TypeScript, strict OOP structure. No cyclic dependencies, same codebase everywhere, easy to use and debug.

![Alt text](Debug.gif?raw=true "Title")

### Advantages:
* OOP modular structure
* WebGL 1 under the hood, wide browser support
* Masks and WebGL [blend effects](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc)
* Assets manager for file preloading: Images, Audio, Image Atlas (Atlas.xml), etc.
* Tilemaps with tileset support from [Tiled editor](https://www.mapeditor.org)
* Unlimited size tilesets: 800x800 cells, with 16x16 pixels [example](https://codepen.io/yaalfred/pen/zYegGGb)
* Frame animations for sprites and tiles
* Spine 2D skeletal animation as a plugin
* Collisions for tiles and objects
* Boundaries (collision shapes) drawing as a debug option

![Boundaries draw](boundaries_draw.png?raw=true "Boundaries draw")

### Tilemaps support:
* Full file format support:
  - JSON (.tmj, .json)
  - XML (.tmx, .xml)
  - Internal tilesets (as part of tilemap file)
  - External JSON tilesets (.tsj, .json)
  - External XML tilesets (.tsx, .xml)
  - Attached image uploading
* [Animated tiles support](https://doc.mapeditor.org/en/stable/manual/editing-tilesets/#tile-animation-editor)
* [Tiled collision shapes](https://doc.mapeditor.org/en/stable/manual/editing-tilesets/#tile-collision-editor)

### How to run examples:
1. `git submodule update --init`
2. `npm i`
3. `npm start`
4. Visit `localhost:9000`

**API docs and tutorials:** [jsge.reslc.ru](https://jsge.reslc.ru)  
**GitHub:** [https://github.com/ALapinskas/jsge](https://github.com/ALapinskas/jsge)  
**Issues:** [https://github.com/ALapinskas/jsge/issues](https://github.com/ALapinskas/jsge/issues)  
**NPM:** [https://www.npmjs.com/package/jsge](https://www.npmjs.com/package/jsge)