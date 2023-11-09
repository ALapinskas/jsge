import { RenderLayer } from "./RenderLayer.js";
import { Exception, Warning } from "./Exception.js";
import { ERROR_CODES, WARNING_CODES } from "../constants.js";
import { WebGlInterface } from "./WebGlInterface.js";
import { SystemSettings } from "../configs.js";
import { ScreenPageData } from "./ScreenPageData.js";
import AssetsManager from "../../modules/assetsm/dist/assetsm.min.js";
//import { calculateBufferData } from "../wa/release.js";
import { CONST } from "../constants.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawCircleObject } from "./DrawCircleObject.js";
import { DrawConusObject } from "./DrawConusObject.js";
import { DrawLineObject } from "./DrawLineObject.js";
import { DrawPolygonObject } from "./DrawPolygonObject.js";
import { DrawRectObject } from "./DrawRectObject.js";
import { DrawTextObject } from "./DrawTextObject.js";

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
    #isOffsetTurnedOff;
    /**
     * @type {boolean}
     */
    #optimization = false;
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
     * @type {Array<DrawImageObject | DrawCircleObject | DrawConusObject | DrawLineObject | DrawPolygonObject | DrawRectObject | DrawTextObject>}
     */
    #renderObjects;
    /**
     * @type {Array<RenderLayer>}
     */
    #renderLayers;
    #bindRenderLayerMethod;

    constructor(name, systemSettings, screenPageData, loader, isOffsetTurnedOff, zIndex) {
        this.#canvas = document.createElement("canvas");
        this.#canvas.id = name;
        this.#canvas.style.zIndex = zIndex;
        this.#canvas.style.position = "absolute";
        this.#isCleared = false;
        this.#isOffsetTurnedOff = isOffsetTurnedOff;

        this.#screenPageData = screenPageData;
        this.#systemSettings = systemSettings;
        this.#loader = loader;
        this.#renderObjects = [];
        this.#renderLayers = [];

        switch (this.systemSettings.gameOptions.optimization) {
            case CONST.OPTIMIZATION.NATIVE_JS.OPTIMIZED:
                this.#bindRenderLayerMethod = this.#bindRenderLayer;
                break;
            case CONST.OPTIMIZATION.NATIVE_JS.NOT_OPTIMIZED:
                this.#bindRenderLayerMethod = this.#bindRenderLayerOld;
                break;
            case CONST.OPTIMIZATION.WEB_ASSEMBLY.WASM:
                this.#bindRenderLayerMethod = this.#bindRenderLayerWM;
                break;
            case CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT:
                Warning("Sorry, " + CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT + ", is not supported, switching to default");
            default:
                this.#bindRenderLayerMethod = this.#bindRenderLayer;
        }
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
     * @param {Object} instance - drawObjectInstance to retrieve 
     * @returns {Array<Object>}
     */
    getObjectsByInstance(instance) {
        return this.#renderObjects.filter((object) => object instanceof instance);
    }

    /**
     * 
     * @returns {Promise<void>}
     */
    initiateWasm = () => {
        return new Promise((resolve, reject) => {
            this.layerData = new WebAssembly.Memory({initial:50});
            this.layerDataFloat32 = new Float32Array(this.layerData.buffer);
            const importObject = {
                env: {
                    data: this.layerData,
                    logi: console.log,
                    logf: console.log
                }
            };

            fetch("/src/wa/calculateBufferData.wasm")
            .then((response) => response.arrayBuffer())
            .then((module) => WebAssembly.instantiate(module, importObject))
            .then((obj) => {
                this.calculateBufferData = obj.instance.exports.calculateBufferData;
                resolve();
            });
        })
    }

    /**
     * 
     * @returns {Promise}
     */
    initiateContext() {
        const webgl = this.#canvas.getContext("webgl");
        if (webgl) {
            this.#drawContext = webgl;
            this.#webGlInterface = new WebGlInterface(this.#drawContext, this.#systemSettings.gameOptions.checkWebGlErrors);
            
            return Promise.all([this.#webGlInterface._initiateImagesDrawProgram(),
                this.#webGlInterface._initPrimitivesDrawProgram()]);
        } else {
            Exception(ERROR_CODES.WEBGL_ERROR, "webgl is not supported in this browser");
        }
    }

    /**
     * @param {string} key
     * @returns {Promise<void>}
     */
    async render(key) {
        return new Promise(async(resolve, reject) => {
            if (!this._isCleared) {
                this.#clearWebGlContext();
            }
            const renderLayers = this._renderLayers;
            if (renderLayers.length !== 0) {
                let renderLayerPromises = [];
                for (const layer of renderLayers) {
                    renderLayerPromises.push(this.#bindRenderLayerMethod(layer));
                }
                const bindResults = await Promise.allSettled(renderLayerPromises);
                bindResults.forEach((result) => {
                    if (result.status === "rejected") {
                        reject("reason: " + result.reason);
                    }
                });
                await this.#webGlInterface._executeTileImagesDraw();
            }
            let renderObjectsPromises = [];
            if (key === CONST.LAYERS.BOUNDARIES) {
                renderObjectsPromises.push(this.#drawBoundariesWebGl().catch((err) => {
                    reject(err);
                }));
            }
            const renderObjects = this.renderObjects;
            if (renderObjects.length !== 0) {
                //this.#checkCollisions(view.renderObjects);
                for (let i = 0; i < renderObjects.length; i++) {
                    const object = renderObjects[i];
                    if (object.isRemoved) {
                        renderObjects.splice(i, 1);
                        i--;
                        continue;
                    }
                    //if (object.isAnimations) {
                    //    object._processActiveAnimations();
                    //}
                    const promise = this._bindRenderObject(object).catch((err) => {
                        reject(err);
                    });
                    renderObjectsPromises.push(promise);
                }
            }
            const bindResults = await Promise.allSettled(renderObjectsPromises);
            bindResults.forEach((result) => {
                if (result.status === "rejected") {
                    reject(result.reason);
                }
            });

            this.#postRenderActions();
                
            this._isCleared = false;
            resolve();
        });
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

    /**
     * @returns {Array<RenderLayer>}
     */
    get _renderLayers() {
        return this.#renderLayers;
    }

    set _renderObject(object) {
        this.#renderObjects.push(object);
    } 

    set _renderObjects(objects) {
        this.#renderObjects = objects;
    } 

    /**
     * @param {RenderLayer} layer
     */
    set _renderLayers(layer) {
        this.#renderLayers.push(layer);
    }

    set _isCleared(value) {
        this.#isCleared = value;
    }

    get _isCleared() {
        return this.#isCleared;
    }

    _createBoundariesPrecalculations() {
        const promises = [];
        for (const layer of this.#renderLayers) {
            promises.push(this.#layerBoundariesPrecalculation(layer).catch((err) => {
                Exception(ERROR_CODES.UNHANDLED_PREPARE_EXCEPTION, err);
            }));
        }
        return promises;
    }

    /**
     * @ignore
     */
    _enableMapBoundaries() {
        this.#isWorldBoundariesEnabled = true;
    }

    #clearWebGlContext() {
        this.#webGlInterface._clearView();
        this.#isCleared = true;
    }

    /**
     * 
     * @param {RenderLayer} renderLayer 
     * @returns {Promise<void>}
     */
    #bindRenderLayerWM = (renderLayer) => {
        return new Promise((resolve, reject) => {
            const tilemap = this.loader.getTileMap(renderLayer.tileMapKey),
                tilesets = tilemap.tilesets,
                tilesetImages = tilesets.map((tileset) => this.#getImage(tileset.data.name)),
                layerData = tilemap.layers.find((layer) => layer.name === renderLayer.layerKey),
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                offsetDataItemsFullNum = layerData.data.length,
                offsetDataItemsFilteredNum = layerData.data.filter((item) => item !== 0).length,
                setBoundaries = false, //renderLayer.setBoundaries,
                [ settingsWorldWidth, settingsWorldHeight ] = this.screenPageData.worldDimensions;
                //[ canvasW, canvasH ] = this.screenPageData.drawDimensions,
                //[ xOffset, yOffset ] = this.screenPageData.worldOffset;

            //clear data
            //this.layerDataFloat32.fill(0);
            this.layerDataFloat32.set(layerData.data);
            if (!layerData) {
                Warning(WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }
            
            for (let i = 0; i < tilesets.length; i++) {
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
                    worldW = tilewidth * layerCols,
                    worldH = tileheight * layerRows,
                    atlasImage = tilesetImages[i],
                    atlasWidth = atlasImage.width,
                    atlasHeight = atlasImage.height,
                    items = layerRows * layerCols,
                    dataCellSizeBytes = 4,
                    vectorCoordsItemsNum = 12,
                    texturesCoordsItemsNum = 12,
                    vectorDataItemsNum = offsetDataItemsFilteredNum * vectorCoordsItemsNum,
                    texturesDataItemsNum = offsetDataItemsFilteredNum * texturesCoordsItemsNum;
                
                if (worldW !== settingsWorldWidth || worldH !== settingsWorldHeight) {
                    Warning(WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                    this.screenPageData._setWorldDimensions(worldW, worldH);
                }

                //if (this.canvas.width !== worldW || this.canvas.height !== worldH) {
                //    this._setCanvasSize(worldW, worldH);
                //}

                // boundaries cleanups every draw circle, we need to set world boundaries again
                if (this.#isWorldBoundariesEnabled) {
                    this.screenPageData._setMapBoundaries();
                }
                this.calculateBufferData(dataCellSizeBytes, offsetDataItemsFullNum, vectorDataItemsNum, layerRows, layerCols, dtwidth, dtheight, tilewidth, tileheight, atlasColumns, atlasWidth, atlasHeight, setBoundaries);
                //const [verticesBufferData, texturesBufferData] = calculateBufferData(layerRows, layerCols, layerData.data, dtwidth, dtheight, tilewidth, tileheight, atlasColumns, atlasWidth, atlasHeight, setBoundaries);
                
                const verticesBufferData = this.layerDataFloat32.slice(offsetDataItemsFullNum, vectorDataItemsNum + offsetDataItemsFullNum),
                    texturesBufferData = this.layerDataFloat32.slice(vectorDataItemsNum + offsetDataItemsFullNum, vectorDataItemsNum + texturesDataItemsNum + offsetDataItemsFullNum);
                //console.log(verticesBufferData);
                //console.log(texturesBufferData);
                this.#bindTileImages(verticesBufferData, texturesBufferData, atlasImage, tileset.name);
                if (setBoundaries) {
                    this.screenPageData._mergeBoundaries();
                    renderLayer.setBoundaries = false;
                }
                resolve();
            }
        });
    }

    #bindRenderLayerOld = (renderLayer) => {
        return new Promise((resolve, reject) => {
            const tilemap = this.loader.getTileMap(renderLayer.tileMapKey),
                tilesets = tilemap.tilesets,
                tilesetImages = tilesets.map((tileset) => this.#getImage(tileset.data.name)),
                layerData = tilemap.layers.find((layer) => layer.name === renderLayer.layerKey),
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                setBoundaries = renderLayer.setBoundaries,
                [ settingsWorldWidth, settingsWorldHeight ] = this.screenPageData.worldDimensions,
                [ canvasW, canvasH ] = this.screenPageData.canvasDimensions,
                [ xOffset, yOffset ] = this.screenPageData.worldOffset,
                verticesBufferData = [],
                texturesBufferData = [];
                
            if (!layerData) {
                Warning(WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }
            for (let i = 0; i <= tilesets.length - 1; i++) {
                const tileset = tilesets[i].data,
                    //tilesetImages = this.loader.getTilesetImageArray(tileset.name),
                    
                    tilewidth = tileset.tilewidth,
                    tileheight = tileset.tileheight,
                    atlasRows = tileset.imageheight / tileheight,
                    atlasColumns = tileset.imagewidth / tilewidth,
                    layerCols = layerData.width,
                    layerRows = layerData.height,
                    worldW = tilewidth * layerCols,
                    worldH = tileheight * layerRows,
                    visibleCols = Math.ceil(canvasW / tilewidth),
                    visibleRows = Math.ceil(canvasH / tileheight),
                    offsetCols = layerCols - visibleCols,
                    offsetRows = layerRows - visibleRows,
                    atlasImage = tilesetImages[i],
                    atlasWidth = atlasImage.width,
                    atlasHeight = atlasImage.height;
                    
                let mapIndex = 0;
                if (worldW !== settingsWorldWidth || worldH !== settingsWorldHeight) {
                    Warning(WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                    this.screenPageData._setWorldDimensions(worldW, worldH);
                }
                for (let row = 0; row < layerRows; row++) {
                    for (let col = 0; col < layerCols; col++) {
                        let tile = layerData.data[mapIndex],
                            mapPosX = col * dtwidth,
                            mapPosY = row * dtheight,
                            mapPosXWithOffset = col * dtwidth - xOffset,
                            mapPosYWithOffset = row * dtheight - yOffset;
                        
                        if (tile !== 0) {
                            tile -= 1;
                            const atlasPosX = tile % atlasColumns * tilewidth,
                                atlasPosY = Math.floor(tile / atlasColumns) * tileheight,
                                vecX1 = mapPosXWithOffset,
                                vecY1 = mapPosYWithOffset,
                                vecX2 = mapPosXWithOffset + tilewidth,
                                vecY2 = mapPosYWithOffset + tileheight,
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

                        }
                        mapIndex++;
                    }
                }
                const v = new Float32Array(verticesBufferData);
                const t = new Float32Array(texturesBufferData);
                this.#bindTileImages(v, t, atlasImage, tileset.name);
            }
            resolve();
        });
    }

    /**
     * 
     * @param {RenderLayer} renderLayer 
     * @returns {Promise<void>}
     */
    #bindRenderLayer(renderLayer) {
        return new Promise((resolve, reject) => {
            const tilemap = this.loader.getTileMap(renderLayer.tileMapKey),
                tilesets = tilemap.tilesets,
                tilesetImages = tilesets.map((tileset) => this.#getImage(tileset.data.name)),
                layerData = tilemap.layers.find((layer) => layer.name === renderLayer.layerKey),
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                tilewidth = dtwidth,
                tileheight = dtheight,
                [ settingsWorldWidth, settingsWorldHeight ] = this.screenPageData.worldDimensions,
                [ canvasW, canvasH ] = this.screenPageData.canvasDimensions,
                [ xOffset, yOffset ] = this.#isOffsetTurnedOff === true ? [0,0] : this.screenPageData.worldOffset,
                boundariesCalculations = this.systemSettings.gameOptions.render.boundaries.realtimeCalculations,
                setBoundaries = renderLayer.setBoundaries && boundariesCalculations;
                
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
                    // sometimes canvasW/H may be bigger than world itself
                    screenRows = worldH > canvasH ? Math.ceil(canvasH / tileheight) + 1 : layerRows,
                    screenCols = worldW > canvasW ? Math.ceil(canvasW / tilewidth) + 1 : layerCols,
                    skipColsRight = layerCols - screenCols - skipColsLeft,

                    verticesBufferData = [],
                    texturesBufferData = [];
                if (worldW !== settingsWorldWidth || worldH !== settingsWorldHeight) {
                    Warning(WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                    this.screenPageData._setWorldDimensions(worldW, worldH);
                }

                // boundaries cleanups every draw circle, we need to set world boundaries again
                if (this.#isWorldBoundariesEnabled) {
                    this.screenPageData._setMapBoundaries();
                }

                let mapIndex = skipRowsTop * layerCols;

                for (let row = 0; row < screenRows; row++) {
                    mapIndex += skipColsLeft;
                    let currentRowIndexes = new Map();

                    for (let col = 0; col < screenCols; col++) {
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
                    const v = new Float32Array(verticesBufferData);
                    const t = new Float32Array(texturesBufferData);
                    this.#bindTileImages(v, t, atlasImage, tileset.name);
                }
            }
            
            if (setBoundaries) {
                // filter undefined value
                const filtered = boundaries.filter(array => array);
                this.screenPageData._addBoundariesArray(filtered);
            }
            resolve();
        });
    }

    #postRenderActions() {
        const images = this.getObjectsByInstance(DrawImageObject);
        for (let i = 0; i < images.length; i++) {
            const object = images[i];
            if (object.isAnimations) {
                object._processActiveAnimations();
            }
        }
    }

    #getImage(key) {
        return this.loader.getImage(key);
    }

    #bindTileImages(verticesBufferData, texturesBufferData,  atlasImage, image_name, drawMask, rotation, translation) {
        this.#webGlInterface._bindTileImages(verticesBufferData, texturesBufferData, atlasImage, image_name, drawMask, rotation, translation);
    }

    //#clearTileMapPromises() {
    //    this.#bindTileMapPromises = [];
    //}

    /**
     * 
     * @param {RenderLayer} renderLayer 
     * @returns {Promise<void>}
     */
    #layerBoundariesPrecalculation(renderLayer) {
        return new Promise((resolve, reject) => {
            if (renderLayer.setBoundaries) {
                const tilemap = this.loader.getTileMap(renderLayer.tileMapKey),
                    tilesets = tilemap.tilesets,
                    layerData = tilemap.layers.find((layer) => layer.name === renderLayer.layerKey),
                    { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                    tilewidth = dtwidth,
                    tileheight = dtheight,
                    [ settingsWorldWidth, settingsWorldHeight ] = this.screenPageData.worldDimensions;
                
                let boundaries = [];

                if (!layerData) {
                    Warning(WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                    reject();
                }
                
                for (let i = 0; i < tilesets.length; i++) {
                    const layerCols = layerData.width,
                        layerRows = layerData.height,
                        worldW = tilewidth * layerCols,
                        worldH = tileheight * layerRows;

                    if (worldW !== settingsWorldWidth || worldH !== settingsWorldHeight) {
                        Warning(WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                        this.screenPageData._setWorldDimensions(worldW, worldH);
                    }
                    
                    if (this.#isWorldBoundariesEnabled) {
                        this.screenPageData._setWholeWorldMapBoundaries();
                    }

                    //calculate boundaries
                    let mapIndex = 0;

                    for (let row = 0; row < layerRows; row++) {
                        for (let col = 0; col < layerCols; col++) {
                            let tile = layerData.data[mapIndex],
                                mapPosX = col * tilewidth,
                                mapPosY = row * tileheight;
                            if (tile !== 0) {
                                tile -= 1;
                                
                                boundaries.push([mapPosX, mapPosY, mapPosX + tilewidth, mapPosY]);
                                boundaries.push([mapPosX + tilewidth, mapPosY, mapPosX + tilewidth, mapPosY + tileheight]);
                                boundaries.push([mapPosX + tilewidth, mapPosY + tileheight, mapPosX, mapPosY + tileheight]);
                                boundaries.push([mapPosX, mapPosY + tileheight, mapPosX, mapPosY ]);
    
                            }
                            mapIndex++;
                        }
                    }
                }
                this.screenPageData._setWholeMapBoundaries(boundaries);
                this.screenPageData._mergeBoundaries(true);
                console.warn("precalculated boundaries set");
                console.log(this.screenPageData.getWholeWorldBoundaries());
                resolve();
            } else {
                resolve();
            }
        });
    }

    /**
     * 
     * @param {DrawImageObject | DrawCircleObject | DrawConusObject | DrawLineObject | DrawPolygonObject | DrawRectObject | DrawTextObject} renderObject 
     * @returns {Promise<void>}
     */
    _bindRenderObject(renderObject) {
        return new Promise((resolve) => {
            const [ xOffset, yOffset ] = this.#isOffsetTurnedOff === true ? [0,0] : this.screenPageData.worldOffset,
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
                if (this.systemSettings.gameOptions.boundaries.drawObjectBoundaries) {
                    const shiftX = x,// - renderObject.boundaries[0],
                        shiftY = y,// - renderObject.boundaries[1],
                        rotation = renderObject.rotation ? renderObject.rotation : 0;
                    if (renderObject.circleBoundaries) {
                        const vertices = renderObject._calculateConusVertices(renderObject.circleBoundaries.r);
                        this.#webGlInterface._bindConus({vertices, bgColor: this.systemSettings.gameOptions.boundaries.boundariesColor }, rotation, [shiftX, shiftY]);
                    } else {
                        this.#webGlInterface._drawPolygon(renderObject.vertices, this.systemSettings.gameOptions.boundaries.boundariesColor, this.systemSettings.gameOptions.boundaries.boundariesWidth, rotation, [shiftX, shiftY]);
                    }
                    
                }
                //ctx.restore();
            } else if (renderObject.type === CONST.DRAW_TYPE.TEXT) {
                this.#webGlInterface._bindText(x, y, renderObject);
            } else if (renderObject.type === CONST.DRAW_TYPE.CIRCLE || renderObject.type === CONST.DRAW_TYPE.CONUS) {
                this.#webGlInterface._bindConus(renderObject, renderObject.rotation, [x, y]);
            } else if (renderObject.type === CONST.DRAW_TYPE.LINE) {
                this.#webGlInterface._drawLines(renderObject.vertices, renderObject.bgColor, this.systemSettings.gameOptions.boundariesWidth, renderObject.rotation, [x, y]);
            } else {
                this.#webGlInterface._bindPrimitives(renderObject, renderObject.rotation, [x, y]);
            }
            return resolve();
        });
    }

    //#clearRenderObjectPromises() {
    //    this.#bindRenderObjectPromises = [];
    //}

    /**
     * 
     * @returns {Promise<void>}
     */
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