// The entry file of your WebAssembly module.

export function calculateBufferData(layerRows: i32, layerCols: i32, layerData:Array<i32>, dtwidth:i32, dtheight:i32, tilewidth:i32, tileheight:i32, atlasColumns:i32, atlasWidth:i32, atlasHeight:i32, setBoundaries:bool): Array<Array<f32>> {
    let boundaries:Array<Array<number>> = [],
      verticesBufferData:Array<f32> = [],
      texturesBufferData:Array<f32> = [],
      mapIndex:i32 = 0;
      
    for (let row:i32 = 0; row < layerRows; row++) {
      for (let col:i32 = 0; col < layerCols; col++) {
          let tile:i32 = layerData[mapIndex],
              mapPosX = col * dtwidth,
              mapPosY = row * dtheight;
              //mapPosXWithOffset = col * dtwidth - xOffset,
              //mapPosYWithOffset = row * dtheight - yOffset;
          
          if (tile !== 0) {
              tile -= 1;
              const aw32 = f32(atlasWidth),
                ah32 = f32(atlasHeight),
                atlasPosX:f32 = f32(tile % atlasColumns * tilewidth),
                atlasPosY:f32 = f32(floor(tile / atlasColumns) * tileheight),
                vecX1:f32 = f32(mapPosX),
                vecY1:f32 = f32(mapPosY),
                vecX2:f32 = f32(mapPosX + tilewidth),
                vecY2:f32 = f32(mapPosY + tileheight),
                texX1:f32 = 1 /  aw32 * atlasPosX,
                texY1:f32 = 1 / ah32 * atlasPosY,
                texX2:f32 = texX1 + (1 / aw32 * f32(tilewidth)),
                texY2:f32 = texY1 + (1 / ah32 * f32(tileheight));

                  verticesBufferData.push(vecX1);
                  verticesBufferData.push(vecY1);
                  verticesBufferData.push(vecX2);
                  verticesBufferData.push(vecY1);
                  verticesBufferData.push(vecX1);
                  verticesBufferData.push(vecY2);
                  verticesBufferData.push(vecX1);
                  verticesBufferData.push(vecY2);
                  verticesBufferData.push(vecX2);
                  verticesBufferData.push(vecY1);
                  verticesBufferData.push(vecX2);
                  verticesBufferData.push(vecY2);
                  
                  texturesBufferData.push(texX1);
                  texturesBufferData.push(texY1);
                  texturesBufferData.push(texX2);
                  texturesBufferData.push(texY1);
                  texturesBufferData.push(texX1);
                  texturesBufferData.push(texY2);
                  texturesBufferData.push(texX1);
                  texturesBufferData.push(texY2);
                  texturesBufferData.push(texX2);
                  texturesBufferData.push(texY1);
                  texturesBufferData.push(texX2);
                  texturesBufferData.push(texY2);
                  
              //webGlClass.bindBufferImage(x, y, tilewidth, tileheight, tilesetImages[tile])
              if (setBoundaries) {
                  boundaries.push([mapPosX, mapPosY, mapPosX + dtwidth, mapPosY]);
                  boundaries.push([mapPosX + dtwidth, mapPosY, mapPosX + dtwidth, mapPosY + dtheight]);
                  boundaries.push([mapPosX + dtwidth, mapPosY + dtheight, mapPosX, mapPosY + dtheight]);
                  boundaries.push([mapPosX, mapPosY + dtheight, mapPosX, mapPosY]);
              }

          }
          mapIndex++;
      }
    }
    return [ verticesBufferData, texturesBufferData ];
}

export function emptyMethod():i32 {
  return 1;
}
/*
export function ArrayBufferLoopTest(layerRows: i32, layerCols: i32, inputArray:TypedArray<Float32Array>):TypedArray<Float32Array> {
  let verticesBufferData:TypedArray<Float32Array>,
  mapIndex:i32 = 0;
  
  for (let row:i32 = 0; row < layerRows; row++) {
    for (let col:i32 = 0; col < layerCols; col++) {
        let tile:f32 = inputArray[mapIndex],
            mapPosX = col,
            mapPosY = row;
            //mapPosXWithOffset = col * dtwidth - xOffset,
            //mapPosYWithOffset = row * dtheight - yOffset;
        
        if (tile !== 0) {
            tile -= 1;
            const vecX1:f32 = f32(floor(tile % mapPosX) * mapPosY);
              
            verticesBufferData[mapIndex] = vecX1;
        }
        mapIndex++;
    }
  }
  return verticesBufferData;
}*/

class returnVales {
  boundaries:Array<Array<number>>;
  vertices:Array<number>;
  textures:Array<number>;
  constructor(boundaries:Array<Array<number>>, vertices:Array<number>, textures:Array<number>) {
    this.boundaries = boundaries;
    this.vertices = vertices;
    this.textures = textures;
  }
}