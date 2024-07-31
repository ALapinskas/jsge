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
const PROGRESS_EVENT_TYPE={loadstart:"loadstart",progress:"progress",abort:"abort",error:"error",load:"load",timeout:"timeout"},ERROR_MESSAGES={LOADER_NOT_REGISTERED:" loader is not registered.",RECURSION_ERROR:"Too much recursion. Stop iteration.",NOT_CORRECT_METHOD_TYPE:"uploadMethod should be instance of Promise and return upload result value",XML_FILE_EXTENSION_INCORRECT:" AtlasXML file extension is incorrect, only .xml file supported",TILESET_FILE_EXTENSION_INCORRECT:" tileset file extension is not correct, only .tsj or .json files are supported",TILEMAP_FILE_EXTENSION_INCORRECT:" tilemap file extension is not correct, only .tmj or .json files are supported",INPUT_PARAMS_ARE_INCORRECT:" fileKey and url should be provided",ATLAS_IMAGE_LOADING_FAILED:"Error loading atlas image ",TILESET_LOADING_FAILED:"Error loading related tileset ",TILEMAP_LOADING_FAILED:"Error loading tilemap ",AUDIO_LOADING_FAILED:"Error loading audio ",IMAGE_LOADING_FAILED:"Error loading image ",XML_FORMAT_INCORRECT:" XML format is not correct."};class Loader{#e;#t;#r=new Map;#s=new Map;constructor(e,t){this.#e=e,this.#t=(e,r,...s)=>{const i=t(e,r,...s);if(i instanceof Promise)return i.then((t=>this.#i(t,e)));throw new TypeError(ERROR_MESSAGES.NOT_CORRECT_METHOD_TYPE)}}#i=(e,t)=>new Promise(((r,s)=>{e||null===e||Warning("AssetsManager: uploadMethod for "+this.#e+" returns incorrect value"),this.#o(t,e),this.#a(t),r()}));#o(e,t){this.#s.set(e,t)}#a(e){this.#r.delete(e)}get filesWaitingForUpload(){return this.#r.size}get loadingQueue(){return this.#r}get uploadMethod(){return this.#t}_addFile=(e,t)=>{this.#r.has(e)&&Warning("AssetsManager: File "+this.#e+" with key "+e+" is already added"),this.#r.set(e,t)};_isFileInQueue=e=>this.#r.has(e);_getFile=e=>this.#s.get(e)}class AssetsManager{#n=5;#l=new EventTarget;#d=new Map;#E=0;constructor(){this.registerLoader("Audio",this._loadAudio),this.registerLoader("Image",this._loadImage),this.registerLoader("TileMap",this._loadTileMap),this.registerLoader("TileSet",this._loadTileSet),this.registerLoader("AtlasImageMap",this._loadAtlasImage),this.registerLoader("AtlasXML",this._loadAtlasXml)}get filesWaitingForUpload(){let e=0;return Array.from(this.#d.values()).map((t=>e+=t.filesWaitingForUpload)),e}registerLoader=(e,t=this._defaultUploadMethod)=>{this["add"+e]=(t,r,...s)=>{this.addFile(e,t,r,...s)},this["get"+e]=t=>this.getFile(e,t),this["is"+e+["InQueue"]]=t=>this.isFileInQueue(e,t);const r=this.#d.get(e)||new Loader(e,t);this.#d.set(e,r)};preload(){return this.#h(),new Promise((async(e,t)=>{this.#u().then((()=>{this.#c(),e()})).catch((e=>{t(e)}))}))}#u(e=0){return this.#R().then((t=>{if(0===this.filesWaitingForUpload)return Promise.resolve(t);if(++e>this.#n){const e=new Error(ERROR_MESSAGES.RECURSION_ERROR);return this.#g(e),Promise.reject(new Error(ERROR_MESSAGES.RECURSION_ERROR))}return this.#u(e)}))}#R(){return new Promise(((e,t)=>{let r=[];Array.from(this.#d.values()).forEach((e=>{Array.from(e.loadingQueue.entries()).forEach((t=>{const s=new Promise(((r,s)=>e.uploadMethod(t[0],...t[1]).then((e=>r(e)))));r.push(s)}))})),Promise.allSettled(r).then((r=>{for(const s of r){if("rejected"===s.status){const e=s.reason;this.#_(e)?t(e):(Warning("AssetsManager: "+e.message),this.#g(e))}e(r)}}))}))}addEventListener(e,t,...r){PROGRESS_EVENT_TYPE[e]?this.#l.addEventListener(e,t,...r):Warning("AssetsManager: Event type should be one of the ProgressEvent.type")}removeEventListener(e,t,...r){this.#l.removeEventListener(e,t,...r)}_loadAtlasXml=(e,t)=>(this.#m(t),fetch(t).then((e=>e.text())).then((e=>(new window.DOMParser).parseFromString(e,"text/xml"))).then((r=>{const s=r.documentElement||r.activeElement,i=s.attributes.getNamedItem("imagePath"),o=s.children;if(i){const r=this.#p(t);return this.addAtlasImageMap(e,r+i.value,o,r),Promise.resolve(s)}{const t=new Error(e+ERROR_MESSAGES.XML_FORMAT_INCORRECT);return this.#g(t),Promise.resolve(t)}})));_loadAtlasImage=(e,t,r,s="anonymous")=>new Promise(((e,i)=>{const o=new Image,a=new Map,n=document.createElement("canvas"),l=n.getContext("2d");o.crossOrigin=s,o.onload=()=>{const t=[];let s=[];n.width=o.width,n.height=o.height,l.drawImage(o,0,0);for(let e of r){const r=e.attributes,i=r.getNamedItem("name").value,o=i.includes(".")?i.split(".")[0]:i,a=r.getNamedItem("x").value,n=r.getNamedItem("y").value,d=r.getNamedItem("width").value,E=r.getNamedItem("height").value;t.push(createImageBitmap(l.getImageData(a,n,d,E),{premultiplyAlpha:"premultiply"})),s.push(o)}this.#S(),Promise.all(t).then((t=>{t.forEach(((e,t)=>{const r=s[t];a.set(r,e),this.addImage(r,"empty url",e)})),n.remove(),e(a)}))},o.onerror=()=>{const r=new Error(ERROR_MESSAGES.ATLAS_IMAGE_LOADING_FAILED+t);this.#g(r),e(null)},o.src=t}));_loadTileSet=(e,t,r=1,s)=>(this.#I(t),fetch(s?s+t:t).then((e=>e.json())).then((e=>{const{name:t,image:i,spacing:o,margin:a,tilewidth:n,tileheight:l}=e;return t&&i&&!this.isFileInQueue("Image",t)&&this.addImage(t,s?s+i:i),e.gid=r,Promise.resolve(e)})).catch((()=>{const e=new Error(ERROR_MESSAGES.TILESET_LOADING_FAILED+t);return this.#g(e),Promise.resolve(null)})));_defaultUploadMethod=(e,t)=>fetch(t);_loadTileMap=(e,t,r=!0)=>(this.#L(t),fetch(t).then((e=>e.json())).then((e=>{const s=this.#p(t);if(!0===r&&e.tilesets&&e.tilesets.length>0){const t=[];return e.tilesets.forEach(((e,r)=>{const{firstgid:i,source:o}=e,a=this._loadTileSet("default-"+i,o,i,s).then((e=>(this.#S(),Promise.resolve(e))));t.push(a)})),Promise.all(t).then((t=>{for(let r=0;r<t.length;r++){const s=t[r];e.tilesets[r].data=s}return Promise.resolve(e)}))}return Promise.resolve(e)})).catch((e=>(e.message.includes("JSON.parse:")&&(e=new Error(ERROR_MESSAGES.TILEMAP_LOADING_FAILED+t)),this.#g(e),Promise.resolve(null)))));_loadAudio=(e,t)=>new Promise((e=>{const r=new Audio(t);r.addEventListener("loadeddata",(()=>{this.#S(),e(r)})),r.addEventListener("error",(()=>{const r=new Error(ERROR_MESSAGES.AUDIO_LOADING_FAILED+t);this.#g(r),e(null)}))}));_loadImage=(e,t,r,s="anonymous")=>new Promise(((e,i)=>{if(r)e(r);else{const r=new Image;r.crossOrigin=s,r.onload=()=>{createImageBitmap(r,{premultiplyAlpha:"premultiply"}).then((t=>{this.#S(),e(t)}))},r.onerror=()=>{const r=new Error(ERROR_MESSAGES.IMAGE_LOADING_FAILED+t);this.#g(r),e(null)},r.src=t}}));#m(e){e.includes(".xml")||Exception(e+ERROR_MESSAGES.XML_FILE_EXTENSION_INCORRECT)}#I(e){e.includes(".tsj")||e.includes(".json")||Exception(e+ERROR_MESSAGES.TILESET_FILE_EXTENSION_INCORRECT)}#L(e){e.includes(".tmj")||e.includes(".json")||Exception(e+ERROR_MESSAGES.TILEMAP_FILE_EXTENSION_INCORRECT)}#_(e){return e.message.includes(ERROR_MESSAGES.NOT_CORRECT_METHOD_TYPE)||e.message.includes(ERROR_MESSAGES.XML_FILE_EXTENSION_INCORRECT)||e.message.includes(ERROR_MESSAGES.TILESET_FILE_EXTENSION_INCORRECT)||e.message.includes(ERROR_MESSAGES.TILEMAP_FILE_EXTENSION_INCORRECT)||e.message.includes(ERROR_MESSAGES.INPUT_PARAMS_ARE_INCORRECT)||e.message.includes(ERROR_MESSAGES.LOADER_NOT_REGISTERED)}#p(e){let t=e.split("/"),r=t.length,s="/";return t[r-1].includes(".tmj")||t[r-1].includes(".xml")||t[r-1].includes(".json")?(t.pop(),s=t.join("/")+"/"):(t[r-2].includes(".tmj")||t[r-2].includes(".xml")||t[r-2].includes(".json"))&&(t.splice(r-2,2),s=t.join("/")+"/"),s}addFile(e,t,r,...s){const i=this.#d.get(e);i?(this.#A(t,r,e),i._addFile(t,[r,...s])):Exception(e+ERROR_MESSAGES.LOADER_NOT_REGISTERED)}isFileInQueue(e,t){const r=this.#d.get(e);if(r)return r._isFileInQueue(t);Exception("Loader for "+e+" is not registered!")}getFile(e,t){const r=this.#d.get(e);if(r)return r._getFile(t);Exception("Loader for "+e+" is not registered!")}#A(e,t,r){const s=ERROR_MESSAGES.INPUT_PARAMS_ARE_INCORRECT;e&&0!==e.trim().length||Exception("add"+r+"()"+s),t&&0!==t.trim().length||Exception("add"+r+"()"+s)}#h(){let e=this.filesWaitingForUpload;this.#l.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.loadstart,{total:e}))}#c(){this.#l.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.load))}#S(){const e=this.filesWaitingForUpload;this.#E+=1,this.#l.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.progress,{lengthComputable:!0,loaded:this.#E,total:e}))}#g(e){Warning("AssetsManger: "+e.message),this.#l.dispatchEvent(new ErrorEvent(PROGRESS_EVENT_TYPE.error,{error:e}))}}function Exception(e){throw new Error(e)}function Warning(e){console.warn(e)}

/***/ }),

/***/ "./src/base/2d/DrawCircleObject.js":
/*!*****************************************!*\
  !*** ./src/base/2d/DrawCircleObject.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawCircleObject": () => (/* binding */ DrawCircleObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/2d/DrawShapeObject.js");



/**
 * Circle object to draw.
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
    constructor(x, y, radius, bgColor) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CIRCLE, x, y, bgColor);
        this.#radius = radius;
        this.#vertices = this._interpolateConus(radius);
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

/***/ "./src/base/2d/DrawConusObject.js":
/*!****************************************!*\
  !*** ./src/base/2d/DrawConusObject.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawConusObject": () => (/* binding */ DrawConusObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/2d/DrawShapeObject.js");



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
    constructor(x, y, radius, bgColor, angle, fade = 0) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CONUS, x, y, bgColor);
        this.#radius = radius;
        this.#angle = angle;
        this.#fade_min = fade;
        this.#vertices = this._interpolateConus(radius, angle);
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

/***/ "./src/base/2d/DrawImageObject.js":
/*!****************************************!*\
  !*** ./src/base/2d/DrawImageObject.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawImageObject": () => (/* binding */ DrawImageObject)
