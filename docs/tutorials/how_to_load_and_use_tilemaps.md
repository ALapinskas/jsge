Tilemaps(.tmg files) is a good way to draw and organize the system levels, they could be created by Tiled editor. 
To load them:
1. [Add and load a tilemap]{@tutorial assets_manager}
2. Add the tilemap layer to the render layer in the init() or start() [stage]{@tutorial screen_pages_stages}:
```
init() {
    this.addRenderLayer("system_layer_key", "tilemap_layer_key", "tilemap_key");
}
```
This will render the tilemap layer on your canvas.

### Extracting boundaries:
For example, you have a walls layer:
<img src="tiled_boundaries_layer.png">
And you want that tiles to be unreachable by the player, or to detect the collision happens. To do that pass true as 4 parameter, for extracting boundaries from the tilemap layer :
```
this.addRenderLayer("system_layer_key", "walls", "tilemap_key", true);
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