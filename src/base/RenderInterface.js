import { TiledRenderLayer } from "./TiledRenderLayer.js";
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
 * RenderInterface class represents on how the drawObjects
 * should be drawn and the render itself
 * @see {@link ScreenPage} a part of ScreenPage
 * @hideconstructor
 */
export class RenderInterface {
    /**
     * @type {HTMLCanvasElement}
     */
    #canvas;
    /**
     * @type {WebGLRenderingContext}
     */
    #drawContext;
    /**
     * @type {boolean}
     */
    #isCleared;
    /**
     * @type {boolean}
     */
    #isActive;
    /**
     * @type {WebGlInterface}
     */
    #webGlInterface;
    /**
     * @type {ScreenPageData}
     */
    #currentScreenPageData;

    /**
     * SystemInterface.systemSettings
     * @type {SystemSettings}
     */
    #systemSettingsReference;
    /**
     * A reference to the systemInterface.loader
     * @type {AssetsManager}
     */
    #loaderReference;
    /**
     * @type {Array<number>}
     */
    #tempFPStime;
    /**
     * @type {NodeJS.Timer}
     */
    #fpsAverageCountTimer;
    /**
     * @type {boolean}
     */
    #isBoundariesPrecalculations = false;
    #minCircleTime;
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();
    #bindRenderLayerMethod;

    #registeredWebGlPrograms = new Map();
    #registeredRenderObjects = new Map();