/* harmony export */ });
/* harmony import */ var _AnimationEvent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../AnimationEvent.js */ "./src/base/AnimationEvent.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/2d/DrawShapeObject.js");
/* harmony import */ var _Temp_ImageTempStorage_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Temp/ImageTempStorage.js */ "./src/base/Temp/ImageTempStorage.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Exception.js */ "./src/base/Exception.js");





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
     * @type {ImageBitmap}
     */
    #image;
    /**
     * @type {EventTarget}
     */
    #emitter;
    /**
     * @type {Map<string, AnimationEvent>}
     */
    #animations;
    /**
     * @type {null | string}
     */
    #activeAnimation;
    /**
     * @type {number}
     */
    #imageIndex;
    /**
     * @type {number}
     */
    #spacing = 0;
    /**
     * @type {Array<Array<number>>}
     */
    #vertices;
    /**
     * @type {Object | null}
     */
    #circleBoundaries;
    /**
     * @type {ImageTempStorage}
     */
    #textureStorage;

    /**
     * @hideconstructor
     */
    constructor(mapX, mapY, width, height, key, imageIndex = 0, boundaries, image, spacing = 0) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.DRAW_TYPE.IMAGE, mapX, mapY);
        this.#key = key;
        this.#emitter = new EventTarget();
        this.#animations = new Map();
        this.image = image;
        this.#imageIndex = imageIndex;
        this.#spacing = spacing;
        this.#w = width;
        this.#h = height;
        this.#vertices = boundaries && !boundaries.r ? this._convertVerticesArray(boundaries) : boundaries && boundaries.r ? this._calculateConusBoundaries(boundaries.r) : this._calculateRectVertices(width, height);
        this.#circleBoundaries = boundaries && typeof boundaries.r !== "undefined" ? boundaries : null;
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
     * @type {ImageBitmap}
     */
    get image() {
        return this.#image;
    }

    set image(value) {
        if (this.#textureStorage) {
            this.#textureStorage._isTextureRecalculated = true;
        }

        this.#image = value;
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
     * Image spacing (for tilesets.spacing > 0)
     * @type {number}
     */
    get spacing() {
        return this.#spacing;
    }

    /**
     * Determines if image is animated or not
     * @type {boolean}
     */
    get hasAnimations() {
        return this.#animations.size > 0;
    }

    /**
     * @type {null | string}
     */
    get activeAnimation() {
        return this.#activeAnimation;
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

    get circleBoundaries() {
        return this.#circleBoundaries;
    }

    /**
     * @ignore
     */
    _processActiveAnimations() {
        const activeAnimation = this.#activeAnimation;
        if (activeAnimation) {
            const animationEvent = this.#animations.get(activeAnimation);
            animationEvent.iterateAnimationIndex();
            this.#imageIndex = animationEvent.currentSprite;
        }
    }
    /**
     * @ignore
     */
    get _textureStorage() {
        return this.#textureStorage;
    }

    /**
     * @ignore
     */
    set _textureStorage(texture) {
        this.#textureStorage = texture;
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
     * @param { Array<number> | Array<{duration:number, id:number}> } animationSpriteIndexes - animation image indexes
     * @param { boolean } [isRepeated = false] - animation is cycled or not, cycled animation could be stopped only with stopRepeatedAnimation();
     */
    addAnimation (eventName, animationSpriteIndexes, isRepeated) {
        if (!this.#checkAnimationParams(animationSpriteIndexes)) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_4__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_1__.ERROR_CODES.UNEXPECTED_INPUT_PARAMS, " animationSpriteIndexes should be Array of indexes, or Array of objects {duration:number, id:number}");
        }
        const animationEvent = new _AnimationEvent_js__WEBPACK_IMPORTED_MODULE_0__.AnimationEvent(eventName, animationSpriteIndexes, isRepeated);
        this.#animations.set(eventName, animationEvent);
        this.addEventListener(eventName, this.#activateAnimation);
    }

    #checkAnimationParams (animationSpriteIndexes) {
        let isCorrect = true;
        animationSpriteIndexes.forEach(element => {
            if (typeof element !== "number") {
                if (typeof element.duration !== "number" || typeof element.id !== "number") {
                    isCorrect = false;
                }
            }     
        });
        return isCorrect;
    }
    #activateAnimation = (event) => {
        const animationName = event.type,
            animationEvent = this.#animations.get(animationName);
        // only one active animation can exist at a time
        if (this.#activeAnimation && this.#activeAnimation !== animationName) {
            this.stopRepeatedAnimation(this.#activeAnimation);
        }
        animationEvent.activateAnimation();
        this.#activeAnimation = animationName;
        this.#imageIndex = animationEvent.currentSprite;
    }; 

    /**
     *
     * @param {string=} eventName - animation name, if not provided - stop current active animation event
     */
    stopRepeatedAnimation (eventName) {
        this.#animations.get(eventName).deactivateAnimation();
        this.#activeAnimation = null;
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

/***/ "./src/base/2d/DrawLineObject.js":
/*!***************************************!*\
  !*** ./src/base/2d/DrawLineObject.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawLineObject": () => (/* binding */ DrawLineObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/2d/DrawShapeObject.js");



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

/***/ "./src/base/2d/DrawPolygonObject.js":
/*!******************************************!*\
  !*** ./src/base/2d/DrawPolygonObject.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawPolygonObject": () => (/* binding */ DrawPolygonObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/2d/DrawShapeObject.js");



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
    constructor(vertices, bgColor) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.POLYGON, vertices[0].x, vertices[0].y, bgColor);
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

/***/ "./src/base/2d/DrawRectObject.js":
/*!***************************************!*\
  !*** ./src/base/2d/DrawRectObject.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawRectObject": () => (/* binding */ DrawRectObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/2d/DrawShapeObject.js");



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
    constructor(x, y, w, h, bgColor) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE, x, y, bgColor);
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

/***/ "./src/base/2d/DrawShapeObject.js":
/*!****************************************!*\
  !*** ./src/base/2d/DrawShapeObject.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawShapeObject": () => (/* binding */ DrawShapeObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants.js */ "./src/constants.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../index.js */ "./src/index.js");



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
    /**
     * Is used for blending pixel arithmetic
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc.
     * @type {Array<number>}
     */
    #blendFunc;
    
    /**
     * @type {number}
     */
    #sortIndex = 0;
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
     * @type {undefined | number | null}
     */
    #attachedMaskId;
    /**
     * @type {boolean}
     */
    #isMask;
    /**
     * @type {boolean}
     */
    #isOffsetTurnedOff = false;

    /**
     * @type {boolean}
     */
    #isChanged = false;
    /**
     * @hideconstructor
     */
    constructor(type, mapX, mapY, bgColor) {
        this.#x = mapX;
        this.#y = mapY;
        this.#bg = bgColor;
        this.#type = type;
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
     * @type {number}
     */
    get sortIndex () {
        return this.#sortIndex;
    }

    set sortIndex(value) {
        this.#sortIndex = value;
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

    get isMaskAttached() {
        return !!this.#attachedMaskId;
    }

    /**
     * @ignore
     */
    get _maskId() {
        return this.#attachedMaskId;
    }

    /**
     * 
     * @param {DrawShapeObject} mask 
     */
    setMask(mask) {
        mask._isMask = true;
        this.#attachedMaskId = mask.id;
    }

    removeMask() {
        this.#attachedMaskId = null;
    }

    set _isMask(isSet) {
        this.#isMask = isSet;
    }

    get _isMask() {
        return this.#isMask;
    }

    get isOffsetTurnedOff() {
        return this.#isOffsetTurnedOff;
    }

    /**
     * turn off offset for specific draw object
     * gameStageData.centerCameraPosition() will take no effect on such object
     * Can be used for something that should be always on screen: control buttons, overlay masks etc.
     */
    turnOffOffset() {
        this.#isOffsetTurnedOff = true;
    }
    /**
     * @ignore
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
    _interpolateConus(radius, angle = 2*Math.PI, step = Math.PI/14) {
        let conusPolygonCoords = [0, 0];

        for (let r = 0; r <= angle; r += step) {
            let x2 = Math.cos(r) * radius,
                y2 = Math.sin(r) * radius;

            conusPolygonCoords.push(x2, y2);
        }

        return conusPolygonCoords;
    }

    /**
     * @param {number} radius 
     * @param {number} [angle = 2 * Math.PI]
     * @param {number} [step = Math.PI/12] 
     * @returns {Array<Array<number>>}
     * @ignore
     */
    _calculateConusBoundaries(radius, angle = 2*Math.PI, step = Math.PI/14) {
        let conusPolygonCoords = [];

        for (let r = 0; r <= angle; r += step) {
            let x2 = Math.cos(r) * radius,
                y2 = Math.sin(r) * radius;

            conusPolygonCoords.push([x2, y2]);
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

/***/ "./src/base/2d/DrawTextObject.js":
/*!***************************************!*\
  !*** ./src/base/2d/DrawTextObject.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawTextObject": () => (/* binding */ DrawTextObject)
/* harmony export */ });
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/2d/DrawShapeObject.js");
/* harmony import */ var _Primitives_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Primitives.js */ "./src/base/2d/Primitives.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _Temp_ImageTempStorage_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Temp/ImageTempStorage.js */ "./src/base/Temp/ImageTempStorage.js");






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
     * @type {HTMLCanvasElement}
     */
    #textureCanvas = document.createElement("canvas");

    /**
     * @type {ImageTempStorage}
     */
    #textureStorage;

    /**
     * @hideconstructor
     */
    constructor(mapX, mapY, text, font, fillStyle) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.DRAW_TYPE.TEXT, mapX, mapY);
        this.#text = text;
        this.#font = font;
        this.#fillStyle = fillStyle;
        this.#textMetrics;
        this.#calculateCanvasTextureAndMeasurements();
    }

    /**
     * Rectangle text box.
     * @type {Rectangle}
     */
    get boundariesBox() {
        const width = this.textMetrics ? Math.floor(this.textMetrics.width) : 300,
            height = this.textMetrics ? Math.floor(this.textMetrics.fontBoundingBoxAscent + this.textMetrics.fontBoundingBoxDescent): 30;
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
        if (value !== this.#text) {
            this.#text = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * @type {string}
     */
    get font() {
        return this.#font;
    }

    set font(value) {
        if (value !== this.#font) {
            this.#font = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * @type {string}
     */
    get textAlign() {
        return this.#textAlign;
    }

    set textAlign(value) {
        if (value !== this.#textAlign) {
            this.#textAlign = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * @type {string}
     */
    get textBaseline() {
        return this.#textBaseline;
    }

    set textBaseline(value) {
        if (value !== this.#textBaseline) {
            this.#textBaseline = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * font color
     * @type {string}
     */
    get fillStyle() {
        return this.#fillStyle;
    }

    /**
     * font color
     */
    set fillStyle(value) {
        if (value !== this.#fillStyle) {
            this.#fillStyle = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * font stroke color
     * @type {string}
     */
    get strokeStyle() {
        return this.#strokeStyle;
    }

    /**
     * font stroke color
     */
    set strokeStyle(value) {
        if (value !== this.#strokeStyle) {
            this.#strokeStyle = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * @type {TextMetrics}
     */
    get textMetrics() {
        return this.#textMetrics;
    }

    /**
     * @ignore
     */
    set _textMetrics(value) {
        this.#textMetrics = value;
    }

    /**
     * @ignore
     */
    get _textureStorage() {
        return this.#textureStorage;
    }

    /**
     * @ignore
     */
    set _textureStorage(texture) {
        this.#textureStorage = texture;
    }

    /**
     * @ignore
     */
    get _textureCanvas() {
        return this.#textureCanvas;
    }

    /**
     * 
     * @returns {void}
     */
    #calculateCanvasTextureAndMeasurements() {
        const ctx = this.#textureCanvas.getContext("2d", { willReadFrequently: true }); // cpu counting instead gpu
        if (ctx) {
            //ctx.clearRect(0, 0, this.#textureCanvas.width, this.#textureCanvas.height);
            ctx.font = this.font;
            this._textMetrics = ctx.measureText(this.text);
            const boxWidth = this.boundariesBox.width, 
                boxHeight = this.boundariesBox.height;
            
            ctx.canvas.width = boxWidth;
            ctx.canvas.height = boxHeight;
            // after canvas resize, have to cleanup and set the font again
            ctx.clearRect(0, 0, boxWidth, boxHeight);
            ctx.font = this.font;
            ctx.textBaseline = "bottom";// bottom
            if (this.fillStyle) {
                ctx.fillStyle = this.fillStyle;
                ctx.fillText(this.text, 0, boxHeight);
            } 
            if (this.strokeStyle) {
                ctx.strokeStyle = this.strokeStyle;
                ctx.strokeText(this.text, 0, boxHeight);
            }
            
            if (this.#textureStorage) {
                this.#textureStorage._isTextureRecalculated = true;
            }

            // debug canvas
            // this.#textureCanvas.style.position = "absolute";
            // document.body.appendChild(this.#textureCanvas);
            
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.ERROR_CODES.UNHANDLED_EXCEPTION, "can't getContext('2d')");
        }
    }
}

/***/ }),

/***/ "./src/base/2d/DrawTiledLayer.js":
/*!***************************************!*\
  !*** ./src/base/2d/DrawTiledLayer.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawTiledLayer": () => (/* binding */ DrawTiledLayer)
/* harmony export */ });
/* harmony import */ var _AnimationEvent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../AnimationEvent.js */ "./src/base/AnimationEvent.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/2d/DrawShapeObject.js");
/* harmony import */ var _Temp_ImageTempStorage_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Temp/ImageTempStorage.js */ "./src/base/Temp/ImageTempStorage.js");
/* harmony import */ var _Temp_TiledLayerTempStorage_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Temp/TiledLayerTempStorage.js */ "./src/base/Temp/TiledLayerTempStorage.js");




/**
 * A render object represents a layer from tiled editor
 * @see {@link DrawObjectFactory} should be created with factory method
 */
class DrawTiledLayer {
    #layerKey;
    #tileMapKey;
    #tilemap;
    #tilesets;
    /**
     * @type {string}
     */
    #DELIMITER = "-#-";
    #tilesetImages;
    /**
     * @type {Array<ImageTempStorage>}
     */
    #textureStorages;
    #layerData;
    #setBoundaries;
    #drawBoundaries;
    #attachedMaskId;
    /**
     * @type {number}
     */
    #sortIndex = 0;
    /**
     * @type {Map<string, AnimationEvent>}
     */
    #animations = new Map();
    #isOffsetTurnedOff;

    /**
     * @hideconstructor
     */
    constructor(layerKey, tileMapKey, tilemap, tilesets, tilesetImages, layerData, setBoundaries = false, shapeMask) {
        this.#layerKey = layerKey;
        this.#tileMapKey = tileMapKey;
        this.#tilemap = tilemap;
        this.#tilesets = tilesets;
        this.#textureStorages = [];
        this.#tilesetImages = tilesetImages;
        this.#layerData = layerData;
        
        this.#setBoundaries = setBoundaries;
        this.#drawBoundaries = setBoundaries ? setBoundaries : false;
        if (shapeMask) {
            this.setMask(shapeMask);
        }
        this.#processData(tilesets, layerData);
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

    get tilemap() {
        return this.#tilemap;
    }
    
    get tilesets() {
        return this.#tilesets;
    }

    get tilesetImages() {
        return this.#tilesetImages;
    }

    get layerData() {
        return this.#layerData;
    }
    /**
     * Should the layer borders used as boundaries, or not
     * Can be set in GameStage.addRenderLayer() method.
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

    /**
     * @ignore
     */
    get _maskId() {
        return this.#attachedMaskId;
    }
    /**
     * 
     * @param {DrawShapeObject} mask 
     */
    setMask(mask) {
        mask._isMask = true;
        this.#attachedMaskId = mask.id;
    }

    removeMask() {
        this.#attachedMaskId = null;
    }

    /**
     * @type {number}
     */
    get sortIndex () {
        return this.#sortIndex;
    }

    set sortIndex(value) {
        this.#sortIndex = value;
    }

    get isOffsetTurnedOff() {
        return this.#isOffsetTurnedOff;
    }
    turnOffOffset() {
        this.#isOffsetTurnedOff = true;
    }

    /**
     * Determines if image is animated or not
     * @type {boolean}
     */
    get hasAnimations() {
        return this.#animations.size > 0;
    }

    /**
     * @ignore
     */
    get _textureStorages() {
        return this.#textureStorages;
    }

    /**
     * @ignore
     */
    _setTextureStorage(index, value) {
        this.#textureStorages[index] = value;
    }

    /**
     * Tilesets has a property tiles, which could contain tile animations
     * or object boundaries, this is workaround for split this and add
     * additional properties for use in draw phase:
     * _hasAnimations
     * _animations - Map<id:activeSprite>
     * _hasBoundaries
     * _boundaries - Map<id:objectgroup>
     * @param {*} tilesets
     */
    #processData(tilesets, layerData) {
        // границы для слоя создаются одни, даже если они высчитываются с разных тайлсетов
        // поэтому суммируем и находим максимальное их количество
        let ellipseBLen = 0,
            pointBLen = 0,
            polygonBLen = 0;
        tilesets.forEach((tileset, idx) => {
            const tiles = tileset.data.tiles,
                name = tileset.data.name,
                firstgid = tileset.firstgid,
                nextTileset = this.tilesets[idx + 1],
                nextgid = nextTileset ? nextTileset.firstgid : 1_000_000_000;
                
            if (tiles) {
                for (let tile of tiles) {
                    const animation = tile.animation,
                        objectgroup = tile.objectgroup,
                        id = tile.id;
                    if (animation) {
                        const eventName = name + this.#DELIMITER + id, 
                            animationIndexes = this.#fixAnimationsItems(animation),
                            animationEvent = new _AnimationEvent_js__WEBPACK_IMPORTED_MODULE_0__.AnimationEvent(eventName, animationIndexes, true);

                        this.#animations.set(eventName, animationEvent);
                        // add additional properties
                        if (!tileset.data._hasAnimations) {
                            tileset.data._hasAnimations = true;
                            tileset.data._animations = new Map();
                            //
                            tileset.data._animations.set(id, animationIndexes[0][0]);
                        }
                        this.#activateAnimation(animationEvent);
                    }
                    if (objectgroup && this.#setBoundaries) {
                        if (tileset.data._hasBoundaries) {
                            tileset.data._boundaries.set(id, objectgroup);
                        } else {
                            // add additional properties
                            tileset.data._hasBoundaries = true;
                            tileset.data._boundaries = new Map();
                            tileset.data._boundaries.set(id, objectgroup);
                        }
                        objectgroup.objects.forEach((object) => {
                            if (object.ellipse) {
                                const cellsWithB = layerData.data.filter((tile) => tile === id + firstgid).length;
                                ellipseBLen += (4 * cellsWithB); // (x, y, wRad, hRad) * layer items
                            } else if (object.point) {
                                const cellsWithB = layerData.data.filter((tile) => tile === id + firstgid).length;
                                pointBLen += (2 * cellsWithB); // (x, y) * layer items
                            } else if (object.polygon) {
                                const cellsWithB = layerData.data.filter((tile) => tile === id + firstgid).length;
                                polygonBLen += (object.polygon.length * 2 * cellsWithB); // (each point * 2(x,y) ) * layer items
                            } else { // rect object
                                const cellsWithB = layerData.data.filter((tile) => tile === id + firstgid).length;
                                polygonBLen += (16 * cellsWithB); // (4 faces * 4 cords for each one) * layer items
                            }
                        });
                    }
                }
            }
            
            const nonEmptyCells = layerData.data.filter((tile) => ((tile >= firstgid) && (tile < nextgid))).length,
                cells = layerData.data.length;

            if (this.#setBoundaries) {
                polygonBLen+=(nonEmptyCells * 16); // potential boundaries also nonEmptyCells
            }
            // создаем вспомогательный объект для расчетов и хранения данных отрисовки
            // help class for draw calculations
            tileset._temp = new _Temp_TiledLayerTempStorage_js__WEBPACK_IMPORTED_MODULE_3__.TiledLayerTempStorage(cells, nonEmptyCells);
        });
        
        // save boundaries max possible lengths
        layerData.ellipseBoundariesLen = ellipseBLen;
        layerData.pointBoundariesLen = pointBLen;
        layerData.polygonBoundariesLen = polygonBLen;
    }

    /**
     * 
     * @param {Array<{duration:number, tileid:number}>} animation 
     * @returns {Array<{duration:number, id:number}>}
     */
    #fixAnimationsItems(animation) {
        return animation.map((animation_item) => ({duration:animation_item.duration, id: animation_item.tileid}));
    }
    /**
     * @ignore
     */
    _processActiveAnimations() {
        for (let animationEvent of this.#animations.values()) {
            if (animationEvent.isActive) {
                animationEvent.iterateAnimationIndex();
                this.#switchCurrentActiveSprite(animationEvent);
            }
        }
    }

    #activateAnimation = (animationEvent) => {
        animationEvent.activateAnimation();
        this.#switchCurrentActiveSprite(animationEvent);
    }; 

    #switchCurrentActiveSprite = (animationEvent) => {
        const [tilesetKey, animationId] = animationEvent.name.split(this.#DELIMITER),
            tilesetIndex = this.#tilesets.findIndex(tileset => tileset.data.name === tilesetKey),
            tileset = this.#tilesets[tilesetIndex];
            
        tileset.data._animations.set(parseInt(animationId), animationEvent.currentSprite);
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

/***/ "./src/base/2d/Primitives.js":
/*!***********************************!*\
  !*** ./src/base/2d/Primitives.js ***!
  \***********************************/
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

/***/ "./src/base/AnimationEvent.js":
/*!************************************!*\
  !*** ./src/base/AnimationEvent.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AnimationEvent": () => (/* binding */ AnimationEvent)
/* harmony export */ });
class AnimationEvent {
    #eventName;
    /**
     * @type {number}
     */
    #defaultDurationTime = 100;
    /**
     * Array [sprite index, duration]
     * @type { Array<Array<number, number>> }
     */
    #animationSpriteIndexes;
    /**
     * 
     * @type {number}
     */
    #currentAnimationItemIndex;
    /**
     * @type {boolean}
     */
    #isActive;
    /**
     * @type {boolean}
     */
    #isRepeated;
    #lastAnimationTimeStamp;
    
    constructor(eventName, animationSpriteIndexes, isRepeated = false, currentSpriteIndex, isActive = false) {
        this.#eventName = eventName;
        this.#animationSpriteIndexes = this.#convertToArray(animationSpriteIndexes);
        this.#currentAnimationItemIndex = currentSpriteIndex ? currentSpriteIndex : 0;
        this.#isActive = isActive;
        this.#isRepeated = isRepeated;
    }

    get name() {
        return this.#eventName;
    }

    get isActive() {
        return this.#isActive;
    }

    get currentSprite() {
        return this.#animationSpriteIndexes[this.#currentAnimationItemIndex][0];
    }

    get _isLastSprite() {
        return (this.#animationSpriteIndexes.length - 1) === this.#currentAnimationItemIndex;
    }

    iterateAnimationIndex() {
        const currentIndex = this.#currentAnimationItemIndex,
            currentDuration = this.#animationSpriteIndexes[currentIndex][1],
            lastIterationTime = Date.now() - this.#lastAnimationTimeStamp;
        // iterate or skip
        if (currentDuration < lastIterationTime) {
            if (!this._isLastSprite) {
                this.#currentAnimationItemIndex++;
            } else {
                if (!this.#isRepeated) {
                    this.deactivateAnimation();
                } else {
                    // take first element
                    this.#currentAnimationItemIndex = 0;
                    
                }
            }
            // reset timestamp
            this.#lastAnimationTimeStamp = Date.now();
        }
    }

    activateAnimation = () => {
        this.#isActive = true;
        this.#currentAnimationItemIndex = 0;
        this.#lastAnimationTimeStamp = Date.now();
    };

    deactivateAnimation = () => {
        this.#isActive = false;
    };

    #convertToArray(animationSpriteIndexes) {
        let animationArray = [];
        animationSpriteIndexes.forEach(element => {
            if (typeof element.id === "number" && typeof element.duration === "number") {
                animationArray.push([element.id, element.duration]);
            } else {
                animationArray.push([element, this.#defaultDurationTime]);
            }
            
        });
        return animationArray;
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
/* harmony import */ var _2d_DrawRectObject_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./2d/DrawRectObject.js */ "./src/base/2d/DrawRectObject.js");
/* harmony import */ var _2d_DrawTextObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./2d/DrawTextObject.js */ "./src/base/2d/DrawTextObject.js");
/* harmony import */ var _2d_DrawConusObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./2d/DrawConusObject.js */ "./src/base/2d/DrawConusObject.js");
/* harmony import */ var _2d_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./2d/DrawImageObject.js */ "./src/base/2d/DrawImageObject.js");
/* harmony import */ var _2d_DrawLineObject_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./2d/DrawLineObject.js */ "./src/base/2d/DrawLineObject.js");
/* harmony import */ var _2d_DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./2d/DrawPolygonObject.js */ "./src/base/2d/DrawPolygonObject.js");
/* harmony import */ var _2d_DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./2d/DrawCircleObject.js */ "./src/base/2d/DrawCircleObject.js");
/* harmony import */ var _2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./2d/DrawTiledLayer.js */ "./src/base/2d/DrawTiledLayer.js");
/* harmony import */ var _2d_DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./2d/DrawShapeObject.js */ "./src/base/2d/DrawShapeObject.js");
/* harmony import */ var _GameStageData_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./GameStageData.js */ "./src/base/GameStageData.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");













/**
 * Creates drawObjects instances.<br>
 * accessible via GameStage.draw <br>
 * Attach images for image objects and tilemaps <br>
 * Adds drawObjects to current GameStage.stageData
 * @see {@link GameStage} a part of GameStage
 */
class DrawObjectFactory {
    /**
     * @type {AssetsManager}
     */
    #iLoader;
    /**
     * @type {GameStageData | null}
     */
    #currentPageData;
    /**
     * @hideconstructor 
     */
    constructor(iLoader) {
        this.#iLoader = iLoader;
    }

    /**
     * @returns {GameStageData}
     */
    get stageData() {
        return this.#currentPageData;
    }

    /**
     * 
     * @param {*} renderObject 
     * @returns {Object}
     */
    #addObjectToPageData(renderObject) {
        this.#currentPageData._renderObject = renderObject;
        this.#currentPageData._sortRenderObjectsBySortIndex();
        return renderObject;
    }
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} backgroundColor - rgba(r,g,b,a)
     * @returns {DrawRectObject}
     */
    rect(x, y, width, height, backgroundColor) {
        const renderObject = new _2d_DrawRectObject_js__WEBPACK_IMPORTED_MODULE_0__.DrawRectObject(x, y, width, height, backgroundColor);
        this.#addObjectToPageData(renderObject);
        return renderObject; 
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
        const renderObject = new _2d_DrawTextObject_js__WEBPACK_IMPORTED_MODULE_1__.DrawTextObject(x, y, text, font, color);
        this.#addObjectToPageData(renderObject);
        return renderObject;
    }

    /**
     * 
     * @param {number} radius 
     * @param {string} bgColor - rgba(r,g,b,a)
     * @param {number=} angle
     * @param {number=} [fade=0] (0 - 1)
     * @returns {DrawConusObject}
     */
    conus(x, y, radius, bgColor, angle, fade = 0) {
        const renderObject = new _2d_DrawConusObject_js__WEBPACK_IMPORTED_MODULE_2__.DrawConusObject(x, y, radius, bgColor, angle, fade);
        this.#addObjectToPageData(renderObject);
        return renderObject;
    }

    /**
     * 
     * @param {number} radius 
     * @param {string} bgColor - rgba(r,g,b,a)
     * @returns {DrawCircleObject}
     */
    circle(x, y, radius, bgColor) {
        const renderObject = new _2d_DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_6__.DrawCircleObject(x, y, radius, bgColor);
        this.#addObjectToPageData(renderObject);
        return renderObject;
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} key 
     * @param {number} [imageIndex = 0]
     * @param {Array<{x:Number, y:Number}> | {r:number}=} boundaries - boundaries as polygon, or circle
     * @param {number} [spacing = 0] - for tilesets.spacing > 0
     * @returns {DrawImageObject}
     */
    image(x, y, width, height, key, imageIndex = 0, boundaries, spacing = 0) {
        const image = this.#iLoader.getImage(key);

        if (!image) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_10__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_11__.ERROR_CODES.CANT_GET_THE_IMAGE, "iLoader can't get the image with key: " + key);
        }
            
        const renderObject = new _2d_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_3__.DrawImageObject(x, y, width, height, key, imageIndex, boundaries, image, spacing);
        
        this.#addObjectToPageData(renderObject);
        return renderObject;
    }

    /**
     * @param {Array<number>} vertices 
     * @param {string} color - rgba(r,g,b,a)
     * @returns {DrawLineObject}
     */
    line(vertices, color) {
        const renderObject = new _2d_DrawLineObject_js__WEBPACK_IMPORTED_MODULE_4__.DrawLineObject(vertices, color);
        this.#addObjectToPageData(renderObject);
        return renderObject;
    }

    /**
     * @param {Array<{x:number, y:number}>} vertices - should go in anticlockwise order
     * @param {string} bgColor - rgba(r,g,b,a)
     * @returns {DrawPolygonObject}
     */
    polygon(vertices, bgColor) {
        const renderObject = new _2d_DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_5__.DrawPolygonObject(vertices, bgColor);
        this.#addObjectToPageData(renderObject);
        return renderObject;
    }

    /**
     * 
     * @param {string} layerKey 
     * @param {string} tileMapKey 
     * @param {boolean=} setBoundaries 
     * @param {DrawShapeObject=} shapeMask 
     * @returns {DrawTiledLayer}
     */
    tiledLayer(layerKey, tileMapKey, setBoundaries, shapeMask) {
        const tilemap = this.#iLoader.getTileMap(tileMapKey),
            tilesets = tilemap.tilesets.map((tileset) => Object.assign({}, tileset)), // copy to avoid change same tilemap instance in different tiledLayers
            tilesetImages = tilesets.map((tileset) => this.#iLoader.getImage(tileset.data.name)),
            layerData = Object.assign({}, tilemap.layers.find((layer) => layer.name === layerKey)), // copy to avoid change same tilemap instance in different tiledLayers
            renderObject = new _2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_7__.DrawTiledLayer(layerKey, tileMapKey, tilemap, tilesets, tilesetImages, layerData, setBoundaries, shapeMask);

        this.#addObjectToPageData(renderObject);
        return renderObject;
    }

    /**
     * @ignore
     * @param {string} methodKey 
     * @param {Function} createObjectInstance
     */
    _registerNewObjectMethod = (methodKey, createObjectInstance) => {
        this[methodKey] = (...args) => this.#createObjectAndAddToPageData(createObjectInstance, ...args);
    };

    /**
     * @ignore
     * @param {Function} createInstance
     * @param {Array<any>} args
     */
    #createObjectAndAddToPageData = (createInstance, ...args) => {
        const instance = createInstance(...args);
        this.#addObjectToPageData(instance);
        return instance;
    };

    /**
     * @ignore
     * @param {GameStageData} pageData;
     */
    _attachPageData = (pageData) => {
        this.#currentPageData = pageData;
    };
    /**
     * @ignore
     */
    _detachPageData = () => {
        this.#currentPageData = null;
    };
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

/***/ "./src/base/GameStage.js":
/*!*******************************!*\
  !*** ./src/base/GameStage.js ***!
  \*******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GameStage": () => (/* binding */ GameStage)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _GameStageData_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./GameStageData.js */ "./src/base/GameStageData.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _modules_assetsm_dist_assetsm_min_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../modules/assetsm/dist/assetsm.min.js */ "./modules/assetsm/dist/assetsm.min.js");
/* harmony import */ var _DrawObjectFactory_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./DrawObjectFactory.js */ "./src/base/DrawObjectFactory.js");
/* harmony import */ var _2d_DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./2d/DrawCircleObject.js */ "./src/base/2d/DrawCircleObject.js");
/* harmony import */ var _2d_DrawConusObject_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./2d/DrawConusObject.js */ "./src/base/2d/DrawConusObject.js");
/* harmony import */ var _2d_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./2d/DrawImageObject.js */ "./src/base/2d/DrawImageObject.js");
/* harmony import */ var _2d_DrawLineObject_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./2d/DrawLineObject.js */ "./src/base/2d/DrawLineObject.js");
/* harmony import */ var _2d_DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./2d/DrawPolygonObject.js */ "./src/base/2d/DrawPolygonObject.js");
/* harmony import */ var _2d_DrawRectObject_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./2d/DrawRectObject.js */ "./src/base/2d/DrawRectObject.js");
/* harmony import */ var _2d_DrawTextObject_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./2d/DrawTextObject.js */ "./src/base/2d/DrawTextObject.js");
/* harmony import */ var _ISystem_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./ISystem.js */ "./src/base/ISystem.js");
/* harmony import */ var _ISystemAudio_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./ISystemAudio.js */ "./src/base/ISystemAudio.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../utils.js */ "./src/utils.js");
/* harmony import */ var _2d_Primitives_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./2d/Primitives.js */ "./src/base/2d/Primitives.js");


















