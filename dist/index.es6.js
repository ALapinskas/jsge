/******/ var __webpack_modules__ = ({

/***/ "./modules/assetsm/dist/assetsm.min.js":
/*!*********************************************!*\
  !*** ./modules/assetsm/dist/assetsm.min.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AssetsManager)
/* harmony export */ });
const PROGRESS_EVENT_TYPE={loadstart:"loadstart",progress:"progress",abort:"abort",error:"error",load:"load",timeout:"timeout"};class AssetsManager{#e;#t;#i;#s;#a;#r;#o;#n;constructor(){this.#t=new Map,this.#i=new Map,this.#s=new Map,this.#a=new Map,this.#r=new Map,this.#o=new Map,this.#e=new EventTarget,this.#n=0}get filesWaitingForUpload(){return this.#a.size+this.#o.size+this.#r.size}getAudio(e){const t=this.#t.get(e);if(t)return t;Warning("Audio with key '"+e+"' is not loaded")}getImage(e){const t=this.#i.get(e);if(t)return t;Warning("Image with key '"+e+"' is not loaded")}getTileMap(e){const t=this.#s.get(e);if(t)return t;Warning("Tilemap with key '"+e+"' is not loaded")}preload(){return this.#d(),Promise.allSettled(Array.from(this.#a.entries()).map((e=>this.#l(e[0],e[1])))).then((e=>(e.forEach((e=>{"rejected"===e.status&&Warning(e.reason||e.value)})),Promise.allSettled(Array.from(this.#o.entries()).map((e=>this.#h(e[0],e[1])))).then((e=>(e.forEach((e=>{"rejected"===e.status&&Warning(e.reason||e.value)})),Promise.allSettled(Array.from(this.#r.entries()).map((e=>this.#u(e[0],e[1])))).then((e=>(e.forEach((e=>{"rejected"===e.status&&Warning(e.reason||e.value)})),this.#m(),Promise.resolve())))))))))}addAudio(e,t){this.#c(e,t),this.#a.has(e)&&Warning("Audio with key "+e+" is already registered"),this.#a.set(e,t)}addImage(e,t){this.#c(e,t),this.#r.has(e)&&Warning("Image with key "+e+" is already registered"),this.#r.set(e,t)}addTileMap(e,t){this.#c(e,t),this.#o.has(e)&&Warning("Tilemap with key "+e+" is already registered"),this.#o.set(e,t)}addEventListener(e,t,...i){PROGRESS_EVENT_TYPE[e]?this.#e.addEventListener(e,t,...i):Warning("Event type should be one of the ProgressEvent.type")}removeEventListener(e,t,...i){this.#e.removeEventListener(e,t,...i)}#g(e,t){const{firstgid:i,source:s}=e;return this.#p(s),fetch(t+s).then((e=>e.json())).then((e=>{const{name:s,image:a}=e;return s&&a&&this.addImage(s,t?t+a:a,e),e.gid=i,Promise.resolve(e)})).catch((()=>{const e=new Error("Can't load related tileset ",s);return Promise.reject(e)}))}#h(e,t){return this.#E(t),fetch(t).then((e=>e.json())).then((i=>{let s,a=t.split("/"),r=a.length;if(a[r-1].includes(".tmj")||a[r-1].includes(".json")?(a.pop(),s=a.join("/")+"/"):(a[r-2].includes(".tmj")||a[r-2].includes(".json"))&&(a.splice(r-2,2),s=a.join("/")+"/"),this.#P(e,i),this.#T(e),i.tilesets&&i.tilesets.length>0){const t=[];return i.tilesets.forEach(((i,a)=>{const r=this.#g(i,s).then((t=>(this.#v(e,a,t),this.#w(),Promise.resolve())));t.push(r)})),Promise.all(t)}})).catch((e=>(e.message.includes("JSON.parse:")&&(e=new Error("Can't load tilemap "+t)),this.#Q(e),Promise.reject(e))))}#l(e,t){return new Promise(((i,s)=>{const a=new Audio(t);a.addEventListener("loadeddata",(()=>{this.#f(e,a),this.#L(e),this.#w(),i()})),a.addEventListener("error",(()=>{const e=new Error("Can't load audio "+t);this.#Q(e),s(e)}))}))}#u(e,t){return new Promise(((i,s)=>{const a=new Image;a.onload=()=>{createImageBitmap(a).then((t=>{this.#M(e,t),this.#j(e),this.#w(),i()}))},a.onerror=()=>{const e=new Error("Can't load image "+t);this.#Q(e),s(e)},a.src=t}))}#p(e){e.includes(".tsj")||e.includes(".json")||Exception("Related Tileset file type is not correct, only .tsj or .json files are supported")}#E(e){e.includes(".tmj")||e.includes(".json")||Exception("Tilemap file type is not correct, only .tmj or .json files are supported")}#c(e,t){const i="image key and url should be provided";e&&0!==e.trim().length||Exception(i),t&&0!==t.trim().length||Exception(i)}#f(e,t){this.#t.set(e,t)}#L(e){this.#a.delete(e)}#M(e,t){this.#i.set(e,t)}#j(e){this.#r.delete(e)}#v(e,t,i){this.#s.get(e).tilesets[t].data=i}#P(e,t){this.#s.set(e,t)}#T(e){this.#o.delete(e)}#d(){let e=this.filesWaitingForUpload;this.#e.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.loadstart,{total:e}))}#m(){this.#e.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.load))}#w(){const e=this.filesWaitingForUpload;this.#n+=1,this.#e.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.progress,{lengthComputable:!0,loaded:this.#n,total:e}))}#Q(e){this.#e.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.error,{error:e}))}}function Exception(e){throw new Error(e)}function Warning(e){console.warn(e)}

/***/ }),

/***/ "./src/base/AnimationEventImageObj.js":
/*!********************************************!*\
  !*** ./src/base/AnimationEventImageObj.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AnimationEventImageObj": () => (/* binding */ AnimationEventImageObj)
/* harmony export */ });
class AnimationEventImageObj {
    #eventName;
    /**
     * @type {Array<number>}
     */
    #animationSpriteIndexes;
    /**
     * @type {number}
     */
    #currentSpriteIndex;
    /**
     * @type {boolean}
     */
    #isActive;
    /**
     * @type {boolean}
     */
    #isRepeated;
    
    constructor(eventName, animationSpriteIndexes, isRepeated = false, currentSpriteIndex, isActive = false) {
        this.#eventName = eventName;
        this.#animationSpriteIndexes = animationSpriteIndexes;
        this.#currentSpriteIndex = currentSpriteIndex ? currentSpriteIndex : 0;
        this.#isActive = isActive;
        this.#isRepeated = isRepeated;
    }

    get isActive() {
        return this.#isActive;
    }

    get currentSprite() {
        return this.#animationSpriteIndexes[this.#currentSpriteIndex];
    }

    get isLastSprite() {
        return (this.#animationSpriteIndexes.length - 1) === this.#currentSpriteIndex;
    }

    iterateSprite() {
        if (!this.isLastSprite) {
            this.#currentSpriteIndex = this.#currentSpriteIndex + 1;
        } else {
            if (!this.#isRepeated) {
                this.#isActive = false;
            } else {
                this.#currentSpriteIndex = 0;
            }
        }
    }

    activateAnimation = () => {
        this.#isActive = true;
        this.#currentSpriteIndex = 0;
    };

    deactivateAnimation = () => {
        this.#isActive = false;
    };
}

/***/ }),

/***/ "./src/base/CanvasView.js":
/*!********************************!*\
  !*** ./src/base/CanvasView.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CanvasView": () => (/* binding */ CanvasView)
/* harmony export */ });
/* harmony import */ var _RenderLayer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./RenderLayer.js */ "./src/base/RenderLayer.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _WebGlInterface_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./WebGlInterface.js */ "./src/base/WebGlInterface.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _ScreenPageData_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ScreenPageData.js */ "./src/base/ScreenPageData.js");
/* harmony import */ var _modules_assetsm_dist_assetsm_min_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../modules/assetsm/dist/assetsm.min.js */ "./modules/assetsm/dist/assetsm.min.js");
/* harmony import */ var _DrawImageObject_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./DrawImageObject.js */ "./src/base/DrawImageObject.js");
/* harmony import */ var _DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./DrawCircleObject.js */ "./src/base/DrawCircleObject.js");
/* harmony import */ var _DrawConusObject_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./DrawConusObject.js */ "./src/base/DrawConusObject.js");
/* harmony import */ var _DrawLineObject_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./DrawLineObject.js */ "./src/base/DrawLineObject.js");
/* harmony import */ var _DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./DrawPolygonObject.js */ "./src/base/DrawPolygonObject.js");
/* harmony import */ var _DrawRectObject_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./DrawRectObject.js */ "./src/base/DrawRectObject.js");
/* harmony import */ var _DrawTextObject_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./DrawTextObject.js */ "./src/base/DrawTextObject.js");







//import { calculateBufferData } from "../wa/release.js";









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
class CanvasView {
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
    
    /**
     * @type {Array<Promise>}
     */
    #bindTileMapPromises;
    /**
     * @type {Array<Promise>}
     */
    #bindRenderObjectPromises;

    constructor(name, systemSettings, screenPageData, loader, isOffsetTurnedOff) {
        this.#canvas = document.createElement("canvas");
        this.#canvas.id = name;
        this.#canvas.style.position = "absolute";
        this.#isCleared = false;
        this.#isOffsetTurnedOff = isOffsetTurnedOff;

        this.#screenPageData = screenPageData;
        this.#systemSettings = systemSettings;
        this.#loader = loader;
        this.#renderObjects = [];
        this.#renderLayers = [];

        this.#bindTileMapPromises = [];
        this.#bindRenderObjectPromises = [];
        this.bindRenderLayerMethod = this.systemSettings.gameOptions.optimization === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT ? this._bindRenderLayerWM : this._bindRenderLayer;
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
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.ERROR_CODES.UNHANDLED_PREPARE_EXCEPTION, err);
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

    _initiateWebGlContext() {
        const webgl = this.#canvas.getContext("webgl");
        if (webgl) {
            this.#drawContext = webgl;
            this.#webGlInterface = new _WebGlInterface_js__WEBPACK_IMPORTED_MODULE_3__.WebGlInterface(this.#drawContext, this.#systemSettings.gameOptions.checkWebGlErrors);
            
            return Promise.all([this.#webGlInterface._initiateImagesDrawProgram(),
                this.#webGlInterface._initPrimitivesDrawProgram()]);
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.ERROR_CODES.WEBGL_ERROR, "webgl is not supported in this browser");
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
        for (const layer of this.#renderLayers) {
            this.#bindTileMapPromises.push(this.bindRenderLayerMethod(layer).catch((err) => {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.ERROR_CODES.UNHANDLED_PREPARE_EXCEPTION, err);
            }));
        }
    }

    _executeBindRenderLayerPromises() {
        return Promise.allSettled(this.#bindTileMapPromises).then((bindResults) => {
            this.#clearTileMapPromises();
            return Promise.resolve(bindResults);
        });
    }

    /**
     * 
     * @param {RenderLayer} renderLayer 
     * @returns {Promise<void>}
     */
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
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
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

    /**
     * 
     * @param {RenderLayer} renderLayer 
     * @returns {Promise<void>}
     */
    _bindRenderLayer(renderLayer) {
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
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
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
                        (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                        this.screenPageData._setWorldDimensions(worldW, worldH);
                    }
                    
                    // boundaries cleanups every draw circle, we need to set world boundaries again
                    if (this.#isWorldBoundariesEnabled) {
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
                    this.#bindTileImages(verticesBufferData, texturesBufferData, atlasImage, tileset.name);
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
    
    _prepareBindRenderObjectPromises() {
        for (let i = 0; i < this.#renderObjects.length; i++) {
            const object = this.#renderObjects[i];
            if (object.isRemoved) {
                this.#renderObjects.splice(i, 1);
                i--;
            }
            //if (object.isAnimations) {
            //    object._processActiveAnimations();
            //}
            const promise = this.#bindRenderObject(object).catch((err) => {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, err);
                return Promise.reject(err);
            });
            this.#bindRenderObjectPromises.push(promise);
        }
    }

    _prepareBindBoundariesPromise() {
        this.#bindRenderObjectPromises.push(this.#drawBoundariesWebGl().catch((err) => {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.ERROR_CODES.UNHANDLED_PREPARE_EXCEPTION, err);
        }));
    }

    _executeBindRenderObjectPromises () {
        return Promise.allSettled(this.#bindRenderObjectPromises).then((bindResults) => {
            this.#clearRenderObjectPromises();
            return Promise.resolve(bindResults);
        });
    }

    _postRenderActions() {
        const images = this.getObjectsByInstance(_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_7__.DrawImageObject);
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

    #clearTileMapPromises() {
        this.#bindTileMapPromises = [];
    }

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
                    (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                    reject();
                }
                
                for (let i = 0; i < tilesets.length; i++) {
                    const layerCols = layerData.width,
                        layerRows = layerData.height,
                        worldW = tilewidth * layerCols,
                        worldH = tileheight * layerRows;

                    if (worldW !== settingsWorldWidth || worldH !== settingsWorldHeight) {
                        (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
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
    #bindRenderObject(renderObject) {
        return new Promise((resolve) => {
            const [ xOffset, yOffset ] = this.#isOffsetTurnedOff === true ? [0,0] : this.screenPageData.worldOffset,
                x = renderObject.x - xOffset,
                y = renderObject.y - yOffset;

            if (renderObject.type === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.DRAW_TYPE.IMAGE) {
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
                if (renderObject.vertices && this.systemSettings.gameOptions.boundaries.drawObjectBoundaries) {
                    const shiftX = x,// - renderObject.boundaries[0],
                        shiftY = y,// - renderObject.boundaries[1],
                        rotation = renderObject.rotation ? renderObject.rotation : 0;
                    this.#webGlInterface._drawPolygon(renderObject.vertices, this.systemSettings.gameOptions.boundaries.boundariesColor, this.systemSettings.gameOptions.boundaries.boundariesWidth, rotation, [shiftX, shiftY]);
                }
                //ctx.restore();
            } else if (renderObject.type === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.DRAW_TYPE.TEXT) {
                this.#webGlInterface._bindText(x, y, renderObject);
            } else if (renderObject.type === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.DRAW_TYPE.CIRCLE || renderObject.type === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.DRAW_TYPE.CONUS) {
                this.#webGlInterface._bindConus(renderObject, renderObject.rotation, [x, y]);
            } else if (renderObject.type === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.DRAW_TYPE.LINE) {
                this.#webGlInterface._drawLines(renderObject.vertices, renderObject.bgColor, this.systemSettings.gameOptions.boundariesWidth, renderObject.rotation, [x, y]);
            } else {
                this.#webGlInterface._bindPrimitives(renderObject, renderObject.rotation, [x, y]);
            }
            return resolve();
        });
    }

    #clearRenderObjectPromises() {
        this.#bindRenderObjectPromises = [];
    }

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

/***/ }),

/***/ "./src/base/DrawCircleObject.js":
/*!**************************************!*\
  !*** ./src/base/DrawCircleObject.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawCircleObject": () => (/* binding */ DrawCircleObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");



/**
 * Conus object to draw.
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
class DrawCircleObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__.DrawShapeObject {
    /**
     * @type {number}
     */
    #radius;

    /**
     * @type {Array<number>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(x, y, radius, bgColor, cut) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CIRCLE, x, y, bgColor, cut);
        this.#radius = radius;
        this.#vertices = this._calculateConusVertices(radius);
    }

    /**
     * Array of [x,y] cords.
     * @type {Array<number>}
     */
    get vertices () {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
    }

    /**
     * @type {number}
     */
    get radius() {
        return this.#radius;
    }
}

/***/ }),

/***/ "./src/base/DrawConusObject.js":
/*!*************************************!*\
  !*** ./src/base/DrawConusObject.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawConusObject": () => (/* binding */ DrawConusObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");



/**
 * Conus object to draw.
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
class DrawConusObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__.DrawShapeObject {
    /**
     * @type {number}
     */
    #radius;

    /**
     * @type {number}
     */
    #angle;

    /**
     * Array of [x,y] cords.
     * @type {Array<number>}
     */
    #vertices;
    #fade_min;

    /**
     * @hideconstructor
     */
    constructor(x, y, radius, bgColor, angle, cut, fade = 0) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CONUS, x, y, bgColor, cut);
        this.#radius = radius;
        this.#angle = angle;
        this.#fade_min = fade;
        this.#vertices = this._calculateConusVertices(radius, angle);
    }

    /**
     * Array of [x,y] cords.
     * @type {Array<number>}
     */
    get vertices () {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
    }

    /**
     * @type {number}
     */
    get radius() {
        return this.#radius;
    }

    /**
     * @type {number}
     */
    get angle() {
        return this.#angle;
    }

    /**
     * @type {number}
     */
    get fade_min() {
        return this.#fade_min;
    }

    /**
     * @param {number} value - fade start pos in px
     */
    set fade_min(value) {
        this.#fade_min = value;
    }
}

