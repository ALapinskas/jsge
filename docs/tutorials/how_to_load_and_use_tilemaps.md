Tilemaps(.tmg files) is a good way to draw and organize the system levels, they could be created by Tiled editor. 
Loading them is now the same as the other objects:
1. [Add and load a tilemap]{@tutorial assets_manager}
2. Create a draw object in the init() or start() [stage]{@tutorial screen_pages_stages}:
```
init() {
    this.tiledLayer = this.draw.tiledLayer("tilemap_layer_key", "tilemap_key", setBoundaries, shapeMask);
    ...
}
```
This will render the tilemap layer on your canvas.

### Extracting boundaries:
For example, you have a walls layer:
<img src="tiled_boundaries_layer.png">
And you want that tiles to be unreachable by the player, or to detect the collision happens. To do that pass true as 3 parameter, for extracting boundaries from the tilemap layer :
```
 this.draw.tiledLayer("tilemap_layer_key", "tilemap_key", true, shapeMask);
```
* This boundaries could be then retrieved:
```
this.screenPageData.getBoundaries()
```
* Also, [page.isBoundariesCollision()]{@link ScreenPage#isBoundariesCollision} method will use this boundaries for collisions calculations. For example the code below will move personSprite only if no collision will happen:
```
if (!page.isBoundariesCollision(newCoordX, newCoordY, personSprite)) {
    personSprite.x = newCoordX;
    personSprite.y = newCoordY;
}
```