/**
 * Represents the stage of the game,<br>
 * Contains pages logic.<br>
 * Instances should be created and registered with System.registerStage() factory method
 * 
 * @see {@link System} instances of this class holds by the System class
 * @hideconstructor
 */
class GameStage {
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
     * @typedef {ISystem}
     */
    #iSystemReference;
    /**
     * @type {GameStageData}
     */
    #stageData;

    constructor() {
        this.#isActive = false;
        
    }

    /**
     * Register stage
     * @param {string} name
     * @param {ISystem} system 
     * @ignore
     */
    _register(name, system) {
        this.#name = name;
        this.#iSystemReference = system;
        this.#stageData = new _GameStageData_js__WEBPACK_IMPORTED_MODULE_1__.GameStageData(this.#iSystemReference.systemSettings.gameOptions);
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
     * @tutorial stages_lifecycle
     * Custom logic for register stage
     */
    register() {}
    /**
     * @tutorial stages_lifecycle
     * Custom logic for init stage
     */
    init() {}
    /**
     * Custom logic for start stage
     * @param {Object=} options
     */
    start(options) {}
    /**
     * @tutorial stages_lifecycle
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
    get iLoader() {
        return this.#iSystemReference.iLoader;
    }

    /**
     * @type {DrawObjectFactory}
     */
    get draw() {
        return this.#iSystemReference.drawObjectFactory;
    }

    /**
     * Attach all canvas elements from the #views to container
     * @param {HTMLElement} container
     * @ignore
     */
    _attachCanvasToContainer(container) {
        this.#attachElementToContainer(this.canvasHtmlElement, container);
    }

    /**
     * Add render object to the stageData
     * @param { DrawConusObject | DrawImageObject | 
     *          DrawLineObject | DrawPolygonObject | 
     *          DrawRectObject | DrawCircleObject | 
     *          DrawTextObject } renderObject 
     */
    addRenderObject = (renderObject) => {
        const data = this.stageData,
            isDataAlreadyAdded = data.renderObjects.indexOf(renderObject) !== -1;
        if (isDataAlreadyAdded) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.NEW_BEHAVIOR_INTRODUCED, "stage.draw methods add objects to pageData, no need to call addRenderObject");
        } else {
            data._renderObject = renderObject;
            data._sortRenderObjectsBySortIndex(); 
        }
    };

    /**
     * Determines if this stage render is Active or not
     * @type {boolean}
     */
    get isActive() {
        return this.#isActive;
    }

    /**
     * Determines if this stage is initialized or not
     * @type {boolean}
     */
    get isInitiated() {
        return this.#isInitiated;
    }

    /**
     * Current stage name
     * @type {string}
     */
    get name () {
        return this.#name;
    }

    /**
     * @type {GameStageData}
     */
    get stageData() {
        return this.#stageData;
    }

    /**
     * @type {SystemSettings}
     */
    get systemSettings() {
        return this.#iSystemReference.systemSettings;
    }

    /**
     * @type {ISystemAudio}
     */
    get audio() {
        return this.#iSystemReference.audio;
    }

    /**
     * @type {ISystem}
     */
    get iSystem() {
        return this.#iSystemReference;
    }

    get canvasHtmlElement() {
        return document.getElementsByTagName("canvas")[0];
    }

    /**
     * 
     * @param {string} eventName 
     * @param {*} listener 
     * @param {*=} options 
     */
    addEventListener = (eventName, listener, options) => {
        this.iSystem.addEventListener(eventName, listener, options);
    };

    /**
     * 
     * @param {string} eventName 
     * @param {*} listener 
     * @param {*=} options 
     */
    removeEventListener = (eventName, listener, options) => {
        this.iSystem.removeEventListener(eventName, listener, options);
    };

    /**
     * Start stage render
     * @param {Object=} options 
     * @ignore
     */
    _start(options) {
        this.start(options);
        this.#isActive = true;
        window.addEventListener("resize", this._resize);
        this._resize();
    }

    /**
     * Stop stage render
     * @ignore
     */
    _stop() {
        this.#isActive = false;
        window.removeEventListener("resize", this._resize);
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

    #setWorldDimensions() {
        const width = this.systemSettings.worldSize ? this.systemSettings.worldSize.width : 0,
            height = this.systemSettings.worldSize ? this.systemSettings.worldSize.height : 0;
            
        this.stageData._setWorldDimensions(width, height);
    }

    //////////////////////////////////////////////////////
    //***************************************************/
    //****************** Collisions ********************//
    //**************************************************//
    //////////////////////////////////////////////////////

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {DrawImageObject} drawObject 
     * @returns {{x:number, y:number, p:number} | boolean}
     */
    isBoundariesCollision = (x, y, drawObject) => {
        const drawObjectType = drawObject.type,
            vertices = drawObject.vertices,
            circleBoundaries = drawObject.circleBoundaries;
        switch(drawObjectType) {
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.TEXT:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CONUS:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.IMAGE:
            if (!circleBoundaries) {
                return this.#isPolygonToBoundariesCollision(x, y, vertices, drawObject.rotation);
            } else {
                return this.#isCircleToBoundariesCollision(x, y, drawObject.circleBoundaries.r);
            }
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
            drawObjectBoundaries = drawObject.vertices,
            circleBoundaries = drawObject.circleBoundaries;
        switch(drawObjectType) {
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.TEXT:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CONUS:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.IMAGE:
            if (!circleBoundaries) {
                return this.#isPolygonToObjectsCollision(x, y, drawObjectBoundaries, drawObject.rotation, objects);
            } else {
                return this.#isCircleToObjectsCollision(x, y, circleBoundaries, objects);
            }
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

    #isCircleToObjectsCollision(x, y, drawObjectBoundaries, objects) {
        const radius = drawObjectBoundaries.r;

        const len = objects.length;

        let collisions = [];
        for (let i = 0; i < len; i++) {
            const mapObject = objects[i],
                drawMapObjectType = mapObject.type,
                circleBoundaries = mapObject.circleBoundaries;

            let coll;
            
            switch(drawMapObjectType) {
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.TEXT:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CONUS:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.IMAGE:
                if (!circleBoundaries) {
                    coll = this.#isCircleToPolygonCollision(x, y, radius, mapObject);
                } else {
                    coll = this.#isCircleToCircleCollision(x, y, radius, mapObject.x, mapObject.y, circleBoundaries.r);
                }
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
 
    #takeTheClosestCollision(collisions) {
        return collisions.sort((a,b) => a.p < b.p)[0];
    }

    #isCircleToPolygonCollision(x, y, radius, mapObject) {
        const [mapOffsetX, mapOffsetY] = this.stageData.worldOffset,
            xWithOffset = x - mapOffsetX,
            yWithOffset = y - mapOffsetY,
            mapObjXWithOffset = mapObject.x - mapOffsetX,
            mapObjYWithOffset = mapObject.y - mapOffsetY,
            mapObjVertices = mapObject.vertices, 
            mapObjRotation = mapObject.rotation,
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
                intersect = (0,_utils_js__WEBPACK_IMPORTED_MODULE_15__.isCircleLineIntersect)(xWithOffset, yWithOffset, radius, edge);
            if (intersect) {
            //console.log("polygon: ", polygonWithOffsetAndRotation);
            //console.log("intersect: ", intersect);
                return intersect;
            }
        }
        return false;
    }

    #isCircleToCircleCollision(circle1X, circle1Y, circle1R, circle2X, circle2Y, circle2R) {
        const len = new _2d_Primitives_js__WEBPACK_IMPORTED_MODULE_16__.Vector(circle1X, circle1Y, circle2X, circle2Y).length;
        console.log(len);
        console.log(circle1R);
        console.log(circle2R);
        if ((len - (circle1R + circle2R)) > 0) {
            return false;
        } else {
            //@todo calculate point of intersect
            return true;
        }
    }

    #isPolygonToPolygonCollision(x, y, polygonVertices, polygonRotation, mapObject) {
        const [mapOffsetX, mapOffsetY] = this.stageData.worldOffset,
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
                intersect = (0,_utils_js__WEBPACK_IMPORTED_MODULE_15__.isPolygonLineIntersect)(polygonWithOffsetAndRotation, edge);
            if (intersect) {
                //console.log("polygon: ", polygonWithOffsetAndRotation);
                //console.log("intersect: ", intersect);
                return intersect;
            }
        }
        return false;
    }

    #calculateShiftedVertexPos(vertex, centerX, centerY, rotation) {
        const vector = new _2d_Primitives_js__WEBPACK_IMPORTED_MODULE_16__.Vector(0, 0, vertex[0], vertex[1]),
            vertexAngle = (0,_utils_js__WEBPACK_IMPORTED_MODULE_15__.angle_2points)(0, 0, vertex[0], vertex[1]),
            len = vector.length;
            
        const newX = centerX + (len * Math.cos(rotation + vertexAngle)),
            newY = centerY + (len * Math.sin(rotation + vertexAngle));
        return [newX, newY];
    }
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} r 
     * @returns {{x:number, y:number, p:number} | boolean}
     */
    #isCircleToBoundariesCollision(x, y, r) {
        const mapObjects = this.stageData.getRawBoundaries(),
            ellipseB = this.stageData.getEllipseBoundaries(),
            pointB = this.stageData.getPointBoundaries(),
            [mapOffsetX, mapOffsetY] = this.stageData.worldOffset,
            xWithOffset = x - mapOffsetX,
            yWithOffset = y - mapOffsetY,
            len = this.stageData.boundariesLen,
            eLen = this.stageData.ellipseBLen,
            pLen = this.stageData.pointBLen;

        for (let i = 0; i < len; i+=4) {
            const x1 = mapObjects[i],
                y1 = mapObjects[i + 1],
                x2 = mapObjects[i + 2],
                y2 = mapObjects[i + 3];

            if (x1 === 0 && y1 === 0 && x2 === 0 && y2 === 0) {
                continue;
            } else {
                const intersect = (0,_utils_js__WEBPACK_IMPORTED_MODULE_15__.isCircleLineIntersect)(xWithOffset, yWithOffset, r, {x1, y1, x2, y2});
                
                if (intersect) {
                    //console.log("rotation: ", rotation);
                    //console.log("polygon: ", polygonWithOffsetAndRotation);
                    //console.log("intersect: ", intersect);
                    return intersect;
                }
            }
        }
        if (eLen > 0) {
            for (let i = 0; i < eLen; i+=4) {
                const ellipse = [ellipseB[i], ellipseB[i+1], ellipseB[i+2], ellipseB[i+3]],
                    intersect = (0,_utils_js__WEBPACK_IMPORTED_MODULE_15__.isEllipseCircleIntersect)(ellipse, {x:xWithOffset, y:yWithOffset, r});
                if (intersect) {
                    //console.log("rotation: ", rotation);
                    //console.log("polygon: ", polygonWithOffsetAndRotation);
                    //console.log("intersect: ", intersect);
                    return intersect;
                }
            }
        }
        
        if (pLen > 0) {
            for (let i = 0; i < pLen; i+=2) {
                const xP = pointB[i],
                    yP = pointB[i + 1],
                    intersect = (0,_utils_js__WEBPACK_IMPORTED_MODULE_15__.isPointCircleIntersect)(xP, yP, {x:xWithOffset, y:yWithOffset, r});
                if (intersect) {
                    //console.log("rotation: ", rotation);
                    //console.log("polygon: ", polygonWithOffsetAndRotation);
                    //console.log("intersect: ", intersect);
                    return intersect;
                }
            }
        }
        return false;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {Array<Array<number>>} polygon
     * @param {number} rotation
     * @returns {{x:number, y:number, p:number} | boolean}
     */
    #isPolygonToBoundariesCollision(x, y, polygon, rotation) {
        const mapObjects = this.stageData.getRawBoundaries(),
            ellipseB = this.stageData.getEllipseBoundaries(),
            pointB = this.stageData.getPointBoundaries(),
            [mapOffsetX, mapOffsetY] = this.stageData.worldOffset,
            xWithOffset = x - mapOffsetX,
            yWithOffset = y - mapOffsetY,
            polygonWithOffsetAndRotation = polygon.map((vertex) => (this.#calculateShiftedVertexPos(vertex, xWithOffset, yWithOffset, rotation))),
            len = this.stageData.boundariesLen,
            eLen = this.stageData.ellipseBLen,
            pLen = this.stageData.pointBLen;

        for (let i = 0; i < len; i+=4) {
            const x1 = mapObjects[i],
                y1 = mapObjects[i + 1],
                x2 = mapObjects[i + 2],
                y2 = mapObjects[i + 3];

            if (x1 === 0 && y1 === 0 && x2 === 0 && y2 === 0) {
                continue;
            } else {
                const intersect = (0,_utils_js__WEBPACK_IMPORTED_MODULE_15__.isPolygonLineIntersect)(polygonWithOffsetAndRotation, {x1, y1, x2, y2});
                if (intersect) {
                    //console.log("rotation: ", rotation);
                    //console.log("polygon: ", polygonWithOffsetAndRotation);
                    //console.log("intersect: ", intersect);
                    return intersect;
                }
            }
        }
        if (eLen > 0) {
            for (let i = 0; i < eLen; i+=4) {
                const ellipse = [ellipseB[i], ellipseB[i+1], ellipseB[i+2], ellipseB[i+3]],
                    intersect = (0,_utils_js__WEBPACK_IMPORTED_MODULE_15__.isEllipsePolygonIntersect)(ellipse, polygonWithOffsetAndRotation);
                if (intersect) {
                    //console.log("rotation: ", rotation);
                    //console.log("polygon: ", polygonWithOffsetAndRotation);
                    //console.log("intersect: ", intersect);
                    return intersect;
                }
            }
        }
        
        if (pLen > 0) {
            for (let i = 0; i < pLen; i+=2) {
                const x = pointB[i],
                    y = pointB[i+1],
                    intersect = (0,_utils_js__WEBPACK_IMPORTED_MODULE_15__.isPointPolygonIntersect)(x, y, polygonWithOffsetAndRotation);
                if (intersect) {
                //console.log("rotation: ", rotation);
                //console.log("polygon: ", polygonWithOffsetAndRotation);
                //console.log("intersect: ", intersect);
                    return intersect;
                }
            }
        }
        return false;
    }
    //****************** End Collisions ****************//

    #setCanvasSize() {
        const canvasWidth = this.systemSettings.canvasMaxSize.width && (this.systemSettings.canvasMaxSize.width < window.innerWidth) ? this.systemSettings.canvasMaxSize.width : window.innerWidth,
            canvasHeight = this.systemSettings.canvasMaxSize.height && (this.systemSettings.canvasMaxSize.height < window.innerHeight) ? this.systemSettings.canvasMaxSize.height : window.innerHeight;
        this.stageData._setCanvasDimensions(canvasWidth, canvasHeight);
    }
}

/***/ }),

/***/ "./src/base/GameStageData.js":
/*!***********************************!*\
  !*** ./src/base/GameStageData.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GameStageData": () => (/* binding */ GameStageData)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");


/**
 * A storage for stage data, such as gameObjects,
 * boundaries, worldDimensions and offset
 * @see {@link GameStage} a part of GameStage
 * @hideconstructor
 */
class GameStageData {
    #worldWidth;
    #worldHeight;
    #viewWidth;
    #viewHeight;
    #xOffset = 0;
    #yOffset = 0;
    #centerX = 0;
    #centerY = 0;
    #rotate = 0;

    #maxBoundariesSize = 0;
    #maxEllipseBoundSize = 0;
    #maxPointBSize = 0;
    /**
     * Points to next empty cell
     * @type {number}
     */
    #bPointer = 0;
    /**
     * Points to next empty cell
     * @type {number}
     */
    #pPointer = 0;
    /**
     * Points to next empty cell
     * @type {number}
     */
    #ePointer = 0;
    /**
     * current screen boundaries, recalculated every render cycles
     * stored as floatArray, 
     * each 4 cells, represent a line with coords x1,y1,x2,y2
     * @type {Float32Array}
     */
    #boundaries;
    /**
     * ellipse boundaries
     * stored as floatArray, 
     * each 4 cells, represent am ellipse with cords centerX, centerY, radiusX, radiusY
     * @type {Float32Array}
     */
    #ellipseBoundaries;
    /**
     * point boundaries
     * stored as floatArray, 
     * each 2 cells, represent a point with coords x1,y1
     * @type {Float32Array}
     */
    #pointBoundaries;
    /**
     * whole world boundaries, calculated once on prepare stage
     * @type {Array<Array<number>>}
     */
    #wholeWorldBoundaries;
    /**
     * @type {Array<DrawImageObject | DrawCircleObject | DrawConusObject | DrawLineObject | DrawPolygonObject | DrawRectObject | DrawTextObject | DrawTiledLayer>}
     */
    #renderObjects = [];
    
    /**
     * @type {boolean}
     */
    #isOffsetTurnedOff;
    /**
     * @deprecated
     * @type {boolean}
     */
    #isWorldBoundariesEnabled = false;

    constructor(gameOptions) {
        //this.#boundaries = new Float32Array(this.#maxBoundariesSize);
        //this.#ellipseBoundaries = new Float32Array(this.#maxBoundariesSize);
        //this.#pointBoundaries = new Float32Array(this.#maxBoundariesSize);
    }

    /**
     * 
     * @returns {boolean}
     */
    isOffsetTurnedOff() {
        return this.#isOffsetTurnedOff;
    }
    set mapRotate(value) {
        this.#rotate = value;
    }

    /**
     * Add a Boundaries line
     * @param {{x1:number,y1:number,x2:number, y2:number}} boundaries 
     */
    #addBoundaries(boundaries) {
        this._addBoundaryLine(boundaries.x1,boundaries.y1, boundaries.x2, boundaries.y2);
    }

    /**
     * Add array of boundaries lines
     * @param {Array<Array<number>>} boundaries 
     * @ignore
     */
    _addBoundariesArray(boundaries) {
        const len = boundaries.length;
        for (let i = 0; i < len; i++) {
            const boundary = boundaries[i];
            this._addBoundaryLine(boundary[0], boundary[1], boundary[2], boundary[3]);
        }
    }

    _addBoundaryLine(x1, y1, x2, y2) {
        this.#boundaries[this.#bPointer] = x1;
        this.#bPointer++;
        this.#boundaries[this.#bPointer] = y1;
        this.#bPointer++;
        this.#boundaries[this.#bPointer] = x2;
        this.#bPointer++;
        this.#boundaries[this.#bPointer] = y2;
        this.#bPointer++;
    }

    _addEllipseBoundary(w, h, x, y) {
        this.#ellipseBoundaries[this.#ePointer] = w;
        this.#ePointer++;
        this.#ellipseBoundaries[this.#ePointer] = h;
        this.#ePointer++;
        this.#ellipseBoundaries[this.#ePointer] = x;
        this.#ePointer++;
        this.#ellipseBoundaries[this.#ePointer] = y;
        this.#ePointer++;
    }

    _addPointBoundary(x,y) {
        this.#pointBoundaries[this.#pPointer] = x;
        this.#pPointer++;
        this.#pointBoundaries[this.#pPointer] = y;
        this.#pPointer++;
    }

    _removeBoundaryLine(startPos) {
        this.#boundaries[startPos] = 0;
        this.#boundaries[startPos + 1] = 0;
        this.#boundaries[startPos + 2] = 0;
        this.#boundaries[startPos + 3] = 0;
    }

    /**
     * Clear map boundaries
     * @ignore
     */
    _clearBoundaries() {
        this.#boundaries.fill(0);
        this.#ellipseBoundaries.fill(0);
        this.#pointBoundaries.fill(0);
        
        this.#bPointer = 0;
        this.#ePointer = 0;
        this.#pPointer = 0;
    }

    _initiateBoundariesData() {
        this.#boundaries = new Float32Array(this.#maxBoundariesSize);
        this.#ellipseBoundaries = new Float32Array(this.#maxEllipseBoundSize);
        this.#pointBoundaries = new Float32Array(this.#maxPointBSize);
    }

    /**
     * 
     * @param {number} bSize
     * @param {number} eSize - ellipse boundaries size
     * @param {number} pSize - points boundaries size
     * @ignore
     */
    _setMaxBoundariesSize(bSize, eSize = 0, pSize = 0) {
        this.#maxBoundariesSize = bSize;
        this.#maxEllipseBoundSize = eSize;
        this.#maxPointBSize = pSize;
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
        const [w, h] = [this.#worldWidth, this.#worldHeight],
            [offsetX, offsetY] = [this.#xOffset, this.#yOffset],
            wOffset = w - offsetX,
            hOffset = h -offsetY;
        if (!w || !h) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.WORLD_DIMENSIONS_NOT_SET, "Can't set map boundaries.");
        }
        this.#addBoundaries({x1: 0, y1: 0, x2: wOffset, y2: 0});
        this.#addBoundaries({x1: wOffset, y1: 0, x2: wOffset, y2: hOffset});
        this.#addBoundaries({x1: wOffset, y1: hOffset, x2: 0, y2: hOffset});
        this.#addBoundaries({x1: 0, y1: hOffset, x2: 0, y2: 0});
    }

    /**
     * @ignore
     */
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
     * !not used
     * @ignore
     * @deprecated
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

    /**
     * @ignore
     * @param {Array<Array<number>>} boundaries 
     */
    _setWholeMapBoundaries(boundaries) {
        this.#wholeWorldBoundaries.push(...boundaries);
    }

    /**
     * @deprecated
     * @ignore
     */
    _enableMapBoundaries() {
        this.#isWorldBoundariesEnabled = true;
    }

    /**
     * current screen boundaries, 
     * this method is for backward capability with jsge@1.4.4
     * recommended to use getRawBoundaries()
     * @returns {Array<Array<number>>}
     */
    getBoundaries() {
        const boundaries = this.#boundaries, 
            len = this.#bPointer;

        let bTempArray = [],
            bArray = [];
        
        for (let i = 0; i < len; i++) {
            const element = boundaries[i];
            bTempArray.push(element);
            if (((i + 1) % 4) === 0) {
                bArray.push(bTempArray);
                bTempArray = [];
            }
        }
        return bArray;
    }

    /**
     * current screen boundaries
     * polygon boundaries from Tiled and Tiled boundaries layers are merged here
     * each 4 cells, represent a line with coords x1,y1,x2,y2
     * @returns {Float32Array}
     */
    getRawBoundaries() {
        return this.#boundaries;
    }

    /**
     * ellipse boundaries from Tiled,
     * stored as floatArray, 
     * each 4 cells, represent am ellipse with cords centerX, centerY, radiusX, radiusY
     * @returns {Float32Array}
     */
    getEllipseBoundaries() {
        return this.#ellipseBoundaries;
    }

    /**
     * point boundaries from Tiled,
     * stored as floatArray, 
     * each 2 cells, represent a point with coords x1,y1
     * @returns {Float32Array}
     */
    getPointBoundaries() {
        return this.#pointBoundaries;
    }

    getWholeWorldBoundaries() {
        return this.#wholeWorldBoundaries;
    }

    /**
     * @deprecated
     */
    get isWorldBoundariesEnabled() {
        return this.#isWorldBoundariesEnabled;
    }
    /**
     * Current canvas dimensions
     * @type {Array<number>}
     */
    get canvasDimensions() {
        return [this.#viewWidth, this.#viewHeight];
    }

    /**
     * Current game world dimensions
     * @type {Array<number>}
     */
    get worldDimensions() {
        return [this.#worldWidth, this.#worldHeight];
    }
    
    /**
     * Current word x/y offset
     * @type {Array<number>}
     */
    get worldOffset() {
        return [this.#xOffset, this.#yOffset];
    }

    /**
     * Current focus point
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
     * Tiled polygon and Tiled layer boundaries length
     * @type {number}
     */
    get boundariesLen() {
        return this.#bPointer;
    }

    /**
     * Tiled ellipse boundaries length
     * @type {number}
     */
    get ellipseBLen() {
        return this.#ePointer;
    }

    /**
     * Tiled point length
     * @type {number}
     */
    get pointBLen() {
        return this.#pPointer;
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

    /**
     * a getter to retrieve all attached renderObjects
     */
    get renderObjects() {
        return this.#renderObjects;
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
     * @ignore
     */
    _sortRenderObjectsBySortIndex() {
        this.#renderObjects = this.#renderObjects.sort((obj1, obj2) => obj1.sortIndex - obj2.sortIndex);
    }

    /**
     * @ignore
     */
    set _renderObject(object) {
        this.#renderObjects.push(object);
    } 

    /**
     * @ignore
     */
    set _renderObjects(objects) {
        this.#renderObjects = objects;
    } 
}

/***/ }),

/***/ "./src/base/IExtension.js":
/*!********************************!*\
  !*** ./src/base/IExtension.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IExtension": () => (/* binding */ IExtension)
/* harmony export */ });
/* harmony import */ var _ISystem_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ISystem.js */ "./src/base/ISystem.js");