/***/ }),

/***/ "./src/base/DrawImageObject.js":
/*!*************************************!*\
  !*** ./src/base/DrawImageObject.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawImageObject": () => (/* binding */ DrawImageObject)
/* harmony export */ });
/* harmony import */ var _AnimationEventImageObj_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AnimationEventImageObj.js */ "./src/base/AnimationEventImageObj.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");



/**
 * Image object to draw
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
class DrawImageObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_2__.DrawShapeObject {
    /**
     * @type {number}
     */
    #w;
    /**
     * @type {number}
     */
    #h;
    /**
     * Image sprite key
     * @type {string}
     */
    #key;
    /**
     * @type {EventTarget}
     */
    #emitter;
    /**
     * @type {Map<string, AnimationEventImageObj>}
     */
    #animations;
    /**
     * @type {number}
     */
    #imageIndex;
    /**
     * @type {Array<Array<number>>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(mapX, mapY, width, height, key, imageIndex = 0, boundaries) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.DRAW_TYPE.IMAGE, mapX, mapY);
        this.#key = key;
        this.#emitter = new EventTarget();
        this.#animations = new Map();
        this.#imageIndex = imageIndex;
        this.#w = width;
        this.#h = height;
        this.#vertices = boundaries ? this._convertVerticesArray(boundaries) : this._calculateRectVertices(width, height);
    }

    /**
     * @type {number}
     */
    get width() {
        return this.#w;
    }

    /**
     * @type {number}
     */
    get height() {
        return this.#h;
    }

    set width(w) {
        this.#w = w;
    }

    set height(h) {
        this.#h = h;
    }

    /**
     * A key should match an image loaded through AssetsManager
     * @type {string}
     */
    get key() {
        return this.#key;
    }

    /**
     * Current image index
     * @type {number}
     */
    get imageIndex() {
        return this.#imageIndex;
    }

    set imageIndex(value) {
        this.#imageIndex = value;
    }

    /**
     * Determines if image is animated or not
     * @type {boolean}
     */
    get isAnimations() {
        return this.#animations.size > 0;
    }

    /**
     * @deprecated - use .vertices instead 
     * @type {Array<Array<number>>}
     */
    get boundaries() {
        return this.#vertices;
    }

    get vertices() {
        return this.#vertices;
    }

    /**
     * @ignore
     */
    _processActiveAnimations() {
        for (let animationEvent of this.#animations.values()) {
            if (animationEvent.isActive) {
                animationEvent.iterateSprite();
                this.#imageIndex = animationEvent.currentSprite;
            }
        }
    }

    /**
     * Emit event
     * @param {string} eventName 
     * @param  {...any} eventParams 
     */
    emit(eventName, ...eventParams) {
        const event = new Event(eventName);
        event.data = [...eventParams];
        this.#emitter.dispatchEvent(event);
    }

    /**
     * Subscribe
     * @param {string} eventName 
     * @param {*} listener 
     * @param {*} options 
     */
    addEventListener(eventName, listener, options) {
        this.#emitter.addEventListener(eventName, listener, options);
    }

    /**
     * Unsubscribe
     * @param {string} eventName 
     * @param {*} listener 
     * @param {*} options 
     */
    removeEventListener(eventName, listener, options) {
        this.#emitter.removeEventListener(eventName, listener, options);
    }

    /**
     * Adds image animations
     * @param { string } eventName -animation name
     * @param { Array<number> } animationSpriteIndexes - animation image indexes
     * @param { boolean } [isRepeated = false] - animation is circled or not, circled animation could be stopped only with stopRepeatedAnimation();
     */
    addAnimation (eventName, animationSpriteIndexes, isRepeated) {
        const animationEvent = new _AnimationEventImageObj_js__WEBPACK_IMPORTED_MODULE_0__.AnimationEventImageObj(eventName, animationSpriteIndexes, isRepeated);
        this.#animations.set(eventName, animationEvent);
        this.addEventListener(eventName, this.#activateAnimation);
    }

    #activateAnimation = (event) => {
        const animationEvent = this.#animations.get(event.type);
        animationEvent.activateAnimation();
        this.#imageIndex = animationEvent.currentSprite;
    }; 

    /**
     *
     * @param {string} eventName - animation name
     */
    stopRepeatedAnimation (eventName) {
        this.#animations.get(eventName).deactivateAnimation();
    }

    /**
     * Removes animations
     */
    removeAllAnimations() {
        for (let [eventName, animationEvent] of this.#animations.entries()) {
            this.removeEventListener(eventName, animationEvent.activateAnimation);
            animationEvent.deactivateAnimation();
        }
        this.#animations.clear();
        this.#animations = undefined;
    }

    destroy() {
        this.removeAllAnimations();
        super.destroy();
    }
}

/***/ }),

/***/ "./src/base/DrawLineObject.js":
/*!************************************!*\
  !*** ./src/base/DrawLineObject.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawLineObject": () => (/* binding */ DrawLineObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");



/**
 * Line object to draw.
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
class DrawLineObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__.DrawShapeObject {
    /**
     * @type {Array<Array<number>>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(vertices, bgColor) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.LINE, vertices[0][0], vertices[0][1], bgColor);
        this.#vertices = vertices;
    }

    /**
     * @type {Array<Array<number>>}
     */
    get vertices () {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
    }
}

/***/ }),

/***/ "./src/base/DrawObjectFactory.js":
/*!***************************************!*\
  !*** ./src/base/DrawObjectFactory.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawObjectFactory": () => (/* binding */ DrawObjectFactory)
/* harmony export */ });
/* harmony import */ var _DrawRectObject_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DrawRectObject.js */ "./src/base/DrawRectObject.js");
/* harmony import */ var _DrawTextObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawTextObject.js */ "./src/base/DrawTextObject.js");
/* harmony import */ var _DrawConusObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DrawConusObject.js */ "./src/base/DrawConusObject.js");
/* harmony import */ var _DrawImageObject_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./DrawImageObject.js */ "./src/base/DrawImageObject.js");
/* harmony import */ var _DrawLineObject_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./DrawLineObject.js */ "./src/base/DrawLineObject.js");
/* harmony import */ var _DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./DrawPolygonObject.js */ "./src/base/DrawPolygonObject.js");
/* harmony import */ var _DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./DrawCircleObject.js */ "./src/base/DrawCircleObject.js");








/**
 * Creates drawObjects instances.<br>
 * accessible via ScreenPage.draw <br>
 * @see {@link ScreenPage} a part of ScreenPage
 */
class DrawObjectFactory {

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} backgroundColor - rgba(r,g,b,a)
     * @param {boolean=} cut
     * @returns {DrawRectObject}
     */
    rect(x, y, width, height, backgroundColor, cut) {
        return new _DrawRectObject_js__WEBPACK_IMPORTED_MODULE_0__.DrawRectObject(x, y, width, height, backgroundColor, cut); 
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {string} text 
     * @param {string} font - size fontFamily
     * @param {string} color - rgba(r,g,b,a)
     * @returns {DrawTextObject}
     */
    text(x, y, text, font, color) {
        return new _DrawTextObject_js__WEBPACK_IMPORTED_MODULE_1__.DrawTextObject(x, y, text, font, color);
    }

    /**
     * 
     * @param {number} radius 
     * @param {string} bgColor - rgba(r,g,b,a)
     * @param {number=} angle
     * @param {boolean=} [cut=false]
     * @param {number=} [fade=0] (0 - 1)
     * @returns {DrawConusObject}
     */
    conus(x, y, radius, bgColor, angle, cut=false, fade = 0) {
        return new _DrawConusObject_js__WEBPACK_IMPORTED_MODULE_2__.DrawConusObject(x, y, radius, bgColor, angle, cut, fade);
    }

    /**
     * 
     * @param {number} radius 
     * @param {string} bgColor - rgba(r,g,b,a)
     * @param {boolean=} cut
     * @returns {DrawCircleObject}
     */
    circle(x, y, radius, bgColor, cut) {
        return new _DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_6__.DrawCircleObject(x, y, radius, bgColor, cut);
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} key 
     * @param {number} [imageIndex = 0]
     * @param {Array<{x:Number, y:Number}>=} boundaries 
     * @returns {DrawImageObject}
     */
    image(x, y, width, height, key, imageIndex = 0, boundaries) {
        return new _DrawImageObject_js__WEBPACK_IMPORTED_MODULE_3__.DrawImageObject(x, y, width, height, key, imageIndex, boundaries);
    }

    /**
     * @param {Array<number>} vertices 
     * @param {string} color - rgba(r,g,b,a)
     * @returns {DrawLineObject}
     */
    line(vertices, color) {
        return new _DrawLineObject_js__WEBPACK_IMPORTED_MODULE_4__.DrawLineObject(vertices, color);
    }

    /**
     * @param {Array<{x:number, y:number}>} vertices - should go in anticlockwise order
     * @param {string} bgColor - rgba(r,g,b,a) 
     * @param {boolean=} cut
     * @returns {DrawPolygonObject}
     */
    polygon(vertices, bgColor, cut) {
        return new _DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_5__.DrawPolygonObject(vertices, bgColor, cut);
    }
}

/***/ }),

/***/ "./src/base/DrawPolygonObject.js":
/*!***************************************!*\
  !*** ./src/base/DrawPolygonObject.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawPolygonObject": () => (/* binding */ DrawPolygonObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");



/**
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
class DrawPolygonObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__.DrawShapeObject {
    /**
     * @type {Array<Array<number>>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(vertices, bgColor, cut) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.POLYGON, vertices[0].x, vertices[0].y, bgColor, cut);
        this.#vertices = this._convertVerticesArray(vertices);
    }

    /**
     * @type {Array<Array<number>>}
     */
    get vertices () {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
    }
}

/***/ }),

/***/ "./src/base/DrawRectObject.js":
/*!************************************!*\
  !*** ./src/base/DrawRectObject.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawRectObject": () => (/* binding */ DrawRectObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");



/**
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
class DrawRectObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__.DrawShapeObject {
    /**
     * @type {number}
     */
    #w;
    /**
     * @type {number}
     */
    #h;
    /**
     * @type {Array<Array<number>>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(x, y, w, h, bgColor, cut) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE, x, y, bgColor, cut);
        this.#w = w;
        this.#h = h;
        this.#vertices = this._calculateRectVertices(w,h);
    }

    /**
     * @type {Array<Array<number>>}
     */
    get vertices () {
        return this.#vertices;
    }
    /**
     * @type {number}
     */
    get width() {
        return this.#w;
    }

    /**
     * @type {number}
     */
    get height() {
        return this.#h;
    }

    set width(w) {
        this.#w = w;
    }

    set height(h) {
        this.#h = h;
    }
}

/***/ }),

/***/ "./src/base/DrawShapeObject.js":
/*!*************************************!*\
  !*** ./src/base/DrawShapeObject.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawShapeObject": () => (/* binding */ DrawShapeObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../index.js */ "./src/index.js");



/**
 * A base draw object.
 */
class DrawShapeObject {
    #x;
    #y;
    #bg;
    /**
     * @type {string}
     * @enum {CONST.DRAW_TYPE}
     */
    #type;
    #cut;
    /**
     * Is used for blending pixel arithmetic
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc.
     * @type {Array<number>}
     */
    #blendFunc;
    
    /**
     * @type {number}
     */
    #zIndex = 0;
    /**
     * @type {number}
     */
    #rotation = 0;
    /**
     * @type {number}
     */
    #id = _index_js__WEBPACK_IMPORTED_MODULE_1__.utils.generateUniqId();
    /**
     * @type {boolean}
     */
    #isRemoved = false;

    /**
     * @hideconstructor
     */
    constructor(type, mapX, mapY, bgColor, cut) {
        this.#x = mapX;
        this.#y = mapY;
        this.#bg = bgColor;
        this.#type = type;
        this.#cut = cut;
    }

    /**
     * Background color as rgba(r,g,b,a).
     * @type {string}
     */
    get bgColor() {
        return this.#bg;
    }

    set bgColor(value) {
        this.#bg = value;
    }

    /**
     * @type {string}
     * @enum {CONST.DRAW_TYPE}
     */
    get type() {
        return this.#type;
    }

    /**
     * @type {number}
     */
    get x() {
        return this.#x;
    }

    /**
     * @type {number}
     */
    get y () {
        return this.#y;
    }

    set x(posX) {
        this.#x = posX;
    }

    set y(posY) {
        this.#y = posY;
    }

    /**
     * @type {boolean}
     */
    get cut() {
        return this.#cut;
    }

    /**
     * @type {number}
     */
    get zIndex () {
        return this.#zIndex;
    }

    set zIndex(value) {
        this.#zIndex = value;
    }

    get blendFunc () {
        return this.#blendFunc;
    }

    set blendFunc(value) {
        this.#blendFunc = value;
    }

    /**
     * @type {number}
     */
    get rotation() {
        return this.#rotation;
    }

    set rotation(value) {
        this.#rotation = value;
    }

    /**
     * @type {number}
     */
    get id() {
        return this.#id;
    }

    /**
     * @type {boolean}
     */
    get isRemoved() {
        return this.#isRemoved;
    }

    /**
     * Destroy object on next render iteration.
     */
    destroy() {
        this.#isRemoved = true;
    }

    /**
     * @param {number} width 
     * @param {number} height 
     * @returns {Array<Array<number>>}
     */
    _calculateRectVertices = (width, height) => {
        const halfW = width/2,
            halfH = height/2;
        return [[-halfW, -halfH], [halfW, -halfH], [halfW, halfH], [-halfW, halfH]];
    };

    /**
     * @param {number} radius 
     * @param {number} [angle = 2 * Math.PI]
     * @param {number} [step = Math.PI/12] 
     * @returns {Array<number>}
     * @ignore
     */
    _calculateConusVertices(radius, angle = 2*Math.PI, step = Math.PI/14) {
        let conusPolygonCoords = [0, 0];

        for (let r = 0; r <= angle; r += step) {
            let x2 = Math.cos(r) * radius,
                y2 = Math.sin(r) * radius;

            conusPolygonCoords.push(x2, y2);
        }

        return conusPolygonCoords;
    }

    /**
     * @param {Array<Array<number>> | Array<{x:number, y:number}>} boundaries
     * @returns {Array<Array<number>>}
     * @ignore
     */
    _convertVerticesArray(boundaries) {
        if (typeof boundaries[0].x !== "undefined" && typeof boundaries[0].y !== "undefined") {
            return _index_js__WEBPACK_IMPORTED_MODULE_1__.utils.verticesArrayToArrayNumbers(boundaries);
        } else {
            return boundaries;
        }
    }
}

/***/ }),

/***/ "./src/base/DrawTextObject.js":
/*!************************************!*\
  !*** ./src/base/DrawTextObject.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawTextObject": () => (/* binding */ DrawTextObject)
/* harmony export */ });
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");
/* harmony import */ var _Primitives_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Primitives.js */ "./src/base/Primitives.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");




/**
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
class DrawTextObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_0__.DrawShapeObject {
    #font;
    #textAlign;
    #textBaseline;
    #fillStyle;
    #strokeStyle;
    #text;
    #textMetrics;

    /**
     * @hideconstructor
     */
    constructor(mapX, mapY, text, font, fillStyle) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.DRAW_TYPE.TEXT, mapX, mapY);
        this.#text = text;
        this.#font = font;
        this.#fillStyle = fillStyle;
        this.#textMetrics;
    }

    /**
     * Rectangle text box.
     * @type {Rectangle}
     */
    get boundariesBox() {
        const width = this.textMetrics ? this.textMetrics.width : 300,
            height = this.textMetrics ? this.textMetrics.actualBoundingBoxAscent + /*this.textMetrics.actualBoundingBoxDescent*/ 5: 30;
        return new _Primitives_js__WEBPACK_IMPORTED_MODULE_1__.Rectangle(this.x, this.y - height, width, height);
    }

    get vertices() {
        const bb = this.boundariesBox;
        return this._calculateRectVertices(bb.width, bb.height);
    }

    /**
     * @type {string}
     */
    get text() {
        return this.#text;
    }

    set text(value) {
        this.#text = value;
    }

    /**
     * @type {string}
     */
    get font() {
        return this.#font;
    }

    set font(value) {
        this.#font = value;
    }

    /**
     * @type {string}
     */
    get textAlign() {
        return this.#textAlign;
    }

    set textAlign(value) {
        this.#textAlign = value;
    }

    /**
     * @type {string}
     */
    get textBaseline() {
        return this.#textBaseline;
    }

    set textBaseline(value) {
        this.#textBaseline = value;
    }

    /**
     * @type {string}
     */
    get fillStyle() {
        return this.#fillStyle;
    }

    set fillStyle(value) {
        this.#fillStyle = value;
    }

    /**
     * @type {string}
     */
    get strokeStyle() {
        return this.#strokeStyle;
    }

    set strokeStyle(value) {
        this.#strokeStyle = value;
    }

    /**
     * @type {TextMetrics}
     */
    get textMetrics() {
        return this.#textMetrics;
    }

    set _textMetrics(value) {
        this.#textMetrics = value;
    }
}

