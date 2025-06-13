Tilemaps (.tmg files) are a great way to draw and organize system levels, and they can be created using the Tiled editor. Loading them is similar to loading other objects:  
1. [Add and load a tilemap]{@tutorial assets_manager}
2. Create a draw object in the [GameStage.init() or GameStage.start()]{@tutorial stages_lifecycle}:
   ```
   init() {
      this.tiledLayer = this.draw.tiledLayer("tilemap_layer_key", "tilemap_key", setCollisionShapes, shapeMask);
      ...
   }
   ```
   This will render the tilemap layer on your canvas.

### Live example
<p class="codepen" data-height="500" data-default-tab="js,result" data-slug-hash="VwgNRxN" data-user="yaalfred" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/yaalfred/pen/VwgNRxN">
  Tilemaps</a> by Arturas-Alfredas Lapinskas (<a href="https://codepen.io/yaalfred">@yaalfred</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
<br />

## Extracting collision shapes:
For example, you have a walls layer:
<img src="collision_shapes_draw.png">
And you want that tiles to be unreachable by the player, or to detect collisions, pass `true` as the third parameter to extract collision shapes from the tilemap layer:
```
 this.draw.tiledLayer("tilemap_layer_key", "tilemap_key", true, shapeMask);
```
These collision shapes can then be retrieved using:
```
this.stageData.getCollisionShapes()
```
* Additionally, the [stage.isCollision()]{@link GameStage#isCollision} method will use these collision shapes for collision calculations. For example, the code below will move the fireball only if no collision occurs:
```
if (!stage.isCollision(newCoordX, newCoordY, fireball)) {
    fireball.x = newCoordX;
    fireball.y = newCoordY;
}
```
To debug collision shapes, you can enable the following options:
```
SystemSettings.gameOptions.debug.collisionShapes.drawLayerCollisionShapes = true;
SystemSettings.gameOptions.debug.collisionShapes.drawObjectCollisionShapes = true;
```
### Live Example
<p class="codepen" data-height="500" data-default-tab="js,result" data-slug-hash="mdvYrWP" data-user="yaalfred" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/yaalfred/pen/mdvYrWP">
  Tiled collision shapes</a> by Arturas-Alfredas Lapinskas (<a href="https://codepen.io/yaalfred">@yaalfred</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
<br />

### Collision shapes and animations from Tiled editor
Starting from jsge@1.4.0, support for the following features has been added:

- [Tiled object collisions]{@link https://doc.mapeditor.org/en/stable/manual/editing-tilesets/#tile-collision-editor} with different collision shapes: polygons, ellipses, dots.
- [Tiled animations]{@link https://doc.mapeditor.org/en/stable/manual/editing-tilesets/#tile-animation-editor}.

The engine will process these features automatically when the `tiledLayer` is created.