/**
 * Class for creating modules
 * Accessed via ISystem.extensionInterface
 */
class IExtension {
    /**
     * @type {ISystem}
     */
    #systemReference;
    /**
     * @hideconstructor
     */
    constructor(iSystem) {
        this.#systemReference = iSystem;
    }
    /**
     * Is used for registering new Object in DrawObjectFactory, \
     * registered method could be then called with this.draw[createInstanceKey]
     * @param {string} createInstanceKey - a key for calling method from DrawObjectFactory
     * @param {function} createInstanceMethod - method 
     */
    registerDrawObject(createInstanceKey, createInstanceMethod) {
        this.#systemReference.drawObjectFactory._registerNewObjectMethod(createInstanceKey, createInstanceMethod);
    }

    /**
     * Used to register a new draw program
     * @param {string} programName
     * @param {string} vertexShader - raw vertex shader program
     * @param {string} fragmentShader - raw fragment shader program 
     * @param {Array<string>} uVars - program uniform variables names
     * @param {Array<string>} aVars - program attribute variables names
     * @returns {Promise<void>}
     */
    registerAndCompileWebGlProgram(programName, vertexShader, fragmentShader, uVars, aVars) {
        return this.#systemReference.iRender._registerAndCompileWebGlProgram(programName, vertexShader, fragmentShader, uVars, aVars);
    }

    /**
     * Inject method to render.init stage. Should be Promise based.
     * @param {function():Promise<void>} method 
     * @returns {void}
     */
    registerRenderInit(method) {
        this.#systemReference.iRender._registerRenderInit(method);
    }

    /**
     * Register render method for class.
     * @param {string} objectClassName - object name registered to DrawObjectFactory
     * @param {function(renderObject, gl, pageData, program, vars):Promise<any[]>} objectRenderMethod - should be promise based returns vertices number and draw program
     * @param {string} objectWebGlDrawProgram - a webgl program name previously registered with iExtension.registerAndCompileWebGlProgram()
     */
    registerObjectRender(objectClassName, objectRenderMethod, objectWebGlDrawProgram) {
        this.#systemReference.iRender._registerObjectRender(objectClassName, objectRenderMethod, objectWebGlDrawProgram);
    }
}

/***/ }),

/***/ "./src/base/INetwork.js":
/*!******************************!*\
  !*** ./src/base/INetwork.js ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "INetwork": () => (/* binding */ INetwork)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _Logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Logger.js */ "./src/base/Logger.js");
/* harmony import */ var _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Events/SystemEvent.js */ "./src/base/Events/SystemEvent.js");





/**
 * Represents Socket connection
 * 
 * From 1.4.4 disabled by default,
 * to enable, set settings.network.enabled to true
 */
class INetwork extends EventTarget {
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

/***/ "./src/base/IRender.js":
/*!*****************************!*\
  !*** ./src/base/IRender.js ***!
  \*****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IRender": () => (/* binding */ IRender)
/* harmony export */ });
/* harmony import */ var _2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./2d/DrawTiledLayer.js */ "./src/base/2d/DrawTiledLayer.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _WebGl_WebGlEngine_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./WebGl/WebGlEngine.js */ "./src/base/WebGl/WebGlEngine.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _GameStageData_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./GameStageData.js */ "./src/base/GameStageData.js");
/* harmony import */ var _modules_assetsm_dist_assetsm_min_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../modules/assetsm/dist/assetsm.min.js */ "./modules/assetsm/dist/assetsm.min.js");
/* harmony import */ var _2d_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./2d/DrawImageObject.js */ "./src/base/2d/DrawImageObject.js");
/* harmony import */ var _2d_DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./2d/DrawCircleObject.js */ "./src/base/2d/DrawCircleObject.js");
/* harmony import */ var _2d_DrawConusObject_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./2d/DrawConusObject.js */ "./src/base/2d/DrawConusObject.js");
/* harmony import */ var _2d_DrawLineObject_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./2d/DrawLineObject.js */ "./src/base/2d/DrawLineObject.js");
/* harmony import */ var _2d_DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./2d/DrawPolygonObject.js */ "./src/base/2d/DrawPolygonObject.js");
/* harmony import */ var _2d_DrawRectObject_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./2d/DrawRectObject.js */ "./src/base/2d/DrawRectObject.js");
/* harmony import */ var _2d_DrawTextObject_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./2d/DrawTextObject.js */ "./src/base/2d/DrawTextObject.js");
/* harmony import */ var _WebGl_ImagesDrawProgram_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./WebGl/ImagesDrawProgram.js */ "./src/base/WebGl/ImagesDrawProgram.js");
/* harmony import */ var _WebGl_PrimitivesDrawProgram_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./WebGl/PrimitivesDrawProgram.js */ "./src/base/WebGl/PrimitivesDrawProgram.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../index.js */ "./src/index.js");







//import { calculateBufferData } from "../wa/release.js";












/**
 * IRender class controls the render(start/stop/speed) 
 * And drawObjects(animations, removing, and rendering)
 * @see {@link GameStage} a part of GameStage
 * @hideconstructor
 */
class IRender {
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
     * @type {WebGlEngine}
     */
    #webGlEngine;
    /**
     * @type {GameStageData | null}
     */
    #currentGameStageData;

    /**
     * ISystem.systemSettings
     * @type {SystemSettings}
     */
    #systemSettingsReference;
    /**
     * A reference to the systemInterface.iLoader
     * @type {AssetsManager}
     */
    #loaderReference;
    /**
     * @type {Float32Array}
     */
    #tempRCircleT;
    /**
     * @type {number}
     */
    #tempRCircleTPointer = 0;
    /**
     * @type {NodeJS.Timer | null}
     */
    #fpsAverageCountTimer;
    /**
     * @type {boolean}
     */
    #isBoundariesPrecalculations = false;
    #minCycleTime;
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();
    #bindRenderLayerMethod;
    #registeredRenderObjects = new Map();

    /**
     * @type {Array<function():Promise<void>>}
     */
    #initPromises = [];
    constructor(systemSettings, iLoader, canvasContainer) {
        this.#isCleared = false;
        this.#canvas = document.createElement("canvas");
        canvasContainer.appendChild(this.#canvas);
        this.#drawContext = this.#canvas.getContext("webgl", {stencil: true});

        this.#systemSettingsReference = systemSettings;
        this.#loaderReference = iLoader;

        this.#tempRCircleT = new Float32Array(this.systemSettings.gameOptions.render.cyclesTimeCalc.averageFPStime);
        this.#minCycleTime = this.systemSettings.gameOptions.render.minCycleTime;

        this.#isBoundariesPrecalculations = this.systemSettings.gameOptions.render.boundaries.wholeWorldPrecalculations;

        this.#webGlEngine = new _WebGl_WebGlEngine_js__WEBPACK_IMPORTED_MODULE_3__.WebGlEngine(this.#drawContext, this.#systemSettingsReference.gameOptions);
        
        this._registerRenderInit(this.#webGlEngine._initiateJsRender);
        if (this.systemSettings.gameOptions.optimization === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.OPTIMIZATION.WEB_ASSEMBLY.NATIVE_WAT ||
            this.systemSettings.gameOptions.optimization === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT) {
            this._registerRenderInit(this.#webGlEngine._initiateWasm);
        }

        this._registerRenderInit(this.fixCanvasSize);
        this._registerRenderInit(
            () => this._registerAndCompileWebGlProgram(_constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES, _WebGl_ImagesDrawProgram_js__WEBPACK_IMPORTED_MODULE_14__.imgVertexShader, _WebGl_ImagesDrawProgram_js__WEBPACK_IMPORTED_MODULE_14__.imgFragmentShader, _WebGl_ImagesDrawProgram_js__WEBPACK_IMPORTED_MODULE_14__.imgUniforms, _WebGl_ImagesDrawProgram_js__WEBPACK_IMPORTED_MODULE_14__.imgAttributes)
        );
        this._registerRenderInit(
            () => this._registerAndCompileWebGlProgram(_constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES, _WebGl_PrimitivesDrawProgram_js__WEBPACK_IMPORTED_MODULE_15__.primitivesVertexShader, _WebGl_PrimitivesDrawProgram_js__WEBPACK_IMPORTED_MODULE_15__.primitivesFragmentShader, _WebGl_PrimitivesDrawProgram_js__WEBPACK_IMPORTED_MODULE_15__.primitivesUniforms, _WebGl_PrimitivesDrawProgram_js__WEBPACK_IMPORTED_MODULE_15__.primitivesAttributes)
        );
        this._registerRenderInit(this.#webGlEngine._initWebGlAttributes);

        this._registerObjectRender(_2d_DrawTextObject_js__WEBPACK_IMPORTED_MODULE_13__.DrawTextObject.name, this.#webGlEngine._bindText, _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES);
        this._registerObjectRender(_2d_DrawRectObject_js__WEBPACK_IMPORTED_MODULE_12__.DrawRectObject.name, this.#webGlEngine._bindPrimitives, _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(_2d_DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_11__.DrawPolygonObject.name, this.#webGlEngine._bindPrimitives, _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(_2d_DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_8__.DrawCircleObject.name, this.#webGlEngine._bindConus, _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(_2d_DrawConusObject_js__WEBPACK_IMPORTED_MODULE_9__.DrawConusObject.name, this.#webGlEngine._bindConus, _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(_2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_0__.DrawTiledLayer.name, this.#webGlEngine._bindTileImages, _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES);
        this._registerObjectRender(_2d_DrawLineObject_js__WEBPACK_IMPORTED_MODULE_10__.DrawLineObject.name, this.#webGlEngine._bindLine, _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
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

    get stageData() {
        return this.#currentGameStageData;
    }

    get systemSettings() {
        return this.#systemSettingsReference;
    }

    get iLoader() {
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
        return this.iLoader.filesWaitingForUpload === 0;
    };

    initiateContext = (stageData) => {
        return Promise.all(this.#initPromises.map(method => method(stageData)));
    };

    clearContext() {
        this.#webGlEngine._clearView();
    }

    setCanvasSize(width, height) {
        this.#canvas.width = width;
        this.#canvas.height = height;
        if (this.#webGlEngine) {
            this.#webGlEngine._fixCanvasSize(width, height);
        }
    }

    fixCanvasSize = () => {
        const settings = this.systemSettings, 
            canvasWidth = settings.canvasMaxSize.width && (settings.canvasMaxSize.width < window.innerWidth) ? settings.canvasMaxSize.width : window.innerWidth,
            canvasHeight = settings.canvasMaxSize.height && (settings.canvasMaxSize.height < window.innerHeight) ? settings.canvasMaxSize.height : window.innerHeight;
        this.setCanvasSize(canvasWidth, canvasHeight);
        return Promise.resolve();
    };

    /****************************
     *  Extend functionality
     ****************************/
    /**
     * @ignore
     * @param {string} programName
     * @param {string} vertexShader - raw vertex shader program
     * @param {string} fragmentShader - raw fragment shader program 
     * @param {Array<string>} uVars - program uniform variables names
     * @param {Array<string>} aVars - program attribute variables names
     * @returns {Promise<void>}
     */
    _registerAndCompileWebGlProgram(programName, vertexShader, fragmentShader, uVars, aVars) {
        this.#webGlEngine._registerAndCompileWebGlProgram(programName, vertexShader, fragmentShader, uVars, aVars);
        return Promise.resolve();
    }

    /**
     * @ignore
     * @param {function(GameStageData):Promise<void>} method 
     * @returns {void}
     */
    _registerRenderInit(method) {
        this.#initPromises.push(method);
        //} else {
        //    Exception(ERROR_CODES.UNEXPECTED_METHOD_TYPE, "registerRenderInit() accept only Promise based methods!");
        //}
    }

    /**
     * @ignore
     * @param {string} objectClassName - object name registered to DrawObjectFactory
     * @param {function(renderObject, gl, pageData, program, vars):Promise<any[]>} objectRenderMethod - should be promise based returns vertices number and draw program
     * @param {string=} objectWebGlDrawProgram 
     */
    _registerObjectRender(objectClassName, objectRenderMethod, objectWebGlDrawProgram) {
        this.#registeredRenderObjects.set(objectClassName, {method: objectRenderMethod, webglProgramName: objectWebGlDrawProgram});
    }

    /****************************
     *  End of Extend functionality
     ****************************/

    /**
     * @returns {Promise<void>}
     */
    async render() {
        const renderObjects = this.stageData.renderObjects;
            
        let errors = [],
            isErrors = false,
            len = renderObjects.length,
            renderObjectsPromises = new Array(len);

        if (len !== 0) {
            //this.#checkCollisions(view.renderObjects);
            for (let i = 0; i < len; i++) {
                const object = renderObjects[i];
                if (object.isRemoved) {
                    renderObjects.splice(i, 1);
                    i--;
                    len--;
                    continue;
                }
                if (object.hasAnimations) {
                    object._processActiveAnimations();
                }
                const promise = await this._bindRenderObject(object)
                    .catch((err) => Promise.reject(err));
                renderObjectsPromises[i] = promise;
            }
            if (this.systemSettings.gameOptions.debug.boundaries.drawLayerBoundaries) {
                renderObjectsPromises.push(this.#drawBoundariesWebGl()
                    .catch((err) => Promise.reject(err))); 
            }
            //const bindResults = await Promise.allSettled(renderObjectsPromises);
            //bindResults.forEach((result) => {
            //    if (result.status === "rejected") {
            //        reject(result.reason);
            //    }
            //});

            //await this.#webGlEngine._executeImagesDraw();

            //this.#postRenderActions();
        }
        const bindResults = await Promise.allSettled(renderObjectsPromises);
        bindResults.forEach((result) => {
            if (result.status === "rejected") {
                Promise.reject(result.reason);
                isErrors = true;
                errors.push(result.reason);
            }
        });

        this.#postRenderActions();
            
        this._isCleared = false;
        if (isErrors === false) {
            return Promise.resolve();
        } else {
            return Promise.reject(errors);
        }
    }

    /**
     * @ignore
     */
    set _isCleared(value) {
        this.#isCleared = value;
    }

    /**
     * @ignore
     */
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
    #postRenderActions() {
        //const images = this.stageData.getObjectsByInstance(DrawImageObject);
        //for (let i = 0; i < images.length; i++) {
        //    const object = images[i];
        //    if (object.isAnimations) {
        //        object._processActiveAnimations();
        //    }
        //}
    }

    //#clearTileMapPromises() {
    //    this.#bindTileMapPromises = [];
    //}

    /**
     * 
     * @param {DrawTiledLayer} renderLayer 
     * @returns {Promise<void>}
     */
    #layerBoundariesPrecalculation(renderLayer) {
        return new Promise((resolve, reject) => {
            if (renderLayer.setBoundaries) {
                const tilemap = this.iLoader.getTileMap(renderLayer.tileMapKey),
                    tilesets = tilemap.tilesets,
                    layerData = tilemap.layers.find((layer) => layer.name === renderLayer.layerKey),
                    { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                    tilewidth = dtwidth,
                    tileheight = dtheight,
                    [ settingsWorldWidth, settingsWorldHeight ] = this.stageData.worldDimensions;
                
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
                        this.stageData._setWorldDimensions(worldW, worldH);
                    }
                    
                    if (renderLayer.setBoundaries && this.systemSettings.gameOptions.render.boundaries.mapBoundariesEnabled) {
                        this.stageData._setWholeWorldMapBoundaries();
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
                this.stageData._setWholeMapBoundaries(boundaries);
                this.stageData._mergeBoundaries(true);
                resolve();
            } else {
                resolve();
            }
        });
    }

    /**
     * @ignore
     * @param {DrawImageObject | DrawCircleObject | DrawConusObject | DrawLineObject | DrawPolygonObject | DrawRectObject | DrawTextObject | DrawTiledLayer} renderObject 
     * @returns {Promise<void>}
     */
    _bindRenderObject(renderObject) {
        const name = renderObject.constructor.name,
            registeredRenderObject = this.#registeredRenderObjects.get(name);
        if (registeredRenderObject) {
            const name = registeredRenderObject.webglProgramName;
            if (name) {
                const program = this.#webGlEngine.getProgram(name),
                    vars = this.#webGlEngine.getProgramVarLocations(name);
                return registeredRenderObject.method(renderObject, this.drawContext, this.stageData, program, vars)
                    .then((results) => this.#webGlEngine._render(results[0], results[1]));  
            } else {
                return registeredRenderObject.method(renderObject, this.drawContext, this.stageData);
            }
        } else {
            // a workaround for images and its extend classes drawing
            if (renderObject.type === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.DRAW_TYPE.IMAGE) {
                const program = this.#webGlEngine.getProgram(_constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES),
                    vars = this.#webGlEngine.getProgramVarLocations(_constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES);

                if (!renderObject.image) {
                    const image = this.iLoader.getImage(renderObject.key);
                    if (!image) {
                        (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.ERROR_CODES.CANT_GET_THE_IMAGE, "iLoader can't get the image with key: " + renderObject.key);
                    } else {
                        renderObject.image = image;
                    }
                }
                return this.#webGlEngine._bindImage(renderObject, this.drawContext, this.stageData, program, vars)
                    .then((results) => this.#webGlEngine._render(results[0], results[1]))
                    .then(() => {
                        if (renderObject.vertices && this.systemSettings.gameOptions.debug.boundaries.drawObjectBoundaries) {
                            return this.#webGlEngine._drawPolygon(renderObject, this.stageData);
                        } else {
                            return Promise.resolve();
                        }
                    });
            } else {
                console.warn("no registered draw object method for " + name + " skip draw");
                return Promise.resolve();
            }
        }
    }

    /**
     * 
     * @returns {Promise<void>}
     */
    #drawBoundariesWebGl() {
        return new Promise((resolve) => {
            const b = this.stageData.getRawBoundaries(),
                eB = this.stageData.getEllipseBoundaries(),
                pB = this.stageData.getPointBoundaries(),
                len = this.stageData.boundariesLen,
                eLen = this.stageData.ellipseBLen,
                pLen = this.stageData.pointBLen;
        
            if (len)
                this.#webGlEngine._drawLines(b, this.systemSettings.gameOptions.debug.boundaries.boundariesColor, this.systemSettings.gameOptions.debug.boundaries.boundariesWidth);
            if (eLen) {
                //draw ellipse boundaries
                for (let i = 0; i < eLen; i+=4) {
                    const x = eB[i],
                        y = eB[i+1],
                        radX = eB[i+2],
                        radY = eB[i+3],
                        vertices = _index_js__WEBPACK_IMPORTED_MODULE_16__.utils.calculateEllipseVertices(x, y, radX, radY);
                    this.#webGlEngine._drawPolygon({x: 0, y: 0, vertices, isOffsetTurnedOff: true}, this.stageData);
                    //this.#webGlEngine._drawLines(vertices, this.systemSettings.gameOptions.debug.boundaries.boundariesColor, this.systemSettings.gameOptions.debug.boundaries.boundariesWidth);
                }
            }
            if (pLen) {
                //draw point boundaries
                for (let i = 0; i < pLen; i+=2) {
                    const x = pB[i],
                        y = pB[i+1],
                        vertices = [x,y, x+1,y+1];

                    this.#webGlEngine._drawLines(vertices, this.systemSettings.gameOptions.debug.boundaries.boundariesColor, this.systemSettings.gameOptions.debug.boundaries.boundariesWidth);
                }
            }
            resolve();
        });
    }

    #countFPSaverage() {
        const timeLeft = this.systemSettings.gameOptions.render.cyclesTimeCalc.averageFPStime,
            steps = this.#tempRCircleTPointer;
        let fullTime = 0;
        for (let i = 0; i < steps; i++) {
            const timeStep = this.#tempRCircleT[i];
            fullTime += timeStep;
        }
        console.log("FPS average for", timeLeft/1000, "sec, is ", (1000 / (fullTime / steps)).toFixed(2));

        // cleanup
        this.#tempRCircleT.fill(0);
        this.#tempRCircleTPointer = 0;
    }

    /**
     * @ignore
     * @param {GameStageData} stageData 
     */
    _startRender = async (/*time*/stageData) => {
        const gameOptions = this.systemSettings.gameOptions;
        //Logger.debug("_render " + this.name + " class");
        this.#isActive = true;
        this.#currentGameStageData = stageData;
        this.fixCanvasSize();
        switch (gameOptions.library) {
        case _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.LIBRARY.WEBGL:
            await this.#prepareViews();
            this.timeStart = Date.now();
            setTimeout(() => requestAnimationFrame(this.#drawViews));
            break;
        }
        if (gameOptions.render.cyclesTimeCalc.check === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.OPTIMIZATION.CYCLE_TIME_CALC.AVERAGES) {
            this.#fpsAverageCountTimer = setInterval(() => this.#countFPSaverage(), gameOptions.render.cyclesTimeCalc.averageFPStime);
        }
    };

    /**
     * @ignore
     */
    _stopRender = () => {
        this.#isActive = false;
        this.#currentGameStageData = null;
        this.#tempRCircleT.fill(0);
        this.#tempRCircleTPointer = 0;
        clearInterval(this.#fpsAverageCountTimer);
        this.#fpsAverageCountTimer = null;
    };
    /**
     * 
     * @returns {Promise<void>}
     */
    #prepareViews() {
        return new Promise((resolve, reject) => {
            let viewPromises = [];
            const isBoundariesPrecalculations = this.#isBoundariesPrecalculations;
            viewPromises.push(this.initiateContext(this.#currentGameStageData));
            if (isBoundariesPrecalculations) {
                console.warn("isBoundariesPrecalculations() is turned off");
                //for (const view of this.#views.values()) {
                //viewPromises.push(this.#iRender._createBoundariesPrecalculations());
                //}
            }
            Promise.allSettled(viewPromises).then((drawingResults) => {
                drawingResults.forEach((result) => {
                    if (result.status === "rejected") {
                        const error = result.reason;
                        (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, error);
                        reject(error);
                    }
                });
                resolve();
            });
        });
    }

    #drawViews = async (/*drawTime*/) => {
        const timeStart = performance.now(),
            minCycleTime = this.#minCycleTime,
            isCyclesTimeCalcCheckCurrent = this.systemSettings.gameOptions.render.cyclesTimeCalc.check === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.OPTIMIZATION.CYCLE_TIME_CALC.CURRENT;
            
        this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.EVENTS.SYSTEM.RENDER.START);
        this.stageData._clearBoundaries();
        this.clearContext();
        
        this.render().then(() => {
            const currentRenderTime = performance.now() - timeStart,
                r_time_less = minCycleTime - currentRenderTime,
                wait_time = r_time_less > 0 ? r_time_less : 0,
                cycleTime = currentRenderTime + wait_time;
                
            if (isCyclesTimeCalcCheckCurrent && currentRenderTime > minCycleTime) {
                console.log("current draw take: ", (currentRenderTime), " ms");
            }

            this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.EVENTS.SYSTEM.RENDER.END);

            if (cycleTime > 0) {
                this.#tempRCircleT[this.#tempRCircleTPointer] = cycleTime;
                this.#tempRCircleTPointer++;
            }

            if (this.#isActive) {
                setTimeout(() => requestAnimationFrame(this.#drawViews), wait_time);
            }
        }).catch((errors) => {
            if (errors.forEach) {
                errors.forEach((err) => {
                    (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, err);
                });
            } else {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, errors.message);
            }
            this._stopRender();
        });
    };
}

/***/ }),

/***/ "./src/base/ISystem.js":
/*!*****************************!*\
  !*** ./src/base/ISystem.js ***!
  \*****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ISystem": () => (/* binding */ ISystem)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _INetwork_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./INetwork.js */ "./src/base/INetwork.js");
/* harmony import */ var _ISystemAudio_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ISystemAudio.js */ "./src/base/ISystemAudio.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _modules_assetsm_dist_assetsm_min_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../modules/assetsm/dist/assetsm.min.js */ "./modules/assetsm/dist/assetsm.min.js");
/* harmony import */ var _DrawObjectFactory_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./DrawObjectFactory.js */ "./src/base/DrawObjectFactory.js");
/* harmony import */ var _GameStage_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./GameStage.js */ "./src/base/GameStage.js");
/* harmony import */ var _IRender_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./IRender.js */ "./src/base/IRender.js");
/* harmony import */ var _IExtension_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./IExtension.js */ "./src/base/IExtension.js");











/**
 * Public interface for a System<br>
 * Can be used to start/stop GameStage render, <br>
 * And provides access to SystemSettings, INetwork and ISystemAudio <br>
 * IRender, DrawObjectFactory, AssetsManager and external modules
 * accessible via GameStage.iSystem and System.system
 * @see {@link System} a part of System class instance
 * @see {@link GameStage} a part of GameStage class instance
 */
class ISystem {
    /**
     * @type {Object}
     */
    #systemSettings;
    /**
     * @type {IExtension}
     */
    #iExtension;
    /**
     * @type {INetwork | null}
     */
    #systemServerConnection;
    /**
     * @type {ISystemAudio}
     */
    #systemAudioInterface;
    /**
     * @type {AssetsManager}
     */
    #iLoader = new _modules_assetsm_dist_assetsm_min_js__WEBPACK_IMPORTED_MODULE_5__["default"]();
    /**
     * @type {IRender}
     */
    #iRender;
    /**
     * @type {DrawObjectFactory}
     */
    #drawObjectFactory = new _DrawObjectFactory_js__WEBPACK_IMPORTED_MODULE_6__.DrawObjectFactory(this.#iLoader);
    
    #modules = new Map();
    /**
     * @type {Map<string, GameStage>}
     */
    #registeredStagesReference;
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();
    /**
     * @hideconstructor
     */
    constructor(systemSettings, registeredStages, canvasContainer) {
        if (!systemSettings) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#systemSettings = systemSettings;
        
        this.#systemAudioInterface = new _ISystemAudio_js__WEBPACK_IMPORTED_MODULE_3__.ISystemAudio(this.iLoader);
        this.#systemServerConnection = systemSettings.network.enabled ? new _INetwork_js__WEBPACK_IMPORTED_MODULE_2__.INetwork(systemSettings) : null;
        this.#iRender = new _IRender_js__WEBPACK_IMPORTED_MODULE_8__.IRender(this.systemSettings, this.iLoader, canvasContainer);
        this.#iExtension = new _IExtension_js__WEBPACK_IMPORTED_MODULE_9__.IExtension(this, this.#iRender);
        this.#registeredStagesReference = registeredStages;
        // broadcast render events
        this.#iRender.addEventListener(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.RENDER.START, () => this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.RENDER.START));
        this.#iRender.addEventListener(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.RENDER.END, () => this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.RENDER.END));
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
     * @type { INetwork | null }
     */
    get iNetwork () {
        return this.#systemServerConnection;
    }

    /**
     * @type { SystemSettings }
     */
    get systemSettings() {
        return this.#systemSettings;
    }

    /**
     * @type { ISystemAudio }
     */
    get audio() {
        return this.#systemAudioInterface;
    }

    /**
     * @type {AssetsManager}
     */
    get iLoader() {
        return this.#iLoader;
    }

    /**
     * @type {IRender}
     */
    get iRender() {
        return this.#iRender;
    }

    /**
     * @type {DrawObjectFactory}
     */
    get drawObjectFactory() {
        return this.#drawObjectFactory;
    }

    get iExtension() {
        return this.#iExtension;
    }
    /**
     * @type {Map<string, Object>}
     */
    get modules() {
        return this.#modules;
    }

    /**
     * 
     * @param {string} moduleKey 
     * @param {Object} moduleClass 
     * @param  {...any} args 
     * @returns {Object}
     */
    installModule = (moduleKey, moduleClass, ...args) => {
        const moduleInstance = new moduleClass(this, ...args);
        if (this.#modules.has(moduleKey)) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.MODULE_ALREADY_INSTALLED, "module " + moduleKey + " is already installed");
            return this.#modules.get(moduleKey);
        } else {
            this.#modules.set(moduleKey, moduleInstance);
        }
        return moduleInstance;
    };

    /**
     * @method
     * @param {string} screenPageName
     * @param {Object} [options] - options
     */
    startGameStage = (screenPageName, options) => {
        if (this.#registeredStagesReference.has(screenPageName)) {
            const stage = this.#registeredStagesReference.get(screenPageName),
                pageData = stage.stageData;
            this.#drawObjectFactory._attachPageData(pageData);
            if (stage.isInitiated === false) {
                stage._init();
            }
            //stage._attachCanvasToContainer(this.#canvasContainer);
            stage._start(options);
            this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.START_PAGE);
            this.#iRender._startRender(pageData);
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.VIEW_NOT_EXIST, "View " + screenPageName + " is not registered!");
        }
    };

    /**
     * @method
     * @param {string} screenPageName
     */
    stopGameStage = (screenPageName) => {
        if (this.#registeredStagesReference.has(screenPageName)) {
            this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.STOP_PAGE);
            this.drawObjectFactory._detachPageData();
            this.#iRender._stopRender();
            this.#registeredStagesReference.get(screenPageName)._stop();
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.VIEW_NOT_EXIST, "View " + screenPageName + " is not registered!");
        }
    };
}