/***/ }),

/***/ "./src/base/Events/SystemEvent.js":
/*!****************************************!*\
  !*** ./src/base/Events/SystemEvent.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SystemEvent": () => (/* binding */ SystemEvent)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Exception.js */ "./src/base/Exception.js");



class SystemEvent extends Event {
    #data;
    constructor(eventValue, data){
        super(eventValue);
        if (!this.#isEventExist(eventValue)) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.UNEXPECTED_EVENT_NAME, ", Please check if event is exist");
        }
        this.#data = data;
    }

    #isEventExist(eventValue) {
        return Object.values(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT).find(eventVal => eventVal === eventValue);
    }

    get data () {
        return this.#data;
    }
}

/***/ }),

/***/ "./src/base/Exception.js":
/*!*******************************!*\
  !*** ./src/base/Exception.js ***!
  \*******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Exception": () => (/* binding */ Exception),
/* harmony export */   "Warning": () => (/* binding */ Warning)
/* harmony export */ });
function Exception (code, message) {
    throw new Error(code + ": " + message);
}

function Warning (code, message) {
    console.warn(code, message);
}

/***/ }),

/***/ "./src/base/Logger.js":
/*!****************************!*\
  !*** ./src/base/Logger.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Logger": () => (/* binding */ Logger)
/* harmony export */ });
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");



class Logger {
    static debug(...args) {
        if (_configs_js__WEBPACK_IMPORTED_MODULE_0__.SystemSettings.mode === _constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.MODE.DEBUG)
            args.forEach(message => console.log(message));
    }
}

/***/ }),

/***/ "./src/base/Primitives.js":
/*!********************************!*\
  !*** ./src/base/Primitives.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Rectangle": () => (/* binding */ Rectangle),
/* harmony export */   "Vector": () => (/* binding */ Vector),
/* harmony export */   "Vertex": () => (/* binding */ Vertex)
/* harmony export */ });
class Vertex {
    #x;
    #y;
    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }
}

class Rectangle {
    #x;
    #y;
    #w;
    #h;
    constructor(x, y, w, h) {
        this.#x = x;
        this.#y = y;
        this.#w = w;
        this.#h = h; 
    }
    /**
     * @type {number}
     */
    get x() {
        return this.#x;
    }
    /**
     * @type {number}
     */
    get y() {
        return this.#y;
    }
    /**
     * @type {number}
     */
    get width() {
        return this.#w;
    }
    /**
     * @type {number}
     */
    get height() {
        return this.#h;
    }
}

class Vector {
    #x;
    #y;
    constructor(x1, y1, x2, y2) {
        this.#x = x2 - x1;
        this.#y = y2 - y1;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get length() {
        return Math.sqrt(Math.pow(this.#x, 2) + Math.pow(this.#y, 2));
    }

    get tetaAngle() {
        return Math.atan2(this.#y, this.#x);
    }
}



/***/ }),

/***/ "./src/base/RenderLayer.js":
/*!*********************************!*\
  !*** ./src/base/RenderLayer.js ***!
  \*********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RenderLayer": () => (/* binding */ RenderLayer)
/* harmony export */ });
class RenderLayer {
    #layerKey;
    #tileMapKey;
    #setBoundaries;
    #drawBoundaries;

    constructor(layerKey, tileMapKey, setBoundaries = false) {
        this.#layerKey = layerKey;
        this.#tileMapKey = tileMapKey;
        this.#setBoundaries = setBoundaries;
        this.#drawBoundaries = setBoundaries ? setBoundaries : false;
    }

    /**
     * A layer name.
     * @type {string}
     */
    get layerKey() {
        return this.#layerKey;
    }

    /**
     * A tilemap layer key, should match key from the tilemap.
     * @type {string}
     */
    get tileMapKey() {
        return this.#tileMapKey;
    }

    /**
     * Should the layer borders used as boundaries, or not
     * Can be set in ScreenPage.addRenderLayer() method.
     * @type {boolean}
     */
    get setBoundaries() {
        return this.#setBoundaries;
    }

    /**
     * Should draw a boundaries helper, or not
     * Can be set in SystemSettings.
     * @type {boolean}
     */
    get drawBoundaries() {
        return this.#drawBoundaries;
    }

    set drawBoundaries(value) {
        this.#drawBoundaries = value;
    }
}


/***/ }),

/***/ "./src/base/ScreenPage.js":
/*!********************************!*\
  !*** ./src/base/ScreenPage.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ScreenPage": () => (/* binding */ ScreenPage)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _ScreenPageData_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ScreenPageData.js */ "./src/base/ScreenPageData.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _Logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Logger.js */ "./src/base/Logger.js");
/* harmony import */ var _modules_assetsm_dist_assetsm_min_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../modules/assetsm/dist/assetsm.min.js */ "./modules/assetsm/dist/assetsm.min.js");
/* harmony import */ var _RenderLayer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./RenderLayer.js */ "./src/base/RenderLayer.js");
/* harmony import */ var _CanvasView_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./CanvasView.js */ "./src/base/CanvasView.js");
/* harmony import */ var _DrawObjectFactory_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./DrawObjectFactory.js */ "./src/base/DrawObjectFactory.js");
/* harmony import */ var _DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./DrawCircleObject.js */ "./src/base/DrawCircleObject.js");
/* harmony import */ var _DrawConusObject_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./DrawConusObject.js */ "./src/base/DrawConusObject.js");
/* harmony import */ var _DrawImageObject_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./DrawImageObject.js */ "./src/base/DrawImageObject.js");
/* harmony import */ var _DrawLineObject_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./DrawLineObject.js */ "./src/base/DrawLineObject.js");
/* harmony import */ var _DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./DrawPolygonObject.js */ "./src/base/DrawPolygonObject.js");
/* harmony import */ var _DrawRectObject_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./DrawRectObject.js */ "./src/base/DrawRectObject.js");
/* harmony import */ var _DrawTextObject_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./DrawTextObject.js */ "./src/base/DrawTextObject.js");
/* harmony import */ var _SystemInterface_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./SystemInterface.js */ "./src/base/SystemInterface.js");
/* harmony import */ var _SystemAudioInterface_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./SystemAudioInterface.js */ "./src/base/SystemAudioInterface.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../utils.js */ "./src/utils.js");
/* harmony import */ var _Primitives_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./Primitives.js */ "./src/base/Primitives.js");





















/**
 * Represents the page of the game,<br>
 * Register and holds CanvasView.<br>
 * Contains pages logic.<br>
 * Instances should be created and registered with System.registerPage() factory method
 * 
 * @see {@link System} instances of this class holds by the System class
 * @hideconstructor
 */
class ScreenPage {
    /**
     * @type {string}
     */
    #name;
    /**
     * @type {boolean}
     */
    #isInitiated = false;
    /**
     * @type {boolean}
     */
    #isActive;
    /**
     * @type {SystemInterface}
     */
    #system;
    /**
     * @type {Map<String, CanvasView>}
     */
    #views;
    /**
     * @type {ScreenPageData}
     */
    #screenPageData;
    /**
     * @type {DrawObjectFactory}
     */
    #drawObjectFactory = new _DrawObjectFactory_js__WEBPACK_IMPORTED_MODULE_7__.DrawObjectFactory();
    /**
     * @type {Array<number>}
     */
    #tempFPStime;
    /**
     * @type {NodeJS.Timer}
     */
    #fpsAverageCountTimer;
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();
    /**
     * @type {boolean}
     */
    #isBoundariesPrecalculations = false;
    #minCircleTime;

    constructor() {
        this.#isActive = false;
        this.#views = new Map();
        this.#screenPageData = new _ScreenPageData_js__WEBPACK_IMPORTED_MODULE_1__.ScreenPageData();
        this.#tempFPStime = [];
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
     * Register stage
     * @param {string} name
     * @param {SystemInterface} system 
     * @ignore
     */
    _register(name, system) {
        this.#name = name;
        this.#system = system;
        this.#isBoundariesPrecalculations = this.systemSettings.gameOptions.render.boundaries.wholeWorldPrecalculations;
        this.#minCircleTime = this.systemSettings.gameOptions.render.minCircleTime;
        this.#setWorldDimensions();
        this.#setCanvasSize();
        this.register();
    }

    /**
     * Initialization stage
     * @ignore
     */
    _init() {
        this.init();
        this.#isInitiated = true;
    }

    /**
     * @tutorial screen_pages_stages
     * Custom logic for register stage
     */
    register() {}
    /**
     * @tutorial screen_pages_stages
     * Custom logic for init stage
     */
    init() {}
    /**
     * Custom logic for start stage
     * @param {Object=} options
     */
    start(options) {}
    /**
     * @tutorial screen_pages_stages
     * Custom logic for stop stage
     */
    stop() {}
    /**
     * Custom logic for resize stage
     */
    resize() {}

    /**
     * @tutorial assets_manager
     * @type {AssetsManager}
     */
    get loader() {
        return this.#system.loader;
    }

    /**
     * @type {DrawObjectFactory}
     */
    get draw() {
        return this.#drawObjectFactory;
    }

    /**
     * Creates new canvas layer
     * and set it to the #views
     * @param {string} name
     * @param {boolean} [isOffsetTurnedOff = false] - determines if offset is affected on this layer or not
     */
    createCanvasView = (name, isOffsetTurnedOff = false) => {
        if (name && name.trim().length > 0) {
            const newView = new _CanvasView_js__WEBPACK_IMPORTED_MODULE_6__.CanvasView(name, this.#system.systemSettings, this.#screenPageData, this.loader, isOffsetTurnedOff);
            this.#views.set(name, newView);
        } else
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.UNEXPECTED_INPUT_PARAMS);
    };

    /**
     * Attach all canvas elements from the #views to container
     * @param {HTMLElement} container
     * @ignore
     */
    _attachViewsToContainer(container) {
        for (const view of this.#views.values()) {
            this.#attachElementToContainer(view.canvas, container);
        }
    }

    /**
     * Add render object to the view
     * @param {string} canvasKey 
     * @param { DrawConusObject | DrawImageObject | 
     *          DrawLineObject | DrawPolygonObject | 
     *          DrawRectObject | DrawCircleObject | 
     *          DrawTextObject } renderObject 
     */
    addRenderObject = (canvasKey, renderObject) => {
        if (!canvasKey) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CANVAS_KEY_NOT_SPECIFIED, ", should pass canvasKey as 3rd parameter");
        } else if (!this.#views.has(canvasKey)) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", should create canvas view, with " + canvasKey + " key first");
        } else {
            const view = this.#views.get(canvasKey);
            view._renderObject = renderObject;
            view._sortRenderObjectsByZIndex();
        }
    };

    /**
     * Add render layer to the view
     * @param {string} canvasKey 
     * @param {string} layerKey 
     * @param {string} tileMapKey 
     * @param {boolean=} setBoundaries 
     */
    addRenderLayer = (canvasKey, layerKey, tileMapKey, setBoundaries) => {
        if (!canvasKey) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CANVAS_KEY_NOT_SPECIFIED, ", should pass canvasKey as 3rd parameter");
        } else if (!this.#views.has(canvasKey)) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", should create canvas view, with " + canvasKey + " key first");
        } else {
            const view = this.#views.get(canvasKey);
            view._renderLayers = new _RenderLayer_js__WEBPACK_IMPORTED_MODULE_5__.RenderLayer(layerKey, tileMapKey, setBoundaries);
            if (setBoundaries && this.systemSettings.gameOptions.render.boundaries.mapBoundariesEnabled) {
                view._enableMapBoundaries();
            }
        }
    };

    /**
     * Determines if this page render is Active or not
     * @type {boolean}
     */
    get isActive() {
        return this.#isActive;
    }

    /**
     * Determines if this page is initialized or not
     * @type {boolean}
     */
    get isInitiated() {
        return this.#isInitiated;
    }

    /**
     * Current page name
     * @type {string}
     */
    get name () {
        return this.#name;
    }

    /**
     * Determines if all added files was loaded or not
     * @returns {boolean}
     */
    isAllFilesLoaded = () => {
        return this.loader.filesWaitingForUpload === 0;
    };

    /**
     * @type {ScreenPageData}
     */
    get screenPageData() {
        return this.#screenPageData;
    }

    /**
     * @type {SystemSettings}
     */
    get systemSettings() {
        return this.#system.systemSettings;
    }

    /**
     * @type {SystemAudioInterface}
     */
    get audio() {
        return this.#system.audio;
    }

    /**
     * @type {SystemInterface}
     */
    get system() {
        return this.#system;
    }

    /**
     * @method
     * @param {string} key 
     * @returns {CanvasView | undefined}
     */
    getView = (key) => {
        const ctx = this.#views.get(key);
        if (ctx) {
            return this.#views.get(key);
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", cannot find canvas with key " + key);
        }
    };

    /**
     * Start page render
     * @param {Object=} options 
     * @ignore
     */
    _start(options) {
        this.#isActive = true;
        window.addEventListener("resize", this._resize);
        this._resize();
        if (this.#views.size > 0) {
            requestAnimationFrame(this.#render);
        }
        this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.START_PAGE);
        this.start(options);
    }

    /**
     * Stop page render
     * @ignore
     */
    _stop() {
        this.#isActive = false;
        window.removeEventListener("resize", this._resize);
        this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.STOP_PAGE);
        this.#removeCanvasFromDom();
        clearInterval(this.#fpsAverageCountTimer);
        this.stop();
    }

    /**
     * Resize event
     * @ignore
     */
    _resize = () => {
        this.#setCanvasSize();
        this.resize();
    };

    /**
     * 
     * @param {HTMLCanvasElement} htmlElement 
     * @param {HTMLElement} container 
     */
    #attachElementToContainer(htmlElement, container) {
        container.appendChild(htmlElement);
    }

    #removeCanvasFromDom() {
        for (const view of this.#views.values()) {
            document.getElementById(view.canvas.id).remove();
        }
    }

    #setWorldDimensions() {
        const width = this.systemSettings.worldSize ? this.systemSettings.worldSize.width : 0,
            height = this.systemSettings.worldSize ? this.systemSettings.worldSize.height : 0;
            
        this.screenPageData._setWorldDimensions(width, height);
    }

    #isPolygonToObjectsCollision(x, y, polygonVertices, polygonRotation, objects) {
        const len = objects.length;
        let collisions = [];
        for (let i = 0; i < len; i++) {
            const mapObject = objects[i],
                drawMapObjectType = mapObject.type;

            let coll;
            
            switch(drawMapObjectType) {
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.TEXT:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CONUS:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.IMAGE:
                coll = this.#isPolygonToPolygonCollision(x, y, polygonVertices, polygonRotation, mapObject);
                break;
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CIRCLE:
                console.warn("isObjectCollision.circle check is not implemented yet!");
                break;
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.LINE:
                console.warn("isObjectCollision.line check is not implemented, please use rect instead");
                break;
            default:
                console.warn("unknown object type!");
            }
            if (coll) {
                collisions.push(coll);
            }
        }
        if (collisions.length > 0) {
            return this.#takeTheClosestCollision(collisions);
        } else {
            return null;
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {Array<Array<number>>} polygon
     * @param {number} rotation 
     * @returns {{x:number, y:number, p:number} | boolean}
     */
    #isPolygonToBoundariesCollision(x, y, polygon, rotation) {
        //console.log("angle: ", rotation);
        //console.log("boundaries before calculations: ");
        //console.log(polygon);
        const mapObjects = this.screenPageData.getBoundaries(),
            [mapOffsetX, mapOffsetY] = this.screenPageData.worldOffset,
            xWithOffset = x - mapOffsetX,
            yWithOffset = y - mapOffsetY,
            polygonWithOffsetAndRotation = polygon.map((vertex) => (this.#calculateShiftedVertexPos(vertex, xWithOffset, yWithOffset, rotation))),
            len = mapObjects.length;
            
        for (let i = 0; i < len; i+=1) {
            const item = mapObjects[i];
            const object = {
                    x1: item[0],
                    y1: item[1],
                    x2: item[2],
                    y2: item[3]
                },
                intersect = (0,_utils_js__WEBPACK_IMPORTED_MODULE_18__.isPolygonLineIntersect)(polygonWithOffsetAndRotation, object);
            if (intersect) {
                //console.log("rotation: ", rotation);
                //console.log("polygon: ", polygonWithOffsetAndRotation);
                //console.log("intersect: ", intersect);
                return intersect;
            }
        }
        return false;
    }

    #takeTheClosestCollision(collisions) {
        return collisions.sort((a,b) => a.p < b.p)[0];
    }

    #isPolygonToPolygonCollision(x, y, polygonVertices, polygonRotation, mapObject) {
        const [mapOffsetX, mapOffsetY] = this.screenPageData.worldOffset,
            xWithOffset = x - mapOffsetX,
            yWithOffset = y - mapOffsetY,
            mapObjXWithOffset = mapObject.x - mapOffsetX,
            mapObjYWithOffset = mapObject.y - mapOffsetY,
            mapObjVertices = mapObject.vertices, 
            mapObjRotation = mapObject.rotation,
            polygonWithOffsetAndRotation = polygonVertices.map((vertex) => (this.#calculateShiftedVertexPos(vertex, xWithOffset, yWithOffset, polygonRotation))),
            len = mapObjVertices.length;
        //console.log("map object check:");
        //console.log(mapObject);
        for (let i = 0; i < len; i+=1) {
            const mapObjFirstVertex = mapObjVertices[i];
            let mapObjNextVertex = mapObjVertices[i + 1];
            if (!mapObjNextVertex) {
                mapObjNextVertex = mapObjVertices[0];
            }
            const vertex = this.#calculateShiftedVertexPos(mapObjFirstVertex, mapObjXWithOffset, mapObjYWithOffset, mapObjRotation),
                nextVertex = this.#calculateShiftedVertexPos(mapObjNextVertex, mapObjXWithOffset, mapObjYWithOffset, mapObjRotation),
                edge = {
                    x1: vertex[0],
                    y1: vertex[1],
                    x2: nextVertex[0],
                    y2: nextVertex[1]
                },
                intersect = (0,_utils_js__WEBPACK_IMPORTED_MODULE_18__.isPolygonLineIntersect)(polygonWithOffsetAndRotation, edge);
            if (intersect) {
                //console.log("polygon: ", polygonWithOffsetAndRotation);
                //console.log("intersect: ", intersect);
                return intersect;
            }
        }
        return false;
    }

    #calculateShiftedVertexPos(vertex, centerX, centerY, rotation) {
        const vector = new _Primitives_js__WEBPACK_IMPORTED_MODULE_19__.Vector(0, 0, vertex[0], vertex[1]),
            vertexAngle = (0,_utils_js__WEBPACK_IMPORTED_MODULE_18__.angle_2points)(0, 0, vertex[0], vertex[1]),
            len = vector.length;
        //console.log("coords without rotation: ");
        //console.log(x + vertex.x);
        //console.log(y + vertex.y);
        //console.log("len: ", len);
        //console.log("angle: ", rotation);
        const newX = centerX + (len * Math.cos(rotation + vertexAngle)),
            newY = centerY + (len * Math.sin(rotation + vertexAngle));
        return [newX, newY];
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {DrawImageObject} drawObject 
     * @returns {{x:number, y:number, p:number} | boolean}
     */
    isBoundariesCollision = (x, y, drawObject) => {
        const drawObjectType = drawObject.type,
            vertices = drawObject.vertices;
        switch(drawObjectType) {
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.TEXT:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CONUS:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.IMAGE:
            return this.#isPolygonToBoundariesCollision(x, y, vertices, drawObject.rotation);
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CIRCLE:
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.circle check is not implemented yet!");
            break;
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.LINE:
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.line check is not implemented yet, please use .rect instead line!");
            break;
        default:
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WARNING_CODES.UNKNOWN_DRAW_OBJECT, "unknown object type!");
        }
        return false;
    };

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {DrawImageObject} drawObject
     * @param {Array<DrawImageObject>} objects - objects array to check
     * @returns {{x:number, y:number, p:number} | boolean} - the closest collision
     */
    isObjectsCollision = (x, y, drawObject, objects) => {
        const drawObjectType = drawObject.type,
            drawObjectBoundaries = drawObject.vertices;
        switch(drawObjectType) {
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.TEXT:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CONUS:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.IMAGE:
            return this.#isPolygonToObjectsCollision(x, y, drawObjectBoundaries, drawObject.rotation, objects);
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CIRCLE:
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.circle check is not implemented yet!");
            break;
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.LINE:
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.line check is not implemented yet, please use .rect instead line!");
            break;
        default:
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WARNING_CODES.UNKNOWN_DRAW_OBJECT, "unknown object type!");
        }
        return false;
    };

    #checkCollisions(renderObjects) {
        const boundaries = this.screenPageData.getBoundaries(),
            boundariesLen = boundaries.length,
            objectsLen = renderObjects.length;
        //console.log(this.screenPageData.worldOffset);
        for (let i = 0; i < objectsLen; i++) {
            const renderObject = renderObjects[i];
            for (let j = 0; j < objectsLen; j++) {
                if (i === j) {
                    continue;
                }
                // const renderObjectCheck = renderObjects[j];
                // check object - object collisions
            }

            for (let k = 0; k < boundariesLen; k+=1) {
                const item = boundaries[k],
                    object = {
                        x1: item[0],
                        y1: item[1],
                        x2: item[2],
                        y2: item[3]
                    };
                const objectBoundaries = object.boundaries;
                if (objectBoundaries) {
                    if ((0,_utils_js__WEBPACK_IMPORTED_MODULE_18__.isPolygonLineIntersect)(objectBoundaries, object)) {
                        this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.GAME.BOUNDARIES_COLLISION, renderObject);
                    }
                } else {
                    if ((0,_utils_js__WEBPACK_IMPORTED_MODULE_18__.isPointLineIntersect)({ x: renderObject.x, y: renderObject.y }, object)) {
                        this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.GAME.BOUNDARIES_COLLISION, renderObject);
                        console.log("boundaries collision detected");
                    }
                }
            }
        }
    }

    #setCanvasSize() {
        const canvasWidth = this.systemSettings.canvasMaxSize.width && (this.systemSettings.canvasMaxSize.width < window.innerWidth) ? this.systemSettings.canvasMaxSize.width : window.innerWidth,
            canvasHeight = this.systemSettings.canvasMaxSize.height && (this.systemSettings.canvasMaxSize.height < window.innerHeight) ? this.systemSettings.canvasMaxSize.height : window.innerHeight;
        this.screenPageData._setCanvasDimensions(canvasWidth, canvasHeight);
        for (const view of this.#views.values()) {
            view._setCanvasSize(canvasWidth, canvasHeight);
        }
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

    #render = async (/*time*/) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_3__.Logger.debug("_render " + this.name + " class");
        if (this.#isActive) {
            switch (this.systemSettings.gameOptions.library) {
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.LIBRARY.WEBGL:
                if (this.isAllFilesLoaded()) {
                    //render
                    await this.#prepareViews();
                } else {
                    (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.ASSETS_NOT_READY, "Is page initialization phase missed?");
                    this.#isActive = false;
                }
                // wait for the end of the execution stack, before start next iteration
                setTimeout(() => requestAnimationFrame(this.#drawViews));
                break;
            }
            this.#fpsAverageCountTimer = setInterval(() => this.#countFPSaverage(), this.systemSettings.gameOptions.render.averageFPStime);
        }
    };

    /**
     * 
     * @returns {Promise<void>}
     */
    #prepareViews() {
        return new Promise((resolve, reject) => {
            let viewPromises = [];
            const isBoundariesPrecalculations = this.#isBoundariesPrecalculations;
            for (const view of this.#views.values()) {
                viewPromises.push(view._initiateWebGlContext());
                if (isBoundariesPrecalculations) {
                    viewPromises.push(view._createBoundariesPrecalculations());
                }
            }
            Promise.allSettled(viewPromises).then((drawingResults) => {
                drawingResults.forEach((result) => {
                    if (result.status === "rejected") {
                        const error = result.reason;
                        (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, error);
                        reject(error);
                    }
                });
                resolve();
            });
        });
    }

    #drawViews = (/*drawTime*/) => {
        const pt0 = performance.now(),
            minCircleTime = this.#minCircleTime;
            
        let viewPromises = [];
        this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.RENDER.START);
        this.screenPageData._clearBoundaries();

        for (const [key, view] of this.#views.entries()) {
            viewPromises.push(this.#executeRender(key, view));
        }
        Promise.allSettled(viewPromises).then((drawingResults) => {
            drawingResults.forEach((result) => {
                if (result.status === "rejected") {
                    (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason);
                }
            });
            const r_time = performance.now() - pt0,
                r_time_less = minCircleTime - r_time,
                wait_time = r_time_less > 0 ? r_time_less : 0,
                fps = 1000 / (r_time + wait_time);
            //console.log("draw circle done, take: ", (r_time), " ms");
            //console.log("fps: ", fps);
            this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.RENDER.END);
            this.#tempFPStime.push(fps);
            if (this.#isActive) {
                setTimeout(() => requestAnimationFrame(this.#drawViews), wait_time);
            }
        });
    };

    /**
     * 
     * @param {string} key 
     * @param {CanvasView} view 
     * @returns {Promise<void>}
     */
    #executeRender (key, view) {
        return new Promise((resolve, reject) => {
            if (!view._isCleared) {
                view._clearWebGlContext();
            }
            if (view._renderLayers.length !== 0) {
                view._prepareBindRenderLayerPromises();
            }
            view._executeBindRenderLayerPromises()
                .then((bindResults) => {
                    bindResults.forEach((result) => {
                        if (result.status === "rejected") {
                            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason);
                            this.#isActive = false;
                            return reject(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNHANDLED_DRAW_ISSUE + ", reason: " + result.reason);
                        }
                    });
                    return view._executeTileImagesDraw();
                })
                .then(() => {
                    if (view.renderObjects.length !== 0) {
                        //this.#checkCollisions(view.renderObjects);
                        view._prepareBindRenderObjectPromises();
                    }
                    if (key === _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.LAYERS.BOUNDARIES) {
                        view._prepareBindBoundariesPromise();
                    }
                    return view._executeBindRenderObjectPromises();
                })
                .then((bindResults) => {
                    bindResults.forEach((result) => {
                        if (result.status === "rejected") {
                            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason);
                            this.#isActive = false;
                        }
                    });

                    view._postRenderActions();
                    
                    view._isCleared = false;
                    resolve();
                });
        });
    }
}

