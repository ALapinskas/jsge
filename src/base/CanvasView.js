import { RenderLayer } from "./RenderLayer.js";
import { DrawShapeObject } from "./DrawShapeObject.js";
import { Exception, Warning } from "./Exception.js";
import { ERROR_CODES, WARNING_CODES } from "../constants.js";
import { WebGlInterface } from "./WebGlInterface.js";
import { SystemSettings } from "../configs.js";
import { ScreenPageData } from "./ScreenPageData.js";
import AssetsManager from "assetsm";
//import { calculateBufferData } from "../wa/release.js";
import { CONST } from "../constants.js";

const INDEX_TOP_LINE = 0,
    INDEX_RIGHT_LINE = 1,
    INDEX_BOTTOM_LINE = 2,
    INDEX_LEFT_LINE = 3;

const INDEX_X1 = 0,
    INDEX_Y1 = 1,
    INDEX_X2 = 2,
    INDEX_Y2 = 3;

/**
 * Canvas view represents each canvas on the page<br> 
 * Should be created via ScreenPage.createCanvasView(),<br>
 * Contains draw logic and holds DrawObjects and Tile
 * Can retrieved by ScreenPage.getView()
 * @see {@link ScreenPage} a part of ScreenPage
 * @hideconstructor
 */
export class CanvasView {
    /**
     * @type {HTMLCanvasElement}
     */
    #canvas;
    /**
     * @type {boolean}
     */
    #isCleared;
    /**
     * @type {boolean}
     */
    #isStatic
    /**
     * @type {boolean}
     */
    #isWorldBoundariesEnabled;

    #drawContext;
    #webGlInterface;

    /**
     * @type {SystemSettings}
     */
    #systemSettings;
    /**
     * @type {ScreenPageData}
     */
    #screenPageData;
    /**
     * @type {AssetsManager}
     */
    #loader;

    /**
     * @type {Array<DrawShapeObject>}
     */
    #renderObjects;
    /**
     * @type {Array<RenderLayer>}
     */
    #renderLayers;
    
    /**
     * @type {Array<Promise>}
     */
    #bindTileMapPromises;
    /**
     * @type {Array<Promise>}
     */
    #bindRenderObjectPromises;

    constructor(name, systemSettings, screenPageData, loader, isStatic) {
        this.#canvas = document.createElement("canvas");
        this.#canvas.id = name;
        this.#canvas.style.position = "absolute";
        this.#isCleared = false;
        this.#isStatic = isStatic;

        this.#screenPageData = screenPageData;
        this.#systemSettings = systemSettings;
        this.#loader = loader;
        this.#renderObjects = [];
        this.#renderLayers = [];

        this.#bindTileMapPromises = [];
        this.#bindRenderObjectPromises = [];
        this.bindRenderLayerMethod = this.systemSettings.gameOptions.optimization === CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT ? this._bindRenderLayerWM : this._bindRenderLayer;
    }

    get screenPageData() {
        return this.#screenPageData;
    }

    get systemSettings() {
        return this.#systemSettings;
    }

    get loader() {
        return this.#loader;
    }

    /**
     * a getter to retrieve all attached renderObjects
     */
    get renderObjects() {
        return this.#renderObjects;
    }

    get canvas() {
        return this.#canvas;
    }

    /**
     * Retrieve specific objects instances
     * @param {DrawShapeObject} instance - drawObjectInstance to retrieve 
     * @returns {Array<DrawShapeObject>}
     */
    getObjectsByInstance(instance) {
        return this.#renderObjects.filter((object) => object instanceof instance);
    }

    get _renderLayers() {
        return this.#renderLayers;
    }

    set _renderObject(object) {
        this.#renderObjects.push(object);
    } 

    set _renderObjects(objects) {
        this.#renderObjects = objects;
    } 

    set _renderLayers(layer) {
        this.#renderLayers.push(layer);
    }

    set _isCleared(value) {
        this.#isCleared = value;
    }

    get _isCleared() {
        return this.#isCleared;
    }

    /**
     * @ignore
     */
    _enableMapBoundaries() {
        this.#isWorldBoundariesEnabled = true;
    }