/***/ }),

/***/ "./src/base/ISystemAudio.js":
/*!**********************************!*\
  !*** ./src/base/ISystemAudio.js ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ISystemAudio": () => (/* binding */ ISystemAudio)
/* harmony export */ });
/* harmony import */ var _modules_assetsm_dist_assetsm_min_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../modules/assetsm/dist/assetsm.min.js */ "./modules/assetsm/dist/assetsm.min.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");




/**
 * An audio interface, <br>
 * controls all application audio,<br>
 * holds and retrieves audio, changes volume<br> 
 * accessible via GameStage.audio
 * @see {@link GameStage} a part of GameStage
 * @hideconstructor
 */
class ISystemAudio {
    #volume = 0.5;
    #audio = new Map();
    /**
     * @type {AssetsManager}
     */
    #loaderReference;

    constructor(iLoader) {
        this.#loaderReference = iLoader;
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
     * Register audio in the iSystem
     * @param {string} name
     */
    registerAudio(name) {
        let mediaElement = this.#loaderReference.getAudio(name);
        this.#audio.set(name, mediaElement);
    }
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
/* harmony import */ var _GameStage_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./GameStage.js */ "./src/base/GameStage.js");
/* harmony import */ var _ISystem_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ISystem.js */ "./src/base/ISystem.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _design_LoadingStage_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../design/LoadingStage.js */ "./src/design/LoadingStage.js");








const loadingPageName = "loadingPage";
/**
 * A main app class, <br>
 * Holder class for GameStage,<br>
 * can register new GameStages,<br>
 * init and preload data for them,<br>
 */
class System {
    /**
     * @type {Map<string, GameStage>}
     */
    #registeredStages;
    /**
     * @type {ISystem}
     */
    #iSystem;
    /**
     * @param {SystemSettings} iSystemSettings - holds iSystem settings
     * @param {HTMLElement | null} [canvasContainer = null] - If it is not passed, iSystem will create div element and attach it to body
     */
    constructor(iSystemSettings, canvasContainer) {
        if (!iSystemSettings) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CREATE_INSTANCE_ERROR, "iSystemSettings should be passed to class instance");
        }
        this.#registeredStages = new Map();

        if (!canvasContainer) {
            canvasContainer = document.createElement("div");
            document.body.appendChild(canvasContainer);
        }

        this.#iSystem = new _ISystem_js__WEBPACK_IMPORTED_MODULE_3__.ISystem(iSystemSettings, this.#registeredStages, canvasContainer);

        this.registerStage(loadingPageName, _design_LoadingStage_js__WEBPACK_IMPORTED_MODULE_5__.LoadingStage);

        this.#iSystem.iLoader.addEventListener("loadstart", this.#loadStart);
        this.#iSystem.iLoader.addEventListener("progress", this.#loadProgress);
        this.#iSystem.iLoader.addEventListener("load", this.#loadComplete);
    }

    /**
     * @type {ISystem}
     */
    get iSystem() {
        return this.#iSystem;
    }

    /**
     * A main factory method for create GameStage instances, <br>
     * register them in a System and call GameStage.register() stage
     * @param {string} screenPageName
     * @param {GameStage} stage
     */
    registerStage(screenPageName, stage) {
        if (screenPageName && typeof screenPageName === "string" && screenPageName.trim().length > 0) {
            const stageInstance = new stage();
            stageInstance._register(screenPageName, this.iSystem);
            this.#registeredStages.set(screenPageName, stageInstance);
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CREATE_INSTANCE_ERROR, "valid class name should be provided");
        }
    }

    /**
     * Preloads assets for all registered pages
     * @return {Promise<void>}
     */
    preloadAllData() {
        return this.#iSystem.iLoader.preload();
    }

    #loadStart = (event) => {
        this.#iSystem.startGameStage(loadingPageName, {total: event.total});
    };

    #loadProgress = (event) => {
        const uploaded = event.loaded,
            left = event.total,
            loadingPage = this.#registeredStages.get(loadingPageName);
            
        loadingPage._progress(uploaded, left);
    };

    #loadComplete = () => {
        this.#iSystem.stopGameStage(loadingPageName);
    };
}

/***/ }),

/***/ "./src/base/Temp/ImageTempStorage.js":
/*!*******************************************!*\
  !*** ./src/base/Temp/ImageTempStorage.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ImageTempStorage": () => (/* binding */ ImageTempStorage)
/* harmony export */ });
/**
 * storing current WebGLTexture
 */
class ImageTempStorage {
    /**
     * @type {Number}
     */
    #textureIndex;
    /**
     * @type {WebGLTexture}
     */
    #texture;
    /**
     * @type {boolean}
     */
    #isTextureRecalculated = true;
    constructor(texture, textureIndex = 0) {
        this.#texture = texture;
        this.#textureIndex = textureIndex;
    }

    get _isTextureRecalculated() {
        return this.#isTextureRecalculated;
    }

    set _isTextureRecalculated(value) {
        this.#isTextureRecalculated = value;
    }

    get _texture() {
        return this.#texture;
    }

    set _texture(value) {
        this.#texture = value;
    }

    get _textureIndex() {
        return this.#textureIndex;
    }
}

/***/ }),

/***/ "./src/base/Temp/TiledLayerTempStorage.js":
/*!************************************************!*\
  !*** ./src/base/Temp/TiledLayerTempStorage.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TiledLayerTempStorage": () => (/* binding */ TiledLayerTempStorage)
/* harmony export */ });
/**
 * storing vectors and textures for DrawTiledLayer
 */
class TiledLayerTempStorage {
    /**
     * @type {Float32Array}
     */
    #vectors;
    /**
     * @type {Float32Array}
     */
    #textures;
    /**
     * @type {Int32Array}
     */
    #boundariesTempIndexes;
    /**
     * @type {number}
     */
    #bufferSize = 0;
    constructor(cells, nonEmptyCells) {
        this.#bufferSize = nonEmptyCells * 12;
        this.#vectors = new Float32Array(this.#bufferSize);
        this.#textures = new Float32Array(this.#bufferSize);
        this.#boundariesTempIndexes = new Int32Array(cells * 4);
    }

    get vectors() {
        return this.#vectors;
    }

    get textures() {
        return this.#textures;
    }

    get _bTempIndexes() {
        return this.#boundariesTempIndexes;
    }

    get bufferSize() {
        return this.#bufferSize;
    }
}

/***/ }),

/***/ "./src/base/WebGl/ImagesDrawProgram.js":
/*!*********************************************!*\
  !*** ./src/base/WebGl/ImagesDrawProgram.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "imgAttributes": () => (/* binding */ imgAttributes),
/* harmony export */   "imgFragmentShader": () => (/* binding */ imgFragmentShader),
/* harmony export */   "imgUniforms": () => (/* binding */ imgUniforms),
/* harmony export */   "imgVertexShader": () => (/* binding */ imgVertexShader)
/* harmony export */ });
const imgVertexShader =  `
    attribute vec2 a_texCoord;

    attribute vec2 a_position;

    uniform vec2 u_translation;
    uniform float u_rotation;
    uniform vec2 u_scale;

    uniform vec2 u_resolution;

    varying vec2 v_texCoord;

    void main(void) {
        float c = cos(u_rotation);
        float s = sin(u_rotation);

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
            c, s, 0,
            -s, c, 0,
            0, 0, 1
        );

        mat3 scalingMatrix = mat3(
            u_scale.x, 0, 0,
            0, u_scale.y, 0,
            0, 0, 1
        );

        mat3 matrix = translationMatrix1 * rotationMatrix * translationMatrix2 * scalingMatrix;
    
        vec2 position = (matrix * vec3(a_position, 1)).xy;

        vec2 clipSpace = position / u_resolution * 2.0 - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        
        v_texCoord = a_texCoord;
    }`;
const imgFragmentShader = `
    precision mediump float;

    uniform sampler2D u_image;

    //texCoords passed in from the vertex shader
    varying vec2 v_texCoord;
    void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        gl_FragColor = color;
    }`;
const imgUniforms = ["u_translation", "u_rotation", "u_scale", "u_resolution","u_image"];
const imgAttributes = ["a_position", "a_texCoord"];



/***/ }),

/***/ "./src/base/WebGl/PrimitivesDrawProgram.js":
/*!*************************************************!*\
  !*** ./src/base/WebGl/PrimitivesDrawProgram.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "primitivesAttributes": () => (/* binding */ primitivesAttributes),