/***/ }),

/***/ "./src/base/ScreenPageData.js":
/*!************************************!*\
  !*** ./src/base/ScreenPageData.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ScreenPageData": () => (/* binding */ ScreenPageData)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");


/**
 * An interface for common views data such as
 * boundaries, world dimensions, options
 * accessible via ScreenPage.screenPageData 
 * @see {@link ScreenPage} a part of ScreenPage
 * @hideconstructor
 */
class ScreenPageData {
    #worldWidth;
    #worldHeight;
    #viewWidth;
    #viewHeight;
    #xOffset = 0;
    #yOffset = 0;
    #centerX = 0;
    #centerY = 0;
    #rotate = 0;
    /**
     * current screen boundaries, recalculated every render circle
     * @type {Array<Array<number>>}
     */
    #boundaries = [];

    /**
     * whole world boundaries, calculated once on prepare stage
     * @type {Array<Array<number>>}
     */
    #wholeWorldBoundaries = [];

    /**
     * Add a Boundaries line
     * @param {{x1:number,y1:number,x2:number, y2:number}} boundaries 
     */
    #addBoundaries(boundaries) {
        this.#boundaries.push([boundaries.x1, boundaries.y1, boundaries.x2, boundaries.y2]);
    }

    /**
     * Add array of boundaries lines
     * @param {Array<Array<number>>} boundaries 
     * @ignore
     */
    _addBoundariesArray(boundaries) {
        this.#boundaries.push(...boundaries);
    }

    /**
     * Clear map boundaries
     * @ignore
     */
    _clearBoundaries() {
        this.#boundaries = [];
    }

    /**
     * 
     * @param {number} width 
     * @param {number} height 
     * @ignore
     */
    _setWorldDimensions(width, height) {
        this.#worldWidth = width;
        this.#worldHeight = height;
    }

    set mapRotate(value) {
        this.#rotate = value;
    }

    /**
     * 
     * @param {number} width 
     * @param {number} height 
     * @ignore
     */
    _setCanvasDimensions(width, height) {
        this.#viewWidth = width;
        this.#viewHeight = height;
    }

    /**
     * Set map borders
     * @ignore
     */
    _setMapBoundaries() {
        const [w, h] = [this.#worldWidth, this.#worldHeight];
        if (!w || !h) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.WORLD_DIMENSIONS_NOT_SET, "Can't set map boundaries.");
        }
        this.#addBoundaries({x1: 0, y1: 0, x2: w, y2: 0});
        this.#addBoundaries({x1: w, y1: 0, x2: w, y2: h});
        this.#addBoundaries({x1: w, y1: h, x2: 0, y2: h});
        this.#addBoundaries({x1: 0, y1: h, x2: 0, y2: 0});
    }

    _setWholeWorldMapBoundaries() {
        const [w, h] = [this.#worldWidth, this.#worldHeight];
        if (!w || !h) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.WORLD_DIMENSIONS_NOT_SET, "Can't set map boundaries.");
        }
        this.#wholeWorldBoundaries.push([0, 0, w, 0]);
        this.#wholeWorldBoundaries.push([w, 0, w, h]);
        this.#wholeWorldBoundaries.push([w, h, 0, h]);
        this.#wholeWorldBoundaries.push([0, h, 0, 0]);
    }

    /**
     * Merge same boundaries
     * @ignore
     */
    _mergeBoundaries(isWholeMapBoundaries = false) {
        const boundaries = isWholeMapBoundaries ? this.getWholeWorldBoundaries() : this.getBoundaries(),
            boundariesSet = new Set(boundaries);
        for (const line of boundariesSet.values()) {
            const lineX1 = line[0],
                lineY1 = line[1],
                lineX2 = line[2],
                lineY2 = line[3];
            for (const line2 of boundariesSet.values()) {
                const line2X1 = line2[0],
                    line2Y1 = line2[1],
                    line2X2 = line2[2],
                    line2Y2 = line2[3];
                if (lineX1 === line2X2 && lineY1 === line2Y2 &&
                    lineX2 === line2X1 && lineY2 === line2Y1) {
                    //remove double lines
                    boundariesSet.delete(line);
                    boundariesSet.delete(line2);
                }
                if (lineX2 === line2X1 && lineY2 === line2Y1 && (lineX1 === line2X2 || lineY1 === line2Y2)) {
                    //merge lines
                    line2[0] = lineX1;
                    line2[1] = lineY1;
                    boundariesSet.delete(line);
                }
            }
        }

        if (isWholeMapBoundaries) {
            this.#boundaries = Array.from(boundariesSet);
        } else {
            this.#wholeWorldBoundaries = Array.from(boundariesSet);
        }
        boundariesSet.clear();
    }

    _setWholeMapBoundaries(boundaries) {
        this.#wholeWorldBoundaries.push(...boundaries);
    }

    /**
     * 
     * @returns {Array<Array<number>>}
     */
    getBoundaries() {
        return this.#boundaries;
    }

    getWholeWorldBoundaries() {
        return this.#wholeWorldBoundaries;
    }
    /**
     * @type {Array<number>}
     */
    get canvasDimensions() {
        return [this.#viewWidth, this.#viewHeight];
    }

    /**
     * @type {Array<number>}
     */
    get worldDimensions() {
        return [this.#worldWidth, this.#worldHeight];
    }
    
    /**
     * @type {Array<number>}
     */
    get worldOffset() {
        return [this.#xOffset, this.#yOffset];
    }

    /**
     * @type {Array<number>}
     */
    get mapCenter() {
        return [this.#centerX, this.#centerY];
    }

    /**
     * @type {number}
     */
    get mapRotate() {
        return this.#rotate;
    }

    /**
     * @method
     * @param {number} x 
     * @param {number} y 
     */
    centerCameraPosition = (x, y) => {
        let [mapOffsetX, mapOffsetY] = this.worldOffset;
        const [canvasWidth, canvasHeight] = this.canvasDimensions,
            [mapWidth, mapHeight] = this.worldDimensions,
            halfScreenWidth = canvasWidth/2,
            halfScreenHeight = canvasHeight/2,
            currentCenterX = halfScreenWidth - mapOffsetX,
            currentCenterY = halfScreenHeight - mapOffsetY;
        if (currentCenterX < x) {
            if (x < mapWidth - halfScreenWidth) {
                const newXOffset = x - halfScreenWidth;
                if (newXOffset >= 0)
                    this.#xOffset = Math.round(newXOffset);
            } else if (mapWidth > canvasWidth) {
                const newXOffset = mapWidth - canvasWidth;
                this.#xOffset = Math.round(newXOffset);
            }
        }
        if (currentCenterY < y) {
            if (y < mapHeight - halfScreenHeight) {
                const newYOffset = y - halfScreenHeight;
                if (newYOffset >= 0)
                    this.#yOffset = Math.round(newYOffset);
            } else if (mapHeight > canvasHeight) {
                const newYOffset = mapHeight - canvasHeight;
                this.#yOffset = Math.round(newYOffset);
            }
        }

        this.#centerX = x;
        this.#centerY = y;
        //Logger.debug("center camera position, offset: ", this.worldOffset);
        //Logger.debug("center: ", this.mapCenter);   
    };

    personRotatedCenterCamera = (x, y, rotationAngle) => {
        console.log("new centering algorithm");
        /*
        let [mapOffsetX, mapOffsetY] = this.worldOffset;
        const [canvasWidth, canvasHeight] = this.canvasDimensions,
            [mapWidth, mapHeight] = this.worldDimensions,
            halfScreenWidth = canvasWidth/2,
            halfScreenHeight = canvasHeight/2,
            currentCenterX = halfScreenWidth - mapOffsetX,
            currentCenterY = halfScreenHeight - mapOffsetY;
        if (currentCenterX < x) {
            if (x < mapWidth - halfScreenWidth) {
                const newXOffset = x - halfScreenWidth;
                if (newXOffset >= 0)
                    this.#xOffset = Math.round(newXOffset);
            } else if (mapWidth > canvasWidth) {
                const newXOffset = mapWidth - canvasWidth;
                this.#xOffset = Math.round(newXOffset);
            }
        }
        if (currentCenterY < y) {
            if (y < mapHeight - halfScreenHeight) {
                const newYOffset = y - halfScreenHeight;
                if (newYOffset >= 0)
                    this.#yOffset = Math.round(newYOffset);
            } else if (mapHeight > canvasHeight) {
                const newYOffset = mapHeight - canvasHeight;
                this.#yOffset = Math.round(newYOffset);
            }
        }

        this.#centerX = x;
        this.#centerY = y;
        Logger.debug("center camera position, offset: ", this.worldOffset);
        Logger.debug("center: ", this.mapCenter);   
        */
    };
}

/***/ }),

/***/ "./src/base/System.js":
/*!****************************!*\
  !*** ./src/base/System.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "System": () => (/* binding */ System)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _ScreenPage_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ScreenPage.js */ "./src/base/ScreenPage.js");