    /**
     * @type {Array<() => Promise<void>>}
     */
    #initPromises = [];
    constructor(systemSettings, loader, canvasContainer) {
        this.#isCleared = false;
        this.#canvas = document.createElement("canvas");
        canvasContainer.appendChild(this.#canvas);
        this.#drawContext = this.#canvas.getContext("webgl", {stencil: true});

        this.#systemSettingsReference = systemSettings;
        this.#loaderReference = loader;

        this.#tempFPStime = [];
        this.#minCircleTime = this.systemSettings.gameOptions.render.minCircleTime;

        this.#isBoundariesPrecalculations = this.systemSettings.gameOptions.render.boundaries.wholeWorldPrecalculations;

        this.#webGlInterface = new WebGlInterface(this.#drawContext, this.#systemSettingsReference.gameOptions.checkWebGlErrors);
        switch (this.systemSettings.gameOptions.optimization) {
            case CONST.OPTIMIZATION.NATIVE_JS.OPTIMIZED:
                this.#bindRenderLayerMethod = this.#bindRenderLayer;
                break;
            case CONST.OPTIMIZATION.NATIVE_JS.NOT_OPTIMIZED:
                this.#bindRenderLayerMethod = this.#bindRenderLayerOld;
                break;
            case CONST.OPTIMIZATION.WEB_ASSEMBLY.WASM:
                this.#bindRenderLayerMethod = this.#bindRenderLayerWM;
                this.registerRenderInit(this._initiateWasm);
                break;
            case CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT:
                Warning("Sorry, " + CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT + ", is not supported, switching to default");
            default:
                this.#bindRenderLayerMethod = this.#bindRenderLayer;
        }

        this.registerRenderInit(this.#webGlInterface._initiateImagesDrawProgram);
        this.registerRenderInit(this.#webGlInterface._initPrimitivesDrawProgram);
        this.registerRenderInit(this.#webGlInterface._initWebGlAttributes);
    }

    /**
     * 
     * @param {string} eventName 
     * @param {*} listener 
     * @param {*=} options 
     */
    addEventListener = (eventName, listener, options) => {
        this.#emitter.addEventListener(eventName, listener, options);
    };

    /**
     * 
     * @param {string} eventName 
     * @param {*} listener 
     * @param {*=} options 
     */
    removeEventListener = (eventName, listener, options) => {
        this.#emitter.removeEventListener(eventName, listener, options);
    };

     /**
     * 
     * @returns {Promise<void>}
     */
    _initiateWasm = () => {
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

    get screenPageData() {
        return this.#currentScreenPageData;
    }

    get systemSettings() {
        return this.#systemSettingsReference;
    }

    get loader() {
        return this.#loaderReference;
    }

    get canvas() {
        return this.#canvas;
    }

    get drawContext() {
        return this.#drawContext;
    }

    /**
     * 
     * @param {string} eventName
     * @param  {...any} eventParams
     */
    emit = (eventName, ...eventParams) => {
        const event = new Event(eventName);
        event.data = [...eventParams];
        this.#emitter.dispatchEvent(event);
    };

    /**
     * Determines if all added files was loaded or not
     * @returns {boolean}
     */
    isAllFilesLoaded = () => {
        return this.loader.filesWaitingForUpload === 0;
    };

    initiateContext = () => {
        return Promise.all(this.#initPromises);
    }

    clearContext() {
        this.#webGlInterface._clearView();
    }

    setCanvasSize(width, height) {
        this.#canvas.width = width;
        this.#canvas.height = height;
        if (this.#webGlInterface) {
            this.#webGlInterface._fixCanvasSize(width, height);
        }
    }

    /****************************
     *  Extend functionality
     ****************************/
    /**
     * 
     * @param {*} programName 
     * @param {*} vertexShader 
     * @param {*} fragmentShader 
     */
    registerWebGlProgram(programName, vertexShader, fragmentShader) {

    }

    /**
     * 
     * @param {() => Promise<void>} method 
     * @returns {void}
     */
    registerRenderInit(method) {
        if (method() instanceof Promise) {
            this.#initPromises.push(method);
        } else {
            Exception(ERROR_CODES.UNEXPECTED_METHOD_TYPE, "registerRenderInit() accept only Promise based methods!");
        }
    }

    /**
     * 
     * @param {string} objectClassName - object name registered to DrawObjectFactory
     * @param {() => Promise<void>} objectRenderMethod - should be promise based
     * @param {*=} objectWebGlDrawProgram 
     */
    registerObjectRender(objectClassName, objectRenderMethod, objectWebGlDrawProgram) {
        if (objectRenderMethod() instanceof Promise) {
            this.#registeredRenderObjects.set(objectClassName, {method: objectRenderMethod, webglProgramName: objectWebGlDrawProgram});
        } else {
            Exception(ERROR_CODES.UNEXPECTED_METHOD_TYPE, "registerObjectRender() accept only Promise based methods!");
        }
    }

    /****************************
     *  End of Extend functionality
     ****************************/

    /**
     * @returns {Promise<void>}
     */
    async render() {
        return new Promise(async(resolve, reject) => {
            //if (!this._isCleared) {
            //    this.#clearWebGlContext();
            //}
            /*const renderLayers = this._renderLayers;
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
            }*/
            let renderObjectsPromises = [];
            const renderObjects = this.screenPageData.renderObjects;
            if (renderObjects.length !== 0) {
                //this.#checkCollisions(view.renderObjects);
                for (let i = 0; i < renderObjects.length; i++) {
                    const object = renderObjects[i];
                    if (object.isRemoved) {
                        renderObjects.splice(i, 1);
                        i--;
                        continue;
                    }
                    if (object.isAnimations) {
                        object._processActiveAnimations();
                    }
                    const promise = await this._bindRenderObject(object).catch((err) => {
                        reject(err);
                    });
                    renderObjectsPromises.push(promise);
                }
                if (this.systemSettings.gameOptions.boundaries.drawLayerBoundaries) {
                    renderObjectsPromises.push(this.#drawBoundariesWebGl().catch((err) => {
                        reject(err);
                    })); 
                }
                const bindResults = await Promise.allSettled(renderObjectsPromises);
                bindResults.forEach((result) => {
                    if (result.status === "rejected") {
                        reject(result.reason);
                    }
                });

                //await this.#webGlInterface._executeImagesDraw();

                this.#postRenderActions();
                    
                this._isCleared = false;
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
        if (this.#webGlInterface) {
            this.#webGlInterface._fixCanvasSize(width, height);
        }
    }

    set _isCleared(value) {
        this.#isCleared = value;
    }

    get _isCleared() {
        return this.#isCleared;
    }

    _createBoundariesPrecalculations() {
        //const promises = [];
        //for (const layer of this.#renderLayers) {
        //    promises.push(this.#layerBoundariesPrecalculation(layer).catch((err) => {
        //        Exception(ERROR_CODES.UNHANDLED_PREPARE_EXCEPTION, err);
        //    }));
        //}
        //return promises;
    }

    #clearWebGlContext() {
        this.#webGlInterface._clearView();
        this.#isCleared = true;
    }

    /**
     * 
     * @param {TiledRenderLayer} renderLayer 
     * @returns {Promise<void>}
     */
    #bindRenderLayerWM = (renderLayer) => {
        return new Promise((resolve, reject) => {
            const tilemap = this.loader.getTileMap(renderLayer.tileMapKey),
                tilesets = tilemap.tilesets,
                tilesetImages = tilesets.map((tileset) => this.loader.getImage(tileset.data.name)),
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
                if (this.screenPageData.isWorldBoundariesEnabled) {
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
                tilesetImages = tilesets.map((tileset) => this.loader.getImage(tileset.data.name)),
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
     * @param {TiledRenderLayer} renderLayer 
     * @returns {Promise<void>}
     */
    #bindRenderLayer(renderLayer) {
        return new Promise((resolve, reject) => {
            const tilemap = this.loader.getTileMap(renderLayer.tileMapKey),
                tilesets = tilemap.tilesets,
                tilesetImages = tilesets.map((tileset) => this.loader.getImage(tileset.data.name)),
                layerData = tilemap.layers.find((layer) => layer.name === renderLayer.layerKey),
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                tilewidth = dtwidth,
                tileheight = dtheight,
                [ settingsWorldWidth, settingsWorldHeight ] = this.screenPageData.worldDimensions,
                [ canvasW, canvasH ] = this.screenPageData.canvasDimensions,
                [ xOffset, yOffset ] = renderLayer.isOffsetTurnedOff === true ? [0,0] : this.screenPageData.worldOffset,
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
                if (setBoundaries) {
                    if (worldW !== settingsWorldWidth || worldH !== settingsWorldHeight) {
                        Warning(WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                        this.screenPageData._setWorldDimensions(worldW, worldH);
                    }
                    
                    // boundaries cleanups every draw circle, we need to set world boundaries again
                    if (this.screenPageData.isWorldBoundariesEnabled) {
                        this.screenPageData._setMapBoundaries();
                    }
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
                    //this.#bindTileImages(verticesBufferData, texturesBufferData, atlasImage, tileset.name, renderLayer._maskId);
                    const v = new Float32Array(verticesBufferData);
                    const t = new Float32Array(texturesBufferData);
                    this.#bindTileImages(v, t, atlasImage, tileset.name, renderLayer._maskId);
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
        const images = this.screenPageData.getObjectsByInstance(DrawImageObject);
        for (let i = 0; i < images.length; i++) {
            const object = images[i];
            if (object.isAnimations) {
                object._processActiveAnimations();
            }
        }
    }

    #bindTileImages(verticesBufferData, texturesBufferData, atlasImage, image_name, shapeMaskId, drawMask, rotation, translation) {
        this.#webGlInterface._bindTileImages(verticesBufferData, texturesBufferData, atlasImage, image_name, shapeMaskId, drawMask, rotation, translation);
    }

    //#clearTileMapPromises() {
    //    this.#bindTileMapPromises = [];
    //}

    /**
     * 
     * @param {TiledRenderLayer} renderLayer 
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
                    
                    if (this.screenPageData.isWorldBoundariesEnabled) {
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
     * @param {DrawImageObject | DrawCircleObject | DrawConusObject | DrawLineObject | DrawPolygonObject | DrawRectObject | DrawTextObject | TiledRenderLayer} renderObject 
     * @returns {Promise<void>}
     */
    _bindRenderObject(renderObject) {
        if (renderObject instanceof TiledRenderLayer) {
            return this.#bindRenderLayerMethod(renderObject)
                .then(() => this.#webGlInterface._executeTileImagesDraw());
        } else {
            return new Promise((resolve) => {
                const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : this.screenPageData.worldOffset,
                    x = renderObject.x - xOffset,
                    y = renderObject.y - yOffset;

                if (renderObject.type === CONST.DRAW_TYPE.IMAGE) {
                    const atlasImage = this.loader.getImage(renderObject.key),
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
                    this.#webGlInterface._bindAndDrawTileImages(verticesBufferData, texturesBufferData, atlasImage, renderObject.key, renderObject.rotation, [x, y], [1, 1], renderObject._maskId);
                    if (renderObject.vertices && this.systemSettings.gameOptions.boundaries.drawObjectBoundaries) {
                        const shiftX = x,// - renderObject.boundaries[0],
                            shiftY = y,// - renderObject.boundaries[1],
                            rotation = renderObject.rotation ? renderObject.rotation : 0;
                        this.#webGlInterface._drawPolygon(renderObject.vertices, this.systemSettings.gameOptions.boundaries.boundariesColor, this.systemSettings.gameOptions.boundaries.boundariesWidth, rotation, [shiftX, shiftY]);
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

    #countFPSaverage() {
        const timeLeft = this.systemSettings.gameOptions.render.averageFPStime,
            steps = this.#tempFPStime.length;
        let fullTime = 0;

        for(let i = 0; i < steps; i++) {
            const timeStep = this.#tempFPStime[i];
            fullTime += timeStep;
        }
        console.log("FPS average for ", timeLeft/1000, "sec, is ", fullTime / steps);

        // cleanup
        this.#tempFPStime = [];
    }

    startRender = async (/*time*/screenPageData) => {
        //Logger.debug("_render " + this.name + " class");
        this.#isActive = true;
        this.#currentScreenPageData = screenPageData;
        const [canvasWidth, canvasHeight] = this.#currentScreenPageData.canvasDimensions;
        this.setCanvasSize(canvasWidth, canvasHeight);
        switch (this.systemSettings.gameOptions.library) {
            case CONST.LIBRARY.WEBGL:
                //if (this.isAllFilesLoaded()) {
                    //render
                    await this.#prepareViews();
                //} else {
                //    Warning(WARNING_CODES.ASSETS_NOT_READY, "Is page initialization phase missed?");
                //    this.stopRender();
                //}
                // wait for the end of the execution stack, before start next iteration
                setTimeout(() => requestAnimationFrame(this.#drawViews));
                break;
        }
        this.#fpsAverageCountTimer = setInterval(() => this.#countFPSaverage(), this.systemSettings.gameOptions.render.averageFPStime);
    };

    stopRender = () => {
        this.#isActive = false;
        this.#currentScreenPageData = null;
        clearInterval(this.#fpsAverageCountTimer);
    }
    /**
     * 
     * @returns {Promise<void>}
     */
    #prepareViews() {
        return new Promise((resolve, reject) => {
            let viewPromises = [];
            const isBoundariesPrecalculations = this.#isBoundariesPrecalculations;
            viewPromises.push(this.initiateContext());
            if (isBoundariesPrecalculations) {
                console.warn("isBoundariesPrecalculations() is turned off");
                //for (const view of this.#views.values()) {
                //viewPromises.push(this.#renderInterface._createBoundariesPrecalculations());
                //}
            }
            Promise.allSettled(viewPromises).then((drawingResults) => {
                drawingResults.forEach((result) => {
                    if (result.status === "rejected") {
                        const error = result.reason;
                        Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, error);
                        reject(error);
                    }
                });
                resolve();
            });
        });
    }

    #drawViews = async (/*drawTime*/) => {
        const pt0 = performance.now(),
            minCircleTime = this.#minCircleTime;
            
        let viewPromises = [];
        this.emit(CONST.EVENTS.SYSTEM.RENDER.START);
        this.screenPageData._clearBoundaries();
        this.clearContext();
        
        //for (const [key, view] of this.#views.entries()) {
        //    const render = await view.render(key);
        //    viewPromises.push(render);
        //}
        const render = await this.render();
        viewPromises.push(render);
        Promise.allSettled(viewPromises).then((drawingResults) => {
            drawingResults.forEach((result) => {
                if (result.status === "rejected") {
                    Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason);
                    this.stopRender();
                }
            });
            const r_time = performance.now() - pt0,
                r_time_less = minCircleTime - r_time,
                wait_time = r_time_less > 0 ? r_time_less : 0,
                fps = 1000 / (r_time + wait_time);
            //console.log("draw circle done, take: ", (r_time), " ms");
            //console.log("fps: ", fps);
            this.emit(CONST.EVENTS.SYSTEM.RENDER.END);
            if(fps === Infinity) {
                console.log("infinity time");
            }
            this.#tempFPStime.push(fps);
            if (this.#isActive) {
                setTimeout(() => requestAnimationFrame(this.#drawViews), wait_time);
            }
        });
    };
}