    _initiateWebGlContext(debug = false) {
        const webgl = this.#canvas.getContext("webgl");
        if (webgl) {
            this.#drawContext = webgl;
            this.#webGlInterface = new WebGlInterface(this.#drawContext, debug);
            
            return Promise.all([this.#webGlInterface._initiateImagesDrawProgram(),
                this.#webGlInterface._initPrimitivesDrawProgram()]);
        } else {
            Exception(ERROR_CODES.WEBGL_ERROR, "webgl is not supported in this browser");
        } 
    }

    _clearWebGlContext() {
        this.#webGlInterface._clearView();
        this.#isCleared = true;
    }

    _executeTileImagesDraw() {
        return this.#webGlInterface._executeTileImagesDraw();
    }

    _setCanvasSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        if (this.#webGlInterface) {
            this.#webGlInterface._fixCanvasSize(width, height);
        }
    }

    _sortRenderObjectsByZIndex() {
        this.#renderObjects = this.#renderObjects.sort((obj1, obj2) => obj2.zIndex - obj1.zIndex);
    }

    _prepareBindRenderLayerPromises() {
        for (const layer of this.renderLayers) {
            this.#bindTileMapPromises.push(this.bindRenderLayerMethod(layer).catch((err) => {
                Exception(ERROR_CODES.UNHANDLED_PREPARE_EXCEPTION, err);
            }));
        }
    }

    _executeBindRenderLayerPromises() {
        return Promise.allSettled(this.#bindTileMapPromises).then((bindResults) => {
            this.#clearTileMapPromises();
            return Promise.resolve(bindResults);
        });
    }

    _bindRenderLayerWM(renderLayer) {
        return new Promise((resolve, reject) => {
            const tilemap = this.loader.getTileMap(renderLayer.tileMapKey),
                tilesets = tilemap.tilesets,
                tilesetImages = tilesets.map((tileset) => this.#getImage(tileset.data.name)),
                layerData = tilemap.layers.find((layer) => layer.name === renderLayer.layerKey),
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                setBoundaries = false;//, //renderLayer.setBoundaries,
                //[ worldW, worldH ] = this.screenPageData.worldDimensions,
                //[ canvasW, canvasH ] = this.screenPageData.drawDimensions,
                //[ xOffset, yOffset ] = this.screenPageData.worldOffset;
                
            if (!layerData) {
                Warning(WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }
            for (let i = 0; i <= tilesets.length - 1; i++) {
                const tileset = tilesets[i].data,
                    //tilesetImages = this.loader.getTilesetImageArray(tileset.name),
                    tilewidth = tileset.tilewidth,
                    tileheight = tileset.tileheight,
                    //atlasRows = tileset.imageheight / tileheight,
                    atlasColumns = tileset.imagewidth / tilewidth,
                    layerCols = layerData.width,
                    layerRows = layerData.height,
                    //visibleCols = Math.ceil(canvasW / tilewidth),
                    //visibleRows = Math.ceil(canvasH / tileheight),
                    //offsetCols = layerCols - visibleCols,
                    //offsetRows = layerRows - visibleRows,
                    atlasImage = tilesetImages[i],
                    atlasWidth = atlasImage.width,
                    atlasHeight = atlasImage.height;
                    
                const [verticesBufferData, texturesBufferData] = calculateBufferData(layerRows, layerCols, layerData.data, dtwidth, dtheight, tilewidth, tileheight, atlasColumns, atlasWidth, atlasHeight, setBoundaries);
                
                this.#bindTileImages(verticesBufferData, texturesBufferData, atlasImage, tileset.name);
                if (setBoundaries) {
                    this.screenPageData._mergeBoundaries();
                    renderLayer.setBoundaries = false;
                }
                resolve();
            }
        });
    }

    _bindRenderLayer(renderLayer) {
        return new Promise((resolve, reject) => {
            const tilemap = this.loader.getTileMap(renderLayer.tileMapKey),
                tilesets = tilemap.tilesets,
                tilesetImages = tilesets.map((tileset) => this.#getImage(tileset.data.name)),
                layerData = tilemap.layers.find((layer) => layer.name === renderLayer.layerKey),
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                tilewidth = dtwidth,
                tileheight = dtheight,
                setBoundaries = renderLayer.setBoundaries,
                [ settingsWorldWidth, settingsWorldHeight ] = this.screenPageData.worldDimensions,
                //[ canvasW, canvasH ] = this.screenPageData.drawDimensions,
                [ xOffset, yOffset ] = this.#isStatic === true ? [0,0] : this.screenPageData.worldOffset;
                
            let boundariesRowsIndexes = new Map(),
                boundaries = [];

            if (!layerData) {
                Warning(WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }
            
            for (let i = 0; i < tilesets.length; i++) {
                const tileset = tilesets[i].data,
                    firstgid = tilesets[i].firstgid,
                    nextTileset = tilesets[i + 1],
                    nextgid = nextTileset ? nextTileset.firstgid : null,
                    tilesetwidth = tileset.tilewidth,
                    tilesetheight = tileset.tileheight,
                    atlasImage = tilesetImages[i],
                    //atlasWidth = atlasImage.width,
                    //atlasHeight = atlasImage.height,
                    atlasWidth = tileset.imagewidth,
                    atlasHeight = tileset.imageheight,
                    //atlasRows = atlasHeight / tileheight,
                    atlasColumns = Math.floor(atlasWidth / tilesetwidth),
                    layerCols = layerData.width,
                    layerRows = layerData.height,
                    worldW = tilewidth * layerCols,
                    worldH = tileheight * layerRows,
                    moduloTop = yOffset % tileheight,
                    moduleLeft = xOffset % tilewidth,
                    skipRowsTop = yOffset !== 0 ? Math.floor(yOffset / tileheight) : 0,
                    skipColsLeft = xOffset !== 0 ? Math.floor(xOffset / tilewidth) : 0,
                    skipColsRight = Math.floor((worldW - (xOffset + worldW)) / tilewidth),
                    endColLeft = Math.ceil((xOffset + worldW ) / tilewidth),
                    endRowTop = Math.ceil((yOffset + worldH ) / tileheight),
                    
                    verticesBufferData = [],
                    texturesBufferData = [];
                if (setBoundaries) {
                    if (worldW !== settingsWorldWidth || worldH !== settingsWorldHeight) {
                        Warning(WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                        this.screenPageData._setWorldDimensions(worldW, worldH);
                    }
                    
                    // boundaries cleanups every draw circle, we need to set world boundaries again
                    if (this.#isWorldBoundariesEnabled) {
                        this.screenPageData._setMapBoundaries();
                    }
                }

                let mapIndex = skipRowsTop * layerCols;

                const rowsEnd = endRowTop - skipRowsTop,
                    colsEnd = endColLeft - skipColsLeft;

                for (let row = 0; row < rowsEnd; row++) {
                    mapIndex += skipColsLeft;
                    let currentRowIndexes = new Map();

                    for (let col = 0; col < colsEnd; col++) {
                        let tile = layerData.data[mapIndex];
                        //if (tile !== 0)
                        if (tile >= firstgid && (nextgid === null || tile < nextgid)) {
                            const mapPosX = col * dtwidth - moduleLeft,
                                mapPosY = row * dtheight - moduloTop;

                            tile -= firstgid;
                            const atlasPosX = tile % atlasColumns * tilesetwidth,
                                atlasPosY = Math.floor(tile / atlasColumns) * tilesetheight,
                                vecX1 = mapPosX,
                                vecY1 = mapPosY,
                                vecX2 = mapPosX + tilesetwidth,
                                vecY2 = mapPosY + tilesetheight,
                                texX1 = 1 / atlasWidth * atlasPosX,
                                texY1 = 1 / atlasHeight * atlasPosY,
                                texX2 = texX1 + (1 / atlasWidth * tilesetwidth),
                                texY2 = texY1 + (1 / atlasHeight * tilesetheight);
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
                            
                            if (setBoundaries) {
                                let rightLine = [ mapPosX + tilesetwidth, mapPosY, mapPosX + tilesetwidth, mapPosY + tilesetheight ],
                                    bottomLine = [ mapPosX + tilesetwidth, mapPosY + tilesetheight, mapPosX, mapPosY + tilesetheight ],
                                    topLine = [ mapPosX, mapPosY, mapPosX + tilesetwidth, mapPosY],
                                    leftLine = [ mapPosX, mapPosY + tilesetheight, mapPosX, mapPosY ],
                                    currentAddedCellIndexes = [null, null, null, null];
                                
                                const topRow = row !== 0 ? boundariesRowsIndexes.get(row - 1) : undefined;
                                if (topRow ) {
                                    const topCellIndexes = topRow.get(col);
                                    if (topCellIndexes) {
                                        //remove double lines from top
                                        const bottomTopCellIndex = topCellIndexes[INDEX_BOTTOM_LINE],
                                            bottomTopCell = boundaries[bottomTopCellIndex];
                                        if (bottomTopCell) {
                                            const bottomTopCellX1 = bottomTopCell[INDEX_X1],
                                                bottomTopCellY1 = bottomTopCell[INDEX_Y1],
                                                bottomTopCellX2 = bottomTopCell[INDEX_X2],
                                                bottomTopCellY2 = bottomTopCell[INDEX_Y2],
                                                topX1 = topLine[INDEX_X1],
                                                topY1 = topLine[INDEX_Y1],
                                                topX2 = topLine[INDEX_X2],
                                                topY2 = topLine[INDEX_Y2];
                                            
                                            if (topX1 === bottomTopCellX2 && topY1 === bottomTopCellY2 &&
                                                topX2 === bottomTopCellX1 && topY2 === bottomTopCellY1) {
                                                boundaries[bottomTopCellIndex] = undefined;
                                                topLine = undefined;
                                            }
                                        }

                                        // merge line from top right
                                        const rightTopCellIndex = topCellIndexes[INDEX_RIGHT_LINE],
                                            rightTopCell = boundaries[rightTopCellIndex];
                                        if (rightTopCell) {
                                            const rightTopCellX1 = rightTopCell[INDEX_X1],
                                                rightTopCellY1 = rightTopCell[INDEX_Y1],
                                                rightTopCellX2 = rightTopCell[INDEX_X2],
                                                rightX1 = rightLine[INDEX_X1],
                                                rightX2 = rightLine[INDEX_X2];
                                            if (rightTopCellX1 === rightX2 && rightTopCellX2 === rightX1) {
                                                boundaries[rightTopCellIndex] = undefined;
                                                rightLine[INDEX_X1] = rightTopCellX1;
                                                rightLine[INDEX_Y1] = rightTopCellY1;
                                            }
                                        }
                                        // merge line from top left
                                        const leftTopCellIndex = topCellIndexes[INDEX_LEFT_LINE],
                                            leftTopCell = boundaries[leftTopCellIndex];
                                        if (leftTopCell) {
                                            const leftTopCellX1 = leftTopCell[INDEX_X1],
                                                leftTopCellX2 = leftTopCell[INDEX_X2],
                                                leftTopCellY2 = leftTopCell[INDEX_Y2],
                                                leftX1 = leftLine[INDEX_X1],
                                                leftX2 = leftLine[INDEX_X2];
                                            if (leftTopCellX1 === leftX2 && leftTopCellX2 === leftX1) {
                                                boundaries[leftTopCellIndex] = undefined;
                                                leftLine[INDEX_X2] = leftTopCellX2;
                                                leftLine[INDEX_Y2] = leftTopCellY2;
                                            }
                                        }
                                    }
                                }
                                const leftCellIndexes = col !== 0 ? currentRowIndexes.get(col - 1) : undefined;
                                if (leftCellIndexes) {

                                    //remove double lines from left
                                    const rightLeftCellIndex = leftCellIndexes[INDEX_RIGHT_LINE],
                                        rightLeftCell = boundaries[rightLeftCellIndex],
                                        rightLeftCellX1 = rightLeftCell[INDEX_X1],
                                        rightLeftCellY1 = rightLeftCell[INDEX_Y1],
                                        rightLeftCellX2 = rightLeftCell[INDEX_X2],
                                        rightLeftCellY2 = rightLeftCell[INDEX_Y2],
                                        leftX1 = leftLine[INDEX_X1],
                                        leftY1 = leftLine[INDEX_Y1],
                                        leftX2 = leftLine[INDEX_X2],
                                        leftY2 = leftLine[INDEX_Y2];

                                    if (leftX1 === rightLeftCellX2 && leftY1 === rightLeftCellY2 &&
                                        leftX2 === rightLeftCellX1 && leftY2 === rightLeftCellY1) {
                                        boundaries[rightLeftCellIndex] = undefined;
                                        leftLine = undefined;
                                    }

                                    //merge long lines from left top
                                    const topLeftCellIndex = leftCellIndexes[INDEX_TOP_LINE],
                                        topLeftCell = boundaries[topLeftCellIndex];
                                    if (topLeftCell && topLine) {
                                        const topLeftCellX1 = topLeftCell[INDEX_X1],
                                            topLeftCellY1 = topLeftCell[INDEX_Y1],
                                            topLeftCellY2 = topLeftCell[INDEX_Y2],
                                            topY1 = topLine[INDEX_Y1],
                                            topY2 = topLine[INDEX_Y2];
                                        if (topLeftCellY1 === topY2 && topLeftCellY2 === topY1 ) {
                                            boundaries[topLeftCellIndex] = undefined;
                                            topLine[INDEX_X1] = topLeftCellX1;
                                            topLine[INDEX_Y1] = topLeftCellY1;
                                        }
                                    }

                                    // merge long lines from left bottom
                                    const bottomLeftCellIndex = leftCellIndexes[INDEX_BOTTOM_LINE],
                                        bottomLeftCell = boundaries[bottomLeftCellIndex];
                                    if (bottomLeftCell) {
                                        const bottomLeftCellY1 = bottomLeftCell[INDEX_Y1],
                                            bottomLeftCellX2 = bottomLeftCell[INDEX_X2],
                                            bottomLeftCellY2 = bottomLeftCell[INDEX_Y2],
                                            bottomY1 = bottomLine[INDEX_Y1],
                                            bottomY2 = bottomLine[INDEX_Y2];
                                        if (bottomLeftCellY1 === bottomY2 && bottomLeftCellY2 === bottomY1 ) {
                                            boundaries[bottomLeftCellIndex] = undefined;
                                            //opposite direction
                                            bottomLine[INDEX_X2] = bottomLeftCellX2;
                                            bottomLine[INDEX_Y2] = bottomLeftCellY2;
                                        }
                                    }

                                }

                                if (topLine) {
                                    boundaries.push(topLine);
                                    currentAddedCellIndexes[INDEX_TOP_LINE] = boundaries.length - 1;
                                }
                                boundaries.push(rightLine);
                                currentAddedCellIndexes[INDEX_RIGHT_LINE] = boundaries.length - 1;
                                boundaries.push(bottomLine);
                                currentAddedCellIndexes[INDEX_BOTTOM_LINE] = boundaries.length - 1;
                                if (leftLine) {
                                    boundaries.push(leftLine);
                                    currentAddedCellIndexes[INDEX_LEFT_LINE] = boundaries.length - 1;
                                }
                                //save values indexes cols info
                                currentRowIndexes.set(col, currentAddedCellIndexes);
                            }

                        }
                        mapIndex++;
                    }
                    if (currentRowIndexes.size > 0) {
                        //save values indexes rows info
                        boundariesRowsIndexes.set(row, currentRowIndexes);
                    }
                    mapIndex += skipColsRight;
                }
                if (verticesBufferData.length > 0 && texturesBufferData.length > 0) {
                    this.#bindTileImages(verticesBufferData, texturesBufferData, atlasImage, tileset.name);
                }
            }
            
            if (setBoundaries) {
                const filtered = boundaries.filter(array => array);
                this.screenPageData._addBoundariesArray(filtered);
            }
            resolve();
        });
    }
    
    _prepareBindRenderObjectPromises() {
        for (let i = 0; i < this.#renderObjects.length; i++) {
            const object = this.#renderObjects[i];
            if (object.isRemoved) {
                this.#renderObjects.splice(i, 1);
                i--;
            }
            if (object.isAnimations) {
                object._processActiveAnimations();
            }
            const promise = this.#bindRenderObject(object).catch((err) => {
                Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, err);
                return Promise.reject(err);
            });
            this.#bindRenderObjectPromises.push(promise);
        }
    }

    _prepareBindBoundariesPromise() {
        this.#bindRenderObjectPromises.push(this.#drawBoundariesWebGl().catch((err) => {
            Exception(ERROR_CODES.UNHANDLED_PREPARE_EXCEPTION, err);
        }));
    }

    _executeBindRenderObjectPromises () {
        return Promise.allSettled(this.#bindRenderObjectPromises).then((bindResults) => {
            this.#clearRenderObjectPromises();
            return Promise.resolve(bindResults);
        });
    }

    #getImage(key) {
        return this.loader.getImage(key);
    }

    #bindTileImages(verticesBufferData, texturesBufferData,  atlasImage, image_name, drawMask, rotation, translation) {
        this.#webGlInterface._bindTileImages(verticesBufferData, texturesBufferData, atlasImage, image_name, drawMask, rotation, translation);
    }

    #clearTileMapPromises() {
        this.#bindTileMapPromises = [];
    }

    #bindRenderObject(renderObject) {
        return new Promise((resolve) => {
            const [ xOffset, yOffset ] = this.#isStatic === true ? [0,0] : this.screenPageData.worldOffset,
                x = renderObject.x - xOffset,
                y = renderObject.y - yOffset;

            if (renderObject.type === CONST.DRAW_TYPE.IMAGE) {
                const atlasImage = this.#getImage(renderObject.key),
                    animationIndex = renderObject.imageIndex;
                let imageX = 0,
                    imageY = 0;
                if (animationIndex !== 0) {
                    const imageColsNumber = atlasImage.width / renderObject.width;
                    imageX = animationIndex % imageColsNumber * renderObject.width,
                    imageY = Math.floor(animationIndex / imageColsNumber) * renderObject.height;
                }
                const posX = x - renderObject.width / 2,
                    posY = y - renderObject.height / 2;
                const vecX1 = posX,
                    vecY1 = posY,
                    vecX2 = vecX1 + renderObject.width,
                    vecY2 = vecY1 + renderObject.height,
                    texX1 = 1 / atlasImage.width * imageX,
                    texY1 = 1 / atlasImage.height * imageY,
                    texX2 = texX1 + (1 / atlasImage.width * renderObject.width),
                    texY2 = texY1 + (1 / atlasImage.height * renderObject.height);
                const verticesBufferData = [
                        vecX1, vecY1,
                        vecX2, vecY1,
                        vecX1, vecY2,
                        vecX1, vecY2,
                        vecX2, vecY1,
                        vecX2, vecY2
                    ],
                    texturesBufferData = [
                        texX1, texY1,
                        texX2, texY1,
                        texX1, texY2,
                        texX1, texY2,
                        texX2, texY1,
                        texX2, texY2
                    ];
                this.#webGlInterface._bindAndDrawTileImages(verticesBufferData, texturesBufferData, atlasImage, renderObject.key, renderObject.rotation, [x, y]);
                //ctx.restore();
            } else if (renderObject.type === CONST.DRAW_TYPE.TEXT) {
                this.#webGlInterface._bindText(x, y, renderObject);
            } else if (renderObject.type === CONST.DRAW_TYPE.CIRCLE) {
                this.#webGlInterface._bindConus(renderObject, renderObject.rotation, [x, y]);
            } else if (renderObject.type === CONST.DRAW_TYPE.LINE) {
                this.#webGlInterface._drawLines(renderObject.vertices, renderObject.bgColor, this.systemSettings.gameOptions.boundariesWidth);
            } else {
                this.#webGlInterface._bindPrimitives(renderObject, renderObject.rotation, [x, y]);
            }
            if (renderObject.boundaries && this.systemSettings.gameOptions.boundaries.drawObjectBoundaries) {
                const shiftX = x,// - renderObject.boundaries[0],
                    shiftY = y,// - renderObject.boundaries[1],
                rotation = renderObject.rotation ? renderObject.rotation : 0;
                this.#webGlInterface._drawPolygon(renderObject.boundaries, this.systemSettings.gameOptions.boundaries.boundariesColor, this.systemSettings.gameOptions.boundaries.boundariesWidth, rotation, [shiftX, shiftY]);
            }
            return resolve();
        });
    }

    #clearRenderObjectPromises() {
        this.#bindRenderObjectPromises = [];
    }

    #drawBoundariesWebGl() {
        return new Promise((resolve) => {
            const b = this.screenPageData.getBoundaries(),
                len = b.length,
                linesArray = [];
        
            for (let i = 0; i < len; i++) {
                const item = b[i];
                linesArray.push(item[0], item[1]);
                linesArray.push(item[2], item[3]);
            }
            this.#webGlInterface._drawLines(linesArray, this.systemSettings.gameOptions.boundaries.boundariesColor, this.systemSettings.gameOptions.boundaries.boundariesWidth);
            resolve();
        });
    }
}