/* harmony import */ var _SystemInterface_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./SystemInterface.js */ "./src/base/SystemInterface.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _design_LoadingScreen_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../design/LoadingScreen.js */ "./src/design/LoadingScreen.js");








const loadingPageName = "loadingPage";
/**
 * A main app class, <br>
 * Holder class for ScreenPage,<br>
 * can register new ScreenPages,<br>
 * init and preload data for them,<br>
 */
class System {
    #registeredPages;
    #system;
    /**
     * @param {SystemSettings} systemSettings - holds system settings
     * @param {HTMLElement} [canvasContainer] - If it is not passed, system will create div element and attach it to body
     */
    constructor(systemSettings, canvasContainer) {
        if (!systemSettings) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#registeredPages = new Map();

        if (!canvasContainer) {
            canvasContainer = document.createElement("div");
            document.body.appendChild(canvasContainer);
        }

        this.#system = new _SystemInterface_js__WEBPACK_IMPORTED_MODULE_3__.SystemInterface(systemSettings, canvasContainer, this.#registeredPages);
        
        this.registerPage(loadingPageName, _design_LoadingScreen_js__WEBPACK_IMPORTED_MODULE_5__.LoadingScreen);

        this.#system.loader.addEventListener("loadstart", this.#loadStart);
        this.#system.loader.addEventListener("progress", this.#loadProgress);
        this.#system.loader.addEventListener("load", this.#loadComplete);
    }

    /**
     * @type {SystemInterface}
     */
    get system() {
        return this.#system;
    }

    /**
     * A main factory method for create ScreenPage instances, <br>
     * register them in a System and call ScreenPage.register() stage
     * @param {string} screenPageName
     * @param {ScreenPage} screen 
     */
    registerPage(screenPageName, screen) {
        if (screenPageName && typeof screenPageName === "string" && screenPageName.trim().length > 0) {
            const page = new screen();
            page._register(screenPageName, this.system);
            this.#registeredPages.set(screenPageName, page);
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CREATE_INSTANCE_ERROR, "valid class name should be provided");
        }
    }

    /**
     * Preloads assets for all registered pages
     * @return {Promise<void>}
     */
    preloadAllData() {
        return this.#system.loader.preload();
    }

    #loadStart = (event) => {
        this.#system.startScreenPage(loadingPageName, {total: event.total});
    };

    #loadProgress = (event) => {
        const uploaded = event.loaded,
            left = event.total,
            loadingPage = this.#registeredPages.get(loadingPageName);
            
        loadingPage._progress(uploaded, left);
    };

    #loadComplete = () => {
        this.#system.stopScreenPage(loadingPageName);
    };
}

/***/ }),

/***/ "./src/base/SystemAudioInterface.js":
/*!******************************************!*\
  !*** ./src/base/SystemAudioInterface.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SystemAudioInterface": () => (/* binding */ SystemAudioInterface)
/* harmony export */ });
/* harmony import */ var _modules_assetsm_dist_assetsm_min_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../modules/assetsm/dist/assetsm.min.js */ "./modules/assetsm/dist/assetsm.min.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");




/**
 * An audio interface, <br>
 * controls all application audio,<br>
 * holds and retrieves audio, changes volume<br> 
 * accessible via ScreenPage.audio
 * @see {@link ScreenPage} a part of ScreenPage
 * @hideconstructor
 */
class SystemAudioInterface {
    #volume = 0.5;
    #audio = new Map();
    /**
     * @type {AssetsManager}
     */
    #loader;

    constructor(loader) {
        this.#loader = loader;
    }

    /**
     * Original track
     * @param {string} name 
     * @returns {HTMLAudioElement | null}
     */
    getAudio = (name) => {
        const audio = this.#audio.get(name);
        if (audio === null) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_1__.WARNING_CODES.AUDIO_NOT_LOADED, "Audio with key " + name + " exists, but not actually loaded");
            return audio;
        }
        if (audio) {
            return audio;
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_1__.WARNING_CODES.AUDIO_NOT_REGISTERED, "");
            return null;
        }
    };

    /**
     * Clone of original track
     * @param {string} name 
     * @returns {HTMLAudioElement | null}
     */
    getAudioCloned = (name) => {
        const audio = this.#audio.get(name);
        if (audio === null) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_1__.WARNING_CODES.AUDIO_NOT_LOADED, "Audio with key " + name + " exists, but not actually loaded");
            return audio;
        }
        if (audio) {
            const audioCloned = audio.cloneNode();
            audioCloned.volume = this.#volume;
            return audioCloned;
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_1__.WARNING_CODES.AUDIO_NOT_REGISTERED);
            return null;
        }
    };

    set volume(value) {
        this.#volume = value;
        this.#updateTracksVolumes(value);
    }
    /**
     * Used to set or get audio volume, 
     * value should be from 0 to 1
     * @type {number}
     */
    get volume() {
        return this.#volume;
    }

    #updateTracksVolumes(value) {
        for (const track of this.#audio.values()) {
            if (track) {
                track.volume = value;
            }
        }
    }

    /**
     * Register audio in the system
     * @param {string} name
     */
    registerAudio(name) {
        let mediaElement = this.#loader.getAudio(name);
        this.#audio.set(name, mediaElement);
    }
}

/***/ }),

/***/ "./src/base/SystemInterface.js":
/*!*************************************!*\
  !*** ./src/base/SystemInterface.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SystemInterface": () => (/* binding */ SystemInterface)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _SystemSocketConnection_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SystemSocketConnection.js */ "./src/base/SystemSocketConnection.js");
/* harmony import */ var _SystemAudioInterface_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./SystemAudioInterface.js */ "./src/base/SystemAudioInterface.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _modules_assetsm_dist_assetsm_min_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../modules/assetsm/dist/assetsm.min.js */ "./modules/assetsm/dist/assetsm.min.js");






/**
 * Public interface for a System<br>
 * Can be used to start/stop ScreenPage render, <br>
 * And provides access to SystemSettings, SystemSocketConnection and SystemAudioInterface <br>
 * accessible via ScreenPage.system and System.system
 * @see {@link System} a part of System class instance
 * @see {@link ScreenPage} a part of ScreenPage class instance
 */
class SystemInterface {
    #systemSettings;
    #canvasContainer;
    #registeredPages;
    #systemServerConnection;
    #systemAudioInterface;
    #loader;
    /**
     * @hideconstructor
     */
    constructor(systemSettings, canvasContainer, registeredPages) {
        if (!systemSettings) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#systemSettings = systemSettings;
        this.#canvasContainer = canvasContainer;
        this.#registeredPages = registeredPages;
        this.#loader = new _modules_assetsm_dist_assetsm_min_js__WEBPACK_IMPORTED_MODULE_5__["default"]();
        this.#systemAudioInterface = new _SystemAudioInterface_js__WEBPACK_IMPORTED_MODULE_3__.SystemAudioInterface(this.loader);
        this.#systemServerConnection = new _SystemSocketConnection_js__WEBPACK_IMPORTED_MODULE_2__.SystemSocketConnection(systemSettings);
    }

    /**
     * @type { SystemSocketConnection }
     */
    get network () {
        return this.#systemServerConnection;
    }

    /**
     * @type { SystemSettings }
     */
    get systemSettings() {
        return this.#systemSettings;
    }

    /**
     * @type { SystemAudioInterface }
     */
    get audio() {
        return this.#systemAudioInterface;
    }

    get loader() {
        return this.#loader;
    }

    /**
     * @method
     * @param {string} screenPageName
     * @param {Object} [options] - options
     */
    startScreenPage = (screenPageName, options) => {
        if (this.#registeredPages.has(screenPageName)) {
            const page = this.#registeredPages.get(screenPageName);
            if (page.isInitiated === false) {
                page._init();
            }
            page._attachViewsToContainer(this.#canvasContainer);
            page._start(options);
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.VIEW_NOT_EXIST, "View " + screenPageName + " is not registered!");
        }
    };

    /**
     * @method
     * @param {string} screenPageName
     */
    stopScreenPage = (screenPageName) => {
        if (this.#registeredPages.has(screenPageName)) {
            this.#registeredPages.get(screenPageName)._stop();
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.VIEW_NOT_EXIST, "View " + screenPageName + " is not registered!");
        }
    };
}

/***/ }),

/***/ "./src/base/SystemSocketConnection.js":
/*!********************************************!*\
  !*** ./src/base/SystemSocketConnection.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SystemSocketConnection": () => (/* binding */ SystemSocketConnection)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _Logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Logger.js */ "./src/base/Logger.js");
/* harmony import */ var _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Events/SystemEvent.js */ "./src/base/Events/SystemEvent.js");





/**
 * Represents Socket connection
 */
class SystemSocketConnection extends EventTarget {
    #systemSettings;
    #socket;

    /**
     * @hideconstructor
     */
    constructor(systemSettings) {
        super();
        if (!systemSettings) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#systemSettings = systemSettings;
    }

    init() {
        __webpack_require__.e(/*! import() */ "vendors-node_modules_socket_io-client_build_esm_index_js").then(__webpack_require__.bind(__webpack_require__, /*! socket.io-client */ "./node_modules/socket.io-client/build/esm/index.js")).then((module) => {
            this.#socket = module.io(this.#systemSettings.network.address, {withCredentials: true});
            
            this.#registerSocketListeners();
        });
    }

    /**
     * @returns {boolean}
     */
    get isServerConnected () {
        if (this.#socket && this.#socket.connected) {
            return true;
        } else {
            return false;
        }
    }
    
    get playerId() {
        return this.#socket.id;
    }

    sendGatherRoomsInfo() {
        this.#socket.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.CLIENT_SERVER.ROOMS_INFO_REQUEST);
    }

    sendCreateOrJoinRoom(roomName, map) {
        this.#socket.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.CLIENT_SERVER.CREATE_OR_JOIN, roomName , map);
    }

    sendMessage(message) {
        this.#socket.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.CLIENT_SERVER.CLIENT_MESSAGE, message);
    }

    #onConnect = () => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_2__.Logger.debug("connected, socket id: " + this.#socket.id);
        this.dispatchEvent(new Event(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.CONNECTION_STATUS_CHANGED));
    };

    #onDisconnect = (reason) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_2__.Logger.debug("server disconnected, reason: " + reason);
        this.dispatchEvent(new Event(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.CONNECTION_STATUS_CHANGED));
    };

    #onData = (event) => {
        console.warn("server data: ", event);
    };

    #onMessage = (message) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_2__.Logger.debug("received new message from server: " + message);
        this.dispatchEvent(new _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_3__.SystemEvent(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.SERVER_MESSAGE, message));
    };

    #onRoomsInfo = (rooms) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_2__.Logger.debug("received roomsInfo " + rooms);
        this.dispatchEvent(new _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_3__.SystemEvent(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.ROOMS_INFO, rooms));
    };

    #onCreateNewRoom = (room, map) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_2__.Logger.debug("CLIENT SOCKET: Created room  " + room);
        this.dispatchEvent(new _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_3__.SystemEvent(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.CREATED, {room, map}));
    };

    #onRoomIsFull = (room) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_2__.Logger.debug("CLIENT SOCKET: Room is full, can't join: " + room);
        this.dispatchEvent(new _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_3__.SystemEvent(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.FULL, {room}));
    };

    #onJoinedToRoom = (room, map) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_2__.Logger.debug("CLIENT SOCKET: Joined to room: " + room, ", map: ", map);
        this.dispatchEvent(new _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_3__.SystemEvent(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.JOINED, {room, map}));
    };

    #onUnjoinedFromRoom = (playerId) => {
        this.dispatchEvent(new _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_3__.SystemEvent(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.DISCONNECTED, {playerId}));
    };

    #registerSocketListeners() {
        this.#socket.on("connect", this.#onConnect);
        this.#socket.on("disconnect", this.#onDisconnect);
        this.#socket.on("data", this.#onData);

        this.#socket.on("roomsInfo", this.#onRoomsInfo);
    
        this.#socket.on("created", this.#onCreateNewRoom);
    
        this.#socket.on("full", this.#onRoomIsFull);
    
        this.#socket.on("joined", this.#onJoinedToRoom);
    
        this.#socket.on("log", function(array) {
            console.log.apply(console, array);
        });
    
        this.#socket.on("message", this.#onMessage);
    
        this.#socket.on("removed", function(message) {
            console.log("removed message");
            console.log(message);
        });

        this.#socket.on("disconnected", this.#onUnjoinedFromRoom);

        addEventListener("beforeunload", this.#disconnect);
    }

    #disconnect = () => {
        this.#socket.disconnect();
    };
}

/***/ }),

/***/ "./src/base/WebGlDrawProgramData.js":
/*!******************************************!*\
  !*** ./src/base/WebGlDrawProgramData.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WebGlDrawProgramData": () => (/* binding */ WebGlDrawProgramData)
/* harmony export */ });
class WebGlDrawProgramData {
    /**
     * @type {string}
     */
    #programName;
    /**
     * @type {number[]}
     */
    #vectors;
    /**
     * @type {number[]}
     */ 
    #textures;
    /**
     * @type {}
     */ 
    #image;
    /**
     * @type {string}
     */ 
    #imageName;
    /**
     * @type {string[]}
     */
    #drawMask;
    /**
     * @type {number}
     */ 
    #rotation;
    /**
     * @type {number[]}
     */ 
    #translation;
    /**
     * @type {number[]}
     */ 
    #scale;
    /**
     * @type {number}
     */ 
    #programVerticesNum;

    constructor(programName, vectors, textures, image, imageName, drawMask = ["SRC_ALPHA", "ONE_MINUS_SRC_ALPHA"], rotation = 0, translation = [0,0], scale = [1, 1]) {
        this.#programName = programName;
        this.#vectors = vectors;
        this.#textures = textures;
        this.#image = image;
        this.#imageName = imageName;
        this.#drawMask = drawMask;
        this.#rotation = rotation;
        this.#translation = translation;
        this.#scale = scale;
        this.#programVerticesNum = vectors.length / 2; 
    }

    get programName() {
        return this.#programName;
    }
    
    get vectors() {
        return this.#vectors;
    }
    
    get textures() {
        return this.#textures;
    }
    
    get image() {
        return this.#image;
    }
    
    get imageName() {
        return this.#imageName;
    }
    
    get drawMask() {
        return this.#drawMask;
    }
    
    get rotation() {
        return this.#rotation;
    }
    
    get translation() {
        return this.#translation;
    }
    
    get scale() {
        return this.#scale;
    }

    get programVerticesNum() {
        return this.#programVerticesNum;
    }
    
    isProgramDataCanBeMerged(imageName, drawMask = ["SRC_ALPHA", "ONE_MINUS_SRC_ALPHA"], rotation = 0, translation = [0,0], scale = [1, 1]) {

        if (this.imageName === imageName 
            && this.drawMask[0] === drawMask[0] 
            && this.drawMask[1] === drawMask[1]
            && this.rotation === rotation
            && this.translation[0] === translation[0]
            && this.translation[1] === translation[1]
            && this.scale[0] === scale[0]
            && this.scale[1] === scale[1]) {
            return true;
        } else {
            return false;
        }
    }
    
    mergeProgramData(vectors, textures) {
        this.#vectors.push(...vectors);
        this.#textures.push(...textures);
        this.#programVerticesNum = this.#vectors.length / 2; 
    }

}


/***/ }),

/***/ "./src/base/WebGlInterface.js":
/*!************************************!*\
  !*** ./src/base/WebGlInterface.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WebGlInterface": () => (/* binding */ WebGlInterface)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ "./src/utils.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _WebGlDrawProgramData_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./WebGlDrawProgramData.js */ "./src/base/WebGlDrawProgramData.js");





