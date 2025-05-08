#### 1. JSGE is stalling during the asset preloading stage.
* Issue:
Some of the asset load requests are responding with 404 errors in the console. 
![loading](loading_stun.png)

* Solution:  
All assets should be under the server folder.  
Sometimes Tiled Editor, sets absolute paths to the images, if you open the tilemap.tmj, you could see something like that:
![path_uncorrect](path_uncorrect.png)  
This source for the tileset should be fixed to start from the tilemap root.