/* harmony export */   "primitivesFragmentShader": () => (/* binding */ primitivesFragmentShader),
/* harmony export */   "primitivesUniforms": () => (/* binding */ primitivesUniforms),
/* harmony export */   "primitivesVertexShader": () => (/* binding */ primitivesVertexShader)
/* harmony export */ });
const primitivesVertexShader =  `
    precision mediump float;

    attribute vec2 a_position;

    uniform vec2 u_translation;
    uniform float u_rotation;
    uniform vec2 u_scale;

    uniform vec2 u_resolution;

    void main(void) {
        float c = cos(u_rotation);
        float s = sin(u_rotation);

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
            c, s, 0,
            -s, c, 0,
            0, 0, 1
        );

        mat3 scalingMatrix = mat3(
            u_scale.x, 0, 0,
            0, u_scale.y, 0,
            0, 0, 1
        );
        
        mat3 matrix = translationMatrix1 * rotationMatrix * scalingMatrix;

        vec2 position = (matrix * vec3(a_position, 1)).xy;

        vec2 clipSpace = position / u_resolution * 2.0 - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
`;
const primitivesFragmentShader = `
    precision mediump float;

    uniform vec4 u_color;
    uniform float u_fade_min; 
    uniform float u_fade_max;
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
const primitivesUniforms = ["u_translation", "u_rotation", "u_scale", "u_resolution", "u_fade_min", "u_fade_max", "u_color"];
const primitivesAttributes = ["a_position"];



/***/ }),

/***/ "./src/base/WebGl/WebGlEngine.js":
/*!***************************************!*\
  !*** ./src/base/WebGl/WebGlEngine.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WebGlEngine": () => (/* binding */ WebGlEngine)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants.js */ "./src/constants.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils.js */ "./src/utils.js");
/* harmony import */ var _2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../2d/DrawTiledLayer.js */ "./src/base/2d/DrawTiledLayer.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _GameStageData_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../GameStageData.js */ "./src/base/GameStageData.js");
/* harmony import */ var _Temp_ImageTempStorage_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Temp/ImageTempStorage.js */ "./src/base/Temp/ImageTempStorage.js");







class WebGlEngine {
    /**
     * @type {WebGLRenderingContext}
     */
    #gl;
    /**
     * @type {number}
     */
    #MAX_TEXTURES;
    /**
     * @type {boolean}
     */
    #debug;
    /**
     * @type {Object}
     */
    #gameOptions;
    /**
     * @type {WebGLBuffer | null}
     */
    #positionBuffer;
    /**
     * @type {WebGLBuffer | null}
     */
    #texCoordBuffer;

    /**
     * @type {Map<string, WebGLProgram}
     */
    #registeredWebGlPrograms = new Map();
    /**
     * @type {Map<string, Object<string, WebGLUniformLocation | number>>}
     */
    #webGlProgramsVarsLocations = new Map();

    constructor(context, gameOptions) {
        if (!context || !(context instanceof WebGLRenderingContext)) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.UNEXPECTED_INPUT_PARAMS, " context parameter should be specified and equal to WebGLRenderingContext");
        }
        
        this.#gl = context;
        this.#gameOptions = gameOptions;
        this.#debug = gameOptions.debug.checkWebGlErrors;
        this.#MAX_TEXTURES = context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS);
        this.#positionBuffer = context.createBuffer();
        this.#texCoordBuffer = context.createBuffer();
    }

    getProgram(name) {
        return this.#registeredWebGlPrograms.get(name);
    }

    getProgramVarLocations(name) {
        return this.#webGlProgramsVarsLocations.get(name);
    }

    _fixCanvasSize(width, height) {
        this.#gl.viewport(0, 0, width, height);
    }
    _initiateJsRender = (stageData) => {
        return new Promise((resolve, reject) => {
            const tileLayers = stageData.getObjectsByInstance(_2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_2__.DrawTiledLayer),
                [ settingsWorldWidth, settingsWorldHeight ] = stageData.worldDimensions;

            // count max possible boundaries sizes
            let maxBSize = 0,
                maxESize = 0,
                maxPSize = 0,
                maxWorldW = 0,
                maxWorldH = 0;

            tileLayers.forEach(tiledLayer => {
                const setBoundaries = tiledLayer.setBoundaries,
                    layerData = tiledLayer.layerData,
                    tilemap = tiledLayer.tilemap,
                    tilesets = tiledLayer.tilesets,
                    { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                    tilewidth = dtwidth,
                    tileheight = dtheight;

                for (let i = 0; i < tilesets.length; i++) {
                    const layerCols = layerData.width,
                        layerRows = layerData.height,
                        worldW = tilewidth * layerCols,
                        worldH = tileheight * layerRows;
                        
                        const polygonBondMax = layerData.polygonBoundariesLen,
                            ellipseBondMax = layerData.ellipseBoundariesLen,
                            pointBondMax = layerData.pointBoundariesLen; 
    
                    if (maxWorldW < worldW) {
                        maxWorldW = worldW
                    }
                    if (maxWorldH < worldH) {
                        maxWorldH = worldH;
                    }
                    
                    if (setBoundaries) {
                        maxBSize += polygonBondMax;
                        maxESize += ellipseBondMax;
                        maxPSize += pointBondMax;
    
                        // boundaries cleanups every draw cycles, we need to set world boundaries again
                        
                    }
                }
            });

            if (maxWorldW !== 0 && maxWorldH !== 0 && (maxWorldW !== settingsWorldWidth || maxWorldH !== settingsWorldHeight)) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                stageData._setWorldDimensions(maxWorldW, maxWorldH);
            }

            if (this.#gameOptions.render.boundaries.mapBoundariesEnabled) {
                maxBSize+=16; //4 sides * 4 cords x1,y1,x2,y,2
            }
            stageData._setMaxBoundariesSize(maxBSize, maxESize, maxPSize);
            stageData._initiateBoundariesData();

            resolve(true);
        });

    }
    _initWebGlAttributes = () => {
        const gl = this.#gl;
        gl.enable(gl.BLEND);
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
        //if stencil test and depth test pass we replace the initial value
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        return Promise.resolve();
    };

    /**
     * 
     * @returns {Promise<void>}
     */
    _initiateWasm = (stageData) => {
        const url = this.#gameOptions.optimization === _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.OPTIMIZATION.WEB_ASSEMBLY.NATIVE_WAT ? this.#gameOptions.optimizationWASMUrl : this.#gameOptions.optimizationAssemblyUrl;
        return new Promise((resolve, reject) => {
            this.layerData = new WebAssembly.Memory({
                initial:1000 // 6.4MiB x 10 = 64MiB(~67,1Mb)
            });
            this.layerDataFloat32 = new Float32Array(this.layerData.buffer);
            const importObject = {
                env: {
                    memory: this.layerData,
                    logi: console.log,
                    logf: console.log
                }
            };

            fetch(url)
                .then((response) => response.arrayBuffer())
                .then((module) => WebAssembly.instantiate(module, importObject))
                .then((obj) => {
                    this.calculateBufferData = obj.instance.exports.calculateBufferData;
                    resolve();
                });
        });
    };

    _clearView() {
        const gl = this.#gl;
        //cleanup buffer, is it required?
        //gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.clearColor(0, 0, 0, 0);// shouldn't be gl.clearColor(0, 0, 0, 1); ?
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    }
    
    _render(verticesNumber, primitiveType, offset = 0) {
        const gl = this.#gl,
            err = this.#debug ? gl.getError() : 0;
        if (err !== 0) {
            console.error(err);
            throw new Error("Error num: " + err);
        } else {
            gl.drawArrays(primitiveType, offset, verticesNumber);
            // set blend to default
            gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
        }
        return new Promise((resolve, reject) => {
            if (this.#gameOptions.debug.delayBetweenObjectRender) {
                setTimeout(() => {
                    resolve();
                }, 1000);
            } else {
                resolve();
            }
        });
    }

    /*************************************
     * Register and compile programs
     ************************************/

    /**
     * 
     * @param {string} programName
     * @param {string} vertexShader - raw vertex shader program
     * @param {string} fragmentShader - raw fragment shader program 
     * @param {Array<string>} uVars - program uniform variables names
     * @param {Array<string>} aVars - program attribute variables names
     * @returns {Promise<void>}
     */
    _registerAndCompileWebGlProgram(programName, vertexShader, fragmentShader, uVars, aVars) {
        const program = this.#compileWebGlProgram(vertexShader, fragmentShader),
            varsLocations = this.#getProgramVarsLocations(program, uVars, aVars);
        this.#registeredWebGlPrograms.set(programName, program);
        this.#webGlProgramsVarsLocations.set(programName, varsLocations);

        return Promise.resolve();
    }

    /**
     * @returns {WebGLProgram}
     */
    #compileWebGlProgram (vertexShader, fragmentShader) {
        const gl = this.#gl,
            program = gl.createProgram();

        if (program) {
            const compVertexShader = this.#compileShader(gl, vertexShader, gl.VERTEX_SHADER);
            if (compVertexShader) {
                gl.attachShader(program, compVertexShader);
            } else {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, "#compileShader(vertexShaderSource) is null");
            }

            const compFragmentShader = this.#compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
            if (compFragmentShader) {
                gl.attachShader(program, compFragmentShader);
            } else {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, "#compileShader(fragmentShaderSource) is null");
            }

            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                const info = gl.getProgramInfoLog(program);
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, `Could not compile WebGL program. \n\n${info}`);
            }
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, "gl.createProgram() is null");
        }
        return program;
    }

    /**
     * 
     * @param {WebGLProgram} program
     * @param {Array<string>} uVars - uniform variables
     * @param {Array<string>} aVars - attributes variables
     * @returns {Object<string, WebGLUniformLocation | number>} - uniform or attribute
     */
    #getProgramVarsLocations(program, uVars, aVars) {
        const gl = this.#gl;
        let locations = {};
        uVars.forEach(elementName => {
            locations[elementName] = gl.getUniformLocation(program, elementName);
        });
        aVars.forEach(elementName => {
            locations[elementName] = gl.getAttribLocation(program, elementName);
        });
        return locations;
    }

    #compileShader(gl, shaderSource, shaderType) {
        const shader = gl.createShader(shaderType);
        if (shader) {
            gl.shaderSource(shader, shaderSource);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                const info = gl.getShaderInfoLog(shader);
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, "Couldn't compile webGl program. \n\n" + info);
            }
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, `gl.createShader(${shaderType}) is null`);
        }
        return shader;
    }
    /*------------------------------------
     * End of Register and compile programs
     -------------------------------------*/

    /**********************************
     * Predefined Drawing programs
     **********************************/
    _bindPrimitives = (renderObject, gl, pageData, program, vars) => {
        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset,
            scale = [1, 1],
            rotation = renderObject.rotation,
            blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA],
            { 
                u_translation: translationLocation,
                u_rotation: rotationRotation,
                u_scale: scaleLocation,
                u_resolution: resolutionUniformLocation,
                u_color: colorUniformLocation,
                a_position: positionAttributeLocation,
                u_fade_min: fadeMinLocation
            } = vars;
            
        let verticesNumber = 0;
        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, x, y);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, 0);
        
        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        switch (renderObject.type) {
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE:
            this.#setSingleRectangle(renderObject.width, renderObject.height);
            verticesNumber += 6;
            break;
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.TEXT:
            break;
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CIRCLE: {
            const coords = renderObject.vertices;
            gl.bufferData(gl.ARRAY_BUFFER, 
                new Float32Array(coords), gl.STATIC_DRAW);
            verticesNumber += coords.length / 2;
            break;
        }
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.POLYGON: {
            const triangles = this.#triangulatePolygon(renderObject.vertices);
            this.#bindPolygon(triangles);
            const len = triangles.length;
            if (len % 3 !== 0) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, `polygons ${renderObject.id}, vertices are not correct, skip drawing`);
                return Promise.reject();
            }
            verticesNumber += len / 2;
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
        
        if (blend) {
            gl.blendFunc(blend[0], blend[1]);
        }
        
        if (renderObject.isMaskAttached) {
            gl.stencilFunc(gl.EQUAL, renderObject._maskId, 0xFF);
        } else if (renderObject._isMask) {
            gl.stencilFunc(gl.ALWAYS, renderObject.id, 0xFF);
        }
        return Promise.resolve([verticesNumber, gl.TRIANGLES]);
    };
    _bindConus = (renderObject, gl, pageData, program, vars) => {
        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset,
            scale = [1, 1],
            rotation = renderObject.rotation,
            { 
                u_translation: translationLocation,
                u_rotation: rotationRotation,
                u_scale: scaleLocation,
                u_resolution: resolutionUniformLocation,
                u_color: colorUniformLocation,
                a_position: positionAttributeLocation,
                u_fade_max: fadeMaxLocation,
                u_fade_min: fadeMinLocation
            } = vars,
            coords = renderObject.vertices,
            fillStyle = renderObject.bgColor,
            fade_min = renderObject.fade_min,
            fadeLen = renderObject.radius,
            blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
        let verticesNumber = 0;

        gl.useProgram(program);
        
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, x, y);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, fade_min);
        gl.uniform1f(fadeMaxLocation, fadeLen);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, 
            new Float32Array(coords), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionAttributeLocation);
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        verticesNumber += coords.length / 2;

        if (blend) {
            gl.blendFunc(blend[0], blend[1]);
        }

        const colorArray = this.#rgbaToArray(fillStyle);

        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        if (renderObject.isMaskAttached) {
            gl.stencilFunc(gl.EQUAL, renderObject._maskId, 0xFF);
        } else if (renderObject._isMask) {
            gl.stencilFunc(gl.ALWAYS, renderObject.id, 0xFF);
        }
        
        return Promise.resolve([verticesNumber, gl.TRIANGLE_FAN]);
    };

    _bindText = (renderObject, gl, pageData, program, vars) => {
        const { u_translation: translationLocation,
            u_rotation: rotationRotation,
            u_scale: scaleLocation,
            u_resolution: resolutionUniformLocation,
            a_position: positionAttributeLocation,
            a_texCoord: texCoordLocation,
            u_image: u_imageLocation } = vars;

        const {width:boxWidth, height:boxHeight} = renderObject.boundariesBox,
            image_name = renderObject.text,
            [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset - boxHeight,
            blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];

        const rotation = 0,
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
        let verticesNumber = 0;

        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, x, y);
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
        
        verticesNumber += 6;
        // remove box
        // fix text edges
        gl.blendFunc(blend[0], blend[1]);
        //
        //var currentTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
        
        let textureStorage = renderObject._textureStorage;
        if (!textureStorage) {
            //const activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
            textureStorage = new _Temp_ImageTempStorage_js__WEBPACK_IMPORTED_MODULE_5__.ImageTempStorage(gl.createTexture());
            renderObject._textureStorage = textureStorage;
        }
        if (textureStorage._isTextureRecalculated === true) {
            this.#updateTextWebGlTexture(gl, textureStorage._texture, renderObject._textureCanvas);
            textureStorage._isTextureRecalculated = false;
        } else {
            this.#bindTexture(gl, textureStorage._texture);
        }
        gl.uniform1i(u_imageLocation, textureStorage._textureIndex);
        gl.depthMask(false);
        return Promise.resolve([verticesNumber, gl.TRIANGLES]);
    };

    _bindImage = (renderObject, gl, pageData, program, vars) => {
        const { 
            u_translation: translationLocation,
            u_rotation: rotationRotation,
            u_scale: scaleLocation,
            u_resolution: resolutionUniformLocation,
            a_position: positionAttributeLocation,
            a_texCoord: texCoordLocation,
            u_image: u_imageLocation } = vars;

        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset;

        const atlasImage = renderObject.image,
            animationIndex = renderObject.imageIndex,
            image_name = renderObject.key,
            shapeMaskId = renderObject._maskId,
            spacing = renderObject.spacing,
            blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.ONE, gl.ONE_MINUS_SRC_ALPHA],
            scale = [1, 1];
        let imageX = 0,
            imageY = 0,
            colNum = 0,
            rowNum = 0,
            verticesNumber = 0;
        if (animationIndex !== 0) {
            const imageColsNumber = (atlasImage.width + spacing) / (renderObject.width + spacing);
            colNum = animationIndex % imageColsNumber;
            rowNum = Math.floor(animationIndex / imageColsNumber);
            imageX = colNum * renderObject.width + (colNum * spacing),
            imageY = rowNum * renderObject.height + (rowNum * spacing);
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
        const vectors = [
                vecX1, vecY1,
                vecX2, vecY1,
                vecX1, vecY2,
                vecX1, vecY2,
                vecX2, vecY1,
                vecX2, vecY2
            ],
            textures = [
                texX1, texY1,
                texX2, texY1,
                texX1, texY2,
                texX1, texY2,
                texX2, texY1,
                texX2, texY2
            ];
        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, x, y);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, renderObject.rotation);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vectors), gl.STATIC_DRAW);

        verticesNumber += vectors.length / 2;
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

        let textureStorage = renderObject._textureStorage;
        if (!textureStorage) {
            textureStorage = new _Temp_ImageTempStorage_js__WEBPACK_IMPORTED_MODULE_5__.ImageTempStorage(gl.createTexture());
            renderObject._textureStorage = textureStorage;
        } 
        if (textureStorage._isTextureRecalculated === true) {
            this.#updateWebGlTexture(gl, textureStorage._texture, renderObject.image);
            textureStorage._isTextureRecalculated = false;
        } else {
            this.#bindTexture(gl, textureStorage._texture);
        }

        gl.uniform1i(u_imageLocation, textureStorage._textureIndex);
        // make image transparent parts transparent
        gl.blendFunc(blend[0], blend[1]);
        if (shapeMaskId) {
            gl.stencilFunc(gl.EQUAL, shapeMaskId, 0xFF);
            //gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        }

        return Promise.resolve([verticesNumber, gl.TRIANGLES]);
    };

    _bindTileImages = async(renderLayer, gl, pageData, program, vars) => {
        const { u_translation: translationLocation,
            u_rotation: rotationRotation,
            u_scale: scaleLocation,
            u_resolution: resolutionUniformLocation,
            a_position: positionAttributeLocation,
            a_texCoord: texCoordLocation,
            u_image: u_imageLocation } = vars;

        gl.useProgram(program);
        let renderLayerData;
        switch (this.#gameOptions.optimization) {
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.OPTIMIZATION.NATIVE_JS.NOT_OPTIMIZED:
            renderLayerData = await this.#prepareRenderLayerOld(renderLayer, pageData);
            break;
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT:
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.OPTIMIZATION.WEB_ASSEMBLY.NATIVE_WAT:
            renderLayerData = await this.#prepareRenderLayerWM(renderLayer, pageData);
            break;
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.OPTIMIZATION.NATIVE_JS.OPTIMIZED:
        default:
            renderLayerData = await this.#prepareRenderLayer(renderLayer, pageData);
        }
        const translation = [0, 0],
            scale = [1, 1],
            rotation = 0,
            drawMask = ["ONE", "ONE_MINUS_SRC_ALPHA"],
            shapeMaskId = renderLayer._maskId;

        let verticesNumber = 0,
            isTextureBind = false;
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.enableVertexAttribArray(texCoordLocation);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation,translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);

        for (let i = 0; i < renderLayerData.length; i++) {
            const data = renderLayerData[i],
                vectors = data[0],
                textures = data[1],
                image_name = data[2],
                image = data[3];
            // if layer use multiple tilesets
            if (vectors.length > 0 && textures.length > 0) {
                // need to have additional draw call for each new texture added
                // probably it could be combined in one draw call if multiple textures 
                // could be used in one draw call
                if (isTextureBind) {
                    await this._render(verticesNumber, gl.TRIANGLES);
                }
                
                gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, vectors, gl.STATIC_DRAW);

                //Tell the attribute how to get data out of positionBuffer
                const size = 2,
                    type = gl.FLOAT, // data is 32bit floats
                    normalize = false,
                    stride = 0, // move forward size * sizeof(type) each iteration to get next position
                    offset = 0;  // verticesNumber * 4; // start of beginning of the buffer
                gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

                //textures buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, textures, gl.STATIC_DRAW);

                gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, offset);

                let textureStorage = renderLayer._textureStorages[i];
                
                if (!textureStorage) {
                    textureStorage = new _Temp_ImageTempStorage_js__WEBPACK_IMPORTED_MODULE_5__.ImageTempStorage(gl.createTexture(), i);
                    renderLayer._setTextureStorage(i, textureStorage);
                }
                if (textureStorage._isTextureRecalculated === true) {
                    this.#updateWebGlTexture(gl, textureStorage._texture, image, textureStorage._textureIndex);
                    textureStorage._isTextureRecalculated = false;
                } else {
                    //console.log("bind texture");
                    this.#bindTexture(gl, textureStorage._texture, textureStorage._textureIndex);
                }
                gl.uniform1i(u_imageLocation, textureStorage._textureIndex);
                gl.blendFunc(gl[drawMask[0]], gl[drawMask[1]]);
                verticesNumber = vectors.length / 2;
                if (shapeMaskId) {
                    gl.stencilFunc(gl.EQUAL, shapeMaskId, 0xFF);
                }
                isTextureBind = true;
            }
        }
        return Promise.resolve([verticesNumber, gl.TRIANGLES]);
    };

    _drawPolygon(renderObject, pageData) {
        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset,
            rotation = renderObject.rotation || 0,
            vertices = renderObject.vertices,
            color =  this.#gameOptions.debug.boundaries.boundariesColor;
        const program = this.getProgram(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        const { u_translation: translationLocation,
                u_rotation: rotationRotation,
                u_scale: scaleLocation,
                u_resolution: resolutionUniformLocation,
                u_color: colorUniformLocation,
                a_position: positionAttributeLocation,
                u_fade_max: fadeMaxLocation,
                u_fade_min: fadeMinLocation
            } = this.getProgramVarLocations(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES),
            gl = this.#gl;

        let verticesNumber = 0;
        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, x, y);
        gl.uniform2f(scaleLocation, 1, 1);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, 0);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        const triangles = this.#triangulatePolygon(vertices);

        const polygonVerticesNum = triangles.length;
        if (polygonVerticesNum % 3 !== 0) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, "polygon boundaries vertices are not correct, skip drawing");
            return;
        }
        this.#bindPolygon(triangles);
        verticesNumber += polygonVerticesNum / 2;
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const colorArray = this.#rgbaToArray(color);
        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);

        this._render(verticesNumber, gl.TRIANGLES);
    }

    _bindLine = (renderObject, gl, pageData, program, vars) => {
        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset,
            scale = [1, 1],
            rotation = renderObject.rotation,
            { 
                u_translation: translationLocation,
                u_rotation: rotationRotation,
                u_scale: scaleLocation,
                u_resolution: resolutionUniformLocation,
                u_color: colorUniformLocation,
                a_position: positionAttributeLocation,
                u_fade_max: fadeMaxLocation,
                u_fade_min: fadeMinLocation
            } = vars,
            coords = renderObject.vertices,
            fillStyle = renderObject.bgColor,
            fade_min = renderObject.fade_min,
            fadeLen = renderObject.radius,
            lineWidth = this.#gameOptions.debug.boundaries.boundariesWidth;
        let verticesNumber = 0;

        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, x, y);
        gl.uniform2f(scaleLocation, 1, 1);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, 0);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER, 
            new Float32Array(coords),
            gl.STATIC_DRAW);

        verticesNumber += coords.length / 2;
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const colorArray = this.#rgbaToArray(fillStyle);
        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        gl.lineWidth(lineWidth);

        return Promise.resolve([0, gl.LINES]);
    };
    
    _drawLines(linesArray, color, lineWidth = 1, rotation = 0, translation = [0, 0]) {
        const program = this.getProgram(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        const { u_translation: translationLocation,
                u_rotation: rotationRotation,
                u_scale: scaleLocation,
                u_resolution: resolutionUniformLocation,
                u_color: colorUniformLocation,
                a_position: positionAttributeLocation,
                u_fade_max: fadeMaxLocation,
                u_fade_min: fadeMinLocation
            } = this.getProgramVarLocations(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES),
            gl = this.#gl;

        let verticesNumber = 0;
        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, 1, 1);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, 0);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER, 
            (linesArray instanceof Float32Array ? linesArray : new Float32Array(linesArray)),
            gl.STATIC_DRAW);

        verticesNumber += linesArray.length / 2;
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
        
        this._render(verticesNumber, gl.LINES);
    }

    /**
     * 
     * @param {DrawTiledLayer} renderLayer 
     * @param {GameStageData} pageData
     * @returns {Promise<Array<Array>>}
     */
    #prepareRenderLayer(renderLayer, pageData) {
        const INDEX_TOP_LINE = 0,
            INDEX_RIGHT_LINE = 1,
            INDEX_BOTTOM_LINE = 2,
            INDEX_LEFT_LINE = 3;

        const INDEX_X1 = 0,
            INDEX_Y1 = 1,
            INDEX_X2 = 2,
            INDEX_Y2 = 3;
        return new Promise((resolve, reject) => {
            const tilemap = renderLayer.tilemap,
                tilesets = renderLayer.tilesets,
                tilesetImages = renderLayer.tilesetImages,
                layerData = renderLayer.layerData,
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                tilewidth = dtwidth,
                tileheight = dtheight,
                [ canvasW, canvasH ] = pageData.canvasDimensions,
                [ xOffset, yOffset ] = renderLayer.isOffsetTurnedOff === true ? [0, 0] : pageData.worldOffset,
                boundariesCalculations = this.#gameOptions.render.boundaries.realtimeCalculations,
                setBoundaries = renderLayer.setBoundaries,
                tileImagesData = [];

            if (!layerData) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }

            if (this.#gameOptions.render.boundaries.mapBoundariesEnabled) {
                pageData._setMapBoundaries();
            }
            
            for (let i = 0; i < tilesets.length; i++) {
                
                const tilesetData = tilesets[i].data,
                    firstgid = tilesets[i].firstgid,
                    nextTileset = tilesets[i + 1],
                    nextgid = nextTileset ? nextTileset.firstgid : 1_000_000_000, // a workaround to avoid multiple conditions
                    tilesetwidth = tilesetData.tilewidth,
                    tilesetheight = tilesetData.tileheight,
                    atlasImage = tilesetImages[i],
                    //atlasWidth = atlasImage.width,
                    //atlasHeight = atlasImage.height,
                    atlasWidth = tilesetData.imagewidth,
                    atlasHeight = tilesetData.imageheight,
                    //atlasRows = atlasHeight / tileheight,
                    atlasColumns = tilesetData.columns,
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
                    cellSpacing = tilesetData.spacing,
                    cellMargin = tilesetData.margin,
                    hasAnimations = tilesetData._hasAnimations;
                    //console.log("non empty: ", layerData.nonEmptyCells);
                    // additional property which is set in DrawTiledLayer
                    const hasBoundaries = tilesetData._hasBoundaries,
                        tilesetBoundaries = tilesetData._boundaries,
                        layerTilesetData = tilesets[i]._temp;

                let v = layerTilesetData.vectors,
                    t = layerTilesetData.textures,
                    filledSize = 0;
                    
                v.fill(0);
                t.fill(0);
                let boundariesRowsIndexes = layerTilesetData._bTempIndexes;
                const fullRowCellsNum = screenCols * 4;
                
                let mapIndex = skipRowsTop * layerCols;
                for (let row = 0; row < screenRows; row++) {
                    mapIndex += skipColsLeft;
                    for (let col = 0; col < screenCols; col++) {
                        let tile = layerData.data[mapIndex];

                        if ((tile >= firstgid) && (tile < nextgid)) {
                            const mapPosX = col * dtwidth - moduleLeft,
                                mapPosY = row * dtheight - moduloTop;

                            // actual tile index
                            tile -= firstgid;
                            // switch if animations are set
                            if (hasAnimations) {
                                const activeTile = tilesetData._animations.get(tile);
                                if (typeof activeTile !== "undefined") {
                                    tile = activeTile;
                                }   
                            }

                            // calculate map position and atlas position
                            const colNum = tile % atlasColumns,
                                rowNum = Math.floor(tile / atlasColumns),
                                atlasPosX = colNum * tilesetwidth + (colNum * cellSpacing),
                                atlasPosY = rowNum * tilesetheight + (rowNum * cellSpacing),
                                vecX1 = mapPosX,
                                vecY1 = mapPosY,
                                vecX2 = mapPosX + tilesetwidth,
                                vecY2 = mapPosY + tilesetheight,
                                texX1 = (1 / atlasWidth) * atlasPosX,
                                texY1 = (1 / atlasHeight) * atlasPosY,
                                texX2 = texX1 + (1 / atlasWidth * tilesetwidth),
                                texY2 = texY1 + (1 / atlasHeight * tilesetheight);

                            // 0 vecX1
                            v[filledSize] = vecX1;
                            t[filledSize] = texX1;

                            // 1 vecY1
                            filledSize++;
                            v[filledSize] = vecY1;
                            t[filledSize] = texY1;
                            
                            // 2 vecX2
                            filledSize++;
                            v[filledSize] = vecX2;
                            t[filledSize] = texX2;

                            // 3 vecY1
                            filledSize++;
                            v[filledSize] = vecY1;
                            t[filledSize] = texY1;

                            // 4 vecX1
                            filledSize++;
                            v[filledSize] = vecX1;
                            t[filledSize] = texX1;

                            // 5 vecY2
                            filledSize++;
                            v[filledSize] = vecY2;
                            t[filledSize] = texY2;

                            // 6 vecX1
                            filledSize++;
                            v[filledSize] = vecX1;
                            t[filledSize] = texX1;

                            // 7 vecY2
                            filledSize++;
                            v[filledSize] = vecY2;
                            t[filledSize] = texY2;

                            // 8 vecX2
                            filledSize++;
                            v[filledSize] = vecX2;
                            t[filledSize] = texX2;

                            // 9 vecY1
                            filledSize++;
                            v[filledSize] = vecY1;
                            t[filledSize] = texY1;

                            // 10 vecX2, 
                            filledSize++;
                            v[filledSize] = vecX2;
                            t[filledSize] = texX2;

                            // 11 vecY2
                            filledSize++;
                            v[filledSize] = vecY2;
                            t[filledSize] = texY2;

                            filledSize++;
                        
                            if (setBoundaries) {
                                // if boundary is set in tilesetData
                                let isBoundaryPreset = false;
                                if (hasBoundaries && tilesetBoundaries.size > 0) {
                                    const tilesetBoundary = tilesetBoundaries.get(tile);
                                    if (tilesetBoundary) {
                                        isBoundaryPreset = true;
                                        const objectGroup = tilesetBoundary,
                                            objects = objectGroup.objects;
                                            
                                        objects.forEach((object) => {
                                            const baseX = mapPosX + object.x, 
                                                baseY = mapPosY + object.y,
                                                rotation = object.rotation;
                                            if (rotation !== 0) {
                                                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Warning)("tilesetData.tiles.rotation property is not supported yet");
                                            }
                                            if (object.polygon) {
                                                object.polygon.forEach(
                                                    (point, idx) => {
                                                        const next = object.polygon[idx + 1];
                                                        if (next) {
                                                            pageData._addBoundaryLine(point.x + baseX, point.y + baseY, next.x + baseX, next.y + baseY);
                                                        } else {
                                                            // last point -> link to the first
                                                            const first = object.polygon[0];
                                                            pageData._addBoundaryLine(point.x + baseX, point.y + baseY, first.x + baseX, first.y + baseY);
                                                        }
                                                    });
                                            } else if (object.point) {
                                                // x/y coordinate
                                                pageData._addPointBoundary(baseX, baseY);
                                            } else if (object.ellipse) {
                                                const radX = object.width / 2,
                                                    radY = object.height / 2;
                                                    
                                                pageData._addEllipseBoundary(baseX + radX, baseY + radY, radX, radY);
                                            } else {
                                                // object is rect
                                                const width = object.width,
                                                    height = object.height,
                                                    x2 = width + baseX,
                                                    y2 = height + baseY;

                                                //boundaries.push([baseX, baseY, x2, baseY]);
                                                pageData._addBoundaryLine(baseX, baseY, x2, baseY);

                                                //boundaries.push([x2, baseY, x2, y2]);
                                                pageData._addBoundaryLine(x2, baseY, x2, y2);

                                                //boundaries.push([x2, y2, baseX, y2]);
                                                pageData._addBoundaryLine(x2, y2, baseX, y2);

                                                //boundaries.push([baseX, y2, baseX, baseY]);
                                                pageData._addBoundaryLine(baseX, y2, baseX, baseY);
                                            }
                                        });
                                    }

                                // extract rect boundary for the whole tile
                                }
                                if (isBoundaryPreset === false) {
                                    const boundaries = pageData.getRawBoundaries();

                                    let rightLine = [ mapPosX + tilesetwidth, mapPosY, mapPosX + tilesetwidth, mapPosY + tilesetheight ],
                                        bottomLine = [ mapPosX + tilesetwidth, mapPosY + tilesetheight, mapPosX, mapPosY + tilesetheight ],
                                        topLine = [ mapPosX, mapPosY, mapPosX + tilesetwidth, mapPosY],
                                        leftLine = [ mapPosX, mapPosY + tilesetheight, mapPosX, mapPosY ];
                                    
                                    // top cell7
                                    if (row !== 0) {
                                        const topCellFirstIndex =  (row - 1) * fullRowCellsNum + (col * 4),
                                            bottomTopLeftFirstIndex = boundariesRowsIndexes[topCellFirstIndex + INDEX_BOTTOM_LINE];
                                        if (bottomTopLeftFirstIndex) {
                                            //remove double lines from top
                                            const bottomTopCellX1 = boundaries[bottomTopLeftFirstIndex];
                                            if (bottomTopCellX1) {
                                                const bottomTopCellY1 = boundaries[bottomTopLeftFirstIndex + INDEX_Y1],
                                                    bottomTopCellX2 = boundaries[bottomTopLeftFirstIndex + INDEX_X2],
                                                    bottomTopCellY2 = boundaries[bottomTopLeftFirstIndex + INDEX_Y2],
                                                    topX1 = topLine[INDEX_X1],
                                                    topY1 = topLine[INDEX_Y1],
                                                    topX2 = topLine[INDEX_X2],
                                                    topY2 = topLine[INDEX_Y2];
                                                
                                                if (topX1 === bottomTopCellX2 && topY1 === bottomTopCellY2 &&
                                                    topX2 === bottomTopCellX1 && topY2 === bottomTopCellY1) {
                                                    pageData._removeBoundaryLine(bottomTopLeftFirstIndex);
                                                    topLine = undefined;
                                                }
                                            }

                                            // merge line from top right
                                            const rightTopRightFirstIndex = boundariesRowsIndexes[ topCellFirstIndex + INDEX_RIGHT_LINE],
                                                rightTopCellX1 = boundaries[rightTopRightFirstIndex];
                                            if (rightTopCellX1) {
                                                const rightTopCellY1 = boundaries[rightTopRightFirstIndex + INDEX_Y1],
                                                    rightTopCellX2 = boundaries[rightTopRightFirstIndex + INDEX_X2],
                                                    rightX1 = boundaries[rightTopRightFirstIndex + INDEX_X1],
                                                    rightX2 = boundaries[rightTopRightFirstIndex + INDEX_X2];
                                                if (rightTopCellX1 === rightX2 && rightTopCellX2 === rightX1) {
                                                    pageData._removeBoundaryLine(rightTopRightFirstIndex);
                                                    rightLine[INDEX_X1] = rightTopCellX1;
                                                    rightLine[INDEX_Y1] = rightTopCellY1;
                                                }
                                            }
                                            // merge line from top left
                                            const leftTopRightFirstIndex =  boundariesRowsIndexes[topCellFirstIndex + INDEX_LEFT_LINE],
                                                leftTopCellX1 = boundaries[leftTopRightFirstIndex];
                                            if (leftTopCellX1) {
                                                const leftTopCellX2 = boundaries[leftTopRightFirstIndex + INDEX_X2],
                                                    leftTopCellY2 = boundaries[leftTopRightFirstIndex + INDEX_Y2],
                                                    leftX1 = leftLine[INDEX_X1],
                                                    leftX2 = leftLine[INDEX_X2];
                                                if (leftTopCellX1 === leftX2 && leftTopCellX2 === leftX1) {
                                                    pageData._removeBoundaryLine(leftTopRightFirstIndex);
                                                    leftLine[INDEX_X2] = leftTopCellX2;
                                                    leftLine[INDEX_Y2] = leftTopCellY2;
                                                }
                                            }
                                        }
                                    }
                                    // leftCell
                                    if (col !== 0) {
                                        
                                        const leftCell = row * fullRowCellsNum + ((col - 1) * 4),
                                            topLeftFirstCellIndex = boundariesRowsIndexes[leftCell];
                                        if (topLeftFirstCellIndex) {

                                            //remove double lines from left
                                            const rightLeftCellIndex = boundariesRowsIndexes[leftCell + INDEX_RIGHT_LINE],
                                                rightLeftX1 = boundaries[rightLeftCellIndex],
                                                rightLeftCellX1 = rightLeftX1,
                                                rightLeftCellY1 = boundaries[rightLeftCellIndex + INDEX_Y1],
                                                rightLeftCellX2 = boundaries[rightLeftCellIndex + INDEX_X2],
                                                rightLeftCellY2 = boundaries[rightLeftCellIndex + INDEX_Y2],
                                                leftX1 = leftLine[INDEX_X1],
                                                leftY1 = leftLine[INDEX_Y1],
                                                leftX2 = leftLine[INDEX_X2],
                                                leftY2 = leftLine[INDEX_Y2];

                                            if (leftX1 === rightLeftCellX2 && leftY1 === rightLeftCellY2 &&
                                                leftX2 === rightLeftCellX1 && leftY2 === rightLeftCellY1) {
                                                pageData._removeBoundaryLine(rightLeftCellIndex);
                                                leftLine = undefined;
                                            }

                                            //merge long lines from left top
                                            const topLeftCellX1 = boundaries[topLeftFirstCellIndex];
                                            if (topLeftCellX1 && topLine) {
                                                const topLeftCellY1 = boundaries[topLeftFirstCellIndex + INDEX_Y1],
                                                    topLeftCellY2 = boundaries[topLeftFirstCellIndex + INDEX_Y2],
                                                    topY1 = topLine[INDEX_Y1],
                                                    topY2 = topLine[INDEX_Y2];
                                                if (topLeftCellY1 === topY2 && topLeftCellY2 === topY1 ) {
                                                    pageData._removeBoundaryLine(topLeftFirstCellIndex);
                                                    topLine[INDEX_X1] = topLeftCellX1;
                                                    topLine[INDEX_Y1] = topLeftCellY1;
                                                }
                                            }

                                            // merge long lines from left bottom
                                            const bottomLeftFirstCellIndex = boundariesRowsIndexes[leftCell + INDEX_BOTTOM_LINE],
                                                bottomLeftCellX1 = boundaries[bottomLeftFirstCellIndex];
                                            if (bottomLeftCellX1) {
                                                const bottomLeftCellY1 = boundaries[bottomLeftFirstCellIndex + INDEX_Y1],
                                                    bottomLeftCellX2 = boundaries[bottomLeftFirstCellIndex + INDEX_X2],
                                                    bottomLeftCellY2 = boundaries[bottomLeftFirstCellIndex + INDEX_Y2],
                                                    bottomY1 = bottomLine[INDEX_Y1],
                                                    bottomY2 = bottomLine[INDEX_Y2];
                                                if (bottomLeftCellY1 === bottomY2 && bottomLeftCellY2 === bottomY1 ) {
                                                    pageData._removeBoundaryLine(bottomLeftFirstCellIndex);
                                                    //opposite direction
                                                    bottomLine[INDEX_X2] = bottomLeftCellX2;
                                                    bottomLine[INDEX_Y2] = bottomLeftCellY2;
                                                }
                                            }

                                        }
                                    }
                                    const currentCellIndex = row * fullRowCellsNum + (col * 4);
                                    if (topLine) {
                                        pageData._addBoundaryLine(topLine[0], topLine[1], topLine[2], topLine[3]);
                                        boundariesRowsIndexes[currentCellIndex + INDEX_TOP_LINE] = pageData.boundariesLen - 4;
                                    }
                                    pageData._addBoundaryLine(rightLine[0], rightLine[1], rightLine[2], rightLine[3]);
                                    boundariesRowsIndexes[currentCellIndex + INDEX_RIGHT_LINE] = pageData.boundariesLen - 4;
                                    pageData._addBoundaryLine(bottomLine[0], bottomLine[1], bottomLine[2], bottomLine[3]);
                                    boundariesRowsIndexes[currentCellIndex + INDEX_BOTTOM_LINE] = pageData.boundariesLen - 4;
                                    if (leftLine) {
                                        pageData._addBoundaryLine(leftLine[0], leftLine[1], leftLine[2], leftLine[3]);
                                        boundariesRowsIndexes[currentCellIndex + INDEX_LEFT_LINE] = pageData.boundariesLen - 4;
                                    }
                                    
                                }
                            }
                        }
                        mapIndex++;
                    }
                    mapIndex += skipColsRight;
                }
                //console.log(boundariesRowsIndexes);
                //this.#bindTileImages(verticesBufferData, texturesBufferData, atlasImage, tilesetData.name, renderLayer._maskId);
                tileImagesData.push([v, t, tilesetData.name, atlasImage]);
                //cleanup
                boundariesRowsIndexes.fill(0);
            }
            
            resolve(tileImagesData);
        });
    }

    #prepareRenderLayerOld(renderLayer, pageData) {
        return new Promise((resolve, reject) => {
            const tilemap = renderLayer.tilemap,
                tilesets = renderLayer.tilesets,
                tilesetImages = renderLayer.tilesetImages,
                layerData = renderLayer.layerData,
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                tilewidth = dtwidth,
                tileheight = dtheight,
                [ canvasW, canvasH ] = pageData.canvasDimensions,
                [ xOffset, yOffset ] = renderLayer.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset;
            
            let tileImagesData = [];
            if (!layerData) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }

            if (this.#gameOptions.render.boundaries.mapBoundariesEnabled) {
                pageData._setMapBoundaries();
            }

            for (let i = 0; i <= tilesets.length - 1; i++) {
                const tilesetData = tilesets[i].data,
                    firstgid = tilesets[i].firstgid,
                    nextTileset = tilesets[i + 1],
                    nextgid = nextTileset ? nextTileset.firstgid : 1_000_000_000, // a workaround to avoid multiple conditions
                    //tilesetImages = this.iLoader.getTilesetImageArray(tilesetData.name),
                    tilesetwidth = tilesetData.tilewidth,
                    tilesetheight = tilesetData.tileheight,
                    //atlasRows = tilesetData.imageheight / tileheight,
                    //atlasColumns = tilesetData.imagewidth / tilewidth,
                    atlasColumns = tilesetData.columns,
                    layerCols = layerData.width,
                    layerRows = layerData.height,
                    worldW = tilewidth * layerCols,
                    worldH = tileheight * layerRows,
                    visibleCols = Math.ceil(canvasW / tilewidth),
                    visibleRows = Math.ceil(canvasH / tileheight),
                    atlasImage = tilesetImages[i],
                    atlasWidth = atlasImage.width,
                    atlasHeight = atlasImage.height,
                    cellSpacing = tilesetData.spacing,
                    cellMargin = tilesetData.margin,
                    layerTilesetData = tilesets[i]._temp;
                
                let mapIndex = 0,
                    v = layerTilesetData.vectors,
                    t = layerTilesetData.textures,
                    filledSize = 0;
                
                v.fill(0);
                t.fill(0);

                for (let row = 0; row < layerRows; row++) {
                    for (let col = 0; col < layerCols; col++) {
                        let tile = layerData.data[mapIndex];
                        
                        if (tile >= firstgid && (tile < nextgid)) {

                            tile -= firstgid;
                            const colNum = tile % atlasColumns,
                                rowNum = Math.floor(tile / atlasColumns),
                                atlasPosX = colNum * tilesetwidth + (colNum * cellSpacing),
                                atlasPosY = rowNum * tilesetheight + (rowNum * cellSpacing),
                                vecX1 = col * dtwidth - xOffset,
                                vecY1 = row * dtheight - yOffset,
                                vecX2 = vecX1 + tilesetwidth,
                                vecY2 = vecY1 + tilesetheight,
                                texX1 = 1 / atlasWidth * atlasPosX,
                                texY1 = 1 / atlasHeight * atlasPosY,
                                texX2 = texX1 + (1 / atlasWidth * tilesetwidth),
                                texY2 = texY1 + (1 / atlasHeight * tilesetheight);
                             
                            // 0 vecX1
                            v[filledSize] = vecX1;
                            t[filledSize] = texX1;

                            // 1 vecY1
                            filledSize++;
                            v[filledSize] = vecY1;
                            t[filledSize] = texY1;
                            
                            // 2 vecX2
                            filledSize++;
                            v[filledSize] = vecX2;
                            t[filledSize] = texX2;

                            // 3 vecY1
                            filledSize++;
                            v[filledSize] = vecY1;
                            t[filledSize] = texY1;

                            // 4 vecX1
                            filledSize++;
                            v[filledSize] = vecX1;
                            t[filledSize] = texX1;

                            // 5 vecY2
                            filledSize++;
                            v[filledSize] = vecY2;
                            t[filledSize] = texY2;

                            // 6 vecX1
                            filledSize++;
                            v[filledSize] = vecX1;
                            t[filledSize] = texX1;

                            // 7 vecY2
                            filledSize++;
                            v[filledSize] = vecY2;
                            t[filledSize] = texY2;

                            // 8 vecX2
                            filledSize++;
                            v[filledSize] = vecX2;
                            t[filledSize] = texX2;

                            // 9 vecY1
                            filledSize++;
                            v[filledSize] = vecY1;
                            t[filledSize] = texY1;

                            // 10 vecX2, 
                            filledSize++;
                            v[filledSize] = vecX2;
                            t[filledSize] = texX2;

                            // 11 vecY2
                            filledSize++;
                            v[filledSize] = vecY2;
                            t[filledSize] = texY2;

                            filledSize++;
                            
                        }
                        mapIndex++;
                    }
                }
                tileImagesData.push([v, t, tilesetData.name, atlasImage]);
            }
            resolve(tileImagesData);
        });
    }

    /**
     * 
     * @param {DrawTiledLayer} renderLayer 
     * @param {GameStageData} pageData
     * @returns {Promise<void>}
     */
    #prepareRenderLayerWM = (renderLayer, pageData) => {
        return new Promise((resolve, reject) => {
            const tilemap = renderLayer.tilemap,
                tilesets = tilemap.tilesets,
                tilesetImages = renderLayer.tilesetImages,
                layerData = renderLayer.layerData,
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                tilewidth = dtwidth,
                tileheight = dtheight,
                offsetDataItemsFullNum = layerData.data.length,
                offsetDataItemsFilteredNum = layerData.data.filter((item) => item !== 0).length,
                setBoundaries = false, //renderLayer.setBoundaries,
                [ settingsWorldWidth, settingsWorldHeight ] = pageData.worldDimensions,
                //[ canvasW, canvasH ] = this.stageData.drawDimensions,
                [ xOffset, yOffset ] = renderLayer.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset;
            const tileImagesData = [];
            // clear data
            // this.layerDataFloat32.fill(0);
            // set data for webgl processing
            this.layerDataFloat32.set(layerData.data);
            if (!layerData) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }

            if (this.#gameOptions.render.boundaries.mapBoundariesEnabled) {
                pageData._setMapBoundaries();
            }
            
            for (let i = 0; i < tilesets.length; i++) {
                const tilesetData = tilesets[i].data,
                    firstgid = tilesets[i].firstgid,
                    nextTileset = tilesets[i + 1],
                    nextgid = nextTileset ? nextTileset.firstgid : 1_000_000_000, // a workaround to avoid multiple conditions
                    //tilesetImages = this.iLoader.getTilesetImageArray(tilesetData.name),
                    tilesetwidth = tilesetData.tilewidth,
                    tilesetheight = tilesetData.tileheight,
                    //atlasRows = tilesetData.imageheight / tileheight,
                    atlasColumns = tilesetData.columns,
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
                    texturesDataItemsNum = offsetDataItemsFilteredNum * texturesCoordsItemsNum,
                    cellSpacing = tilesetData.spacing;
                
                const itemsProcessed = this.calculateBufferData(dataCellSizeBytes, offsetDataItemsFullNum, vectorDataItemsNum, layerRows, layerCols, dtwidth, dtheight, tilesetwidth, tilesetheight, atlasColumns, atlasWidth, atlasHeight, xOffset, yOffset, firstgid, nextgid, cellSpacing, setBoundaries);
                
                const verticesBufferData = itemsProcessed > 0 ? this.layerDataFloat32.slice(offsetDataItemsFullNum, vectorDataItemsNum + offsetDataItemsFullNum) : [],
                    texturesBufferData = itemsProcessed > 0 ? this.layerDataFloat32.slice(vectorDataItemsNum + offsetDataItemsFullNum, vectorDataItemsNum + texturesDataItemsNum + offsetDataItemsFullNum) : [];
                    
                tileImagesData.push([verticesBufferData, texturesBufferData, tilesetData.name, atlasImage]);
            }
            resolve(tileImagesData);
        });
    };

    /**
     * 
     * @param {string} rgbaColor 
     * @returns {number[]}
     */
    #rgbaToArray (rgbaColor) {
        return rgbaColor.replace("rgba(", "").replace(")", "").split(",").map((/** @param {string} */item) => Number(item.trim()));
    }

    #triangulatePolygon(vertices) {
        const triangulatedPolygon = new Float32Array(vertices.length * vertices.length),
            pointer = 0;
            
        const [triangulated, len] = this.#triangulate(vertices, triangulatedPolygon, pointer);
        
        const sliced = triangulated.slice(0, len);
        
        return sliced;
    }

    /**
     * 
     * @param {Array<Array<number>>} polygonVertices 
     * @param {Float32Array} triangulatedPolygon 
     * @returns {Array}
     */
    #triangulate (polygonVertices, triangulatedPolygon, pointer) {
        const len = polygonVertices.length,
            vectorsCS = (a, b, c) => (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.crossProduct)({x:c[0] - a[0], y: c[1] - a[1]}, {x:b[0] - a[0], y: b[1] - a[1]});

        if (len <= 3) {
            polygonVertices.forEach(vertex => {
                triangulatedPolygon[pointer] = vertex[0];
                pointer++;
                triangulatedPolygon[pointer] = vertex[1];
                pointer++;
            });
            return [triangulatedPolygon, pointer];
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
                triangulatedPolygon[pointer] = prevVertex[0];
                pointer++;
                triangulatedPolygon[pointer] = prevVertex[1];
                pointer++;
                triangulatedPolygon[pointer] = currentVertex[0];
                pointer++;
                triangulatedPolygon[pointer] = currentVertex[1];
                pointer++;
                triangulatedPolygon[pointer] = nextVertex[0];
                pointer++;
                triangulatedPolygon[pointer] = nextVertex[1];
                pointer++;
                processedVertices = processedVertices.filter((val, index) => index !== i);
            } else {
                skipCount += 1;
                if (skipCount > processedVerticesLen) {
                    // sometimes fails
                    (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.TRIANGULATE_ISSUE, "Can't extract all triangles vertices.");
                    return [triangulatedPolygon, pointer];
                }
                i++;
            }
            // if (cs < 0): it's jumping over next vertex, maybe not a good solution? Moving up
            // i++;
        }
        
        return [triangulatedPolygon, pointer];
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
    /*------------------------------------
     * End of Predefined Drawing programs
     -------------------------------------*/

    /**-----------------------------------
     * Textures
     ------------------------------------*/
    #updateWebGlTexture(gl, texture, textureImage, textureNum = 0, useMipMaps = false) {
        this.#bindTexture(gl, texture, textureNum);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
        // LINEAR filtering is better for images and tiles, but for texts it produces a small blur
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // for textures not power of 2 (texts for example)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, useMipMaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    }

    #updateTextWebGlTexture(gl, texture, textureImage, textureNum = 0) {
        this.#bindTexture(gl, texture, textureNum);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
        // LINEAR filtering is better for images and tiles, but for texts it produces a small blur
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // for textures not power of 2 (texts for example)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    }

    #bindTexture(gl, texture, textureNum = 0) {
        gl.activeTexture(gl.TEXTURE0 + textureNum);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    #removeTexture(gl, texture) {
        gl.deleteTexture(texture);
    }
    /*------------------------------------
     * End Textures
    --------------------------------------*/

    isPowerOfTwo(value) {
        return (value & (value - 1)) === 0;
    }

    nextHighestPowerOfTwo(x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
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
class SystemSettings {
    /**
     * @hideconstructor
     */
    constructor(){}
    /**
     * DEBUG/PRODUCTION, for debug mode system Logger will show debug information in the console
     */
    static mode = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.MODE.DEBUG;

    static gameOptions = {
        // no other variants only WEBGL for now
        library: _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.LIBRARY.WEBGL,
        optimization: _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.OPTIMIZATION.NATIVE_JS.OPTIMIZED,
        optimizationWASMUrl: "./src/wa/calculateBufferDataWat.wasm",
        optimizationAssemblyUrl: "/src/wa/calculateBufferDataAssembly.wasm",
        loadingScreen: {
            backgroundColor:  "rgba(128, 128, 128, 0.6)",
            loadingBarBg: "rgba(128, 128, 128, 1)",
            loadingBarProgress: "rgba(128, 128, 128, 0.2)",
        },
        render: {
            minCycleTime: 16.666, //ms which is ~60 FPS
            cyclesTimeCalc: {
                check: _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.OPTIMIZATION.CYCLE_TIME_CALC.AVERAGES,
                averageFPStime: 10000
            },
            boundaries: {
                mapBoundariesEnabled: true,
                realtimeCalculations: true,
                wholeWorldPrecalculations: false
            },
            
        },
        debug: {
            checkWebGlErrors: false,
            debugMobileTouch: false,
            boundaries: {
                drawLayerBoundaries: false,
                drawObjectBoundaries: false,
                boundariesColor: "rgba(224, 12, 21, 0.6)",
                boundariesWidth: 2
            },
            delayBetweenObjectRender: false, // 1 sec delay for debug proposes
        }
    };
    

    static network = {
        // disable INetwork by default
        enabled: false,
        address: "https://gameserver.reslc.ru:9009",
        gatherRoomsInfoInterval: 5000
    };

    static canvasMaxSize = {
        width: 1800,
        height: 1800
    };

    static worldSize = {
        width: 960,
        height: 960
    };

    static defaultCanvasKey = "default";

    static customSettings = {};
}

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
        CYCLE_TIME_CALC: {
            AVERAGES: "AVERAGES",
            CURRENT: "CURRENT"
        },
        NATIVE_JS: {
            NOT_OPTIMIZED: "NOT_OPTIMIZED",
            OPTIMIZED: "OPTIMIZED"
        },
        WEB_ASSEMBLY: {
            ASSEMBLY_SCRIPT: "ASSEMBLY_SCRIPT",
            NATIVE_WAT: "WASM"
        }
    }
};

const ERROR_CODES = {
    CREATE_INSTANCE_ERROR: "CREATE_INSTANCE_ERROR",
    VIEW_NOT_EXIST: "VIEW_NOT_EXIST",
    ELEMENT_NOT_EXIST: "ELEMENT_NOT_EXIST",
    FILE_NOT_EXIST: "FILE_NOT_EXIST",
    CANT_GET_THE_IMAGE: "CANT_GET_THE_IMAGE",
    UNEXPECTED_INPUT_PARAMS: "UNEXPECTED_INPUT_PARAMS",
    UNHANDLED_EXCEPTION: "UNHANDLED_EXCEPTION",
    CANVAS_KEY_NOT_SPECIFIED: "CANVAS_KEY_NOT_SPECIFIED",
    CANVAS_WITH_KEY_NOT_EXIST: "CANVAS_WITH_KEY_NOT_EXIST",
    WRONG_TYPE_ERROR: "WRONG_TYPE_ERROR",
    UNEXPECTED_WS_MESSAGE: "UNEXPECTED_WS_MESSAGE",
    UNEXPECTED_PLAYER_ID: "UNEXPECTED_PLAYER_ID",
    UNEXPECTED_BULLET_ID: "UNEXPECTED_BULLET_ID",
    UNEXPECTED_EVENT_NAME: "UNEXPECTED_EVENT_NAME",
    WEBGL_ERROR: "WEBGL_ERROR",
    DRAW_PREPARE_ERROR: "DRAW_PREPARE_ERROR",
    UNEXPECTED_TILE_ID: "UNEXPECTED_TILE_ID",
    UNEXPECTED_TOUCH_AREA: "UNEXPECTED TOUCH AREA",
    UNEXPECTED_METHOD_TYPE: "UNEXPECTED METHOD TYPE"
};

const WARNING_CODES =  {
    FILE_LOADING_ISSUE: "FILE_LOADING_ISSUE",
    ASSETS_NOT_READY: "ASSETS_NOT_READY",
    NOT_FOUND: "NOT_FOUND",
    NOT_TESTED: "NOT_TESTED",
    WORLD_DIMENSIONS_NOT_SET: "WORLD_DIMENSIONS_NOT_SET",
    INCORRECT_RENDER_TYPE: "INCORRECT_RENDER_TYPE",
    UNHANDLED_DRAW_ISSUE: "UNHANDLED_DRAW_ISSUE",
    UNEXPECTED_WORLD_SIZE: "UNEXPECTED_WORLD_SIZE",
    AUDIO_ALREADY_REGISTERED: "AUDIO_ALREADY_REGISTERED",
    AUDIO_NOT_REGISTERED: "AUDIO_NOT_REGISTERED",
    AUDIO_NOT_LOADED: "AUDIO_NOT_LOADED",
    UNKNOWN_DRAW_OBJECT: "UNKNOWN_DRAW_OBJECT",
    METHOD_NOT_IMPLEMENTED: "METHOD_NOT_IMPLEMENTED",
    POLYGON_VERTICES_NOT_CORRECT: "POLYGON_VERTICES_NOT_CORRECT",
    MODULE_ALREADY_INSTALLED: "MODULE_ALREADY_INSTALLED",
    DEPRECATED_PARAMETER: "DEPRECATED_PARAMETER",
    NEW_BEHAVIOR_INTRODUCED: "NEW_BEHAVIOR_INTRODUCED",
    TEXTURE_IMAGE_TEMP_OVERFLOW: "TEXTURE_IMAGE_TEMP_OVERFLOW",
    TRIANGULATE_ISSUE: "TRIANGULATE_ISSUE"
};

/***/ }),

/***/ "./src/design/LoadingStage.js":
/*!************************************!*\
  !*** ./src/design/LoadingStage.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LoadingStage": () => (/* binding */ LoadingStage)
/* harmony export */ });
/* harmony import */ var _base_GameStage_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base/GameStage.js */ "./src/base/GameStage.js");


class LoadingStage extends _base_GameStage_js__WEBPACK_IMPORTED_MODULE_0__.GameStage {
    #total = 0;
    #loaded = 0;
    #barWidth = 0;
    register() {
        //this.iLoader.addImage(logoKey, "./images/icon.png");
    }

    init() {
        const [w, h] = this.stageData.canvasDimensions,
            barWidth = w/3,
            barHeight = 20;
        //this.logo = this.draw.image(w/2, h/2, 300, 200, logoKey);
        this.background = this.draw.rect(0, 0, w, h, this.systemSettings.gameOptions.loadingScreen.backgroundColor);  
        this.loadingBarBg = this.draw.rect(w/2 - (barWidth/2), h/2 - (barHeight/2), barWidth, barHeight, this.systemSettings.gameOptions.loadingScreen.loadingBarBg);
        this.loadingBarProgress = this.draw.rect(w/2 - (barWidth/2), h/2 - (barHeight/2), barWidth, barHeight, this.systemSettings.gameOptions.loadingScreen.loadingBarProgress);
        this.text = this.draw.text(w/2 - 20, h/2 - 2 * barHeight, "JsGE", "24px sans-serif", "black");
        this.#barWidth = barWidth;
    }

    _progress = (loaded) => {
        const widthPart = this.#barWidth / this.#total;

        this.#loaded = loaded;
        const newWidth = widthPart * this.#loaded;
        // sometimes additional items are added to queue in load process
        // to avoid bar width overflow additional check added below:
        const applyWidth = loaded > this.#total ? this.#barWidth : newWidth;

        this.loadingBarProgress.width = applyWidth;
    };

    start(options) {
        this.#total = options.total;
    }

    // a workaround for checking upload progress before render
    //get iLoader() {
    //    return ({filesWaitingForUpload:0});
    //}
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
/* harmony export */   "DrawImageObject": () => (/* reexport safe */ _base_2d_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_2__.DrawImageObject),
/* harmony export */   "GameStage": () => (/* reexport safe */ _base_GameStage_js__WEBPACK_IMPORTED_MODULE_1__.GameStage),
/* harmony export */   "ISystemAudio": () => (/* reexport safe */ _base_ISystemAudio_js__WEBPACK_IMPORTED_MODULE_3__.ISystemAudio),
/* harmony export */   "Primitives": () => (/* reexport module object */ _base_2d_Primitives_js__WEBPACK_IMPORTED_MODULE_4__),
/* harmony export */   "System": () => (/* reexport safe */ _base_System_js__WEBPACK_IMPORTED_MODULE_0__.System),
/* harmony export */   "SystemSettings": () => (/* reexport safe */ _configs_js__WEBPACK_IMPORTED_MODULE_5__.SystemSettings),
/* harmony export */   "utils": () => (/* reexport module object */ _utils_js__WEBPACK_IMPORTED_MODULE_7__)
/* harmony export */ });
/* harmony import */ var _base_System_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base/System.js */ "./src/base/System.js");
/* harmony import */ var _base_GameStage_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base/GameStage.js */ "./src/base/GameStage.js");
/* harmony import */ var _base_2d_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./base/2d/DrawImageObject.js */ "./src/base/2d/DrawImageObject.js");
/* harmony import */ var _base_ISystemAudio_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./base/ISystemAudio.js */ "./src/base/ISystemAudio.js");
/* harmony import */ var _base_2d_Primitives_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./base/2d/Primitives.js */ "./src/base/2d/Primitives.js");
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
/* harmony export */   "calculateEllipseVertices": () => (/* binding */ calculateEllipseVertices),
/* harmony export */   "countClosestTraversal": () => (/* binding */ countClosestTraversal),
/* harmony export */   "countClosestTraversal2": () => (/* binding */ countClosestTraversal2),
/* harmony export */   "countDistance": () => (/* binding */ countDistance),
/* harmony export */   "crossProduct": () => (/* binding */ crossProduct),
/* harmony export */   "dotProduct": () => (/* binding */ dotProduct),
/* harmony export */   "dotProductWithAngle": () => (/* binding */ dotProductWithAngle),
/* harmony export */   "generateUniqId": () => (/* binding */ generateUniqId),
/* harmony export */   "isCircleLineIntersect": () => (/* binding */ isCircleLineIntersect),
/* harmony export */   "isEllipseCircleIntersect": () => (/* binding */ isEllipseCircleIntersect),
/* harmony export */   "isEllipseLineIntersect": () => (/* binding */ isEllipseLineIntersect),
/* harmony export */   "isEllipsePolygonIntersect": () => (/* binding */ isEllipsePolygonIntersect),
/* harmony export */   "isLineShorter": () => (/* binding */ isLineShorter),
/* harmony export */   "isMobile": () => (/* binding */ isMobile),
/* harmony export */   "isPointCircleIntersect": () => (/* binding */ isPointCircleIntersect),
/* harmony export */   "isPointInsidePolygon": () => (/* binding */ isPointInsidePolygon),
/* harmony export */   "isPointLineIntersect": () => (/* binding */ isPointLineIntersect),
/* harmony export */   "isPointOnTheLine": () => (/* binding */ isPointOnTheLine),
/* harmony export */   "isPointPolygonIntersect": () => (/* binding */ isPointPolygonIntersect),
/* harmony export */   "isPointRectIntersect": () => (/* binding */ isPointRectIntersect),
/* harmony export */   "isPolygonLineIntersect": () => (/* binding */ isPolygonLineIntersect),
/* harmony export */   "isSafari": () => (/* binding */ isSafari),
/* harmony export */   "pointToCircleDistance": () => (/* binding */ pointToCircleDistance),
/* harmony export */   "randomFromArray": () => (/* binding */ randomFromArray),
/* harmony export */   "verticesArrayToArrayNumbers": () => (/* binding */ verticesArrayToArrayNumbers)
/* harmony export */ });
/* harmony import */ var _base_2d_Primitives_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base/2d/Primitives.js */ "./src/base/2d/Primitives.js");


function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent) ;
}

function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function pointToCircleDistance(x, y, circle) {
    const pointToCircleCenterDistance = new _base_2d_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(x, y, circle.x, circle.y).length;
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
    return new _base_2d_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(obj1.x, obj1.y, obj2.x, obj2.y).length;
}

function isLineShorter(line1, line2) {
    return (new _base_2d_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line1.x1, line1.y1, line1.x2, line1.y2)).length < (new _base_2d_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line2.x1, line2.y1, line2.x2, line2.y2)).length;
}

function isPointLineIntersect(point, line) {
    const lineL = new _base_2d_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line.x1, line.y1, line.x2, line.y2).length,
        lengthAB = new _base_2d_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line.x1, line.y1, point.x, point.y).length + new _base_2d_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line.x2, line.y2, point.x, point.y).length;

    if (lengthAB <= lineL + 0.2) {
        //console.log("point to line intersect. line len: " + lineL + ", line AB len: " + lengthAB);
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

function isPointPolygonIntersect(x, y, polygon) {
    const len = polygon.length;
    
    for (let i = 0; i < len; i+=1) {
        let vertex1 = polygon[i],
            vertex2 = polygon[i + 1];

        // if last vertex, set vertex2 as the first
        if (!vertex2) {
            vertex2 = polygon[0];
        }

        if (isPointLineIntersect({x,y}, {x1: vertex1[0], y1: vertex1[1], x2: vertex2[0], y2: vertex2[1]})) {
            return true;
        }
    }
    return false;
}

function isPointInsidePolygon(x, y, polygon) {
    const len = polygon.length;
    let intersections = 0;

    for (let i = 0; i < len; i++) {
        let vertex1 = polygon[i],
            vertex2 = polygon[i + 1] ? polygon[i + 1] : polygon[0],
            x1 = vertex1[0],
            y1 = vertex1[1],
            x2 = vertex2[0],
            y2 = vertex2[1];
            
        if (y < y1 !== y < y2 && 
            x < (x2 - x1) * (y - y1) / (y2 - y1) + x1) {
            intersections++;
        }
    }
    
    if (intersections > 0) {
        if (intersections % 2 === 0) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}

function isPointRectIntersect(x, y, rect) {
    if (x >= rect.x && x <= rect.width + rect.x && y >= rect.y && y <= rect.y + rect.height) {
        return true;
    } else {
        return false;
    }
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {{x:number, y:number, r:number}} circle 
 * @returns {boolean}
 */
function isPointCircleIntersect(x, y, circle) {
    const radius = circle.r,
        lineToCircleCenter = new _base_2d_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(x, y, circle.x, circle.y),
        pointCircleLineLength = lineToCircleCenter.length;
        
    if (pointCircleLineLength < radius)
        return true;
    else
        return false;
}

function isCircleLineIntersect(x, y, r, line) {
    const x1 = line.x1,
        y1 = line.y1,
        x2 = line.x2,
        y2 = line.y2,
        vec1 = {x: x1 - x, y: y1-y}, //new Vector(x, y, x1, y1),
        vec2 = {x: x2 - x, y: y2-y}, //new Vector(x, y, x2, y2),
        vec3 = {x: x2 - x1, y: y2-y1}, //new Vector(x1 ,y1, x2, y2),
        vec4 = {x: x1 - x2, y: y1-y2}, //new Vector(x2, y2, x1, y1),
        vec3Len = Math.sqrt(Math.pow(vec3.x, 2) + Math.pow(vec3.y, 2)),//vec3.length,
        dotP1 = dotProduct(vec1, vec4),
        dotP2 = dotProduct(vec2, vec3);
        // checks if the line is inside the circle,
        // max_dist = Math.max(vec1Len, vec2Len);
    let min_dist;
    
    if (dotP1 > 0 && dotP2 > 0) {
        min_dist = crossProduct(vec1,vec2)/vec3Len;
        if (min_dist < 0) {
            min_dist *= -1;
        }
    } else {
        min_dist = Math.min(vec1.length, vec2.length);
    }
    
    if (min_dist <= r) { // && max_dist >= r) {
        return true;
    } else {
        return false;
    } 
}

/**
 * 
 * @param {Array<number>} ellipse - x,y,radX,radY
 * @param {Array<Array<number>>} line [x1,y1],[x2,y2]
 */
function isEllipseLineIntersect(ellipse, line) {
    const x = ellipse[0],
        y = ellipse[1],
        radX = ellipse[2],
        radY = ellipse[3],
        x1 = line[0][0],
        y1 = line[0][1],
        x2 = line[1][0],
        y2 = line[1][1],
        lineAToElCenter = { x: x - x1, y: y - y1 }, //new Vector(x, y, x1, y1),
        lineBToElCenter = { x: x - x2, y: y - y2 }, //new Vector(x, y, x2, y2),
        lineAToElCenterLen = Math.sqrt(Math.pow(lineAToElCenter.x, 2) + Math.pow(lineAToElCenter.y, 2)),
        lineBToElCenterLen = Math.sqrt(Math.pow(lineBToElCenter.x, 2) + Math.pow(lineBToElCenter.y, 2)),
        lineToCenterLenMin = Math.min(lineAToElCenterLen, lineBToElCenterLen),
        ellipseMax = Math.max(radX, radY);
        
    if (lineToCenterLenMin > ellipseMax) {
        return false;
    }
    
    const traversalLine = lineToCenterLenMin === lineAToElCenterLen ? lineAToElCenter : lineBToElCenter,
        angleToAxisX = Math.atan2(traversalLine.y, traversalLine.x);
    
    const intersectX = Math.cos(angleToAxisX) * radX,
        intersectY = Math.sin(angleToAxisX) * radY,
        lineToCenter = { x: 0 - intersectX, y: 0 - intersectY },
        intersectLineLen = Math.sqrt(Math.pow(lineToCenter.x, 2) + Math.pow(lineToCenter.y, 2));
    //console.log("lenToCheck: ", lenToCheck);
    //console.log("x: ", intersectX);
    if (lineToCenterLenMin > intersectLineLen) {
        return false;
    }
    return true;
}

/**
 * 
 * @param {Array<number>} ellipse - x,y,radX,radY
 * @param {{x:number, y:number, r:number}} circle
 * @returns {{x:number, y:number, p:number} | boolean}
 */
function isEllipseCircleIntersect(ellipse, circle) {
    const ellipseX = ellipse[0],
        ellipseY = ellipse[1],
        ellipseToCircleLine = { x: ellipseX - circle.x, y: ellipseY - circle.y },
        len = Math.sqrt(Math.pow(ellipseToCircleLine.x, 2) + Math.pow(ellipseToCircleLine.y, 2)),
        maxRad = Math.max(ellipse[2], ellipse[3]);
    // no collisions for sure
    if (len > (maxRad + circle.r)) {
        return false;
    } else {
        // check possible collision
        const angle = angle_2points(ellipseX, ellipseY, circle.x, circle.y),
            traversalX = ellipseX + (ellipse[2] * Math.cos(angle)),
            traversalY =  ellipseY + (ellipse[3] * Math.sin(angle)),
            vecTrX = ellipseX - traversalX,
            vecTrY = ellipseY - traversalY,
            traversalLen = Math.sqrt(Math.pow(vecTrX, 2) + Math.pow(vecTrY, 2)) + circle.r;
        if (len <= traversalLen) {
            return {x: vecTrX, y: vecTrY, p:1};
        } else {
            return false;
        }
    }
    
}

/**
 * 
 * @param {Array<number>} ellipse - x,y,radX,radY
 * @param {Array<Array<number>>} polygon - x,y
 * @returns {boolean}
 */
function isEllipsePolygonIntersect(ellipse, polygon) {
    const len = polygon.length;

    for (let i = 0; i < len; i+=1) {
        let vertex1 = polygon[i],
            vertex2 = polygon[i + 1];

        // if last vertex, set vertex2 as the first
        if (!vertex2) {
            vertex2 = polygon[0];
        }

        if (isEllipseLineIntersect(ellipse, [vertex1, vertex2])) {
            return true;
        }
    }
    return false;
}

function generateUniqId() {
    return Math.round(Math.random() * 1000000); 
}

function randomFromArray(array) {
    return array[Math.floor(Math.random()*array.length)];
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

/**
 * @param {number} x
 * @param {number} y
 * @param {number} radiusX
 * @param {number} radiusY
 * @param {number} [angle = 2 * Math.PI]
 * @param {number} [step = Math.PI/12] 
 * @returns {Array<number>}
 */
function calculateEllipseVertices(x = 0, y = 0, radiusX, radiusY, angle = 2*Math.PI, step = Math.PI/8) {
    let ellipsePolygonCoords = [];

    for (let r = 0; r <= angle; r += step) {
        let x2 = Math.cos(r) * radiusX + x,
            y2 = Math.sin(r) * radiusY + y;

        ellipsePolygonCoords.push([x2, y2]);
    }

    return ellipsePolygonCoords;
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
/******/ var __webpack_exports__GameStage = __webpack_exports__.GameStage;
/******/ var __webpack_exports__ISystemAudio = __webpack_exports__.ISystemAudio;
/******/ var __webpack_exports__Primitives = __webpack_exports__.Primitives;
/******/ var __webpack_exports__System = __webpack_exports__.System;
/******/ var __webpack_exports__SystemSettings = __webpack_exports__.SystemSettings;
/******/ var __webpack_exports__utils = __webpack_exports__.utils;
/******/ export { __webpack_exports__CONST as CONST, __webpack_exports__DrawImageObject as DrawImageObject, __webpack_exports__GameStage as GameStage, __webpack_exports__ISystemAudio as ISystemAudio, __webpack_exports__Primitives as Primitives, __webpack_exports__System as System, __webpack_exports__SystemSettings as SystemSettings, __webpack_exports__utils as utils };
/******/ 

//# sourceMappingURL=index.es6.js.map