Tilemaps(.tmg files) is a good way to draw and organize the system levels, they could be created by Tiled editor. 
Loading them is now the same as the other objects:
1. [Add and load a tilemap]{@tutorial assets_manager}
2. Create a draw object in the init() or start() [stage]{@tutorial stages_lifecycle}:
```
init() {
    this.tiledLayer = this.draw.tiledLayer("tilemap_layer_key", "tilemap_key", setBoundaries, shapeMask);
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
<br />

## Extracting boundaries:
For example, you have a walls layer:
<img src="tiled_boundaries.png">
And you want that tiles to be unreachable by the player, or to detect the collision happens. To do that pass true as 3 parameter, for extracting boundaries from the tilemap layer :
```
 this.draw.tiledLayer("tilemap_layer_key", "tilemap_key", true, shapeMask);
```
* This boundaries could be then retrieved:
```
this.stageData.getBoundaries()
```
* Also, [stage.isBoundariesCollision()]{@link GameStage#isBoundariesCollision} method will use this boundaries for collisions calculations. For example the code below will move fireball only if no collision will happen:
```
if (!stage.isBoundariesCollision(newCoordX, newCoordY, fireball)) {
    fireball.x = newCoordX;
    fireball.y = newCoordY;
}
```
* To debug boundaries you can enable an option:
```
SystemSettings.gameOptions.debug.boundaries.drawLayerBoundaries = true;
SystemSettings.gameOptions.debug.boundaries.drawObjectBoundaries = true;
```
### Live Example
<p class="codepen" data-height="500" data-default-tab="js,result" data-slug-hash="mdvYrWP" data-user="yaalfred" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/yaalfred/pen/mdvYrWP">
  Tiled boundries</a> by Arturas-Alfredas Lapinskas (<a href="https://codepen.io/yaalfred">@yaalfred</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

### Boundaries and animations
From jsge@1.4.0 added support: 
- [Tiled object collisions(boundaries)]{@link https://doc.mapeditor.org/en/stable/manual/editing-tilesets/#tile-collision-editor} - different boundaries shapes: polygons, ellipses, dots
- [Tiled animations]{@link https://doc.mapeditor.org/en/stable/manual/editing-tilesets/#tile-animation-editor}

Engine will process them automatically when tiledLayer is created.
