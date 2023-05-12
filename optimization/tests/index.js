 
import assert from "node:assert/strict";
import { calculateBufferData } from "./files/debug.js";

const layerRows = 60, 
    layerCols = 60,
    layerData = Array(3600).fill(7),
    dtwidth = 16,
    dtheight = 16,
    tilewidth = 16,
    tileheight = 16,
    atlasColumns = 4,
    atlasWidth = 64,
    atlasHeight = 64,
    setBoundaries = false;

const pt0 = performance.now();
const results = calculateBufferData(layerRows, layerCols, layerData, dtwidth, dtheight, tilewidth, tileheight, atlasColumns, atlasWidth, atlasHeight, setBoundaries);
console.log("done, take: ", performance.now() - pt0, "ms, test results: ");
console.log(results);
console.log("ok");


const pt1 = performance.now();
const results2 = calculateBufferDataOriginal(layerRows, layerCols, layerData, dtwidth, dtheight, tilewidth, tileheight, atlasColumns, atlasWidth, atlasHeight, setBoundaries);
console.log("done, original take: ", performance.now() - pt1, "ms, test results: ");
console.log(results2);
console.log("ok");

//is native function have same results as webassembly
//assert.deepStrictEqual(results, results2);

function calculateBufferDataOriginal(layerRows, layerCols, layerData, dtwidth, dtheight, tilewidth, tileheight, atlasColumns, atlasWidth, atlasHeight, setBoundaries) {
    let boundaries = [],
      verticesBufferData = [],
      texturesBufferData = [],
      mapIndex = 0;
      
    for (let row= 0; row < layerRows; row++) {
      for (let col = 0; col < layerCols; col++) {
          let tile = layerData[mapIndex],
              mapPosX = col * dtwidth,
              mapPosY = row * dtheight;
              //mapPosXWithOffset = col * dtwidth - xOffset,
              //mapPosYWithOffset = row * dtheight - yOffset;
          
          if (tile !== 0) {
              tile -= 1;
              const atlasPosX = tile % atlasColumns * tilewidth,
                  atlasPosY = Math.floor(tile / atlasColumns) * tileheight,
                  vecX1 = mapPosX,
                  vecY1 = mapPosY,
                  vecX2 = mapPosX + tilewidth,
                  vecY2 = mapPosY + tileheight,
                  texX1 = 1 / atlasWidth * atlasPosX,
                  texY1 = 1 / atlasHeight * atlasPosY,
                  texX2 = texX1 + (1 / atlasWidth * tilewidth),
                  texY2 = texY1 + (1 / atlasHeight * tileheight);
                  verticesBufferData.push(
                    vecX1, vecY1,
                    vecX2, vecY1,
                    vecX1, vecY2,
                    vecX1, vecY2,
                    vecX2, vecY1,
                    vecX2, vecY2);
                  texturesBufferData.push(
                    texX1, texY1,
                    texX2, texY1,
                    texX1, texY2,
                    texX1, texY2,
                    texX2, texY1,
                    texX2, texY2
                  );
              
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