class WebGlInterface {
    /**
     * @type {string}
     */
    #vertexShaderSource;
    /**
     * @type {string}
     */
    #fragmentShaderSource;
    /**
     * @type {Map<string, WebGLProgram>}
     */
    #programs;
    /**
     * @type {Array<WebGlDrawProgramData>}
     */
    #programsData;
    /**
     * @type {Map<string, Object>}
     */
    #coordsLocations;
    /**
     * @type {number}
     */
    #verticesNumber;
    /**
     * @type {WebGLRenderingContext}
     */
    #gl;
    /**
     * @type {boolean}
     */
    #debug;
    /**
     * @type  {Map<string, number>}
     */
    #images_bind;
    /**
     * @type {WebGLBuffer | null}
     */
    #positionBuffer;
    /**
     * @type {WebGLBuffer | null}
     */
    #texCoordBuffer;

    constructor(context, debug) {
        if (!context || !(context instanceof WebGLRenderingContext)) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.UNEXPECTED_INPUT_PARAMS, " context parameter should be specified and equal to WebGLRenderingContext");
        }
        
        this.#gl = context;
        this.#debug = debug;
        this.#programs = new Map();
        this.#programsData = [];
        this.#coordsLocations = new Map();
        this.#images_bind = new Map();
        this.#verticesNumber = 0;
        this.#positionBuffer = this.#gl.createBuffer();
        this.#texCoordBuffer = this.#gl.createBuffer();
    }

    _fixCanvasSize(width, height) {
        this.#gl.viewport(0, 0, width, height);
    }

    _initiateImagesDrawProgram() {
        this.#vertexShaderSource = `
        attribute vec2 a_texCoord;

        attribute vec2 a_position;

        uniform vec2 u_translation;
        uniform float u_rotation;
        uniform vec2 u_scale;

        uniform vec2 u_resolution;

        varying vec2 v_texCoord;

        void main(void) {
            float c = cos(-u_rotation);
            float s = sin(-u_rotation);

            mat3 translationMatrix1 = mat3(
                1, 0, 0,
                0, 1, 0,
                u_translation.x, u_translation.y, 1
            );

            mat3 translationMatrix2 = mat3(
                1, 0, 0,
                0, 1, 0,
                -u_translation.x, -u_translation.y, 1
            );
            
            mat3 rotationMatrix = mat3(
                c, -s, 0,
                s, c, 0,
                0, 0, 1
            );

            mat3 scalingMatrix = mat3(
                u_scale.x, 0, 0,
                0, u_scale.y, 0,
                0, 0, 1
            );

            mat3 matrix = translationMatrix1 * rotationMatrix * translationMatrix2 * scalingMatrix;
            //Scale
            // vec2 scaledPosition = a_position * u_scale;
            // Rotate the position
            // vec2 rotatedPosition = vec2(
            //    scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
            //    scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x
            //);
            
            //vec2 position = rotatedPosition + u_translation;
            vec2 position = (matrix * vec3(a_position, 1)).xy;

            //convert position from pixels to 0.0 to 1.0
            vec2 zeroToOne = position / u_resolution;

            //convert from 0->1 to 0->2
            vec2 zeroToTwo = zeroToOne * 2.0;

            //convert from 0->2 to -1->+1
            vec2 clipSpace = zeroToTwo - 1.0;

            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            
            v_texCoord = a_texCoord;
        }
        `;
        this.#fragmentShaderSource = `
        precision mediump float;

        uniform sampler2D u_image;

        //texCoords passed in from the vertex shader
        varying vec2 v_texCoord;

        void main() {
            vec4 color = texture2D(u_image, v_texCoord);
            gl_FragColor = color;
        }
        `;
        const program = this.#initProgram(),
            programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES;

        this.#setProgram(programName, program);

        const gl = this.#gl,
            translationLocation = gl.getUniformLocation(program, "u_translation"),
            rotationRotation = gl.getUniformLocation(program, "u_rotation"),
            scaleLocation = gl.getUniformLocation(program, "u_scale"),
            resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution"),
            positionAttributeLocation = gl.getAttribLocation(program, "a_position"),
            texCoordLocation = gl.getAttribLocation(program, "a_texCoord"),
            u_imageLocation = gl.getUniformLocation(program, "u_image");

        gl.enable(gl.BLEND);
        // turn attribute on

        this.#coordsLocations.set(programName, {
            translationLocation,
            rotationRotation,
            scaleLocation,
            resolutionUniformLocation,
            positionAttributeLocation,
            texCoordLocation,
            u_imageLocation
        });
        return Promise.resolve();
    }

    _initPrimitivesDrawProgram() {
        this.#vertexShaderSource = `
        precision mediump float;

        attribute vec2 a_position;

        uniform vec2 u_translation;
        uniform float u_rotation;
        uniform vec2 u_scale;

        uniform vec2 u_resolution;

        void main(void) {
            float c = cos(-u_rotation);
            float s = sin(-u_rotation);

            mat3 translationMatrix1 = mat3(
                1, 0, 0,
                0, 1, 0,
                u_translation.x, u_translation.y, 1
            );

            //mat3 translationMatrix2 = mat3(
            //    1, 0, 0,
            //    0, 1, 0,
            //    -u_translation.x, -u_translation.y, 1
            //);
            
            mat3 rotationMatrix = mat3(
                c, -s, 0,
                s, c, 0,
                0, 0, 1
            );

            mat3 scalingMatrix = mat3(
                u_scale.x, 0, 0,
                0, u_scale.y, 0,
                0, 0, 1
            );

            //mat3 matrix = translationMatrix1 * rotationMatrix * translationMatrix2 * scalingMatrix;

            mat3 matrix = translationMatrix1 * rotationMatrix * scalingMatrix;

            //Scale
            // vec2 scaledPosition = a_position * u_scale;
            // Rotate the position
            // vec2 rotatedPosition = vec2(
            //    scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
            //    scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x
            //);
            
            //vec2 position = rotatedPosition + u_translation;
            vec2 position = (matrix * vec3(a_position, 1)).xy;

            //convert position from pixels to 0.0 to 1.0
            vec2 zeroToOne = position / u_resolution;

            //convert from 0->1 to 0->2
            vec2 zeroToTwo = zeroToOne * 2.0;

            //convert from 0->2 to -1->+1
            vec2 clipSpace = zeroToTwo - 1.0;

            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        }
        `;
        this.#fragmentShaderSource = `
        precision mediump float;

        uniform vec4 u_color;
        uniform float u_fade_min; 
        uniform float u_fade_max;
        uniform vec2 a_position;
        uniform vec2 u_resolution;
        uniform vec2 u_translation;
        
        void main(void) {
            vec4 p = u_color;
            if (u_fade_min > 0.0) {
                vec2 fix_tr = vec2(u_translation.x, u_resolution.y - u_translation.y); 
                float distance = distance(fix_tr.xy, gl_FragCoord.xy);
                if (u_fade_min <= distance && distance <= u_fade_max) {
                    float percent = ((distance - u_fade_max) / (u_fade_min - u_fade_max)) * 100.0;
                    p.a = u_color.a * (percent / 100.0);
                }
            }

            gl_FragColor = p;
        }
        `;
        const program = this.#initProgram(),
            programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES;
        this.#setProgram(programName, program);

        const gl = this.#gl,
            translationLocation = gl.getUniformLocation(program, "u_translation"),
            rotationRotation = gl.getUniformLocation(program, "u_rotation"),
            scaleLocation = gl.getUniformLocation(program, "u_scale"),
            resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution"),
            colorUniformLocation = gl.getUniformLocation(program, "u_color"),
            positionAttributeLocation = gl.getAttribLocation(program, "a_position"),
            fadeMinLocation = gl.getUniformLocation(program, "u_fade_min"),
            fadeMaxLocation =  gl.getUniformLocation(program, "u_fade_max");

        this.#coordsLocations.set(programName, {
            translationLocation,
            rotationRotation,
            scaleLocation,
            resolutionUniformLocation,
            colorUniformLocation,
            positionAttributeLocation,
            fadeMinLocation,
            fadeMaxLocation
        });
        return Promise.resolve();
    }
    
    /**
     * 
     * @param {*} vectors 
     * @param {*} textures 
     * @param {*} image 
     * @param {*} imageName 
     * @param {*} drawMask 
     * @param {*} rotation 
     * @param {*} translation 
     * @param {*} scale 
     * @returns {Promise<void>}
     */
    _bindTileImages(vectors, textures, image, imageName, drawMask = ["SRC_ALPHA", "ONE_MINUS_SRC_ALPHA"], rotation = 0, translation = [0, 0], scale = [1, 1]) {
        return new Promise((resolve) => {
            const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
                existingProgramData = this.#programsData.filter((data) => data.programName === programName);
                
            let isProgramDataMerged = false;

            for(let i = 0; i < existingProgramData.length; i++) {
                const data = existingProgramData[i];
                if (data.isProgramDataCanBeMerged(imageName, drawMask)) {
                    data.mergeProgramData(vectors, textures);
                    isProgramDataMerged = true;
                }
            }

            if (!isProgramDataMerged) {
                this.#programsData.push(new _WebGlDrawProgramData_js__WEBPACK_IMPORTED_MODULE_3__.WebGlDrawProgramData(programName, vectors, textures, image, imageName, drawMask, rotation, translation, scale));
            }

            resolve();
        });
    }
    
    /**
     * 
     * @returns {Promise<void>}
     */
    _executeTileImagesDraw() {
        return new Promise((resolve) => {
            const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
                program = this.#getProgram(programName),
                { translationLocation,
                    rotationRotation,
                    scaleLocation,
                    resolutionUniformLocation,
                    positionAttributeLocation,
                    texCoordLocation,
                    u_imageLocation } = this.#coordsLocations.get(programName),
                gl = this.#gl,
                programsData = this.#programsData.filter(programData => programData.programName === programName);
           
            gl.useProgram(program);

            for (let i = 0; i < programsData.length; i++) {
                const data = programsData[i];
                // set the resolution
                gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
                gl.uniform2f(translationLocation, data.translation[0], data.translation[1]);
                gl.uniform2f(scaleLocation, data.scale[0], data.scale[1]);
                gl.uniform1f(rotationRotation, data.rotation);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vectors), gl.STATIC_DRAW);

                gl.enableVertexAttribArray(positionAttributeLocation);
                //Tell the attribute how to get data out of positionBuffer
                const size = 2,
                    type = gl.FLOAT, // data is 32bit floats
                    normalize = false,
                    stride = 0, // move forward size * sizeof(type) each iteration to get next position
                    offset = 0; // start of beginning of the buffer
                gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

                //textures buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.textures), gl.STATIC_DRAW);

                gl.enableVertexAttribArray(texCoordLocation);
                gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, offset);

                let bind_number  = this.#images_bind.get(data.imageName);

                if (!bind_number ) {
                    bind_number  = this.#images_bind.size + 1;
                    gl.activeTexture(gl["TEXTURE" + bind_number]);
                    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data.image);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    this.#images_bind.set(data.imageName, bind_number);
                } else {
                    gl.activeTexture(gl["TEXTURE" + bind_number]);
                }
                gl.uniform1i(u_imageLocation, bind_number);
                gl.blendFunc(gl[data.drawMask[0]], gl[data.drawMask[1]]);
                this.#verticesNumber = data.programVerticesNum;
                // Upload the image into the texture.
                this.#executeGlslProgram();
            }

            resolve();
        });
    }

    _bindAndDrawTileImages(vectors, textures, image, image_name, rotation = 0, translation = [0, 0], scale = [1, 1]) {
        const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
            program = this.#getProgram(programName),
            { translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                positionAttributeLocation,
                texCoordLocation,
                u_imageLocation } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vectors), gl.STATIC_DRAW);

        this.#verticesNumber += vectors.length / 2;
        gl.enableVertexAttribArray(positionAttributeLocation);
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        //textures buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        let bind_number  = this.#images_bind.get(image_name);

        if (!bind_number ) {
            bind_number  = this.#images_bind.size + 1;

            gl.activeTexture(gl["TEXTURE" + bind_number]);
            gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
            
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            this.#images_bind.set(image_name, bind_number);
        } else {
            gl.activeTexture(gl["TEXTURE" + bind_number]);
        }
        gl.uniform1i(u_imageLocation, bind_number );
        // make image transparent parts transparent
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // Upload the image into the texture.
        this.#executeGlslProgram();
    }

    _bindText(x, y, renderObject) {
        const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
            program = this.#getProgram(programName),
            { translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                positionAttributeLocation,
                texCoordLocation,
                u_imageLocation } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        //@toDo: add additional info to the #images_bind and avoid this call, if image is already created
        const { boxWidth, boxHeight, ctx } = this.#createCanvasText(renderObject),
            texture = ctx.canvas,
            image_name = renderObject.text;

        y = y - boxHeight;

        const rotation = 0, 
            translation = [0, 0], 
            scale = [1, 1];
        const vecX1 = x,
            vecY1 = y,
            vecX2 = vecX1 + boxWidth,
            vecY2 = vecY1 + boxHeight;
        const verticesBufferData = [
                vecX1, vecY1,
                vecX2, vecY1,
                vecX1, vecY2,
                vecX1, vecY2,
                vecX2, vecY1,
                vecX2, vecY2
            ],
            texturesBufferData = [
                0, 0,
                1, 0,
                0, 1,
                0, 1,
                1, 0,
                1, 1
            ];

        gl.useProgram(program);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesBufferData), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        //textures buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturesBufferData), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        
        this.#verticesNumber += 6;
        // remove box
        // fix text edges
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        //gl.depthMask(false);
        let bind_number = this.#images_bind.get(image_name);
        if (!bind_number) {
            bind_number  = this.#images_bind.size + 1;

            gl.activeTexture(gl["TEXTURE" + bind_number]);
            gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
            // Upload the image into the texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            // As image properties such as text stroke changes, image_name still the same,
            // and image won't replaced
            //this.#images_bind.set(image_name, bind_number);
        } else {
            gl.activeTexture(gl["TEXTURE" + bind_number]);
        }
        gl.uniform1i(u_imageLocation, bind_number);
        //console.log("vertex attrib 1 :", gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING));
        this.#executeGlslProgram();
    }

    _bindPrimitives(renderObject, rotation = 0, translation = [0, 0], scale = [1, 1]) {
        const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.#getProgram(programName),
            { 
                translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation,
                fadeMinLocation
            } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, 0);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        switch (renderObject.type) {
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE:
            this.#setSingleRectangle(renderObject.width, renderObject.height);
            this.#verticesNumber += 6;
            break;
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.TEXT:
            break;
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CIRCLE: {
            const coords = renderObject.vertices;
            gl.bufferData(this.#gl.ARRAY_BUFFER, 
                new Float32Array(coords), this.#gl.STATIC_DRAW);
            this.#verticesNumber += coords.length / 2;
            break;
        }
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.POLYGON: {
            const triangles = this.#triangulatePolygon(renderObject.vertices);
            this.#bindPolygon(triangles);
            const len = triangles.length;
            if (len % 3 !== 0) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, `polygons ${renderObject.id}, vertices are not correct, skip drawing`);
                return;
            }
            this.#verticesNumber += len / 2;
            break;
        }
        }
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const colorArray = this.#rgbaToArray(renderObject.bgColor);
        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        if (renderObject.blendFunc) {
            gl.blendFunc(renderObject.blendFunc[0], renderObject.blendFunc[1]);
        }
        if (renderObject.cut) {
            gl.blendEquation(gl.FUNC_SUBTRACT);
        }
        //disable attribute which is not used in this program
        //if (gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_ENABLED)) {
        //gl.disableVertexAttribArray(1);
        //}
        this.#executeGlslProgram(0, null, true);
    }

    _drawLines(linesArray, color, lineWidth = 1, rotation = 0, translation = [0, 0]) {
        const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.#getProgram(programName),
            { resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation,
            
                translationLocation,
                rotationRotation,
                scaleLocation,
                fadeMinLocation
            } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, 1, 1);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, 0);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        this.#gl.bufferData(
            this.#gl.ARRAY_BUFFER, 
            new Float32Array(linesArray),
            this.#gl.STATIC_DRAW);

        this.#verticesNumber += linesArray.length / 2;
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const colorArray = this.#rgbaToArray(color);
        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        gl.lineWidth(lineWidth);

        //gl.blendFunc(gl.ONE, gl.DST_COLOR );
        
        //disable attribute which is not used in this program
        //if (gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_ENABLED)) {
        //    gl.disableVertexAttribArray(1);
        //}
        this.#executeGlslProgram(0, gl.LINES);
    }

    _drawPolygon(vertices, color, lineWidth = 1, rotation = 0, translation = [0, 0]) {
        const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.#getProgram(programName),
            { resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation,
            
                translationLocation,
                rotationRotation,
                scaleLocation,
                fadeMinLocation
            } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, 1, 1);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, 0);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        const triangles = this.#triangulatePolygon(vertices);
        
        const polygonVerticesNum = triangles.length;
        if (polygonVerticesNum % 3 !== 0) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, "polygon boundaries vertices are not correct, skip drawing");
            return;
        }
        this.#bindPolygon(triangles);
        this.#verticesNumber += polygonVerticesNum / 2;
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const colorArray = this.#rgbaToArray(color);
        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);

        this.#executeGlslProgram(0, null);
    }

    _bindConus(renderObject, rotation = 0, translation = [0, 0], scale = [1, 1]) {
        const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.#getProgram(programName),
            { 
                translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation,
                fadeMinLocation,
                fadeMaxLocation
            } = this.#coordsLocations.get(programName),
            gl = this.#gl,
            coords = renderObject.vertices,
            fillStyle = renderObject.bgColor,
            fade_min = renderObject.fade_min,
            fadeLen = renderObject.radius;
            
        gl.useProgram(program);
        
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, fade_min);
        gl.uniform1f(fadeMaxLocation, fadeLen);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        gl.bufferData(this.#gl.ARRAY_BUFFER, 
            new Float32Array(coords), this.#gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionAttributeLocation);
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        this.#verticesNumber += coords.length / 2;

        if (renderObject.blendFunc) {
            gl.blendFunc(renderObject.blendFunc[0], renderObject.blendFunc[1]);
        }

        if (renderObject.cut) {
            // cut bottom 
            gl.blendEquation(gl.FUNC_SUBTRACT);
            //gl.blendFunc( gl.ONE, gl.ONE );
            //gl.blendFunc(gl.ONE, gl.DST_COLOR);
        } //else {
        //gl.disable(gl.BLEND);
        // make transparent
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        //}

        const colorArray = this.#rgbaToArray(fillStyle);

        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        //disable attribute which is not used in this program
        //if (gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_ENABLED)) {
        //gl.disableVertexAttribArray(1);
        //}
        this.#executeGlslProgram(0, gl.TRIANGLE_FAN, true);
    }

    _clearView() {
        const gl = this.#gl;
        // Set clear color to black, fully opaque
        this.#programsData = [];
        gl.clearColor(0, 0, 0, 0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    #setProgram(name, program) {
        this.#programs.set(name, program);
    }

    #getProgram(name) {
        return this.#programs.get(name);
    }

    #bindPolygon(vertices) {
        this.#gl.bufferData(
            this.#gl.ARRAY_BUFFER, 
            new Float32Array(vertices),
            this.#gl.STATIC_DRAW);
    }

    #setSingleRectangle(width, height) {
        const x1 = 0,
            x2 = 0 + width,
            y1 = 0,
            y2 = 0 + height;
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, 
            new Float32Array([
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2]), this.#gl.STATIC_DRAW);
    }
    
    #executeGlslProgram(offset = 0, primitiveType, resetEquation) {
        const primitiveTypeValue = primitiveType ? primitiveType : this.#gl.TRIANGLES,
            gl = this.#gl;
            
        const err = this.#debug ? gl.getError() : 0;
        if (err !== 0) {
            console.error(err);
            throw new Error("Error num: " + err);
        } else {
            gl.drawArrays(primitiveTypeValue, offset, this.#verticesNumber);
            this.#verticesNumber = 0;
            // set blend to default
            if (resetEquation) {
                gl.blendEquation(  gl.FUNC_ADD );
            }
        }
    }

    /**
     * @returns {WebGLProgram}
     */
    #initProgram() {
        const gl = this.#gl,
            program = gl.createProgram();

        if (program) {
            const compVertexShader = this.#compileShader(this.#vertexShaderSource, gl.VERTEX_SHADER);
            if (compVertexShader) {
                gl.attachShader(program, compVertexShader);
            } else {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, "#compileShader(vertexShaderSource) is null");
            }

            const compFragmentShader = this.#compileShader(this.#fragmentShaderSource, gl.FRAGMENT_SHADER);
            if (compFragmentShader) {
                gl.attachShader(program, compFragmentShader);
            } else {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, "#compileShader(fragmentShaderSource) is null");
            }

            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                const info = gl.getProgramInfoLog(program);
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, `Could not compile WebGL program. \n\n${info}`);
            }
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, "gl.createProgram() is null");
        }
        return program;
    }

    /**
     * 
     * @param {*} renderObject 
     * @returns {{boxWidth:number, boxHeight:number, ctx:CanvasRenderingContext2D}}
     */
    #createCanvasText(renderObject) {
        const ctx = document.createElement("canvas").getContext("2d");
        if (ctx) { 
            ctx.font = renderObject.font;
            renderObject._textMetrics = ctx.measureText(renderObject.text);
            const boxWidth = renderObject.boundariesBox.width, 
                boxHeight = renderObject.boundariesBox.height;
            ctx.canvas.width = boxWidth;
            ctx.canvas.height = boxHeight;
            ctx.font = renderObject.font;
            ctx.textBaseline = "bottom";// bottom
            if (renderObject.fillStyle) {
                ctx.fillStyle = renderObject.fillStyle;
                ctx.fillText(renderObject.text, 0, boxHeight);
            } 
            if (renderObject.strokeStyle) {
                ctx.strokeStyle = renderObject.strokeStyle;
                ctx.strokeText(renderObject.text, 0, boxHeight);
            }
            return { boxWidth, boxHeight, ctx };
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, "can't getContext('2d')");
        }
    }

    #compileShader(shaderSource, shaderType) {
        const shader = this.#gl.createShader(shaderType);
        if (shader) {
            this.#gl.shaderSource(shader, shaderSource);
            this.#gl.compileShader(shader);

            if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
                const info = this.#gl.getShaderInfoLog(shader);
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, "Couldn't compile webGl program. \n\n" + info);
            }
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, `gl.createShader(${shaderType}) is null`);
        }
        return shader;
    }

    /**
     * 
     * @param {string} rgbaColor 
     * @returns {number[]}
     */
    #rgbaToArray (rgbaColor) {
        return rgbaColor.replace("rgba(", "").replace(")", "").split(",").map((/** @param {string} */item) => Number(item.trim()));
    }

    #triangulatePolygon(vertices) {
        return this.#triangulate(vertices);
    }

    /**
     * 
     * @param {Array<Array<number>>} polygonVertices 
     * @param {Array<number>} triangulatedPolygon 
     * @returns {Array<number>}
     */
    #triangulate (polygonVertices, triangulatedPolygon = []) {
        const len = polygonVertices.length,
            vectorsCS = (a, b, c) => (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.crossProduct)({x:c[0] - a[0], y: c[1] - a[1]}, {x:b[0] - a[0], y: b[1] - a[1]});

        if (len <= 3) {
            polygonVertices.forEach(vertex => {
                triangulatedPolygon.push(vertex[0]);
                triangulatedPolygon.push(vertex[1]);
            });
            return triangulatedPolygon;
        }
        const verticesSortedByY = [...polygonVertices].sort((curr, next) => next[1] - curr[1]);
        const topVertexIndex = polygonVertices.indexOf(verticesSortedByY[0]),
            startVertexIndex = topVertexIndex !== len - 1 ? topVertexIndex + 1 : 0;
        
        let processedVertices = polygonVertices,
            processedVerticesLen = processedVertices.length,
            skipCount = 0,
            i = startVertexIndex;
        
        while(processedVertices.length > 2) {
            // if overflowed, start from beginning
            const currLen = processedVertices.length;
            if (i >= currLen) {
                i -= currLen;
            }
    
            const prevVertex = i === 0 ? processedVertices[currLen - 1] : processedVertices[i - 1],
                currentVertex = processedVertices[i],
                nextVertex = currLen === i + 1 ? processedVertices[0] : processedVertices[i + 1];
    
            
            const cs = vectorsCS(prevVertex, currentVertex, nextVertex);
    
            if (cs < 0) {
                triangulatedPolygon.push(prevVertex[0]);
                triangulatedPolygon.push(prevVertex[1]);
                triangulatedPolygon.push(currentVertex[0]);
                triangulatedPolygon.push(currentVertex[1]);
                triangulatedPolygon.push(nextVertex[0]);
                triangulatedPolygon.push(nextVertex[1]);
                processedVertices = processedVertices.filter((val, index) => index !== i);
            } else {
                skipCount += 1;
                if (skipCount > processedVerticesLen) {
                    (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.DRAW_PREPARE_ERROR, "Can't extract triangles. Probably vertices input is not correct, or the order is wrong");
                }
            }
            i++;
        }
        
        return triangulatedPolygon;
    }
}

/***/ }),

/***/ "./src/configs.js":
/*!************************!*\
  !*** ./src/configs.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SystemSettings": () => (/* binding */ SystemSettings)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants.js */ "./src/constants.js");


/**
 * Settings object, should be passed as a parameter to System.constructor().
 */
const SystemSettings = {
    mode: _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.MODE.DEBUG,
    
    gameOptions: {
        library: _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.LIBRARY.WEBGL,
        checkWebGlErrors: false,
        debugMobileTouch: false,
        optimization: null,
        loadingScreen: {
            backgroundColor:  "rgba(128, 128, 128, 0.6)",
            loadingBarBg: "rgba(128, 128, 128, 1)",
            loadingBarProgress: "rgba(128, 128, 128, 0.2)",
        },
        boundaries: {
            drawLayerBoundaries: false,
            drawObjectBoundaries: false,
            boundariesColor: "rgba(224, 12, 21, 0.6)",
            boundariesWidth: 2
        },
        render: {
            averageFPStime: 10000,
            minCircleTime: 16, //ms which is ~60 FPS
            boundaries: {
                mapBoundariesEnabled: true,
                realtimeCalculations: true,
                wholeWorldPrecalculations: false
            }
        }
    },

    network: {
        address: "https://gameserver.reslc.ru:9009",
        gatherRoomsInfoInterval: 5000
    },

    canvasMaxSize: {
        width: 900,
        height: 960
    },

    worldSize: {
        width: 960,
        height: 960
    },

    defaultCanvasKey: "default"
};

/***/ }),

/***/ "./src/constants.js":
/*!**************************!*\
  !*** ./src/constants.js ***!
  \**************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CONST": () => (/* binding */ CONST),
/* harmony export */   "ERROR_CODES": () => (/* binding */ ERROR_CODES),
/* harmony export */   "WARNING_CODES": () => (/* binding */ WARNING_CODES)
/* harmony export */ });
const CONST = {
    MODE: {
        DEBUG: "DEBUG",
        PRODUCTION: "PRODUCTION"
    },
    SCREENS: {},
    AUDIO: {},
    CONNECTION_STATUS: {
        DISCONNECTED: "disconnected",
        CONNECTED: "connected",
        CONNECTION_LOST: "connection lost"
    },
    EVENTS: {
        SYSTEM: {
            START_PAGE:"START_PAGE",
            STOP_PAGE: "STOP_PAGE",
            RENDER: {
                START: "start",
                END: "end"
            }
        },
        GAME: {
            BOUNDARIES_COLLISION: "BOUNDARIES_COLLISION",
            OBJECTS_COLLISION: "OBJECTS_COLLISION"
        },
        WEBSOCKET: {
            SERVER_CLIENT: {
                CONNECTION_STATUS_CHANGED: "CONNECTION_STATUS_CHANGED",
                ROOMS_INFO: "roomsInfo",
                CREATED: "created",
                JOINED: "joined",
                FULL: "full",
                DISCONNECTED: "disconnected",
                SERVER_MESSAGE: "message",
                RESTARTED: "restarted",
            },
            CLIENT_SERVER: {
                ROOMS_INFO_REQUEST: "gatherRoomsInfo",
                CREATE_OR_JOIN: "create or join",
                RESTART_REQUEST: "restart",
                CLIENT_MESSAGE: "message"
            }
        }
    },
    WEBGL: {
        DRAW_PROGRAMS: {
            PRIMITIVES: "drawPrimitives",
            IMAGES: "drawImages"
        }
    },
    DRAW_TYPE: {
        RECTANGLE: "rect",
        CONUS: "conus",
        CIRCLE: "circle",
        POLYGON: "polygon",
        LINE: "line",
        TEXT: "text",
        IMAGE: "image"
    },
    LAYERS: {
        DEFAULT: "default-view-layer",
        BOUNDARIES: "boundaries-view-layer"
    },
    GAME_OPTIONS: {},
    LIBRARY: {
        WEBGL: "webgl"
    },
    OPTIMIZATION: {
        WEB_ASSEMBLY: {
            ASSEMBLY_SCRIPT: "ASSEMBLY_SCRIPT"
        }
    }
};

const ERROR_CODES = {
    CREATE_INSTANCE_ERROR: "CREATE_INSTANCE_ERROR",
    VIEW_NOT_EXIST: "VIEW_NOT_EXIST",
    ELEMENT_NOT_EXIST: "ELEMENT_NOT_EXIST",
    FILE_NOT_EXIST: "FILE_NOT_EXIST",
    UNEXPECTED_INPUT_PARAMS: "UNEXPECTED_INPUT_PARAMS",
    UNHANDLED_EXCEPTION: "UNHANDLED_EXCEPTION",
    UNHANDLED_PREPARE_EXCEPTION: "UNHANDLED_PREPARE_EXCEPTION",
    CANVAS_KEY_NOT_SPECIFIED: "CANVAS_KEY_NOT_SPECIFIED",
    CANVAS_WITH_KEY_NOT_EXIST: "CANVAS_WITH_KEY_NOT_EXIST",
    WRONG_TYPE_ERROR: "WRONG_TYPE_ERROR",
    UNEXPECTED_WS_MESSAGE: "UNEXPECTED_WS_MESSAGE",
    UNEXPECTED_PLAYER_ID: "UNEXPECTED_PLAYER_ID",
    UNEXPECTED_BULLET_ID: "UNEXPECTED_BULLET_ID",
    UNEXPECTED_EVENT_NAME: "UNEXPECTED_EVENT_NAME",
    WEBGL_ERROR: "WEBGL_ERROR",
    DRAW_PREPARE_ERROR: "DRAW_PREPARE_ERROR",
    UNEXPECTED_TOUCH_AREA: "UNEXPECTED_TOUCH_AREA",
};

const WARNING_CODES =  {
    FILE_LOADING_ISSUE: "FILE_LOADING_ISSUE",
    ASSETS_NOT_READY: "ASSETS_NOT_READY",
    NOT_FOUND: "NOT_FOUND",
    NOT_TESTED: "NOT_TESTED",
    WORLD_DIMENSIONS_NOT_SET: "WORLD_DIMENSIONS_NOT_SET",
    UNHANDLED_DRAW_ISSUE: "UNHANDLED_DRAW_ISSUE",
    UNEXPECTED_WORLD_SIZE: "UNEXPECTED_WORLD_SIZE",
    AUDIO_ALREADY_REGISTERED: "AUDIO_ALREADY_REGISTERED",
    AUDIO_NOT_REGISTERED: "AUDIO_NOT_REGISTERED",
    AUDIO_NOT_LOADED: "AUDIO_NOT_LOADED",
    UNKNOWN_DRAW_OBJECT: "UNKNOWN_DRAW_OBJECT",
    METHOD_NOT_IMPLEMENTED: "METHOD_NOT_IMPLEMENTED",
    POLYGON_VERTICES_NOT_CORRECT: "POLYGON_VERTICES_NOT_CORRECT"
};

/***/ }),

/***/ "./src/design/LoadingScreen.js":
/*!*************************************!*\
  !*** ./src/design/LoadingScreen.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LoadingScreen": () => (/* binding */ LoadingScreen)
/* harmony export */ });
/* harmony import */ var _base_ScreenPage_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base/ScreenPage.js */ "./src/base/ScreenPage.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../index.js */ "./src/index.js");



const logoKey = "logoKey";
class LoadingScreen extends _base_ScreenPage_js__WEBPACK_IMPORTED_MODULE_0__.ScreenPage {
    #total = 0;
    #loaded = 0;
    #barWidth = 0;
    register() {
        //this.loader.addImage(logoKey, "./images/icon.png");
    }

    init() {
        const [w, h] = this.screenPageData.canvasDimensions,
            barWidth = w/3,
            barHeight = 20;
        this.createCanvasView(_index_js__WEBPACK_IMPORTED_MODULE_1__.CONST.LAYERS.DEFAULT);
        //this.logo = this.draw.image(w/2, h/2, 300, 200, logoKey);
        this.background = this.draw.rect(0, 0, w, h, this.systemSettings.gameOptions.loadingScreen.backgroundColor);  
        this.loadingBarBg = this.draw.rect(w/2 - (barWidth/2), h/2 - (barHeight/2), barWidth, barHeight, this.systemSettings.gameOptions.loadingScreen.loadingBarBg);
        this.loadingBarProgress = this.draw.rect(w/2 - (barWidth/2), h/2 - (barHeight/2), barWidth, barHeight, this.systemSettings.gameOptions.loadingScreen.loadingBarProgress);

        this.#barWidth = barWidth;
        this.addRenderObject(_index_js__WEBPACK_IMPORTED_MODULE_1__.CONST.LAYERS.DEFAULT, this.background);
        //this.addRenderObject(CONST.LAYERS.DEFAULT, this.logo);
        this.addRenderObject(_index_js__WEBPACK_IMPORTED_MODULE_1__.CONST.LAYERS.DEFAULT, this.loadingBarBg);
        this.addRenderObject(_index_js__WEBPACK_IMPORTED_MODULE_1__.CONST.LAYERS.DEFAULT, this.loadingBarProgress);
    }

    _progress = (loaded, left) => {
        const [w, h] = this.screenPageData.canvasDimensions,
            widthPart = this.#barWidth / this.#total;

        this.#loaded = loaded;
        
        this.loadingBarProgress.width = widthPart * this.#loaded;
    };

    start(options) {
        this.#total = options.total;
    }

    // a workaround for checking upload progress before render
    get loader() {
        return ({filesWaitingForUpload:0});
    }
} 

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CONST": () => (/* reexport safe */ _constants_js__WEBPACK_IMPORTED_MODULE_6__.CONST),
/* harmony export */   "DrawImageObject": () => (/* reexport safe */ _base_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_2__.DrawImageObject),
/* harmony export */   "Primitives": () => (/* reexport module object */ _base_Primitives_js__WEBPACK_IMPORTED_MODULE_4__),
/* harmony export */   "ScreenPage": () => (/* reexport safe */ _base_ScreenPage_js__WEBPACK_IMPORTED_MODULE_1__.ScreenPage),
/* harmony export */   "System": () => (/* reexport safe */ _base_System_js__WEBPACK_IMPORTED_MODULE_0__.System),
/* harmony export */   "SystemAudioInterface": () => (/* reexport safe */ _base_SystemAudioInterface_js__WEBPACK_IMPORTED_MODULE_3__.SystemAudioInterface),
/* harmony export */   "SystemSettings": () => (/* reexport safe */ _configs_js__WEBPACK_IMPORTED_MODULE_5__.SystemSettings),
/* harmony export */   "utils": () => (/* reexport module object */ _utils_js__WEBPACK_IMPORTED_MODULE_7__)
/* harmony export */ });
/* harmony import */ var _base_System_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base/System.js */ "./src/base/System.js");
/* harmony import */ var _base_ScreenPage_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base/ScreenPage.js */ "./src/base/ScreenPage.js");
/* harmony import */ var _base_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./base/DrawImageObject.js */ "./src/base/DrawImageObject.js");
/* harmony import */ var _base_SystemAudioInterface_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./base/SystemAudioInterface.js */ "./src/base/SystemAudioInterface.js");
/* harmony import */ var _base_Primitives_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./base/Primitives.js */ "./src/base/Primitives.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./configs.js */ "./src/configs.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./constants.js */ "./src/constants.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils.js */ "./src/utils.js");











/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "angle_2points": () => (/* binding */ angle_2points),
/* harmony export */   "angle_3points": () => (/* binding */ angle_3points),
/* harmony export */   "countClosestTraversal": () => (/* binding */ countClosestTraversal),
/* harmony export */   "countClosestTraversal2": () => (/* binding */ countClosestTraversal2),
/* harmony export */   "countDistance": () => (/* binding */ countDistance),
/* harmony export */   "crossProduct": () => (/* binding */ crossProduct),
/* harmony export */   "dotProduct": () => (/* binding */ dotProduct),
/* harmony export */   "dotProductWithAngle": () => (/* binding */ dotProductWithAngle),
/* harmony export */   "generateUniqId": () => (/* binding */ generateUniqId),
/* harmony export */   "isLineShorter": () => (/* binding */ isLineShorter),
/* harmony export */   "isMobile": () => (/* binding */ isMobile),
/* harmony export */   "isPointCircleIntersect": () => (/* binding */ isPointCircleIntersect),
/* harmony export */   "isPointLineIntersect": () => (/* binding */ isPointLineIntersect),
/* harmony export */   "isPointOnTheLine": () => (/* binding */ isPointOnTheLine),
/* harmony export */   "isPointPolygonIntersect": () => (/* binding */ isPointPolygonIntersect),
/* harmony export */   "isPointRectIntersect": () => (/* binding */ isPointRectIntersect),
/* harmony export */   "isPolygonLineIntersect": () => (/* binding */ isPolygonLineIntersect),
/* harmony export */   "isSafari": () => (/* binding */ isSafari),
/* harmony export */   "pointToCircleDistance": () => (/* binding */ pointToCircleDistance),
/* harmony export */   "verticesArrayToArrayNumbers": () => (/* binding */ verticesArrayToArrayNumbers)
/* harmony export */ });
/* harmony import */ var _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base/Primitives.js */ "./src/base/Primitives.js");


function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent) ;
}

function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function pointToCircleDistance(x, y, circle) {
    const pointToCircleCenterDistance = new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(x, y, circle.x, circle.y).length;
    return pointToCircleCenterDistance - circle.r;
}

function countClosestTraversal(line, sight) {
    const x1 = sight.x1,
        y1 = sight.y1,
        x2 = sight.x2,
        y2 = sight.y2;
    const x3 = line.x1,
        y3 = line.y1,
        x4 = line.x2,
        y4 = line.y2;

    const r_px = x1,
        r_py = y1,
        r_dx = x2-x1,
        r_dy = y2-y1;

    const s_px = x3,
        s_py = y3,
        s_dx = x4-x3,
        s_dy = y4-y3;

    const r_mag = Math.sqrt(r_dx*r_dx+r_dy*r_dy),
        s_mag = Math.sqrt(s_dx*s_dx+s_dy*s_dy);
    if(r_dx/r_mag==s_dx/s_mag && r_dy/r_mag==s_dy/s_mag){
        return null;
    }

    const T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx),
        T1 = (s_px+s_dx*T2-r_px)/r_dx;

    if(T1<0 || isNaN(T1)) return null;
    if(T2<0 || T2>1) return null;

    return {
        x: r_px+r_dx*T1,
        y: r_py+r_dy*T1,
        p: T1
    };
}

/**
 * 
 * @param {{x1:number, y1:number, x2:number, y2:number}} line1 
 * @param {{x1:number, y1:number, x2:number, y2:number}} line2 
 * @returns {{x:number, y:number, p:number} | undefined}
 * @ignore
 */
function countClosestTraversal2(line1, line2) {
    const x1 = line2.x1,
        y1 = line2.y1,
        x2 = line2.x2,
        y2 = line2.y2;
    const x3 = line1.x1,
        y3 = line1.y1,
        x4 = line1.x2,
        y4 = line1.y2;

    const det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    // lines are parallel, or coincident
    if (det === 0){
        return;
    }
    let x = ((x1*y2 - y1*x2) * (x3 - x4) - (x1 - x2) * (x3*y4 - y3*x4)) / det;
    let y = ((x1*y2 - y1*x2) * (y3 - y4) - (y1 - y2) * (x3*y4 - y3*x4)) / det;
    const point = {x, y};
    
    if (isPointOnTheLine(point, line1, 0.0000000000001) && isPointOnTheLine(point, line2, 0.0000000000001)) {
        const p = Math.sqrt(Math.pow((x - x1), 2) + Math.pow((y - y1), 2));
        return {x, y, p};
    } else {
        return;
    }
}

function angle_2points(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function angle_3points(a, b, c) {
    const x1 = a.x - b.x,
        x2 = c.x - b.x,
        y1 = a.y - b.y,
        y2 = c.y - b.y,
        d1 = Math.sqrt(x1 * x1 + y1 * y1),
        d2 = Math.sqrt(x2 * x2 + y2 * y2);
    //console.log("angle: ", (Math.acos((x1* x2 + y1 * y2) / (d1 * d2))* 180) / Math.PI);
    return Math.acos((x1* x2 + y1 * y2) / (d1 * d2));
}

function dotProductWithAngle(lenA, lenB, angle) {
    return lenA * lenB * Math.cos(angle);
}

function dotProduct(vec1, vec2) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
}

function crossProduct(a, b) {
    return (a.x * b.y - b.x * a.y);
}

function isPointOnTheLine(point, line, m_error = 0) {
    return  (
        ((point.x >= (line.x1 - m_error)) && (point.x <= (line.x2 + m_error))) || 
                ((point.x <= (line.x1 + m_error)) && (point.x >= (line.x2 - m_error)))
    ) && (
        ((point.y >= (line.y1 - m_error)) && (point.y <= (line.y2 + m_error))) || 
                ((point.y <= (line.y1 + m_error)) && (point.y >= (line.y2 - m_error)))
    );
}

function countDistance(obj1, obj2) {
    return new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(obj1.x, obj1.y, obj2.x, obj2.y).length;
}

function isLineShorter(line1, line2) {
    return (new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line1.x1, line1.y1, line1.x2, line1.y2)).length < (new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line2.x1, line2.y1, line2.x2, line2.y2)).length;
}

function isPointLineIntersect(point, line) {
    const lineL = new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line.x1, line.y1, line.x2, line.y2).length,
        lengthAB = new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line.x1, line.y1, point.x, point.y).length + new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line.x2, line.y2, point.x, point.y).length;

    if (lengthAB <= lineL + 0.2) {
        //Logger.debug("point to line intersect. line len: " + lineL + ", line AB len: " + lengthAB);
        return true;
    }
    return false;
}

/**
 * 
 * @param {Array<Array<number>>} polygon 
 * @param {{x1:number, y1:number, x2:number, y2:number}} line 
 * @returns {{x:number, y:number, p:number} | null}
 * @ignore
 */
function isPolygonLineIntersect(polygon, line) {
    const len = polygon.length;
    for (let i = 0; i < len; i+=1) {
        let curr = polygon[i],
            next = polygon[i+1];
        //if next item not exist and current is not first
        if (!next) {
            // if current vertex is not the first one
            if (!(curr[0] === polygon[0][0] && curr[1] === polygon[0][1])) {
                next = polygon[0];
            } else {
                continue;
            }
        }
        const edge = { x1: curr[0], y1: curr[1], x2: next[0], y2: next[1] };
        const intersection = countClosestTraversal2(edge, line);
        if (intersection) {
            return intersection;
        }
    }
    if (polygon[len-1][0] !== polygon[0][0] && polygon[len-1][1] !== polygon[0][1]) {
        //check one last item
        const curr = polygon[len - 1],
            next = polygon[0];
        const edge = { x1: curr[0], y1: curr[1], x2: next[0], y2: next[1] };
        const intersection = countClosestTraversal2(edge, line);
        if (intersection) {
            return intersection;
        }
    }
    return null;
}

function isPointPolygonIntersect(/*x, y, polygon*/) {
    //const vertices = polygon.vertices;

    return false;
}

function isPointRectIntersect(x, y, rect) {
    if (x >= rect.x && x <= rect.width + rect.x && y >= rect.y && y <= rect.y + rect.height) {
        return true;
    } else {
        return false;
    }
}

function isPointCircleIntersect(x, y, circle) {
    const radius = circle.width,
        lineToCircleCenter = new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(x, y, circle.x, circle.y),
        pointCircleLineLength = lineToCircleCenter.length;
    if (pointCircleLineLength < radius)
        return true;
    else
        return false;
}

function generateUniqId() {
    return Math.round(Math.random() * 1000000); 
}

function verticesArrayToArrayNumbers(array) {
    const len = array.length,
        numbers = [];
    for (let i = 0; i < len; i++) {
        const vertex = array[i];
        numbers.push([vertex.x, vertex.y]);
    }
    return numbers;
}



/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/******/ // expose the modules object (__webpack_modules__)
/******/ __webpack_require__.m = __webpack_modules__;
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/ensure chunk */
/******/ (() => {
/******/ 	__webpack_require__.f = {};
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = (chunkId) => {
/******/ 		return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 			__webpack_require__.f[key](chunkId, promises);
/******/ 			return promises;
/******/ 		}, []));
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/get javascript chunk filename */
/******/ (() => {
/******/ 	// This function allow to reference async chunks
/******/ 	__webpack_require__.u = (chunkId) => {
/******/ 		// return url for filenames based on template
/******/ 		return "" + chunkId + ".index.es6.js";
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/load script */
/******/ (() => {
/******/ 	var inProgress = {};
/******/ 	var dataWebpackPrefix = "jsge:";
/******/ 	// loadScript function to load a script via script tag
/******/ 	__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 		if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 		var script, needAttach;
/******/ 		if(key !== undefined) {
/******/ 			var scripts = document.getElementsByTagName("script");
/******/ 			for(var i = 0; i < scripts.length; i++) {
/******/ 				var s = scripts[i];
/******/ 				if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 			}
/******/ 		}
/******/ 		if(!script) {
/******/ 			needAttach = true;
/******/ 			script = document.createElement('script');
/******/ 			script.type = "module";
/******/ 			script.charset = 'utf-8';
/******/ 			script.timeout = 120;
/******/ 			if (__webpack_require__.nc) {
/******/ 				script.setAttribute("nonce", __webpack_require__.nc);
/******/ 			}
/******/ 			script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 			script.src = url;
/******/ 		}
/******/ 		inProgress[url] = [done];
/******/ 		var onScriptComplete = (prev, event) => {
/******/ 			// avoid mem leaks in IE.
/******/ 			script.onerror = script.onload = null;
/******/ 			clearTimeout(timeout);
/******/ 			var doneFns = inProgress[url];
/******/ 			delete inProgress[url];
/******/ 			script.parentNode && script.parentNode.removeChild(script);
/******/ 			doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 			if(prev) return prev(event);
/******/ 		};
/******/ 		var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 		script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 		script.onload = onScriptComplete.bind(null, script.onload);
/******/ 		needAttach && document.head.appendChild(script);
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/publicPath */
/******/ (() => {
/******/ 	var scriptUrl;
/******/ 	if (typeof import.meta.url === "string") scriptUrl = import.meta.url
/******/ 	// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 	// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 	if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 	scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 	__webpack_require__.p = scriptUrl;
/******/ })();
/******/ 
/******/ /* webpack/runtime/jsonp chunk loading */
/******/ (() => {
/******/ 	// no baseURI
/******/ 	
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"main": 0
/******/ 	};
/******/ 	
/******/ 	__webpack_require__.f.j = (chunkId, promises) => {
/******/ 			// JSONP chunk loading for javascript
/******/ 			var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 			if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 	
/******/ 				// a Promise means "currently loading".
/******/ 				if(installedChunkData) {
/******/ 					promises.push(installedChunkData[2]);
/******/ 				} else {
/******/ 					if(true) { // all chunks have JS
/******/ 						// setup Promise in chunk cache
/******/ 						var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 						promises.push(installedChunkData[2] = promise);
/******/ 	
/******/ 						// start chunk loading
/******/ 						var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 						// create error before stack unwound to get useful stacktrace later
/******/ 						var error = new Error();
/******/ 						var loadingEnded = (event) => {
/******/ 							if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 								installedChunkData = installedChunks[chunkId];
/******/ 								if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 								if(installedChunkData) {
/******/ 									var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 									var realSrc = event && event.target && event.target.src;
/******/ 									error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 									error.name = 'ChunkLoadError';
/******/ 									error.type = errorType;
/******/ 									error.request = realSrc;
/******/ 									installedChunkData[1](error);
/******/ 								}
/******/ 							}
/******/ 						};
/******/ 						__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 					} else installedChunks[chunkId] = 0;
/******/ 				}
/******/ 			}
/******/ 	};
/******/ 	
/******/ 	// no prefetching
/******/ 	
/******/ 	// no preloaded
/******/ 	
/******/ 	// no HMR
/******/ 	
/******/ 	// no HMR manifest
/******/ 	
/******/ 	// no on chunks loaded
/******/ 	
/******/ 	// install a JSONP callback for chunk loading
/******/ 	var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 		var [chunkIds, moreModules, runtime] = data;
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0;
/******/ 		if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 			for(moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) var result = runtime(__webpack_require__);
/******/ 		}
/******/ 		if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				installedChunks[chunkId][0]();
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 	
/******/ 	}
/******/ 	
/******/ 	var chunkLoadingGlobal = self["webpackChunkjsge"] = self["webpackChunkjsge"] || [];
/******/ 	chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 	chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ })();
/******/ 
/************************************************************************/
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module is referenced by other modules so it can't be inlined
/******/ var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ var __webpack_exports__CONST = __webpack_exports__.CONST;
/******/ var __webpack_exports__DrawImageObject = __webpack_exports__.DrawImageObject;
/******/ var __webpack_exports__Primitives = __webpack_exports__.Primitives;
/******/ var __webpack_exports__ScreenPage = __webpack_exports__.ScreenPage;
/******/ var __webpack_exports__System = __webpack_exports__.System;
/******/ var __webpack_exports__SystemAudioInterface = __webpack_exports__.SystemAudioInterface;
/******/ var __webpack_exports__SystemSettings = __webpack_exports__.SystemSettings;
/******/ var __webpack_exports__utils = __webpack_exports__.utils;
/******/ export { __webpack_exports__CONST as CONST, __webpack_exports__DrawImageObject as DrawImageObject, __webpack_exports__Primitives as Primitives, __webpack_exports__ScreenPage as ScreenPage, __webpack_exports__System as System, __webpack_exports__SystemAudioInterface as SystemAudioInterface, __webpack_exports__SystemSettings as SystemSettings, __webpack_exports__utils as utils };
/******/ 

//# sourceMappingURL=index.es6.js.map