Tilemaps(.tmg files) is good way to draw and organize system levels, they could eb created by Tiled editor. To load them:
1. [Add and load tilemap]{@tutorial assets_manager}
2. Add tilemap layer to render layer in the init() or start() [stage]{@tutorial screen_pages_stages}:
```
init() {
    this.addRenderLayer("system_layer_key", "tilemap_layer_key", "tilemap_key");
}
```
This will render the tilemap layer on your canvas.

3. To extract boundaries from tilemap layer pass true as 4 parameter:
```
this.addRenderLayer("system_layer_key", "tilemap_layer_key", "tilemap_key", true);
```
This will extract tilemap boundaries on each render circle. They could be then retrieved, and used with:
```
this.screenPageData.getBoundaries()
```
Also, [page.isBoundariesCollision()]{@link ScreenPage#isBoundariesCollision} methods will use this boundaries for collisions calculations