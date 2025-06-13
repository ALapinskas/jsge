/******/ var __webpack_modules__ = ({

/***/ "./modules/assetsm/src/AssetsManager.js":
/*!**********************************************!*\
  !*** ./modules/assetsm/src/AssetsManager.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AssetsManager)
/* harmony export */ });

const PROGRESS_EVENT_TYPE = {
    loadstart: "loadstart", 
    progress: "progress", 
    abort: "abort", 
    error: "error", 
    load: "load", 
    timeout: "timeout"
}

const ERROR_MESSAGES = {
    // Critical
    LOADER_NOT_REGISTERED: " loader is not registered.",
    RECURSION_ERROR: "Too much recursion. Stop iteration.",
    NOT_CORRECT_METHOD_TYPE: "uploadMethod should be instance of Promise and return upload result value",
    XML_FILE_EXTENSION_INCORRECT: " AtlasXML file extension is incorrect, only .xml file supported",
    TILESET_FILE_EXTENSION_INCORRECT: " tileset file extension is not correct, only .tsj, .json, .tsx, .xml files are supported",
    TILEMAP_FILE_EXTENSION_INCORRECT: " tilemap file extension is not correct, only .tmj, .json, .tmx, .xml files are supported",
    INPUT_PARAMS_ARE_INCORRECT: " fileKey and url should be provided",
    // Non critical
    ATLAS_IMAGE_LOADING_FAILED: "Error loading atlas image ",
    TILESET_LOADING_FAILED: "Error loading related tileset ",
    TILEMAP_LOADING_FAILED: "Error loading tilemap ",
    AUDIO_LOADING_FAILED: "Error loading audio ",
    IMAGE_LOADING_FAILED: "Error loading image ",
    XML_FORMAT_INCORRECT: " XML format is not correct.",
}

const FILE_FORMAT = {
    JSON: "JSON",
    XML: "XML",
    UNKNOWN: "UNKNOWN"
}

class Loader {
    /**
     * @type {string}
     */
    #fileType;
    /**
     * @type { (...args: any[]) => Promise<void> }
     */
    #uploadMethod;
    /**
     * name: url
     * @type { Map<string, string[]>}
     */
    #loadingQueue = new Map();
    /**
     * name: file
     * @type { Map<string, any>}
     */
    #store = new Map();
    /**
     * 
     * @param {string} name 
     * @param {Function} uploadMethod 
     */

    constructor(name, uploadMethod) {
        this.#fileType = name;
        this.#uploadMethod = (key, url, ...args) => {
            const upload = uploadMethod(key, url, ...args);
            if (upload instanceof Promise) {
                return upload.then((uploadResult) => this.#processUploadResult(uploadResult, key));
            } else {
                throw new TypeError(ERROR_MESSAGES.NOT_CORRECT_METHOD_TYPE);
            }
        }
    }

    /**
     * 
     * @param {null | Object} uploadResult 
     * @param {string} key 
     * @returns {Promise<void>}
     */
    #processUploadResult = (uploadResult, key) => {
        return new Promise((resolve, reject) => {
            if ( !uploadResult && uploadResult !== null ) {
                Warning("AssetsManager: uploadMethod for " + this.#fileType + " returns incorrect value");
            }
            this.#addUploadResultValue(key, uploadResult);
            this.#removeUploadFromQueue(key);
            resolve();
        });
    }

    /**
     * 
     * @param {string} key 
     * @param {*} value 
     */
    #addUploadResultValue(key, value) {
        this.#store.set(key, value);
    }

    /**
     * 
     * @param {string} key 
     */
    #removeUploadFromQueue(key) {
        this.#loadingQueue.delete(key);
    }

    get filesWaitingForUpload() {
        return this.#loadingQueue.size;
    }

    get loadingQueue() {
        return this.#loadingQueue
    };
    
    get uploadMethod() { 
        return this.#uploadMethod;
    }

    /**
     * 
     * @param {string} key 
     * @param {string[]} paramsArr 
     */
    _addFile = (key, paramsArr) => {
        if (this.#loadingQueue.has(key)) {
            Warning("AssetsManager: File " + this.#fileType + " with key " + key + " is already added");
        }
        this.#loadingQueue.set(key, paramsArr);
    }

    /**
     * 
     * @param {string} key 
     * @returns {boolean}
     */
    _isFileInQueue = (key) => {
        return this.#loadingQueue.has(key);
    }

    /**
     * 
     * @param {string} key 
     * @returns {any}
     */
    _getFile = (key) => {
        return this.#store.get(key);
    }
}

/**
 *  This class is used to preload 
 *  tilemaps, tilesets, images and audio,
 *  and easy access loaded files by keys
 */
class AssetsManager {

    /**
     * @type {number}
     */
    #MAX_LOADING_CYCLES = 5;
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();

    /**
     * @type { Map<string, Loader>}
     */
    #registeredLoaders = new Map();
    
    /**
     * @type {number}
     */
    #itemsLoaded = 0;

    constructor() {
        this.registerLoader("Audio", this._loadAudio);
        this.registerLoader("Image", this._loadImage);
        this.registerLoader("TileMap", this._loadTileMap);
        this.registerLoader("TileSet", this._loadTileSet);
        this.registerLoader("AtlasImageMap", this._loadAtlasImage);
        this.registerLoader("AtlasXML", this._loadAtlasXml);
    }

    /**
     * @returns {number}
     */
    get filesWaitingForUpload() {
        let files = 0;
        Array.from(this.#registeredLoaders.values()).map((loader) => files += loader.filesWaitingForUpload);
        return files;
    }

    /**
     * Register a new file type to upload. Method will dynamically add new methods.
     * @param {string} fileTypeName
     * @param {Function=} loadMethod loadMethod should return Promise<result>
     * @returns {void}
     */
    registerLoader = (fileTypeName, loadMethod = this._defaultUploadMethod) => {
        this["add" + fileTypeName] = (key, url, ...args) => {
            this.addFile(fileTypeName, key, url, ...args);
        }
        this["get" + fileTypeName] = (key) => {
            return this.getFile(fileTypeName, key);
        }
        this["is" + fileTypeName + ["InQueue"]] = (key) => {
            return this.isFileInQueue(fileTypeName, key);
        }

        const registeredFileType = this.#registeredLoaders.get(fileTypeName) || new Loader(fileTypeName, loadMethod);

        this.#registeredLoaders.set(fileTypeName, registeredFileType);
    }

    /**
     * Execute load audio, images from tilemaps and images queues
     * @returns {Promise<void>}
     */
    preload() {
        this.#dispatchLoadingStart();
        return new Promise(async(resolve, reject) => {
            this.#uploadFilesRecursive().then(() => {
                this.#dispatchLoadingFinish();
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /**
     * 
     * @param {number} loadCount 
     * @returns {Promise<void>}
     */
    #uploadFilesRecursive(loadCount = 0) {
        return this.#uploadFiles().then(() => {
            if (this.filesWaitingForUpload === 0) {
                return Promise.resolve();
            } else {
                loadCount++;
                if (loadCount > this.#MAX_LOADING_CYCLES) {
                    const err = new Error(ERROR_MESSAGES.RECURSION_ERROR);
                    this.#dispatchLoadingError(err);
                    return Promise.reject(new Error(ERROR_MESSAGES.RECURSION_ERROR));
                } else {
                    return this.#uploadFilesRecursive(loadCount);
                }
            }
        });
    }

    /**
     * 
     * @returns {Promise<void>}
     */
    #uploadFiles() {
        return new Promise((resolve, reject) => {
            /** @type {Promise<void>[]} */
            let uploadPromises = [];
            Array.from(this.#registeredLoaders.values()).forEach((fileType) => {
                Array.from(fileType.loadingQueue.entries()).forEach((key_value) => {
                    /** @type {Promise<void>} */
                    const p = new Promise((res, rej) => fileType.uploadMethod(key_value[0], ...key_value[1]).then(() => res()));
                    uploadPromises.push(p);
                });
            });
    
            Promise.allSettled(uploadPromises).then((results) => {
                for (const result of results) {
                    if (result.status === "rejected") {
                        const error = result.reason;
                        // incorrect method is a critical issue
                        if (this.#isUploadErrorCritical(error)) {
                            reject(error);
                        } else {
                            Warning("AssetsManager: " + error.message);
                            this.#dispatchLoadingError(error);
                        }
                    }
                }
                resolve();
            });
        });
    }

    addEventListener(type, fn, ...args) {
        if (!PROGRESS_EVENT_TYPE[type]) {
            Warning("AssetsManager: Event type should be one of the ProgressEvent.type");
        } else {
            this.#emitter.addEventListener(type, fn, ...args);
        }   
    }

    removeEventListener(type, fn, ...args) {
        this.#emitter.removeEventListener(type, fn, ...args);
    }

    /**
     * Loads image atlas xml
     * @param {string} key
     * @param {string} url
     * @returns {Promise<HTMLElement | Error>}
     */
    _loadAtlasXml = (key, url) => {
        this.#checkXmlUrl(url);
        return fetch(url)
            .then(response => response.text())
            .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
            .then(data => {
                const atlas = data.documentElement || data.activeElement,
                    atlasImagePath = atlas.attributes.getNamedItem("imagePath"),
                    childrenNodes = atlas.children;

                if (atlasImagePath) {
                    const relativePath = this.#calculateRelativePath(url);

                    this.addAtlasImageMap(key, relativePath + atlasImagePath.value, childrenNodes, relativePath);
                    return atlas;
                } else {
                    const err = new Error(key + ERROR_MESSAGES.XML_FORMAT_INCORRECT);
                    this.#dispatchLoadingError(err);
                    return err;
                    // return Promise.reject(err);
                }
            });
    }

    _loadAtlasImage = (key, url, atlasChildNodes, cors = "anonymous") => {
        return new Promise((resolve, reject) => {
            const img = new Image(),
                imageAtlas = new Map(),
                tempCanvas = document.createElement("canvas"),
                tempCtx = tempCanvas.getContext("2d");
            
            img.crossOrigin = cors;
            img.onload = () => {
                const imageBitmapPromises = [];
                let imageAtlasKeys = [];
                // fix dimensions
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                tempCtx.drawImage(img, 0, 0);

                for(let childNode of atlasChildNodes) {
                    const nodeAttr = childNode.attributes,
                        fullName = nodeAttr.getNamedItem("name").value,
                        name = fullName.includes(".") ? fullName.split(".")[0] : fullName, // remove name ext
                        x = nodeAttr.getNamedItem("x").value,
                        y = nodeAttr.getNamedItem("y").value,
                        width = nodeAttr.getNamedItem("width").value,
                        height = nodeAttr.getNamedItem("height").value;
                    
                    // images are not cropped correctly in the mozilla@124.0, issue:
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=1797567
                    // getImageData() crop them manually before 
                    // creating imageBitmap from atlas
                    imageBitmapPromises.push(createImageBitmap(tempCtx.getImageData(x, y, width, height), {premultiplyAlpha:"premultiply"}));
                    imageAtlasKeys.push(name);
                }
                this.#dispatchCurrentLoadingProgress();
                Promise.all(imageBitmapPromises).then((results) => {
                    results.forEach((image, idx) => {
                        const name = imageAtlasKeys[idx];
                        imageAtlas.set(name, image);
                        this.addImage(name, "empty url", image);
                    });
                    tempCanvas.remove();
                    resolve(imageAtlas);
                });
            };
            img.onerror = () => {
                const err = new Error(ERROR_MESSAGES.ATLAS_IMAGE_LOADING_FAILED + url);
                this.#dispatchLoadingError(err);
                resolve(null);
                //reject(err);
            };
            img.src = url;
        });
    }

    /**
     * Loads tileset
     * @param {string} key
     * @param {string} url 
     * @param {number} gid
     * @param {string} relativePath
     * @returns {Promise<Object>}
     */
    _loadTileSet = (key, url, gid=1, relativePath) => {
        const file_format = this.#checkTilesetUrl(url),
            loadPath = relativePath ? relativePath + url : url;
        if (file_format === FILE_FORMAT.JSON) {
            return fetch(loadPath)
                .then((response) => response.json())
                .then((data) => this._processTilesetData(data, relativePath, gid, url))
                .catch(() => {
                    const err = new Error(ERROR_MESSAGES.TILESET_LOADING_FAILED + url);
                    this.#dispatchLoadingError(err);
                    return Promise.resolve(null);
                    //return Promise.reject(err);
                });
        } else if (file_format === FILE_FORMAT.XML) {
            return fetch(loadPath)
                .then(response => response.text())
                .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
                .then(xmlString => this._processTilesetXmlData(xmlString.documentElement))
                .then((data) => this._processTilesetData(data, relativePath, gid, url))
                .catch(() => {
                    const err = new Error(ERROR_MESSAGES.TILESET_LOADING_FAILED + url);
                    this.#dispatchLoadingError(err);
                    return Promise.resolve(null);
                });
        } else {
            return Promise.reject(loadPath + ERROR_MESSAGES.TILEMAP_FILE_EXTENSION_INCORRECT);
        }
    }

    /**
     * 
     * @param {Object} doc 
     * @returns {Object}
     */
    _processTilesetXmlData = (doc) => {
        const tilesetData = {
            columns: Number(doc.attributes?.columns?.value),
            name: doc.attributes?.name?.value,
            tilecount: Number(doc.attributes?.tilecount?.value),
            tiledversion: doc.attributes?.tiledversion?.value,
            tileheight: Number(doc.attributes?.tileheight?.value),
            tilewidth: Number(doc.attributes?.tilewidth?.value),
            version: doc.attributes?.version?.value,
            margin: doc.attributes?.margin ? Number(doc.attributes.margin.value) : 0,
            spacing: doc.attributes?.spacing ? Number(doc.attributes.margin.value) : 0,
            type: doc.tagName
        };
        
        this._processTilesetXmlChildData(tilesetData, doc.childNodes);
        
        return tilesetData;
    }

    /**
     * 
     * @param {any} tilesetData 
     * @param {any} nodes
     * @returns {void} 
     */
    _processTilesetXmlChildData(tilesetData, nodes) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i],
                name = node.nodeName;
                
            if (name === "image") {
                tilesetData.image = node?.attributes?.source?.value;
                tilesetData.imagewidth = node?.attributes?.width ? Number(node.attributes.width.value) : 0;
                tilesetData.imageheight = node?.attributes?.height ? Number(node.attributes.height.value) : 0;
            } else if (name === "tileoffset") {
                tilesetData.tileoffset = {
                    x: Number(node.attributes.x.value),
                    y: Number(node.attributes.y.value)
                };
            } else if (name === "tile") {
                if (!tilesetData.tiles) {
                    tilesetData.tiles = [];
                }
                
                const tile = {
                    id: Number(node.attributes?.id?.value)
                }
                const childN = node.childNodes;
                
                for (let j = 0; j < childN.length; j++) {
                    const child = childN[j],
                        childName = child.nodeName;
                    if (childName === "objectgroup") {
                        tile.objectgroup = {
                            type: childName
                        }

                        if (child.attributes?.id) {
                            tile.objectgroup.id = Number(child.attributes?.id?.value);
                        }
                        if (child.attributes?.draworder) {
                            tile.objectgroup.draworder = child.attributes.draworder.value;
                        }
                        if (child.attributes?.opacity) {
                            tile.objectgroup.opacity = child.attributes.opacity.value;
                        }
                        if (child.attributes?.x && child.attributes?.y) {
                            tile.objectgroup.x = child.attributes.x.value;
                            tile.objectgroup.y = child.attributes.y.value;
                        }

                        tile.objectgroup.objects = [];

                        const objects = child.childNodes;
                        for (let k = 0; k < objects.length; k++) {
                            const obj = objects[k];
                            
                            if (obj.nodeName === "object") {
                                const objInc = {
                                    id: Number(obj.attributes?.id?.value),
                                    visible: obj.attributes.visible && obj.attributes.visible.value === "0" ? false : true,
                                    x: Number(obj.attributes?.x?.value),
                                    y: Number(obj.attributes?.y?.value),
                                    rotation: obj.attributes?.rotation ? Number(obj.attributes.rotation.value) :0,
                                };
                                if (obj.attributes?.width) {
                                    objInc.width = Number(obj.attributes.width.value); 
                                }
                                if (obj.attributes?.height) {
                                    objInc.height = Number(obj.attributes.height.value);
                                }
                                
                                const childObjects = obj.childNodes;
                                if (childObjects && childObjects.length > 0) {
                                    for (let n = 0; n < childObjects.length; n++) {
                                        const childObj = childObjects[n];
                                
                                        if (childObj.nodeName === "ellipse") {
                                            objInc.ellipse = true;
                                        } else if (childObj.nodeName === "point") {
                                            objInc.point = true;
                                        } else if (childObj.nodeName === "polygon") {
                                            const points = childObj.attributes?.points?.value;
                                            if (points && points.length > 0) {
                                                const pointsArr = points.split(" ").map((point) => {
                                                    const [x, y] = point.split(",");
                                                    return {x:Number(x), y:Number(y)};
                                                });
                                                objInc.polygon = pointsArr;
                                            }
                                        }
                                    }
                                }

                                tile.objectgroup.objects.push(objInc);
                            }
                        }
                    } else if (childName === "animation") {
                        //
                        tile.animation = [];
                        
                        const frames = child.childNodes;
                        for (let t = 0; t < frames.length; t++) {
                            const frame = frames[t];

                            if (frame.nodeName === "frame") {
                                const frameObject = {
                                    tileid: Number(frame.attributes?.tileid?.value),
                                    duration: Number(frame.attributes?.duration?.value)
                                }
                                tile.animation.push(frameObject);
                            }
                        }
                    }
                }

                tilesetData.tiles.push(tile);
            }
        }
    }
    /**
     * 
     * @param {Object} data 
     * @param {string} relativePath
     * @param {number=} gid
     * @param {string=} source
     * @returns {Promise<Object>}
     */
    _processTilesetData = (data, relativePath, gid, source) => {
        const {name, image } = data;
        if (name && image && !this.isFileInQueue("Image", name)) {
            this.addImage(name, relativePath ? relativePath + image : image);
        }
        if (gid) {
            data.firstgid = gid;
        }
        // if it is an external file
        if (source) {
            data.source = source;
        }
        return Promise.resolve(data);
    }

    /**
     * 
     * @param {string} key 
     * @param {string} url 
     * @returns {Promise<any>}
     */
    _defaultUploadMethod = (key, url) => {
        return fetch(url);
    }

    /**
     * Loads tilemap file and related data
     * @param {string} key 
     * @param {string} url 
     * @param {boolean} [attachTileSetData = true] - indicates, whenever tilesetData is attached, or will be loaded separately
     * @returns {Promise}
     */
    _loadTileMap = (key, url, attachTileSetData = true) => {
        const file_format = this.#checkTilemapUrl(url);
        
        let fetchData;
        if (file_format === FILE_FORMAT.JSON) {
            fetchData = fetch(url)
                .then((response) => response.json())
                .then((data) => this._processTileMapData(data, url, attachTileSetData))
                .catch((err) => {
                    if (err.message.includes("JSON.parse:")) {
                        err = new Error(ERROR_MESSAGES.TILEMAP_LOADING_FAILED + url);
                    }
                    this.#dispatchLoadingError(err);
                    return Promise.resolve(null);
                    //return Promise.reject(err);
                });
        } else if (FILE_FORMAT.XML) {
            fetchData = fetch(url)
                .then((response) => response.text())
                .then((rawText) => this._processTileMapXML(rawText))
                .then((tilemapData) => this._processTileMapData(tilemapData, url, attachTileSetData))
                .catch((err) => {
                    this.#dispatchLoadingError(err);
                    return Promise.resolve(null);
                    //return Promise.reject(err);
                });
        } else {
            return Promise.reject(url + ERROR_MESSAGES.TILEMAP_FILE_EXTENSION_INCORRECT);
        }

        return fetchData;
    }

    /**
     * 
     * @param {string} rawText 
     * @returns {Object}
     */
    _processTileMapXML = (rawText) => {
        const xmlDoc = new DOMParser().parseFromString(rawText, "text/xml");
                
        /** @type {Object} */
        const doc = xmlDoc.documentElement;
        const tilemapData = {
            type: doc.tagName,
            width: Number(doc.attributes?.width?.value),
            height: Number(doc.attributes?.height?.value),
            infinite: doc.attributes.infinite && doc.attributes.infinite.value === "1" ? true : false,
            nextlayerid: Number(doc.attributes?.nextlayerid?.value),
            nextobjectid: Number(doc.attributes?.nextobjectid?.value),
            orientation: doc.attributes?.orientation?.value,
            renderorder: doc.attributes?.renderorder?.value,
            tiledversion: doc.attributes?.tiledversion?.value,
            tileheight: Number(doc.attributes?.tileheight?.value),
            tilewidth: Number(doc.attributes?.tilewidth?.value),
            version: doc.attributes?.version?.value,
            /** @type {Array<Object>} */
            tilesets: [],
            /** @type {Array<Object>} */
            layers: []
        };
        const nodes = xmlDoc.documentElement.childNodes;
        for (let i = 0; i < nodes.length; i++) {
            /** @type {Object} */
            const node = nodes[i],
                name = node.nodeName;
                
            if (name === "tileset") {
                const tileset = {
                    firstgid: Number(node.attributes?.firstgid?.value)
                };
                if (node.attributes?.source) { // external tileset (will be loaded later)
                    tileset.source = node.attributes?.source?.value;
                } else {
                    // inline tileset
                    tileset.columns = Number(node.attributes?.columns?.value);
                    if (node.attributes?.margin) {
                        tileset.margin = Number(node.attributes?.margin?.value);
                    }
                    if (node.attributes?.spacing) {
                        tileset.spacing = node.attributes?.spacing?.value;
                    }
                    tileset.name = node.attributes?.name?.value;
                    
                    tileset.tilecount = Number(node.attributes?.tilecount?.value);
                    tileset.tilewidth = Number(node.attributes?.tilewidth?.value);
                    tileset.tileheight = Number(node.attributes?.tileheight?.value);

                    this._processTilesetXmlChildData(tileset, node.childNodes);
                }
                tilemapData.tilesets.push(tileset);
            } else if (name === "layer") {
                const layer = {
                    height: Number(node.attributes?.height?.value),
                    id: Number(node.attributes?.id?.value),
                    name: node.attributes?.name?.value,
                    width: Number(node.attributes?.width?.value),
                    data: node.textContent ? node.textContent.trim().split(",").map((val) => Number(val)): null
                }
                tilemapData.layers.push(layer);
            }
        }

        return tilemapData;
    }

    /**
     * 
     * @param {any} data 
     * @param {string} url 
     * @param {boolean} attachTileSetData 
     * @returns {Promise<any>}
     */
    _processTileMapData = (data, url, attachTileSetData) => {
        const relativePath = this.#calculateRelativePath(url);
        
        if (attachTileSetData === true && data.tilesets && data.tilesets.length > 0) {
            const tilesetPromises = [];
            // upload additional tileset data
            data.tilesets.forEach((tileset, idx) => {
                const { firstgid, source } = tileset;
                if (source) { // external tileset
                    const loadTilesetPromise = this._loadTileSet("default-" + firstgid, source, firstgid, relativePath)
                        .then((tilesetData) => {
                            this.#dispatchCurrentLoadingProgress();
                            return Promise.resolve(tilesetData);
                        });
                    tilesetPromises.push(loadTilesetPromise);
                } else { // inline tileset
                    const loadTilesetPromise = this._processTilesetData(tileset, relativePath)
                        .then((tilesetData) => {
                            this.#dispatchCurrentLoadingProgress();
                            return Promise.resolve(tilesetData);
                        });
                    tilesetPromises.push(loadTilesetPromise);
                }
            });
            //attach additional tileset data to tilemap data
            return Promise.all(tilesetPromises).then((tilesetDataArray) => {
                for (let i = 0; i < tilesetDataArray.length; i++) {
                    const tilesetData = tilesetDataArray[i];
                    data.tilesets[i] = tilesetData;
                    // @depricated
                    // save backward capability with jsge@1.5.71
                    data.tilesets[i].data = Object.assign({}, tilesetData);
                }
                return Promise.resolve(data);
            });
        } else {
            return Promise.resolve(data);
        }
    }

    /**
     * Loads audio file
     * @param {string} key 
     * @param {string} url 
     * @returns {Promise}
     */
    _loadAudio = (key, url) => {
        return new Promise((resolve) => {
            const audio = new Audio(url);
            
            audio.addEventListener("loadeddata", () => {
                this.#dispatchCurrentLoadingProgress();
                resolve(audio);
            });

            audio.addEventListener("error", () => {
                const err = new Error(ERROR_MESSAGES.AUDIO_LOADING_FAILED + url);
                this.#dispatchLoadingError(err);
                resolve(null);
                //reject(err);
            });
        });
    }

    /**
     * Loads image file.
     * @param {string} key 
     * @param {string} url
     * @param {ImageBitmap=} image - image could be add from another source
     * @param {string} [cors="anonymous"] // https://hacks.mozilla.org/2011/11/using-cors-to-load-webgl-textures-from-cross-domain-images
     * @returns {Promise}
     */
    _loadImage = (key, url, image, cors = "anonymous") => {
        return new Promise((resolve, reject) => {
            if (image) {
                resolve(image);
            } else {
                const img = new Image();
                img.crossOrigin = cors;
                img.onload = () => {
                    // do we need a bitmap? Without creating bitmap images has not premultiplied
                    // transparent pixels, and in some cases it creates white ages,
                    // in other - multiply pixels with the background
                    createImageBitmap(img, {premultiplyAlpha:"premultiply"}).then((imageBitmap) => {
                        this.#dispatchCurrentLoadingProgress();
                        resolve(imageBitmap);
                    });
                };
                img.onerror = () => {
                    const err = new Error(ERROR_MESSAGES.IMAGE_LOADING_FAILED + url);
                    this.#dispatchLoadingError(err);
                    resolve(null);
                    // reject(err);
                };
                img.src = url;
            }
        });
    }

    #checkXmlUrl(url) {
        if (url.includes(".xml")) {
            return;
        } else {
            Exception(url + ERROR_MESSAGES.XML_FILE_EXTENSION_INCORRECT);
        }
    }

    #checkTilesetUrl(url) {
        if (url.includes(".tsj") || url.includes(".json")) {
            return FILE_FORMAT.JSON;
        } else if (url.includes(".tsx") || url.includes(".xml")) {
            return FILE_FORMAT.XML;
        } else {
            return FILE_FORMAT.UNKNOWN;
        }
    }

    #checkTilemapUrl(url) {
        if (url.includes(".tmj") || url.includes(".json")) {
            return FILE_FORMAT.JSON;
        } else if (url.includes(".tmx") || url.includes(".xml")) {
            return FILE_FORMAT.XML;
        } else {
            return FILE_FORMAT.UNKNOWN;
        }
    }

    #isUploadErrorCritical(error) {
        return error.message.includes(ERROR_MESSAGES.NOT_CORRECT_METHOD_TYPE)
            || error.message.includes(ERROR_MESSAGES.XML_FILE_EXTENSION_INCORRECT)
            || error.message.includes(ERROR_MESSAGES.TILESET_FILE_EXTENSION_INCORRECT)
            || error.message.includes(ERROR_MESSAGES.TILEMAP_FILE_EXTENSION_INCORRECT)
            || error.message.includes(ERROR_MESSAGES.INPUT_PARAMS_ARE_INCORRECT)
            || error.message.includes(ERROR_MESSAGES.LOADER_NOT_REGISTERED);
    }

    /**
     * Calculate relative path for current url
     * for example: /folder/images/map.xml -> /folder/images/
     * @param {string} url 
     * @returns {string}
     */
    #calculateRelativePath(url) {
        let split = url.split("/"),
            length = split.length,
            lastEl = split[length - 1],
            //prelastEl = split[length - 2],
            relativePath = "/";
        
        // url ends with .ext
        if (lastEl.includes(".tmj") || lastEl.includes(".tmx") || lastEl.includes(".xml") || lastEl.includes(".json")) {
            split.pop();
            relativePath = split.join("/") + "/";
        // url ends with /
        }/* else if (prelastEl.includes(".tmj") || lastEl.includes(".tmx") || prelastEl.includes(".xml") || prelastEl.includes(".json")) {
            split.splice(length - 2, 2);
            relativePath = split.join("/") + "/";
        }*/
        return relativePath;
    }

    addFile(fileType, fileKey, url, ...args) {
        const loader = this.#registeredLoaders.get(fileType);
        if (loader) {
            this.#checkInputParams(fileKey, url, fileType);
            loader._addFile(fileKey, [url, ...args]);
        } else {
            Exception(fileType + ERROR_MESSAGES.LOADER_NOT_REGISTERED);
        }

    }

    isFileInQueue(fileType, fileKey) {
        const loader = this.#registeredLoaders.get(fileType);
        if (loader) {
            return loader._isFileInQueue(fileKey);
        } else {
            Exception("Loader for " + fileType + " is not registered!");
        }
    }

    getFile(fileType, fileKey) {
        const loader = this.#registeredLoaders.get(fileType);
        if (loader) {
            return loader._getFile(fileKey);
        } else {
            Exception("Loader for " + fileType + " is not registered!");
        }
    }

    #checkInputParams(fileKey, url, fileType) {
        const errorMessage = ERROR_MESSAGES.INPUT_PARAMS_ARE_INCORRECT;
        if (!fileKey || fileKey.trim().length === 0) {
            Exception("add" + fileType + "()" + errorMessage);
        }
        if (!url || url.trim().length === 0) {
            Exception("add" + fileType + "()" + errorMessage);
        }
        return;
    }

    #dispatchLoadingStart() {
        let total = this.filesWaitingForUpload;
        this.#emitter.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.loadstart, { total }));
    }

    #dispatchLoadingFinish() {
        this.#emitter.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.load));
    }

    #dispatchCurrentLoadingProgress() {
        const total = this.filesWaitingForUpload;
        this.#itemsLoaded += 1;
        this.#emitter.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.progress, { lengthComputable: true, loaded: this.#itemsLoaded, total }));
    }

    #dispatchLoadingError(error) {
        Warning("AssetsManger: " + error.message);
        this.#emitter.dispatchEvent(new ErrorEvent(PROGRESS_EVENT_TYPE.error, { error }));
    }
}

function Exception (message) {
    throw new Error(message);
}

function Warning (message) {
    console.warn(message);
}

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
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.CIRCLE, x, y, bgColor);
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
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.CONUS, x, y, bgColor);
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
     * @type {number}
     */
    #margin = 0;
    /**
     * @type {Array<Array<number>>}
     */
    #vertices;
    /**
     * @type {Object | null}
     */
    #circleCollisionShapes;
    /**
     * @type {ImageTempStorage}
     */
    #textureStorage;

    /**
     * @hideconstructor
     */
    constructor(mapX, mapY, width, height, key, imageIndex = 0, collisionShapes, image, spacing = 0, margin = 0) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_1__.DRAW_TYPE.IMAGE, mapX, mapY);
        this.#key = key;
        this.#emitter = new EventTarget();
        this.#animations = new Map();
        this.image = image;
        this.#imageIndex = imageIndex;
        this.#spacing = spacing;
        this.#margin = margin;
        this.#w = width;
        this.#h = height;
        this.#vertices = collisionShapes && !collisionShapes.r ? this._convertVerticesArray(collisionShapes) : collisionShapes && collisionShapes.r ? this._calculateConusShapes(collisionShapes.r) : this._calculateRectVertices(width, height);
        this.#circleCollisionShapes = collisionShapes && typeof collisionShapes.r !== "undefined" ? collisionShapes : null;
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
     * Image spacing (for tilesets.margin > 0)
     * @type {number}
     */
    get margin() {
        return this.#margin;
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

    get vertices() {
        return this.#vertices;
    }

    get circleCollisionShapes() {
        return this.#circleCollisionShapes;
    }

    /**
     * @ignore
     */
    _processActiveAnimations() {
        const activeAnimation = this.#activeAnimation;
        if (activeAnimation) {
            const animationEvent = this.#animations.get(activeAnimation);
            if (animationEvent.isActive === false) {
                this.#activeAnimation = null;
            } else {
                animationEvent.iterateAnimationIndex();
                this.#imageIndex = animationEvent.currentSprite;
            }
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
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.LINE, vertices[0][0], vertices[0][1], bgColor);
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
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.POLYGON, vertices[0].x, vertices[0].y, bgColor);
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
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.RECTANGLE, x, y, bgColor);
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
     * @type {DRAW_TYPE}
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
     * @type {DRAW_TYPE}
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
    _calculateConusShapes(radius, angle = 2*Math.PI, step = Math.PI/14) {
        let conusPolygonCoords = [];

        for (let r = 0; r <= angle; r += step) {
            let x2 = Math.cos(r) * radius,
                y2 = Math.sin(r) * radius;

            conusPolygonCoords.push([x2, y2]);
        }

        return conusPolygonCoords;
    }


    /**
     * @param {Array<Array<number>> | Array<{x:number, y:number}>} collision_shapes
     * @returns {Array<Array<number>>}
     * @ignore
     */
    _convertVerticesArray(collision_shapes) {
        if (typeof collision_shapes[0].x !== "undefined" && typeof collision_shapes[0].y !== "undefined") {
            return _index_js__WEBPACK_IMPORTED_MODULE_1__.utils.verticesArrayToArrayNumbers(collision_shapes);
        } else {
            return collision_shapes;
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
        super(_constants_js__WEBPACK_IMPORTED_MODULE_2__.DRAW_TYPE.TEXT, mapX, mapY);
        this.#text = text;
        this.#font = font;
        this.#fillStyle = fillStyle;
        this.#textMetrics;
        this.#calculateCanvasTextureAndMeasurements();
    }

    /**
     * @deprecated
     * Use collisionShapes()
     * @type {Rectangle}
     */
    get boundariesBox() {
        return this.collisionShapes;
    }

    /**
     * Rectangle text box.
     * @type {Rectangle}
     */
    get collisionShapes() {
        const width = this.textMetrics ? Math.floor(this.textMetrics.width) : 300,
            height = this.textMetrics ? Math.floor(this.textMetrics.fontBoundingBoxAscent + this.textMetrics.fontBoundingBoxDescent): 30;
        return new _Primitives_js__WEBPACK_IMPORTED_MODULE_1__.Rectangle(this.x, this.y - height, width, height);
    }

    get vertices() {
        const bb = this.collisionShapes;
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
            const boxWidth = this.collisionShapes.width, 
                boxHeight = this.collisionShapes.height;
            
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
    #setCollisionShapes;
    #drawCollisionShapes;
    #attachedMaskId;
    /**
     * @type {number}
     */
    #sortIndex = 0;
    /**
     * @type {Map<string, AnimationEvent>}
     */
    #animations = new Map();
    /**
     * @type {boolean}
     */
    #isOffsetTurnedOff;
    /**
     * @type {boolean}
     */
    #isRemoved = false;

    /**
     * @hideconstructor
     */
    constructor(layerKey, tileMapKey, tilemap, tilesets, tilesetImages, layerData, setCollisionShapes = false, shapeMask) {
        this.#layerKey = layerKey;
        this.#tileMapKey = tileMapKey;
        this.#tilemap = tilemap;
        this.#tilesets = tilesets;
        this.#textureStorages = [];
        this.#tilesetImages = tilesetImages;
        this.#layerData = layerData;
        
        this.#setCollisionShapes = setCollisionShapes;
        this.#drawCollisionShapes = setCollisionShapes ? setCollisionShapes : false;
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
     * Should the layer borders used as collision shapes, or not
     * Can be set in GameStage.addRenderLayer() method.
     * @type {boolean}
     */
    get setCollisionShapes() {
        return this.#setCollisionShapes;
    }

    /**
     * Should draw a collision shapes helper, or not
     * Can be set in SystemSettings.
     * @type {boolean}
     */
    get drawCollisionShapes() {
        return this.#drawCollisionShapes;
    }

    set drawCollisionShapes(value) {
        this.#drawCollisionShapes = value;
    }

    get isRemoved() {
        return this.#isRemoved;
    }

    set isRemoved(value) {
        this.#isRemoved = value;
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
     * or object collision shapes, this is workaround for split this and add
     * additional properties for use in draw phase:
     * _hasAnimations
     * _animations - Map<id:activeSprite>
     * _hasCollisionShapes
     * _collisionShapes - Map<id:objectgroup>
     * @param {*} tilesets
     */
    #processData(tilesets, layerData) {
        // границы для слоя создаются одни, даже если они высчитываются с разных тайлсетов
        // поэтому суммируем и находим максимальное их количество
        // также находим максимально возможное количество для текущего экрана
        let ellipseBLen = 0,
            pointBLen = 0,
            polygonBLen = 0;
        tilesets.forEach((tileset, idx) => {
            const tiles = tileset.tiles,
                name = tileset.name,
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
                        if (!tileset._hasAnimations) {
                            tileset._hasAnimations = true;
                            tileset._animations = new Map();
                            //
                            tileset._animations.set(id, animationIndexes[0][0]);
                        }
                        this.#activateAnimation(animationEvent);
                    }
                    if (objectgroup && this.#setCollisionShapes) {
                        if (tileset._hasCollisionShapes) {
                            tileset._collisionShapes.set(id, objectgroup);
                        } else {
                            // add additional properties
                            tileset._hasCollisionShapes = true;
                            tileset._collisionShapes = new Map();
                            tileset._collisionShapes.set(id, objectgroup);
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

            if (this.#setCollisionShapes) {
                polygonBLen+=(nonEmptyCells * 16); // potential collision shapes also nonEmptyCells
            }
            // создаем вспомогательный объект для расчетов и хранения данных отрисовки
            // help class for draw calculations
            tileset._temp = new _Temp_TiledLayerTempStorage_js__WEBPACK_IMPORTED_MODULE_3__.TiledLayerTempStorage(cells, nonEmptyCells);
        });
        
        // save collision shapes max possible lengths
        layerData.ellipseCollisionShapesLen = ellipseBLen;
        layerData.pointCollisionShapesLen = pointBLen;
        layerData.polygonCollisionShapesLen = polygonBLen;
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
            tilesetIndex = this.#tilesets.findIndex(tileset => tileset.name === tilesetKey),
            tileset = this.#tilesets[tilesetIndex];
            
        tileset._animations.set(parseInt(animationId), animationEvent.currentSprite);
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
    /**
     * @type {number}
     */
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
/* harmony import */ var _modules_assetsm_src_AssetsManager_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../modules/assetsm/src/AssetsManager.js */ "./modules/assetsm/src/AssetsManager.js");














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

    get stageData() {
        return this.#currentPageData;
    }

    /**
     * 
     * @param {*} renderObject 
     * @returns {void}
     */
    #addObjectToPageData(renderObject) {
        this.#currentPageData._renderObject = renderObject;
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
     * @param {Array<{x:Number, y:Number}> | {r:number}=} collisionShapes - collision shapes as polygon, or circle
     * @param {number} [spacing = 0] - for tilesets.spacing > 0
     * @param {number} [margin = 0] - for tilesets.margin > 0
     * @returns {DrawImageObject}
     */
    image(x, y, width, height, key, imageIndex = 0, collisionShapes, spacing = 0, margin = 0) {
        const image = this.#iLoader.getImage(key);

        if (!image) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_10__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_11__.ERROR_CODES.CANT_GET_THE_IMAGE, "iLoader can't get the image with key: " + key);
        }
            
        const renderObject = new _2d_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_3__.DrawImageObject(x, y, width, height, key, imageIndex, collisionShapes, image, spacing, margin);
        
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
     * @param {boolean=} setCollisionShapes 
     * @param {DrawShapeObject=} shapeMask 
     * @returns {DrawTiledLayer}
     */
    tiledLayer(layerKey, tileMapKey, setCollisionShapes, shapeMask) {
        const tilemap = this.#iLoader.getTileMap(tileMapKey),
            layerData = Object.assign({}, tilemap.layers.find((layer) => layer.name === layerKey)), // copy to avoid change same tilemap instance in different tiledLayers
            tilesetIds = Array.from(new Set(layerData.data.filter((id) => id !== 0))).sort((a, b) => a - b),
            tilesets = tilemap.tilesets.map((tileset) => Object.assign({}, tileset)).filter((tileset) => {
                const tilesetStartI = tileset.firstgid,
                    tilesetLastI = tilesetStartI + tileset.tilecount;
                if (tilesetIds.find((id) => ((id >= tilesetStartI) && (id < tilesetLastI)))) {
                    return true;
                } else {
                    return false;
                }
            }), // copy to avoid change same tilemap instance in different tiledLayers
            tilesetImages = tilesets.map((tileset) => this.#iLoader.getImage(tileset.name)),
            renderObject = new _2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_7__.DrawTiledLayer(layerKey, tileMapKey, tilemap, tilesets, tilesetImages, layerData, setCollisionShapes, shapeMask);
        if (tilesetImages.length > 1) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_10__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_11__.WARNING_CODES.MULTIPLE_IMAGE_TILESET, " tileset " + layerKey + " includes multiple images, it can case performance issues!");
        }
        //console.log(layerKey);
        //console.log(tilesetIds);
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
/* harmony import */ var _modules_assetsm_src_AssetsManager_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../modules/assetsm/src/AssetsManager.js */ "./modules/assetsm/src/AssetsManager.js");
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
 * @abstract
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
     * @type {ISystem}
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
     * @returns {AssetsManager}
     */
    get iLoader() {
        return this.#iSystemReference.iLoader;
    }

    /**
     * @returns {DrawObjectFactory}
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
        }
    };

    /**
     * Determines if this stage render is Active or not
     * @returns {boolean}
     */
    get isActive() {
        return this.#isActive;
    }

    /**
     * Determines if this stage is initialized or not
     * @returns {boolean}
     */
    get isInitiated() {
        return this.#isInitiated;
    }

    /**
     * Current stage name
     * @returns {string}
     */
    get name () {
        return this.#name;
    }

    /**
     * @returns {GameStageData}
     */
    get stageData() {
        return this.#stageData;
    }

    /**
     * @returns {SystemSettings}
     */
    get systemSettings() {
        return this.#iSystemReference.systemSettings;
    }

    /**
     * @returns {ISystemAudio}
     */
    get audio() {
        return this.#iSystemReference.audio;
    }

    /**
     * @returns {ISystem}
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
     * Backward capability with jsge before 1.5.9
     * @deprecated
     * isCollision()
     * @param {number} x 
     * @param {number} y 
     * @param {DrawImageObject} drawObject 
     * @returns {{x:number, y:number, p:number} | boolean}
     */
    isBoundariesCollision = (x, y, drawObject) => {
        return this.isCollision(x, y, drawObject);
    };

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {DrawImageObject} drawObject 
     * @returns {{x:number, y:number, p:number} | boolean}
     */
    isCollision = (x, y, drawObject) => {
        const drawObjectType = drawObject.type,
            vertices = drawObject.vertices,
            circleCollisionShapes = drawObject.circleCollisionShapes;
        switch(drawObjectType) {
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.TEXT:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.RECTANGLE:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.CONUS:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.IMAGE:
                if (!circleCollisionShapes) {
                    return this.#isPolygonToCollisionShapesCollision(x, y, vertices, drawObject.rotation);
                } else {
                    return this.#isCircleToCollisionShapesCollision(x, y, drawObject.circleCollisionShapes.r);
                }
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.CIRCLE:
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.circle check is not implemented yet!");
                break;
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.LINE:
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.line check is not implemented yet, please use .rect instead line!");
                break;
            default:
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNKNOWN_DRAW_OBJECT, "unknown object type!");
        }
        return false;
    };

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {DrawImageObject} drawObject
     * @param {Array<DrawImageObject>} objects - objects array to check
     * @returns {Array<Object> | boolean} - array of objects with collisions, or false if no collision happen
     */
    isObjectsCollision = (x, y, drawObject, objects) => {
        const drawObjectType = drawObject.type,
            drawObjectCollisionShapes = drawObject.vertices,
            circleCollisionShapes = drawObject.circleCollisionShapes;
        switch(drawObjectType) {
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.TEXT:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.RECTANGLE:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.CONUS:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.IMAGE:
                if (!circleCollisionShapes) {
                    return this.#isPolygonToObjectsCollision(x, y, drawObjectCollisionShapes, drawObject.rotation, objects);
                } else {
                    return this.#isCircleToObjectsCollision(x, y, circleCollisionShapes, objects);
                }
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.CIRCLE:
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.circle check is not implemented yet!");
                break;
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.LINE:
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.line check is not implemented yet, please use .rect instead line!");
                break;
            default:
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNKNOWN_DRAW_OBJECT, "unknown object type!");
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
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.TEXT:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.RECTANGLE:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.CONUS:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.IMAGE:
                coll = this.#isPolygonToPolygonCollision(x, y, polygonVertices, polygonRotation, mapObject);
                break;
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.CIRCLE:
                console.warn("isObjectCollision.circle check is not implemented yet!");
                break;
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.LINE:
                console.warn("isObjectCollision.line check is not implemented, please use rect instead");
                break;
            default:
                console.warn("unknown object type!");
            }
            if (coll) {
                collisions.push(mapObject);
            }
        }
        if (collisions.length > 0) {
            return collisions;
        } else {
            return false;
        }
    }

    #isCircleToObjectsCollision(x, y, drawObjectCollisionShapes, objects) {
        const radius = drawObjectCollisionShapes.r;

        const len = objects.length;

        let collisions = [];
        for (let i = 0; i < len; i++) {
            const mapObject = objects[i],
                drawMapObjectType = mapObject.type,
                circleCollisionShapes = mapObject.circleCollisionShapes;

            /**
             * @type {boolean | Object}
             */
            let coll;
            
            switch(drawMapObjectType) {
                case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.TEXT:
                case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.RECTANGLE:
                case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.CONUS:
                case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.IMAGE:
                    if (!circleCollisionShapes) {
                        coll = this.#isCircleToPolygonCollision(x, y, radius, mapObject);
                    } else {
                        coll = this.#isCircleToCircleCollision(x, y, radius, mapObject.x, mapObject.y, circleCollisionShapes.r);
                    }
                    break;
                case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.CIRCLE:
                    console.warn("isObjectCollision.circle check is not implemented yet!");
                    break;
                case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.LINE:
                    console.warn("isObjectCollision.line check is not implemented, please use rect instead");
                    break;
                default:
                    console.warn("unknown object type!");
            }
            if (coll) {
                collisions.push(mapObject);
            }
        }
        if (collisions.length > 0) {
            return collisions;
        } else {
            return false;
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
    #isCircleToCollisionShapesCollision(x, y, r) {
        const mapObjects = this.stageData.getRawCollisionShapes(),
            ellipseB = this.stageData.getEllipseCollisionShapes(),
            pointB = this.stageData.getPointCollisionShapes(),
            [mapOffsetX, mapOffsetY] = this.stageData.worldOffset,
            xWithOffset = x - mapOffsetX,
            yWithOffset = y - mapOffsetY,
            len = this.stageData.collisionShapesLen,
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
    #isPolygonToCollisionShapesCollision(x, y, polygon, rotation) {
        const mapObjects = this.stageData.getRawCollisionShapes(),
            ellipseB = this.stageData.getEllipseCollisionShapes(),
            pointB = this.stageData.getPointCollisionShapes(),
            [mapOffsetX, mapOffsetY] = this.stageData.worldOffset,
            xWithOffset = x - mapOffsetX,
            yWithOffset = y - mapOffsetY,
            polygonWithOffsetAndRotation = polygon.map((vertex) => (this.#calculateShiftedVertexPos(vertex, xWithOffset, yWithOffset, rotation))),
            len = this.stageData.collisionShapesLen,
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
/* harmony import */ var _2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./2d/DrawTiledLayer.js */ "./src/base/2d/DrawTiledLayer.js");
/* harmony import */ var _2d_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./2d/DrawImageObject.js */ "./src/base/2d/DrawImageObject.js");
/* harmony import */ var _2d_DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./2d/DrawCircleObject.js */ "./src/base/2d/DrawCircleObject.js");
/* harmony import */ var _2d_DrawConusObject_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./2d/DrawConusObject.js */ "./src/base/2d/DrawConusObject.js");
/* harmony import */ var _2d_DrawLineObject_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./2d/DrawLineObject.js */ "./src/base/2d/DrawLineObject.js");
/* harmony import */ var _2d_DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./2d/DrawPolygonObject.js */ "./src/base/2d/DrawPolygonObject.js");
/* harmony import */ var _2d_DrawRectObject_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./2d/DrawRectObject.js */ "./src/base/2d/DrawRectObject.js");
/* harmony import */ var _2d_DrawTextObject_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./2d/DrawTextObject.js */ "./src/base/2d/DrawTextObject.js");











/**
 * A storage for stage data, such as gameObjects,
 * collision shapes, worldDimensions and offset
 * @see {@link GameStage} a part of GameStage
 * @hideconstructor
 */
class GameStageData {
    /**
     * @type {number}
     */
    #worldWidth;
    #worldHeight;
    /**
     * @type {number}
     */
    #viewWidth;
    /**
     * @type {number}
     */
    #viewHeight;
    /**
     * @type {number}
     */
    #xOffset = 0;
    /**
     * @type {number}
     */
    #yOffset = 0;
    /**
     * @type {number}
     */
    #centerX = 0;
    /**
     * @type {number}
     */
    #centerY = 0;
    /**
     * @type {number}
     */
    #rotate = 0;
    /**
     * @type {number}
     */
    #maxCollisionShapesSize = 0;
    /**
     * @type {number}
     */
    #maxEllipseCollisionShapesSize = 0;
    /**
     * @type {number}
     */
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
     * current screen collision shapes, recalculated every render cycles
     * stored as floatArray, 
     * each 4 cells, represent a line with coords x1,y1,x2,y2
     * @type {Float32Array}
     */
    #collision_shapes;
    /**
     * ellipse collision shapes
     * stored as floatArray, 
     * each 4 cells, represent am ellipse with cords centerX, centerY, radiusX, radiusY
     * @type {Float32Array}
     */
    #ellipseCollisionShapes;
    /**
     * point collision shapes
     * stored as floatArray, 
     * each 2 cells, represent a point with coords x1,y1
     * @type {Float32Array}
     */
    #pointCollisionShapes;
    /**
     * whole world collision shapes, calculated once on prepare stage
     * @type {Array<Array<number>>}
     */
    #wholeWorldCollisionShapes;
    /**
     * @type {Array<DrawImageObject | DrawCircleObject | DrawConusObject | DrawLineObject | DrawPolygonObject | DrawRectObject | DrawTextObject | DrawTiledLayer>}
     */
    #renderObjects = [];
    /**
     * @type {Array<DrawImageObject | DrawCircleObject | DrawConusObject | DrawLineObject | DrawPolygonObject | DrawRectObject | DrawTextObject | DrawTiledLayer>}
     */
    #pendingRenderObjects = [];

    /**
     * @type {boolean}
     */
    #isOffsetTurnedOff;
    /**
     * @deprecated
     * @type {boolean}
     */
    #isWorldCollisionShapesEnabled = false;

    /**
     * @type {Array<number>}
     */
    #debugObjectCollisionShapes = [];
    /**
     * 
     * @type {boolean}
     */
    #isDebugObjectCollisionShapes = false;

    constructor(gameOptions) {
        //this.#collision_shapes = new Float32Array(this.#maxCollisionShapesSize);
        //this.#ellipseCollisionShapes = new Float32Array(this.#maxCollisionShapesSize);
        //this.#pointCollisionShapes = new Float32Array(this.#maxCollisionShapesSize);
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
     * Add a Collision Shape line
     * @param {{x1:number,y1:number,x2:number, y2:number}} collision_shapes 
     */
    #addCollisionShapes(collision_shapes) {
        this._addCollisionShapeLine(collision_shapes.x1,collision_shapes.y1, collision_shapes.x2, collision_shapes.y2);
    }

    /**
     * Add array of collision shapes lines
     * @param {Array<Array<number>>} collision_shapes 
     * @ignore
     */
    _addImageDebugCollisionShapes(collision_shapes) {
        const len = collision_shapes.length;
        for (let i = 0; i < len; i++) {
            this.#debugObjectCollisionShapes.push(...collision_shapes[i]);
        }
    }

    _enableDebugObjectCollisionShapes() {
        this.#isDebugObjectCollisionShapes = true;
    }
    /**
     * Add array of collision shapes lines
     * @param {Array<Array<number>>} collision_shapes 
     * @ignore
     */
    _addCollisionShapesArray(collision_shapes) {
        const len = collision_shapes.length;
        for (let i = 0; i < len; i++) {
            const collision_shape = collision_shapes[i];
            this._addCollisionShapeLine(collision_shape[0], collision_shape[1], collision_shape[2], collision_shape[3]);
        }
    }

    _addCollisionShapeLine(x1, y1, x2, y2) {
        this.#collision_shapes[this.#bPointer] = x1;
        this.#bPointer++;
        this.#collision_shapes[this.#bPointer] = y1;
        this.#bPointer++;
        this.#collision_shapes[this.#bPointer] = x2;
        this.#bPointer++;
        this.#collision_shapes[this.#bPointer] = y2;
        this.#bPointer++;
    }

    _addEllipseCollisionShape(w, h, x, y) {
        this.#ellipseCollisionShapes[this.#ePointer] = w;
        this.#ePointer++;
        this.#ellipseCollisionShapes[this.#ePointer] = h;
        this.#ePointer++;
        this.#ellipseCollisionShapes[this.#ePointer] = x;
        this.#ePointer++;
        this.#ellipseCollisionShapes[this.#ePointer] = y;
        this.#ePointer++;
    }

    _addPointCollisionShape(x,y) {
        this.#pointCollisionShapes[this.#pPointer] = x;
        this.#pPointer++;
        this.#pointCollisionShapes[this.#pPointer] = y;
        this.#pPointer++;
    }

    _removeCollisionShapeLine(startPos) {
        this.#collision_shapes[startPos] = 0;
        this.#collision_shapes[startPos + 1] = 0;
        this.#collision_shapes[startPos + 2] = 0;
        this.#collision_shapes[startPos + 3] = 0;
    }

    /**
     * Clear map collision shapes
     * @ignore
     */
    _clearCollisionShapes() {
        this.#collision_shapes.fill(0);
        this.#ellipseCollisionShapes.fill(0);
        this.#pointCollisionShapes.fill(0);
        
        this.#bPointer = 0;
        this.#ePointer = 0;
        this.#pPointer = 0;
        if (this.#isDebugObjectCollisionShapes) {
            this.#debugObjectCollisionShapes = [];
        }
    }

    _initiateCollisionShapesData() {
        this.#collision_shapes = new Float32Array(this.#maxCollisionShapesSize);
        this.#ellipseCollisionShapes = new Float32Array(this.#maxEllipseCollisionShapesSize);
        this.#pointCollisionShapes = new Float32Array(this.#maxPointBSize);
    }

    /**
     * 
     * @param {number} bSize
     * @param {number} eSize - ellipse collision shapes size
     * @param {number} pSize - points collision shapes size
     * @ignore
     */
    _setMaxCollisionShapesSize(bSize, eSize = 0, pSize = 0) {
        this.#maxCollisionShapesSize = bSize;
        this.#maxEllipseCollisionShapesSize = eSize;
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
    _setMapCollisionShapes() {
        const [w, h] = [this.#worldWidth, this.#worldHeight],
            [offsetX, offsetY] = [this.#xOffset, this.#yOffset],
            wOffset = w - offsetX,
            hOffset = h -offsetY;
        if (!w || !h) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.WORLD_DIMENSIONS_NOT_SET, "Can't set map collision shapes.");
        }
        this.#addCollisionShapes({x1: 0, y1: 0, x2: wOffset, y2: 0});
        this.#addCollisionShapes({x1: wOffset, y1: 0, x2: wOffset, y2: hOffset});
        this.#addCollisionShapes({x1: wOffset, y1: hOffset, x2: 0, y2: hOffset});
        this.#addCollisionShapes({x1: 0, y1: hOffset, x2: 0, y2: 0});
    }

    /**
     * @ignore
     */
    _setWholeWorldMapCollisionShapes() {
        const [w, h] = [this.#worldWidth, this.#worldHeight];
        if (!w || !h) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.WORLD_DIMENSIONS_NOT_SET, "Can't set map collision shapes.");
        }
        this.#wholeWorldCollisionShapes.push([0, 0, w, 0]);
        this.#wholeWorldCollisionShapes.push([w, 0, w, h]);
        this.#wholeWorldCollisionShapes.push([w, h, 0, h]);
        this.#wholeWorldCollisionShapes.push([0, h, 0, 0]);
    }

    /**
     * Merge same collision shapes
     * !not used
     * @ignore
     * @deprecated
     */
    _mergeCollisionShapes(isWholeMapCollisionShapes = false) {
        const collision_shapes = isWholeMapCollisionShapes ? this.getWholeWorldCollisionShapes() : this.getCollisionShapes(),
            collisionShapesSet = new Set(collision_shapes);

        for (const line of collisionShapesSet.values()) {
            const lineX1 = line[0],
                lineY1 = line[1],
                lineX2 = line[2],
                lineY2 = line[3];
            for (const line2 of collisionShapesSet.values()) {
                const line2X1 = line2[0],
                    line2Y1 = line2[1],
                    line2X2 = line2[2],
                    line2Y2 = line2[3];
                if (lineX1 === line2X2 && lineY1 === line2Y2 &&
                    lineX2 === line2X1 && lineY2 === line2Y1) {
                    //remove double lines
                    collisionShapesSet.delete(line);
                    collisionShapesSet.delete(line2);
                }
                if (lineX2 === line2X1 && lineY2 === line2Y1 && (lineX1 === line2X2 || lineY1 === line2Y2)) {
                    //merge lines
                    line2[0] = lineX1;
                    line2[1] = lineY1;
                    collisionShapesSet.delete(line);
                }
            }
        }
        if (isWholeMapCollisionShapes) {
            this.#collision_shapes = Array.from(collisionShapesSet);
        } else {
            this.#wholeWorldCollisionShapes = Array.from(collisionShapesSet);
        }
        collisionShapesSet.clear();
    }

    /**
     * @ignore
     * @param {Array<Array<number>>} collision_shapes 
     */
    _setWholeMapCollisionShapes(collision_shapes) {
        this.#wholeWorldCollisionShapes.push(...collision_shapes);
    }

    /**
     * @deprecated
     * @ignore
     */
    _enableMapCollisionShapes() {
        this.#isWorldCollisionShapesEnabled = true;
    }

    /**
     * @ignore
     */
    _sortRenderObjectsBySortIndex() {
        this.#renderObjects.sort((obj1, obj2) => obj1.sortIndex - obj2.sortIndex);
    }

    _processPendingRenderObjects() {
        if (this.#pendingRenderObjects.length > 0) {
            this.#renderObjects.push(...this.#pendingRenderObjects);
            this._sortRenderObjectsBySortIndex();
            this.#pendingRenderObjects = [];
        }
    }

    /**
     * @ignore
     */
    set _renderObject(object) {
        this.#pendingRenderObjects.push(object);
    } 

    /**
     * @ignore
     */
    set _renderObjects(objects) {
        objects.forEach(object => {
            this._renderObject = object;
        });
    } 

    /**
     * Backward capability with jsge before 1.5.9
     * @deprecated
     * getCollisionShapes()
     * @returns {Array<Array<number>>}
     */
    getBoundaries() {
        return this.getCollisionShapes();
    }
    /**
     * current screen collision shapes, 
     * this method is for backward capability with jsge@1.4.4
     * recommended to use getRawCollisionShapes()
     * @returns {Array<Array<number>>}
     */
    getCollisionShapes() {
        const collision_shapes = this.#collision_shapes, 
            len = this.#bPointer;

        let bTempArray = [],
            bArray = [];
        
        for (let i = 0; i < len; i++) {
            const element = collision_shapes[i];
            bTempArray.push(element);
            if (((i + 1) % 4) === 0) {
                bArray.push(bTempArray);
                bTempArray = [];
            }
        }
        return bArray;
    }

    /**
     * current screen collision shapes
     * polygon collision shapes from Tiled and Tiled collision shapes layers are merged here
     * each 4 cells, represent a line with coords x1,y1,x2,y2
     * @returns {Float32Array}
     */
    getRawCollisionShapes() {
        return this.#collision_shapes;
    }
    /**
     * Backward capability with jsge before 1.5.9
     * @deprecated
     * getRawCollisionShapes()
     * @returns {Float32Array}
     */
    getRawBoundaries() {
        return this.getRawCollisionShapes();
    }

    /**
     * ellipse collision shapes from Tiled,
     * stored as floatArray, 
     * each 4 cells, represent am ellipse with cords centerX, centerY, radiusX, radiusY
     * @returns {Float32Array}
     */
    getEllipseCollisionShapes() {
        return this.#ellipseCollisionShapes;
    }
    /**
     * Backward capability with jsge before 1.5.9
     * @deprecated
     * getEllipseCollisionShapes()
     * @returns {Float32Array}
     */
    getEllipseBoundaries() {
        return this.getEllipseCollisionShapes();
    }

    /**
     * point collision shapes from Tiled,
     * stored as floatArray, 
     * each 2 cells, represent a point with coords x1,y1
     * @returns {Float32Array}
     */
    getPointCollisionShapes() {
        return this.#pointCollisionShapes;
    }
    /**
     * Backward capability with jsge before 1.5.9
     * @deprecated
     * getPointCollisionShapes()
     * @returns {Float32Array}
     */
    getPointBoundaries() {
        return this.getPointCollisionShapes();
    }
    
    getWholeWorldCollisionShapes() {
        return this.#wholeWorldCollisionShapes;
    }

    /**
     * @deprecated
     * getWholeWorldCollisionShapes()
     */
    getWholeWorldBoundaries() {
        return this.getWholeWorldCollisionShapes();
    }

    getDebugObjectCollisionShapes() {
        return this.#debugObjectCollisionShapes;
    }

    /**
     * @deprecated
     * getDebugObjectCollisionShapes()
     */
    getDebugObjectBoundaries() {
        return this.getDebugObjectCollisionShapes();
    }

    /**
     * @deprecated
     */
    get isWorldBoundariesEnabled() {
        return this.#isWorldCollisionShapesEnabled;
    }
    /**
     * Current canvas dimensions
     * @returns {Array<number>}
     */
    get canvasDimensions() {
        return [this.#viewWidth, this.#viewHeight];
    }

    /**
     * Current game world dimensions
     * @returns {Array<number>}
     */
    get worldDimensions() {
        return [this.#worldWidth, this.#worldHeight];
    }
    
    /**
     * Current word x/y offset
     * @returns {Array<number>}
     */
    get worldOffset() {
        return [this.#xOffset, this.#yOffset];
    }

    /**
     * Current focus point
     * @returns {Array<number>}
     */
    get mapCenter() {
        return [this.#centerX, this.#centerY];
    }

    /**
     * @returns {number}
     */
    get mapRotate() {
        return this.#rotate;
    }

    /**
     * Tiled polygon and Tiled layer collision shapes length
     * @deprecated
     * Use collisionShapesLen()
     * @returns {number}
     */
    get boundariesLen() {
        return this.#bPointer;
    }

    /**
     * Tiled polygon and Tiled layer collision shapes length
     * @returns {number}
     */
    get collisionShapesLen() {
        return this.#bPointer;
    }

    /**
     * Tiled ellipse collision shapes length
     * @returns {number}
     */
    get ellipseBLen() {
        return this.#ePointer;
    }

    /**
     * Tiled point collision shapes length
     * @returns {number}
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
     * Used to remove all render objects,
     * Designed for restart the stage
     */
    cleanUp() {
        this.#renderObjects = [];
        this.#pendingRenderObjects = [];
        this._clearCollisionShapes();
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




//import { Socket } from "socket.io-client";

/**
 * Represents Socket connection
 * 
 * From 1.4.4 disabled by default,
 * to enable, set settings.network.enabled to true
 */
class INetwork extends EventTarget {
    /**
     * @type {Object}
     */
    #systemSettings;
    /**
     * @type {Socket}
     */
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
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _WebGl_WebGlEngine_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./WebGl/WebGlEngine.js */ "./src/base/WebGl/WebGlEngine.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _GameStageData_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./GameStageData.js */ "./src/base/GameStageData.js");
/* harmony import */ var _modules_assetsm_src_AssetsManager_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../modules/assetsm/src/AssetsManager.js */ "./modules/assetsm/src/AssetsManager.js");
/* harmony import */ var _WebGl_ImagesDrawProgram_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./WebGl/ImagesDrawProgram.js */ "./src/base/WebGl/ImagesDrawProgram.js");
/* harmony import */ var _WebGl_PrimitivesDrawProgram_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./WebGl/PrimitivesDrawProgram.js */ "./src/base/WebGl/PrimitivesDrawProgram.js");
/* harmony import */ var _WebGl_ImagesDrawProgramM_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./WebGl/ImagesDrawProgramM.js */ "./src/base/WebGl/ImagesDrawProgramM.js");
/* harmony import */ var _RenderLoop_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./RenderLoop.js */ "./src/base/RenderLoop.js");






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
     * @type {WebGLRenderingContext | null}
     */
    #drawContext;
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
    

    #renderLoopInstance;
    /**
     * @type {boolean}
     */
    #isCollisionShapesPrecalculations = false;

    /**
     * @type {Array<function():Promise<void>>}
     */
    #initPromises = [];
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();
    constructor(systemSettings, iLoader, canvasContainer) {
        const preserveDrawingBuffer = systemSettings.gameOptions.debug.preserveDrawingBuffer;
        let contextOpt = { stencil: true };
        if (preserveDrawingBuffer === true) {
            contextOpt.preserveDrawingBuffer = true;
        }
        this.#canvas = document.createElement("canvas");
        canvasContainer.appendChild(this.#canvas);
        
        this.#drawContext = this.#canvas.getContext("webgl", contextOpt);

        this.#systemSettingsReference = systemSettings;
        this.#loaderReference = iLoader;

        this.#isCollisionShapesPrecalculations = this.systemSettings.gameOptions.render.collisionShapes.wholeWorldPrecalculations;

        this.#webGlEngine = new _WebGl_WebGlEngine_js__WEBPACK_IMPORTED_MODULE_2__.WebGlEngine(this.#drawContext, this.#systemSettingsReference.gameOptions, this.iLoader);
        
        this._registerRenderInit(this.#webGlEngine._initiateJsRender);
        if (this.systemSettings.gameOptions.optimization === _constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.OPTIMIZATION.WEB_ASSEMBLY.NATIVE_WAT ||
            this.systemSettings.gameOptions.optimization === _constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT) {
            this._registerRenderInit(this.#webGlEngine._initiateWasm);
        }

        this._registerRenderInit(this.fixCanvasSize);
        this._registerRenderInit(
            () => this._registerAndCompileWebGlProgram(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES, _WebGl_ImagesDrawProgram_js__WEBPACK_IMPORTED_MODULE_6__.imgVertexShader, _WebGl_ImagesDrawProgram_js__WEBPACK_IMPORTED_MODULE_6__.imgFragmentShader, _WebGl_ImagesDrawProgram_js__WEBPACK_IMPORTED_MODULE_6__.imgUniforms, _WebGl_ImagesDrawProgram_js__WEBPACK_IMPORTED_MODULE_6__.imgAttributes)
        );
        this._registerRenderInit(
            () => this._registerAndCompileWebGlProgram(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES, _WebGl_PrimitivesDrawProgram_js__WEBPACK_IMPORTED_MODULE_7__.primitivesVertexShader, _WebGl_PrimitivesDrawProgram_js__WEBPACK_IMPORTED_MODULE_7__.primitivesFragmentShader, _WebGl_PrimitivesDrawProgram_js__WEBPACK_IMPORTED_MODULE_7__.primitivesUniforms, _WebGl_PrimitivesDrawProgram_js__WEBPACK_IMPORTED_MODULE_7__.primitivesAttributes)
        );
        this._registerRenderInit(
            () => this._registerAndCompileWebGlProgram(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES_M, _WebGl_ImagesDrawProgramM_js__WEBPACK_IMPORTED_MODULE_8__.imgMVertexShader, _WebGl_ImagesDrawProgramM_js__WEBPACK_IMPORTED_MODULE_8__.imgMFragmentShader, _WebGl_ImagesDrawProgramM_js__WEBPACK_IMPORTED_MODULE_8__.imgMUniforms, _WebGl_ImagesDrawProgramM_js__WEBPACK_IMPORTED_MODULE_8__.imgMAttributes)
        );
        this._registerRenderInit(this.#webGlEngine._initWebGlAttributes);
    }

    _webGlEngine() {
        return this.#webGlEngine;
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

    /**
     * 
     * @returns {boolean}
     */
    _isRenderActive() {
        return this.#renderLoopInstance ? this.#renderLoopInstance._isActive : false;
    }

    initiateContext = (stageData) => {
        return Promise.all(this.#initPromises.map(method => method(stageData)));
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
        this.#webGlEngine._registerObjectRender(objectClassName, objectRenderMethod, objectWebGlDrawProgram);
    }

    /****************************
     *  End of Extend functionality
     ****************************/

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

    _createCollisionShapesPrecalculations() {
        //const promises = [];
        //for (const layer of this.#renderLayers) {
        //    promises.push(this.#layerCollisionShapesPrecalculation(layer).catch((err) => {
        //        Exception(ERROR_CODES.UNHANDLED_PREPARE_EXCEPTION, err);
        //    }));
        //}
        //return promises;
    }

    //#clearTileMapPromises() {
    //    this.#bindTileMapPromises = [];
    //}

    /**
     * @ignore
     * @param {GameStageData} stageData 
     */
    _startRender = async (/*time*/stageData) => {
        this.fixCanvasSize();
        this.#currentGameStageData = stageData;
        switch (this.systemSettings.gameOptions.library) {
        case _constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.LIBRARY.WEBGL:
            await this.#prepareViews();
            this.#renderLoopInstance = new _RenderLoop_js__WEBPACK_IMPORTED_MODULE_9__.RenderLoop(this.systemSettings, stageData, this._webGlEngine());
            // delegate render loop events
            this.#renderLoopInstance.addEventListener(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.EVENTS.SYSTEM.RENDER.START, () => this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.EVENTS.SYSTEM.RENDER.START));
            this.#renderLoopInstance.addEventListener(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.EVENTS.SYSTEM.RENDER.END, () => this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.EVENTS.SYSTEM.RENDER.END));

            this.#renderLoopInstance._start();
            break;
        }
    };

    /**
     * @ignore
     */
    _stopRender = () => {
        this.#renderLoopInstance.removeEventListener(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.EVENTS.SYSTEM.RENDER.START, this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.EVENTS.SYSTEM.RENDER.START));
        this.#renderLoopInstance.removeEventListener(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.EVENTS.SYSTEM.RENDER.END, this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.EVENTS.SYSTEM.RENDER.END));

        this.#renderLoopInstance._stop();
        this.#renderLoopInstance = undefined;

    };
    /**
     * 
     * @returns {Promise<void>}
     */
    #prepareViews() {
        return new Promise((resolve, reject) => {
            let viewPromises = [];
            const isCollisionShapesPrecalculations = this.#isCollisionShapesPrecalculations;
            viewPromises.push(this.initiateContext(this.#currentGameStageData));
            if (isCollisionShapesPrecalculations) {
                console.warn("isCollisionShapesPrecalculations() is turned off");
                //for (const view of this.#views.values()) {
                //viewPromises.push(this.#iRender._createCollisionShapesPrecalculations());
                //}
            }
            Promise.allSettled(viewPromises).then((drawingResults) => {
                drawingResults.forEach((result) => {
                    if (result.status === "rejected") {
                        const error = result.reason;
                        (0,_Exception_js__WEBPACK_IMPORTED_MODULE_0__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_1__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, error);
                        reject(error);
                    }
                });
                resolve();
            });
        });
    }
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
/* harmony import */ var _modules_assetsm_src_AssetsManager_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../modules/assetsm/src/AssetsManager.js */ "./modules/assetsm/src/AssetsManager.js");
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
    #iLoader = new _modules_assetsm_src_AssetsManager_js__WEBPACK_IMPORTED_MODULE_5__["default"]();
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
     * @type {Map<string, Object>}
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
        this.#iExtension = new _IExtension_js__WEBPACK_IMPORTED_MODULE_9__.IExtension(this);
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
     * @returns { INetwork | null }
     */
    get iNetwork () {
        return this.#systemServerConnection;
    }

    /**
     * @returns { SystemSettings }
     */
    get systemSettings() {
        return this.#systemSettings;
    }

    /**
     * @returns { ISystemAudio }
     */
    get audio() {
        return this.#systemAudioInterface;
    }

    /**
     * @returns {AssetsManager}
     */
    get iLoader() {
        return this.#iLoader;
    }

    /**
     * @returns {IRender}
     */
    get iRender() {
        return this.#iRender;
    }

    /**
     * @returns {DrawObjectFactory}
     */
    get drawObjectFactory() {
        return this.#drawObjectFactory;
    }

    /**
     * @returns {IExtension}
     */
    get iExtension() {
        return this.#iExtension;
    }
    /**
     * @returns {Map<string, Object>}
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
     * @param {string} gameStageName
     * @param {Object} [options] - options
     */
    startGameStage = (gameStageName, options) => {
        if (this.#registeredStagesReference.has(gameStageName)) {
            if (this.#iRender._isRenderActive() === true) {
                this.#iRender._stopRender();
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.ANOTHER_STAGE_ACTIVE, " Can't start the stage " + gameStageName + " while, another stage is active");
            } else {
                const stage = this.#registeredStagesReference.get(gameStageName),
                    pageData = stage.stageData;
                this.#drawObjectFactory._attachPageData(pageData);
                if (stage.isInitiated === false) {
                    stage._init();
                }
                //stage._attachCanvasToContainer(this.#canvasContainer);
                stage._start(options);
                pageData._processPendingRenderObjects();
                this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.START_PAGE);
                this.#iRender._startRender(pageData);
            }
            
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.VIEW_NOT_EXIST, "Stage " + gameStageName + " is not registered!");
        }
    };

    /**
     * @method
     * @param {string} gameStageName
     */
    stopGameStage = (gameStageName) => {
        if (this.#registeredStagesReference.has(gameStageName)) {
            this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.STOP_PAGE);
            this.drawObjectFactory._detachPageData();
            this.#iRender._stopRender();
            this.#registeredStagesReference.get(gameStageName)._stop();
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.STAGE_NOT_EXIST, "GameStage " + gameStageName + " is not registered!");
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
/* harmony import */ var _modules_assetsm_src_AssetsManager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../modules/assetsm/src/AssetsManager.js */ "./modules/assetsm/src/AssetsManager.js");
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
     * @returns {number}
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

/***/ "./src/base/RenderLoop.js":
/*!********************************!*\
  !*** ./src/base/RenderLoop.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RenderLoop": () => (/* binding */ RenderLoop)
/* harmony export */ });
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _GameStageData_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./GameStageData.js */ "./src/base/GameStageData.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./2d/DrawTiledLayer.js */ "./src/base/2d/DrawTiledLayer.js");
/* harmony import */ var _2d_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./2d/DrawImageObject.js */ "./src/base/2d/DrawImageObject.js");
/* harmony import */ var _2d_DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./2d/DrawCircleObject.js */ "./src/base/2d/DrawCircleObject.js");
/* harmony import */ var _2d_DrawConusObject_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./2d/DrawConusObject.js */ "./src/base/2d/DrawConusObject.js");
/* harmony import */ var _2d_DrawLineObject_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./2d/DrawLineObject.js */ "./src/base/2d/DrawLineObject.js");
/* harmony import */ var _2d_DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./2d/DrawPolygonObject.js */ "./src/base/2d/DrawPolygonObject.js");
/* harmony import */ var _2d_DrawRectObject_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./2d/DrawRectObject.js */ "./src/base/2d/DrawRectObject.js");
/* harmony import */ var _2d_DrawTextObject_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./2d/DrawTextObject.js */ "./src/base/2d/DrawTextObject.js");
/* harmony import */ var _WebGl_WebGlEngine_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./WebGl/WebGlEngine.js */ "./src/base/WebGl/WebGlEngine.js");
/* harmony import */ var _RenderLoopDebug_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./RenderLoopDebug.js */ "./src/base/RenderLoopDebug.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../index.js */ "./src/index.js");


















/**
 * Class represents the render loop,
 * on each time stage start, a new RenderLoop class instance created,
 * after stage stop, RenderLoop stops and its instance removed
 * @see {@link IRender} a part of iRender
 * @hideconstructor
 */
class RenderLoop {
    /**
     * @type {boolean}
     */
    #isActive;
    /**
     * @type {boolean}
     */
    #isCleared;
    /**
     * @type {RenderLoopDebug}
     */
    #renderLoopDebug;
    #fpsAverageCountTimer;
    /**
     * 
     * @type {GameStageData} 
     */
    #stageData;
    /**
     * @type { WebGlEngine }
     */
    #webGlEngine;
    /**
     * 
     * @type {SystemSettings}
     */
    #systemSettings;
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();
    constructor(systemSettings, stageData, WebGlEngine) {
        this.#systemSettings = systemSettings;
        this.#stageData = stageData;
        this.#renderLoopDebug = new _RenderLoopDebug_js__WEBPACK_IMPORTED_MODULE_13__.RenderLoopDebug(this.#systemSettings.gameOptions.render.cyclesTimeCalc.averageFPStime);
        this.#webGlEngine = WebGlEngine;

        this.#webGlEngine._initDrawCallsDebug(this.renderLoopDebug);
        
        if (this.#systemSettings.gameOptions.render.cyclesTimeCalc.check === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.OPTIMIZATION.CYCLE_TIME_CALC.AVERAGES) {
            this.#fpsAverageCountTimer = setInterval(() => this.#countFPSaverage(), this.#systemSettings.gameOptions.render.cyclesTimeCalc.averageFPStime);
        }
    }

    /**
     * @returns { GameStageData }
     */
    get stageData() {
        return this.#stageData;
    }

    /**
     * @returns { RenderLoopDebug }
     */
    get renderLoopDebug() {
        return this.#renderLoopDebug;
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

    _start() {
        this.#isActive = true;
        requestAnimationFrame(this.#runRenderLoop);
    }

    _stop() {
        this.#isActive = false;
        this.#stageData = null;
        this.renderLoopDebug.cleanupTempVars();
        clearInterval(this.#fpsAverageCountTimer);
        //this.#fpsAverageCountTimer = null;
    }

    /**
     * 
     * @param {Number} drawTimestamp - end time of previous frame's rendering 
     */
    #runRenderLoop = (drawTimestamp) => {
        if (!this.#isActive) {
            return;
        }
        
        const currentDrawTime = this.renderLoopDebug.currentDrawTime(drawTimestamp);
        this.renderLoopDebug.prevDrawTime = drawTimestamp;
        
        const timeStart = performance.now(),
            isCyclesTimeCalcCheckCurrent = this.#systemSettings.gameOptions.render.cyclesTimeCalc.check === _constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.OPTIMIZATION.CYCLE_TIME_CALC.CURRENT;
            
        this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.EVENTS.SYSTEM.RENDER.START);
        this.#stageData._clearCollisionShapes();
        this.#clearContext();
        
        this.render().then(() => {
            const currentRenderTime = performance.now() - timeStart,
                //r_time_less = minCycleTime - currentRenderTime,
                wait_time = 0, // нужна ли вообще возможность контролировать время отрисовки?
                cycleTime = currentRenderTime + wait_time;
                
            if (isCyclesTimeCalcCheckCurrent) {
                console.log("current draw take: ", (currentDrawTime), " ms");
                console.log("current render() time: ", currentRenderTime);
                console.log("draw calls: ", this.renderLoopDebug.drawCalls);
                console.log("vertices draw: ", this.renderLoopDebug.verticesDraw);
            } else {
                this.renderLoopDebug.tempRCircleT = currentDrawTime;
                this.renderLoopDebug.incrementTempRCircleTPointer();
            }

            this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.EVENTS.SYSTEM.RENDER.END);

            if (this.#isActive) {
                setTimeout(() => requestAnimationFrame(this.#runRenderLoop), wait_time);
            }
        }).catch((errors) => {
            if (errors.forEach) {
                errors.forEach((err) => {
                    (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, err);
                });
            } else {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_3__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, errors.message);
            }
            this._stop();
        });
    };

    /**
     * @returns {Promise<void>}
     */
    async render() {
        const renderObjects = this.#stageData.renderObjects;
            
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
                if ("hasAnimations" in object && object.hasAnimations) {
                    object._processActiveAnimations();
                }
                const promise = await this.#drawRenderObject(object)
                    .catch((err) => Promise.reject(err));
                renderObjectsPromises[i] = promise;
            }
            if (this.#systemSettings.gameOptions.debug.collisionShapes.drawLayerCollisionShapes) {
                renderObjectsPromises.push(this.#drawCollisionShapesWebGl()
                    .catch((err) => Promise.reject(err))); 
            }
        }
        const bindResults = await Promise.allSettled(renderObjectsPromises);
        bindResults.forEach((result) => {
            if (result.status === "rejected") {
                Promise.reject(result.reason);
                isErrors = true;
                errors.push(result.reason);
            }
        });
            
        this._isCleared = false;
        if (isErrors === false) {
            this.#stageData._processPendingRenderObjects();
            return Promise.resolve();
        } else {
            return Promise.reject(errors);
        }
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
     * @param {string} eventName
     * @param  {...any} eventParams
     */
    emit = (eventName, ...eventParams) => {
        const event = new Event(eventName);
        event.data = [...eventParams];
        this.#emitter.dispatchEvent(event);
    };

    /**
     * @ignore
     * @param {DrawImageObject | DrawCircleObject | DrawConusObject | DrawLineObject | DrawPolygonObject | DrawRectObject | DrawTextObject | DrawTiledLayer} renderObject 
     * @returns {Promise<void>}
     */
    #drawRenderObject(renderObject) {
        return this.#webGlEngine._preRender()
            .then(() => this.#isActive ? this.#webGlEngine._drawRenderObject(renderObject, this.stageData) : Promise.resolve())
            .then((args) => this.#webGlEngine._postRender(args));
    }

    #clearContext() {
        this.#webGlEngine._clearView();
    }

    /**
     * 
     * @returns {Promise<void>}
     */
    #drawCollisionShapesWebGl() {
        return new Promise((resolve) => {
            const b = this.stageData.getRawCollisionShapes(),
                eB = this.stageData.getEllipseCollisionShapes(),
                pB = this.stageData.getPointCollisionShapes(),
                bDebug = this.stageData.getDebugObjectCollisionShapes(),
                len = this.stageData.collisionShapesLen,
                eLen = this.stageData.ellipseBLen,
                pLen = this.stageData.pointBLen,
                bDebugLen = this.#systemSettings.gameOptions.debug.collisionShapes.drawObjectCollisionShapes ? bDebug.length : 0;
        
            if (len)
                this.#webGlEngine._drawLines(b, this.#systemSettings.gameOptions.debug.collisionShapes.color, this.#systemSettings.gameOptions.debug.collisionShapes.width);
            this.renderLoopDebug.incrementDrawCallsCounter();
            if (eLen) {
                //draw ellipse collision shapes
                for (let i = 0; i < eLen; i+=4) {
                    const x = eB[i],
                        y = eB[i+1],
                        radX = eB[i+2],
                        radY = eB[i+3],
                        vertices = _index_js__WEBPACK_IMPORTED_MODULE_14__.utils.calculateEllipseVertices(x, y, radX, radY);
                    this.#webGlEngine._drawPolygon({x: 0, y: 0, vertices, isOffsetTurnedOff: true}, this.stageData);
                    this.renderLoopDebug.incrementDrawCallsCounter();
                    //this.#webGlEngine._drawLines(vertices, this.systemSettings.gameOptions.debug.collisionShapes.color, this.systemSettings.gameOptions.debug.collisionShapes.width);
                }
            }
            if (pLen) {
                //draw point collisionShapes
                for (let i = 0; i < pLen; i+=2) {
                    const x = pB[i],
                        y = pB[i+1],
                        vertices = [x,y, x+1,y+1];

                    this.#webGlEngine._drawLines(vertices, this.#systemSettings.gameOptions.debug.collisionShapes.color, this.#systemSettings.gameOptions.debug.collisionShapes.width);
                    this.renderLoopDebug.incrementDrawCallsCounter();
                }
            }
            if (bDebugLen > 0) {
                this.#webGlEngine._drawLines(bDebug, this.#systemSettings.gameOptions.debug.collisionShapes.color, this.#systemSettings.gameOptions.debug.collisionShapes.width);
            }
            resolve();
        });
    }

    
    /**
     * 
     * @param {DrawTiledLayer} renderLayer 
     * @returns {Promise<void>}
     */
    #layerCollisionShapesPrecalculation(renderLayer) {
        return new Promise((resolve, reject) => {

        });
    }

    #countFPSaverage() {
        const timeLeft = this.#systemSettings.gameOptions.render.cyclesTimeCalc.averageFPStime,
            steps = this.renderLoopDebug.tempRCircleTPointer;
        let fullTime = 0;
        for (let i = 0; i < steps; i++) {
            const timeStep = this.renderLoopDebug.tempRCircleT[i];
            fullTime += timeStep;
        }
        console.log("FPS average for", timeLeft/1000, "sec, is ", (1000 / (fullTime / steps)).toFixed(2));
        console.log("Last loop info:");
        console.log("Webgl draw calls: ", this.renderLoopDebug.drawCalls);
        console.log("Vertices draw: ", this.renderLoopDebug.verticesDraw);
        // cleanup
        this.renderLoopDebug.cleanupTempVars();
    }
}

/***/ }),

/***/ "./src/base/RenderLoopDebug.js":
/*!*************************************!*\
  !*** ./src/base/RenderLoopDebug.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RenderLoopDebug": () => (/* binding */ RenderLoopDebug)
/* harmony export */ });
/**
 * Debug info fro RenderLoop
 * @see {@link RenderLoop} a part of RenderLoop
 * @hideconstructor
 */
class RenderLoopDebug {
    /**
     * @type {number}
     */
    #verticesNum = 0;
    /**
     * @type {number}
     */
    #drawCalls = 0;
    /**
     * @type {number}
     */
    #prevDrawTime = 0;
    /**
     * @type {Float32Array}
     */
    #tempRCircleT;
    /**
     * @type {number}
     */
    #tempRCircleTPointer = 0;
    /**
     * @type {NodeJS.Timeout | null}
     */
    constructor(averageFPStime) {
        this.#tempRCircleT = new Float32Array(averageFPStime);
    }

    get drawCalls() {
        return this.#drawCalls;
    }

    get verticesDraw() {
        return this.#verticesNum;
    }

    /**
     * @returns {Float32Array}
     */
    get tempRCircleT() {
        return this.#tempRCircleT;
    }

    get tempRCircleTPointer() {
        return this.#tempRCircleTPointer;
    }

    /**
     * @param {number} time
     */
    set tempRCircleT(time) {
        this.#tempRCircleT[this.#tempRCircleTPointer] = time;
    }

    set prevDrawTime(drawTime) {
        this.#prevDrawTime = drawTime;
    }

    currentDrawTime(drawTimestamp) {
        return drawTimestamp - this.#prevDrawTime;
    }

    incrementTempRCircleTPointer() {
        this.#tempRCircleTPointer++;
    }

    incrementDrawCallsCounter() {
        this.#drawCalls+=1;
    }

    set verticesDraw(vertices) {
        this.#verticesNum += vertices;
    }

    cleanupDebugInfo() {
        this.#verticesNum = 0;
        this.#drawCalls = 0;
    }

    cleanupDrawCallsCounter() {
        this.#drawCalls = 0;
    }

    cleanupTempVars() {
        this.#tempRCircleT.fill(0);
        this.#tempRCircleTPointer = 0;
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
/* harmony import */ var _ISystem_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ISystem.js */ "./src/base/ISystem.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _design_LoadingStage_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../design/LoadingStage.js */ "./src/design/LoadingStage.js");







const loadingPageName = "loadingPage";
/**
 * A main app class, <br>
 * Holder class for GameStage,<br>
 * can register new GameStages,<br>
 * init and preload data for them,<br>
 */
class System {
    /**
     * @type {Map<string, Object>}
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

        this.#iSystem = new _ISystem_js__WEBPACK_IMPORTED_MODULE_2__.ISystem(iSystemSettings, this.#registeredStages, canvasContainer);

        this.#addPreloadStage();
    }

    /**
     * @returns {ISystem}
     */
    get iSystem() {
        return this.#iSystem;
    }
    
    /**
     * A main factory method for create GameStage instances, <br>
     * register them in a System and call GameStage.register() stage
     * @param {string} screenPageName
     * @param {Object} extendedGameStage - extended GameStage class(not an instance!)
     */
    registerStage(screenPageName, extendedGameStage) {
        if (screenPageName && typeof screenPageName === "string" && screenPageName.trim().length > 0) {
            const stageInstance = new extendedGameStage();
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

    #addPreloadStage() {
        this.registerStage(loadingPageName, _design_LoadingStage_js__WEBPACK_IMPORTED_MODULE_4__.LoadingStage);

        this.#iSystem.iLoader.addEventListener("loadstart", this.#loadStart);
        this.#iSystem.iLoader.addEventListener("progress", this.#loadProgress);
        this.#iSystem.iLoader.addEventListener("load", this.#loadComplete);
    }

    #loadStart = (event) => {
        this.#iSystem.startGameStage(loadingPageName, { total: event.total });
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
     * @type {Array}
     */
    #vectors;
    /**
     * @type {Array}
     */
    #textures;
    /**
     * @type {Int32Array}
     */
    #collisionShapesTempIndexes;
    /**
     * @type {number}
     */
    #bufferSize = 0;
    /**
     * @param {number} cells 
     **/
    #cells = 0;
    /**
     * @param {number} nonEmptyCells 
     */
    #nonEmptyCells = 0;
    constructor(cells, nonEmptyCells) {
        this._initiateStorageData(cells, nonEmptyCells);
    }

    get cells() {
        return this.#cells;
    }

    get vectors() {
        return this.#vectors;
    }

    get textures() {
        return this.#textures;
    }

    get _cTempIndexes() {
        return this.#collisionShapesTempIndexes;
    }

    get bufferSize() {
        return this.#bufferSize;
    }

    _initiateStorageData(cellsSize, emptyCells) {
        this.#cells = cellsSize;
        this.#nonEmptyCells = emptyCells ? emptyCells : cellsSize;
        if (this.#nonEmptyCells > cellsSize) {
            this.#nonEmptyCells  = cellsSize;
        }
        this.#bufferSize = this.#nonEmptyCells * 12;

        this.#vectors = new Array(this.#bufferSize);
        this.#textures = new Array(this.#bufferSize);
        this.#collisionShapesTempIndexes = new Int32Array(this.#cells * 4);
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

/***/ "./src/base/WebGl/ImagesDrawProgramM.js":
/*!**********************************************!*\
  !*** ./src/base/WebGl/ImagesDrawProgramM.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "imgMAttributes": () => (/* binding */ imgMAttributes),
/* harmony export */   "imgMFragmentShader": () => (/* binding */ imgMFragmentShader),
/* harmony export */   "imgMUniforms": () => (/* binding */ imgMUniforms),
/* harmony export */   "imgMVertexShader": () => (/* binding */ imgMVertexShader)
/* harmony export */ });
const imgMVertexShader =  `
    attribute vec2 a_texCoord;

    attribute vec2 a_position;

    uniform vec2 u_resolution;

    varying vec2 v_texCoord;

    void main(void) {
        vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_texCoord = a_texCoord;
    }`;

const imgMFragmentShader = `
    precision mediump float;

    uniform sampler2D u_image;

    //texCoords passed in from the vertex shader
    varying vec2 v_texCoord;
    void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        gl_FragColor = color;
    }`;
const imgMUniforms = ["u_resolution", "u_image"];
const imgMAttributes = ["a_position", "a_texCoord"];



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
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _GameStageData_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../GameStageData.js */ "./src/base/GameStageData.js");
/* harmony import */ var _Temp_ImageTempStorage_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Temp/ImageTempStorage.js */ "./src/base/Temp/ImageTempStorage.js");
/* harmony import */ var _2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../2d/DrawTiledLayer.js */ "./src/base/2d/DrawTiledLayer.js");
/* harmony import */ var _2d_DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../2d/DrawCircleObject.js */ "./src/base/2d/DrawCircleObject.js");
/* harmony import */ var _2d_DrawConusObject_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../2d/DrawConusObject.js */ "./src/base/2d/DrawConusObject.js");
/* harmony import */ var _2d_DrawLineObject_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../2d/DrawLineObject.js */ "./src/base/2d/DrawLineObject.js");
/* harmony import */ var _2d_DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../2d/DrawPolygonObject.js */ "./src/base/2d/DrawPolygonObject.js");
/* harmony import */ var _2d_DrawRectObject_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../2d/DrawRectObject.js */ "./src/base/2d/DrawRectObject.js");
/* harmony import */ var _2d_DrawTextObject_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../2d/DrawTextObject.js */ "./src/base/2d/DrawTextObject.js");
/* harmony import */ var _modules_assetsm_src_AssetsManager_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../modules/assetsm/src/AssetsManager.js */ "./modules/assetsm/src/AssetsManager.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../index.js */ "./src/index.js");

















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
     * @type {AssetsManager}
     */
    #loaderReference;
    /**
     * @type {WebGLBuffer | null}
     */
    #positionBuffer;
    /**
     * @type {WebGLBuffer | null}
     */
    #texCoordBuffer;
    /**
     * @type {Array<number> | null}
     */
    #currentVertices = null;
    /**
     * @type {Array<number> | null}
     */
    #currentTextures = null;
    /**
     * @type {Map<string, WebGLProgram>}
     */
    #registeredWebGlPrograms = new Map();
    /**
     * @type {Map<string, Object<string, WebGLUniformLocation | number>>}
     */
    #webGlProgramsVarsLocations = new Map();
    /**
     * @type {Map<string, {method: Function, webglProgramName: string}>}
     */
    #registeredRenderObjects = new Map();

    /**
     * @type {boolean}
     */
    #loopDebug;

    constructor(context, gameOptions, iLoader) {
        if (!context || !(context instanceof WebGLRenderingContext)) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.UNEXPECTED_INPUT_PARAMS, " context parameter should be specified and equal to WebGLRenderingContext");
        }
        
        this.#gl = context;
        this.#gameOptions = gameOptions;
        this.#loaderReference = iLoader;
        this.#debug = gameOptions.debug.checkWebGlErrors;
        this.#MAX_TEXTURES = context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS);
        this.#positionBuffer = context.createBuffer();
        this.#texCoordBuffer = context.createBuffer();

        this._registerObjectRender(_2d_DrawTextObject_js__WEBPACK_IMPORTED_MODULE_11__.DrawTextObject.name, this._bindText, _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES_M);
        this._registerObjectRender(_2d_DrawRectObject_js__WEBPACK_IMPORTED_MODULE_10__.DrawRectObject.name, this._bindPrimitives, _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(_2d_DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_9__.DrawPolygonObject.name, this._bindPrimitives, _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(_2d_DrawCircleObject_js__WEBPACK_IMPORTED_MODULE_6__.DrawCircleObject.name, this._bindConus, _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(_2d_DrawConusObject_js__WEBPACK_IMPORTED_MODULE_7__.DrawConusObject.name, this._bindConus, _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(_2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_5__.DrawTiledLayer.name, this._bindTileImages, _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES_M);
        this._registerObjectRender(_2d_DrawLineObject_js__WEBPACK_IMPORTED_MODULE_8__.DrawLineObject.name, this._bindLine, _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(_constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.IMAGE, this._bindImage, _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES_M);
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
            const tileLayers = stageData.getObjectsByInstance(_2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_5__.DrawTiledLayer),
                [ settingsWorldWidth, settingsWorldHeight ] = stageData.worldDimensions;

            // count max possible collisionShapes sizes
            let maxBSize = 0,
                maxESize = 0,
                maxPSize = 0,
                maxWorldW = 0,
                maxWorldH = 0;

            tileLayers.forEach(tiledLayer => {
                const setCollisionShapes = tiledLayer.setCollisionShapes,
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
                        
                    const polygonBondMax = layerData.polygonCollisionShapesLen,
                        ellipseBondMax = layerData.ellipseCollisionShapesLen,
                        pointBondMax = layerData.pointCollisionShapesLen; 
    
                    if (maxWorldW < worldW) {
                        maxWorldW = worldW;
                    }
                    if (maxWorldH < worldH) {
                        maxWorldH = worldH;
                    }
                    
                    if (setCollisionShapes) {
                        maxBSize += polygonBondMax;
                        maxESize += ellipseBondMax;
                        maxPSize += pointBondMax;
    
                        // collisionShapes cleanups every draw cycles, we need to set world collisionShapes again
                        
                    }
                }
            });

            if (maxWorldW !== 0 && maxWorldH !== 0 && (maxWorldW !== settingsWorldWidth || maxWorldH !== settingsWorldHeight)) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                stageData._setWorldDimensions(maxWorldW, maxWorldH);
            }

            if (this.#gameOptions.render.collisionShapes.mapCollisionShapesEnabled) {
                maxBSize+=16; //4 sides * 4 cords x1,y1,x2,y,2
            }
            stageData._setMaxCollisionShapesSize(maxBSize, maxESize, maxPSize);
            stageData._initiateCollisionShapesData();

            resolve(true);
        });

    };
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

    _initDrawCallsDebug(debugObjReference) {
        this.#loopDebug = debugObjReference;
    }

    /**
     * 
     * @returns {void}
     */
    _clearView() {
        const gl = this.#gl;
        this.#loopDebug.cleanupDebugInfo();
        //cleanup buffer, is it required?
        //gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.clearColor(0, 0, 0, 0);// shouldn't be gl.clearColor(0, 0, 0, 1); ?
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    }
    
    /**
     * 
     * @returns {Promise<any>}
     */
    _render(verticesNumber, primitiveType, offset = 0) {
        this.#gl.drawArrays(primitiveType, offset, verticesNumber);
        // set blend to default
        return Promise.resolve(verticesNumber);
    }

    /**
     * 
     * @returns {Promise<void>}
     */
    _preRender() {
        return new Promise((resolve, reject) => {
            const gl = this.#gl,
                err = this.#debug ? gl.getError() : 0;
            if (err !== 0) {
                console.error(err);
                throw new Error("Error num: " + err);
            } else {
                resolve();
            }
        });
    }

    /**
     * 
     * @returns {Promise<void>}
     */
    _postRender(inputData) {
        let verticesNumber = inputData;

        // A workaround for backward capability in 1.5.n
        if (Array.isArray(verticesNumber)) {
            const [vertices, primitiveType] = inputData;
            
            this.#gl.drawArrays(primitiveType, 0, vertices);
            verticesNumber = vertices;
        }

        return new Promise((resolve, reject) => {
            const gl = this.#gl;

            if (verticesNumber !== 0) {
                this.#loopDebug.incrementDrawCallsCounter();
                this.#loopDebug.verticesDraw = verticesNumber;
            }

            gl.stencilFunc(gl.ALWAYS, 1, 0xFF);

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
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, "#compileShader(vertexShaderSource) is null");
            }

            const compFragmentShader = this.#compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
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
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, "Couldn't compile webGl program. \n\n" + info);
            }
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, `gl.createShader(${shaderType}) is null`);
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
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.RECTANGLE:
            this.#setSingleRectangle(renderObject.width, renderObject.height);
            verticesNumber += 6;
            break;
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.TEXT:
            break;
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.CIRCLE: {
            const coords = renderObject.vertices;
            gl.bufferData(gl.ARRAY_BUFFER, 
                new Float32Array(coords), gl.STATIC_DRAW);
            verticesNumber += coords.length / 2;
            break;
        }
        case _constants_js__WEBPACK_IMPORTED_MODULE_0__.DRAW_TYPE.POLYGON: {
            const triangles = this.#triangulatePolygon(renderObject.vertices);
            this.#bindPolygon(triangles);
            const len = triangles.length;
            if (len % 3 !== 0) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, `polygons ${renderObject.id}, vertices are not correct, skip drawing`);
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
        return this._render(verticesNumber, gl.TRIANGLES);
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
        
        return this._render(verticesNumber, gl.TRIANGLE_FAN);
    };

    _bindText = (renderObject, gl, pageData, program, vars) => {
        const { u_translation: translationLocation,
            u_rotation: rotationRotation,
            u_scale: scaleLocation,
            u_resolution: resolutionUniformLocation,
            a_position: positionAttributeLocation,
            a_texCoord: texCoordLocation,
            u_image: u_imageLocation } = vars;

        const {width:boxWidth, height:boxHeight} = renderObject.collisionShapes,
            image_name = renderObject.text,
            [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset - boxHeight,
            blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];

        const rotation = renderObject.rotation || 0,
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
            textureStorage = new _Temp_ImageTempStorage_js__WEBPACK_IMPORTED_MODULE_4__.ImageTempStorage(gl.createTexture());
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
        return this._render(verticesNumber, gl.TRIANGLES);
        
    };

    _bindImage = (renderObject, gl, pageData, program, vars) => {
        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset;

        if (renderObject.vertices && this.#gameOptions.debug.collisionShapes.drawObjectCollisionShapes) {
            pageData._enableDebugObjectCollisionShapes();
            pageData._addImageDebugCollisionShapes(_index_js__WEBPACK_IMPORTED_MODULE_13__.utils.calculateLinesVertices(x, y, renderObject.rotation, renderObject.vertices));
        }
        
        const {
            u_resolution: resolutionUniformLocation,
            a_position: positionAttributeLocation,
            a_texCoord: texCoordLocation,
            u_image: u_imageLocation } = vars;

        if (!renderObject.image) {
            const image = this.#loaderReference.getImage(renderObject.key);
            if (!image) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CANT_GET_THE_IMAGE, "iLoader can't get the image with key: " + renderObject.key);
            } else {
                renderObject.image = image;
            }
        }
        const atlasImage = renderObject.image,
              animationIndex = renderObject.imageIndex,
              shapeMaskId = renderObject._maskId,
              spacing = renderObject.spacing,
              margin = renderObject.margin,
              blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.ONE, gl.ONE_MINUS_SRC_ALPHA],
              scale = [1, 1];
        
        let imageX = margin,
            imageY = margin,
            colNum = 0,
            rowNum = 0;

        if (animationIndex !== 0) {
            const imageColsNumber = (atlasImage.width + spacing - (2*margin)) / (renderObject.width + spacing);
            colNum = animationIndex % imageColsNumber;
            rowNum = Math.floor(animationIndex / imageColsNumber);
            imageX = colNum * renderObject.width + (colNum * spacing) + margin,
            imageY = rowNum * renderObject.height + (rowNum * spacing) + margin;
        }

        // transform, scale and rotate should be done in js side
        //gl.uniform2f(translationLocation, x, y);
        //gl.uniform2f(scaleLocation, scale[0], scale[1]);
        //gl.uniform1f(rotationRotation, renderObject.rotation);
        // multiple matrices:
        const c = Math.cos(renderObject.rotation),
              s = Math.sin(renderObject.rotation),
              translationMatrix = [
                  1, 0, x,
                  0, 1, y,
                  0, 0, 1],
              rotationMatrix = [
                  c, -s, 0,
                  s, c, 0,
                  0, 0, 1
              ],
              scaleMatrix = [
                  scale[0], 0, 0,
                  0, scale[1], 0,
                  0, 0, 1
              ];
        const matMultiply = _index_js__WEBPACK_IMPORTED_MODULE_13__.utils.mat3Multiply(_index_js__WEBPACK_IMPORTED_MODULE_13__.utils.mat3Multiply(translationMatrix, rotationMatrix), scaleMatrix);

        const posX = 0 - renderObject.width / 2,
              posY = 0 - renderObject.height / 2;

        const vecX1 = posX,
              vecY1 = posY,
              vecX2 = vecX1 + renderObject.width,
              vecY2 = vecY1 + renderObject.height,
              texX1 = 1 / atlasImage.width * imageX,
              texY1 = 1 / atlasImage.height * imageY,
              texX2 = texX1 + (1 / atlasImage.width * renderObject.width),
              texY2 = texY1 + (1 / atlasImage.height * renderObject.height);
        //console.log("mat1: ", matMult1);
        //console.log("mat2: ", matMult2);
        //console.log("x1y1: ", x1y1);
        const vectorsD =  [
            vecX1, vecY1,
            vecX2, vecY1,
            vecX1, vecY2,
            vecX1, vecY2,
            vecX2, vecY1,
            vecX2, vecY2
        ];
        const vectors = _index_js__WEBPACK_IMPORTED_MODULE_13__.utils.mat3MultiplyPosCoords(matMultiply, vectorsD),
        textures = [
            texX1, texY1,
            texX2, texY1,
            texX1, texY2,
            texX1, texY2,
            texX2, texY1,
            texX2, texY2
        ];
        
        //vec2 position = (u_transformMat * vec3(a_position, 1)).xy;
        //console.log("translation x: ", x, " y: ", y);
        //console.log("scale x: ", scale[0], " y: ", scale[1]);
        //console.log("rotation: ", renderObject.rotation);
        // Determine could we merge next drawObject or not
        // 1. Find next object
        const nextObject = this.getNextRenderObject(renderObject, pageData);
        // 2. Is it have same texture and draw program?
        if (nextObject && this._canImageObjectsMerge(renderObject, nextObject)) {
            //
            if (this.#currentVertices === null) {
                this.#currentVertices = vectors;
                this.#currentTextures = textures;
                return Promise.resolve(0);
            } else {
                this.#currentVertices.push(...vectors);
                this.#currentTextures.push(...textures);
                return Promise.resolve(0);
            }
        } else {
            
            gl.useProgram(program);
            // set the resolution
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            // bind data and call draw
            if (this.#currentVertices === null) {
                this.#currentVertices = vectors;
                this.#currentTextures = textures;
            } else {
                this.#currentVertices.push(...vectors);
                this.#currentTextures.push(...textures);
            }
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#currentVertices), gl.STATIC_DRAW);

            const verticesNumber = this.#currentVertices.length / 2;
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
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#currentTextures), gl.STATIC_DRAW);

            gl.enableVertexAttribArray(texCoordLocation);
            gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

            let textureStorage = renderObject._textureStorage;
            if (!textureStorage) {
                textureStorage = new _Temp_ImageTempStorage_js__WEBPACK_IMPORTED_MODULE_4__.ImageTempStorage(gl.createTexture());
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
            this.#currentVertices = null;
            this.#currentTextures = null;
            return this._render(verticesNumber, gl.TRIANGLES);
        }
    };

    /**
     * 
     * @param {*} obj1 
     * @param {*} obj2
     * @returns {boolean} 
     */
    _canImageObjectsMerge = (obj1, obj2) => {
        const registeredO1 = this.#registeredRenderObjects.get(obj1.constructor.name) || this.#registeredRenderObjects.get(obj1.type),
            registeredO2 = this.#registeredRenderObjects.get(obj2.constructor.name) || this.#registeredRenderObjects.get(obj2.type);
        if ((registeredO1.webglProgramName === registeredO2.webglProgramName)
            && (obj1.type === obj2.type)
            && (obj1.image === obj2.image)
            && (obj2.isRemoved === false)) {
                return true;
        } else {
            return false;
        }
    }

    /**
     * 
     * @param {*} obj1 
     * @param {*} obj2 
     * @returns {boolean}
     */
    _canMergeNextTileObject = (obj1, obj2) => {
        if ((obj2 instanceof _2d_DrawTiledLayer_js__WEBPACK_IMPORTED_MODULE_5__.DrawTiledLayer) 
            && (obj1.tilesetImages.length === 1) 
            && (obj2.tilesetImages.length === 1) 
            && (obj1.tilesetImages[0] === obj2.tilesetImages[0])
            && (obj2.isRemoved === false)) {
                return true;
        } else {
            return false;
        }
    }

    _canTextBeMerged = (obj1, obj2) => {
        const registeredO1 = this.#registeredRenderObjects.get(obj1.constructor.name) || this.#registeredRenderObjects.get(obj1.type),
            registeredO2 = this.#registeredRenderObjects.get(obj2.constructor.name) || this.#registeredRenderObjects.get(obj2.type);
        if ((registeredO1.webglProgramName === registeredO2.webglProgramName) 
            && (obj1.type === obj2.type)
            && (obj2.isRemoved === false)) {
                return true;
        } else {
            return false;
        }
    }
    _bindTileImages = async(renderLayer, gl, pageData, program, vars) => {
        const { u_translation: translationLocation,
            u_rotation: rotationRotation,
            u_scale: scaleLocation,
            u_resolution: resolutionUniformLocation,
            a_position: positionAttributeLocation,
            a_texCoord: texCoordLocation,
            u_image: u_imageLocation } = vars;

        gl.useProgram(program);
        /**
         * @type {Array<any> | null}
         */
        let renderLayerData = null;
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
              rotation = renderLayer.rotation || 0,
              drawMask = ["ONE", "ONE_MINUS_SRC_ALPHA"],
              shapeMaskId = renderLayer._maskId;

        /*
        const c = Math.cos(renderLayer.rotation || 0),
              s = Math.sin(renderLayer.rotation || 0),
              translationMatrix = [
                  1, 0, translation[0],
                  0, 1, translation[1],
                  0, 0, 1],
              rotationMatrix = [
                  c, -s, 0,
                  s, c, 0,
                  0, 0, 1
              ],
              scaleMatrix = [
                  scale[0], 0, 0,
                  0, scale[1], 0,
                  0, 0, 1
              ];
        const matMultiply = utils.mat3Multiply(utils.mat3Multiply(translationMatrix, rotationMatrix), scaleMatrix);
        for (let i = 0; i < renderLayerData.length; i++) {
            renderLayerData[i][0] = utils.mat3MultiplyPosCoords(matMultiply, renderLayerData[i][0]);
        }*/
        //console.log("mat1: ", matMult1);
        //console.log("mat2: ", matMult2);
        /*
        const x1y1 = utils.mat3MultiplyVector(matMultiply, [vecX1, vecY1, 1]),
              x2y1 = utils.mat3MultiplyVector(matMultiply, [vecX2, vecY1, 1]),
              x1y2 = utils.mat3MultiplyVector(matMultiply, [vecX1, vecY2, 1]),
              x2y2 = utils.mat3MultiplyVector(matMultiply, [vecX2, vecY2, 1]);
        */
        const nextObject = this.getNextRenderObject(renderLayer, pageData);
              
        if (this._canMergeNextTileObject(renderLayer, nextObject)) {
            if (this.#currentVertices === null) {
                this.#currentVertices = renderLayerData[0][0];
                this.#currentTextures = renderLayerData[0][1];
                return Promise.resolve(0);
            } else {
                this.#currentVertices.push(...renderLayerData[0][0]);
                this.#currentTextures.push(...renderLayerData[0][1]);
                return Promise.resolve(0);
            }
        } else {
            let verticesNumber = 0,
                isTextureBind = false,
                renderLayerDataLen = renderLayerData.length;
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.enableVertexAttribArray(texCoordLocation);

            // set the resolution
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            //gl.uniform2f(translationLocation,translation[0], translation[1]);
            //gl.uniform2f(scaleLocation, scale[0], scale[1]);
            //gl.uniform1f(rotationRotation, rotation);

            // MULTIPLE_IMAGE_TILESET drawing, no merging possible
            if (renderLayerDataLen > 1) {
                for (let i = 0; i < renderLayerDataLen; i++) {
                    const data = renderLayerData[i],
                        vectors = data[0],
                        textures = data[1],
                        image_name = data[2],
                        image = data[3];
                    // if layer use multiple tilesets
                    // the issue is: when we add some layer data to the temp arrays, and then
                    // process empty layer, it actually skips the draw with this check
                    if (vectors.length > 0 && textures.length > 0) {
                        // need to have additional draw call for each new texture added
                        // probably it could be combined in one draw call if multiple textures 
                        // could be used in one draw call
                        if (isTextureBind) {
                            await this._render(verticesNumber, gl.TRIANGLES);
                        }
                        
                        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vectors), gl.STATIC_DRAW);
    
                        //Tell the attribute how to get data out of positionBuffer
                        const size = 2,
                            type = gl.FLOAT, // data is 32bit floats
                            normalize = false,
                            stride = 0, // move forward size * sizeof(type) each iteration to get next position
                            offset = 0;  // verticesNumber * 4; // start of beginning of the buffer
                        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    
                        //textures buffer
                        gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);
    
                        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, offset);
    
                        let textureStorage = renderLayer._textureStorages[i];
                        
                        if (!textureStorage) {
                            textureStorage = new _Temp_ImageTempStorage_js__WEBPACK_IMPORTED_MODULE_4__.ImageTempStorage(gl.createTexture(), i);
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
            // Single image tileset draw, with merging
            } else {
                const data = renderLayerData[0],
                    vectors = data[0],
                    textures = data[1],
                    image_name = data[2],
                    image = data[3];
                // if layer use multiple tilesets
                // the issue is: when we add some layer data to the temp arrays, and then
                // process empty layer, it actually skips the draw with this check
                if (this.#currentVertices === null) {
                    this.#currentVertices = vectors;
                    this.#currentTextures = textures;
                } else {
                    this.#currentVertices.push(...vectors);
                    this.#currentTextures.push(...textures);
                }
                
                gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#currentVertices), gl.STATIC_DRAW);

                //Tell the attribute how to get data out of positionBuffer
                const size = 2,
                    type = gl.FLOAT, // data is 32bit floats
                    normalize = false,
                    stride = 0, // move forward size * sizeof(type) each iteration to get next position
                    offset = 0;  // verticesNumber * 4; // start of beginning of the buffer
                gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

                //textures buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#currentTextures), gl.STATIC_DRAW);

                gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, offset);

                let textureStorage = renderLayer._textureStorages[0];
                
                if (!textureStorage) {
                    textureStorage = new _Temp_ImageTempStorage_js__WEBPACK_IMPORTED_MODULE_4__.ImageTempStorage(gl.createTexture(), 0);
                    renderLayer._setTextureStorage(0, textureStorage);
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
                
                verticesNumber = this.#currentVertices.length / 2;
                if (shapeMaskId) {
                    gl.stencilFunc(gl.EQUAL, shapeMaskId, 0xFF);
                }
                this.#currentVertices = null;
                this.#currentTextures = null;
            }
            
            renderLayerData = null;
            return this._render(verticesNumber, gl.TRIANGLES);
        }
    };

    _drawPolygon(renderObject, pageData) {
        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset,
            rotation = renderObject.rotation || 0,
            vertices = renderObject.vertices,
            color =  this.#gameOptions.debug.collisionShapes.color;
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
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, "polygon collision shapes vertices are not correct, skip drawing");
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
            lineWidth = this.#gameOptions.debug.collisionShapes.width;
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

        return this._render(0, gl.LINES);
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
     * @ignore
     * @param {string} objectType - object name registered to DrawObjectFactory | object type registered to DrawObjectFactory
     * @param {function(renderObject, gl, pageData, program, vars):Promise<any>} objectRenderMethod - should be promise based returns vertices number and draw program
     * @param {string=} objectWebGlDrawProgram 
     */
    _registerObjectRender(objectType, objectRenderMethod, objectWebGlDrawProgram) {
        this.#registeredRenderObjects.set(objectType, {method: objectRenderMethod, webglProgramName: objectWebGlDrawProgram});
    }

    _drawRenderObject(renderObject, pageData) {
        const name = renderObject.constructor.name,
            registeredRenderObject = this.#registeredRenderObjects.get(name) || this.#registeredRenderObjects.get(renderObject.type);
        if (registeredRenderObject) {
            const name = registeredRenderObject.webglProgramName,
                program = name ? this.getProgram(name) : null,
                vars = name ? this.getProgramVarLocations(name) : null;

            return registeredRenderObject.method(renderObject, this.#gl, pageData, program, vars);
        } else {
            console.warn("no registered draw object method for " + name + " skip draw");
            return Promise.resolve();
        }
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
                collisionShapesCalculations = this.#gameOptions.render.collisionShapes.realtimeCalculations,
                setCollisionShapes = renderLayer.setCollisionShapes,
                tileImagesData = [];

            if (!layerData) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }

            if (this.#gameOptions.render.collisionShapes.mapCollisionShapesEnabled) {
                pageData._setMapCollisionShapes();
            }
            
            for (let i = 0; i < tilesets.length; i++) {
                
                const tilesetData = tilesets[i],
                    firstgid = tilesets[i].firstgid,
                    nextTileset = tilesets[i + 1],
                    nextgid = nextTileset ? nextTileset.firstgid : 1_000_000_000, // a workaround to avoid multiple conditions
                    tilesetwidth = tilesetData.tilewidth,
                    tilesetheight = tilesetData.tileheight,
                    tileoffsetX = tilesetData.tileoffset ? tilesetData.tileoffset.x : 0,
                    tileoffsetY = tilesetData.tileoffset ? tilesetData.tileoffset.y : 0,
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
                    screenCells = screenRows * screenCols,
                    skipColsRight = layerCols - screenCols - skipColsLeft,
                    cellSpacing = typeof tilesetData.spacing === "number" ? tilesetData.spacing : 0,
                    cellMargin = typeof tilesetData.margin === "number" ? tilesetData.margin : 0,
                    hasAnimations = tilesetData._hasAnimations;
                    //console.log("non empty: ", layerData.nonEmptyCells);
                    // additional property which is set in DrawTiledLayer
                const hasCollisionShapes = tilesetData._hasCollisionShapes,
                    tilesetCollisionShapes = tilesetData._collisionShapes,
                    layerTilesetData = tilesets[i]._temp;

                if (layerTilesetData.cells !== screenCells) {
                    layerTilesetData._initiateStorageData(screenCells);
                }
                let v = layerTilesetData.vectors,
                    t = layerTilesetData.textures,
                    filledSize = 0;
                    
                //v.fill(0);
                //t.fill(0);
                v = [];
                t = [];
                let collisionShapesRowsIndexes = layerTilesetData._cTempIndexes;
                const fullRowCellsNum = screenCols * 4;
                
                let mapIndex = skipRowsTop * layerCols;
                for (let row = 0; row < screenRows; row++) {
                    mapIndex += skipColsLeft;
                    for (let col = 0; col < screenCols; col++) {
                        let tile = layerData.data[mapIndex];

                        if ((tile >= firstgid) && (tile < nextgid)) {
                            const mapPosX = col * dtwidth - moduleLeft + tileoffsetX,
                                // this fix is used to draw items with height different that the actual tilecell height
                                posYFix = tilesetheight - dtheight,
                                mapPosY = row * dtheight - posYFix - moduloTop + tileoffsetY;

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
                                atlasPosX = colNum * tilesetwidth + (colNum * cellSpacing) + cellMargin,
                                atlasPosY = rowNum * tilesetheight + (rowNum * cellSpacing) + cellMargin,
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
                        
                            if (setCollisionShapes) {
                                // if collision shape is set in tilesetData
                                let isCollisionShapesPreset = false;
                                if (hasCollisionShapes && tilesetCollisionShapes.size > 0) {
                                    const tilesetCollisionShape = tilesetCollisionShapes.get(tile);
                                    if (tilesetCollisionShape) {
                                        isCollisionShapesPreset = true;
                                        const objectGroup = tilesetCollisionShape,
                                            objects = objectGroup.objects;
                                            
                                        objects.forEach((object) => {
                                            const baseX = mapPosX + object.x, 
                                                baseY = mapPosY + object.y,
                                                rotation = object.rotation;
                                            if (rotation !== 0) {
                                                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)("tilesetData.tiles.rotation property is not supported yet");
                                            }
                                            if (object.polygon) {
                                                object.polygon.forEach(
                                                    (point, idx) => {
                                                        const next = object.polygon[idx + 1];
                                                        if (next) {
                                                            pageData._addCollisionShapeLine(point.x + baseX, point.y + baseY, next.x + baseX, next.y + baseY);
                                                        } else {
                                                            // last point -> link to the first
                                                            const first = object.polygon[0];
                                                            pageData._addCollisionShapeLine(point.x + baseX, point.y + baseY, first.x + baseX, first.y + baseY);
                                                        }
                                                    });
                                            } else if (object.point) {
                                                // x/y coordinate
                                                pageData._addPointCollisionShape(baseX, baseY);
                                            } else if (object.ellipse) {
                                                const radX = object.width / 2,
                                                    radY = object.height / 2;
                                                    
                                                pageData._addEllipseCollisionShape(baseX + radX, baseY + radY, radX, radY);
                                            } else {
                                                // object is rect
                                                const width = object.width,
                                                    height = object.height,
                                                    x2 = width + baseX,
                                                    y2 = height + baseY;

                                                //collisionShapes.push([baseX, baseY, x2, baseY]);
                                                pageData._addCollisionShapeLine(baseX, baseY, x2, baseY);

                                                //collisionShapes.push([x2, baseY, x2, y2]);
                                                pageData._addCollisionShapeLine(x2, baseY, x2, y2);

                                                //collisionShapes.push([x2, y2, baseX, y2]);
                                                pageData._addCollisionShapeLine(x2, y2, baseX, y2);

                                                //collisionShapes.push([baseX, y2, baseX, baseY]);
                                                pageData._addCollisionShapeLine(baseX, y2, baseX, baseY);
                                            }
                                        });
                                    }

                                // extract rect collsiion shape for the whole tile
                                }
                                if (isCollisionShapesPreset === false) {
                                    const collisionShapes = pageData.getRawCollisionShapes();

                                    let rightLine = [ mapPosX + tilesetwidth, mapPosY, mapPosX + tilesetwidth, mapPosY + tilesetheight ],
                                        bottomLine = [ mapPosX + tilesetwidth, mapPosY + tilesetheight, mapPosX, mapPosY + tilesetheight ],
                                        topLine = [ mapPosX, mapPosY, mapPosX + tilesetwidth, mapPosY],
                                        leftLine = [ mapPosX, mapPosY + tilesetheight, mapPosX, mapPosY ];
                                    
                                    // top cell7
                                    if (row !== 0) {
                                        const topCellFirstIndex =  (row - 1) * fullRowCellsNum + (col * 4),
                                            bottomTopLeftFirstIndex = collisionShapesRowsIndexes[topCellFirstIndex + INDEX_BOTTOM_LINE];
                                        if (bottomTopLeftFirstIndex) {
                                            //remove double lines from top
                                            const bottomTopCellX1 = collisionShapes[bottomTopLeftFirstIndex];
                                            if (bottomTopCellX1) {
                                                const bottomTopCellY1 = collisionShapes[bottomTopLeftFirstIndex + INDEX_Y1],
                                                    bottomTopCellX2 = collisionShapes[bottomTopLeftFirstIndex + INDEX_X2],
                                                    bottomTopCellY2 = collisionShapes[bottomTopLeftFirstIndex + INDEX_Y2],
                                                    topX1 = topLine[INDEX_X1],
                                                    topY1 = topLine[INDEX_Y1],
                                                    topX2 = topLine[INDEX_X2],
                                                    topY2 = topLine[INDEX_Y2];
                                                
                                                if (topX1 === bottomTopCellX2 && topY1 === bottomTopCellY2 &&
                                                    topX2 === bottomTopCellX1 && topY2 === bottomTopCellY1) {
                                                    pageData._removeCollisionShapeLine(bottomTopLeftFirstIndex);
                                                    topLine = undefined;
                                                }
                                            }

                                            // merge line from top right
                                            const rightTopRightFirstIndex = collisionShapesRowsIndexes[ topCellFirstIndex + INDEX_RIGHT_LINE],
                                                rightTopCellX1 = collisionShapes[rightTopRightFirstIndex];
                                            if (rightTopCellX1) {
                                                const rightTopCellY1 = collisionShapes[rightTopRightFirstIndex + INDEX_Y1],
                                                    rightTopCellX2 = collisionShapes[rightTopRightFirstIndex + INDEX_X2],
                                                    rightX1 = collisionShapes[rightTopRightFirstIndex + INDEX_X1],
                                                    rightX2 = collisionShapes[rightTopRightFirstIndex + INDEX_X2];
                                                if (rightTopCellX1 === rightX2 && rightTopCellX2 === rightX1) {
                                                    pageData._removeCollisionShapeLine(rightTopRightFirstIndex);
                                                    rightLine[INDEX_X1] = rightTopCellX1;
                                                    rightLine[INDEX_Y1] = rightTopCellY1;
                                                }
                                            }
                                            // merge line from top left
                                            const leftTopRightFirstIndex =  collisionShapesRowsIndexes[topCellFirstIndex + INDEX_LEFT_LINE],
                                                leftTopCellX1 = collisionShapes[leftTopRightFirstIndex];
                                            if (leftTopCellX1) {
                                                const leftTopCellX2 = collisionShapes[leftTopRightFirstIndex + INDEX_X2],
                                                    leftTopCellY2 = collisionShapes[leftTopRightFirstIndex + INDEX_Y2],
                                                    leftX1 = leftLine[INDEX_X1],
                                                    leftX2 = leftLine[INDEX_X2];
                                                if (leftTopCellX1 === leftX2 && leftTopCellX2 === leftX1) {
                                                    pageData._removeCollisionShapeLine(leftTopRightFirstIndex);
                                                    leftLine[INDEX_X2] = leftTopCellX2;
                                                    leftLine[INDEX_Y2] = leftTopCellY2;
                                                }
                                            }
                                        }
                                    }
                                    // leftCell
                                    if (col !== 0) {
                                        
                                        const leftCell = row * fullRowCellsNum + ((col - 1) * 4),
                                            topLeftFirstCellIndex = collisionShapesRowsIndexes[leftCell];
                                        if (topLeftFirstCellIndex) {

                                            //remove double lines from left
                                            const rightLeftCellIndex = collisionShapesRowsIndexes[leftCell + INDEX_RIGHT_LINE],
                                                rightLeftX1 = collisionShapes[rightLeftCellIndex],
                                                rightLeftCellX1 = rightLeftX1,
                                                rightLeftCellY1 = collisionShapes[rightLeftCellIndex + INDEX_Y1],
                                                rightLeftCellX2 = collisionShapes[rightLeftCellIndex + INDEX_X2],
                                                rightLeftCellY2 = collisionShapes[rightLeftCellIndex + INDEX_Y2],
                                                leftX1 = leftLine[INDEX_X1],
                                                leftY1 = leftLine[INDEX_Y1],
                                                leftX2 = leftLine[INDEX_X2],
                                                leftY2 = leftLine[INDEX_Y2];

                                            if (leftX1 === rightLeftCellX2 && leftY1 === rightLeftCellY2 &&
                                                leftX2 === rightLeftCellX1 && leftY2 === rightLeftCellY1) {
                                                pageData._removeCollisionShapeLine(rightLeftCellIndex);
                                                leftLine = undefined;
                                            }

                                            //merge long lines from left top
                                            const topLeftCellX1 = collisionShapes[topLeftFirstCellIndex];
                                            if (topLeftCellX1 && topLine) {
                                                const topLeftCellY1 = collisionShapes[topLeftFirstCellIndex + INDEX_Y1],
                                                    topLeftCellY2 = collisionShapes[topLeftFirstCellIndex + INDEX_Y2],
                                                    topY1 = topLine[INDEX_Y1],
                                                    topY2 = topLine[INDEX_Y2];
                                                if (topLeftCellY1 === topY2 && topLeftCellY2 === topY1 ) {
                                                    pageData._removeCollisionShapeLine(topLeftFirstCellIndex);
                                                    topLine[INDEX_X1] = topLeftCellX1;
                                                    topLine[INDEX_Y1] = topLeftCellY1;
                                                }
                                            }

                                            // merge long lines from left bottom
                                            const bottomLeftFirstCellIndex = collisionShapesRowsIndexes[leftCell + INDEX_BOTTOM_LINE],
                                                bottomLeftCellX1 = collisionShapes[bottomLeftFirstCellIndex];
                                            if (bottomLeftCellX1) {
                                                const bottomLeftCellY1 = collisionShapes[bottomLeftFirstCellIndex + INDEX_Y1],
                                                    bottomLeftCellX2 = collisionShapes[bottomLeftFirstCellIndex + INDEX_X2],
                                                    bottomLeftCellY2 = collisionShapes[bottomLeftFirstCellIndex + INDEX_Y2],
                                                    bottomY1 = bottomLine[INDEX_Y1],
                                                    bottomY2 = bottomLine[INDEX_Y2];
                                                if (bottomLeftCellY1 === bottomY2 && bottomLeftCellY2 === bottomY1 ) {
                                                    pageData._removeCollisionShapeLine(bottomLeftFirstCellIndex);
                                                    //opposite direction
                                                    bottomLine[INDEX_X2] = bottomLeftCellX2;
                                                    bottomLine[INDEX_Y2] = bottomLeftCellY2;
                                                }
                                            }

                                        }
                                    }
                                    const currentCellIndex = row * fullRowCellsNum + (col * 4);
                                    if (topLine) {
                                        pageData._addCollisionShapeLine(topLine[0], topLine[1], topLine[2], topLine[3]);
                                        collisionShapesRowsIndexes[currentCellIndex + INDEX_TOP_LINE] = pageData.collisionShapesLen - 4;
                                    }
                                    pageData._addCollisionShapeLine(rightLine[0], rightLine[1], rightLine[2], rightLine[3]);
                                    collisionShapesRowsIndexes[currentCellIndex + INDEX_RIGHT_LINE] = pageData.collisionShapesLen - 4;
                                    pageData._addCollisionShapeLine(bottomLine[0], bottomLine[1], bottomLine[2], bottomLine[3]);
                                    collisionShapesRowsIndexes[currentCellIndex + INDEX_BOTTOM_LINE] = pageData.collisionShapesLen - 4;
                                    if (leftLine) {
                                        pageData._addCollisionShapeLine(leftLine[0], leftLine[1], leftLine[2], leftLine[3]);
                                        collisionShapesRowsIndexes[currentCellIndex + INDEX_LEFT_LINE] = pageData.collisionShapesLen - 4;
                                    }
                                    
                                }
                            }
                        }
                        mapIndex++;
                    }
                    mapIndex += skipColsRight;
                }
                //console.log(collisionShapesRowsIndexes);
                //this.#bindTileImages(verticesBufferData, texturesBufferData, atlasImage, tilesetData.name, renderLayer._maskId);
                tileImagesData.push([v, t, tilesetData.name, atlasImage]);
                //cleanup
                collisionShapesRowsIndexes.fill(0);
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
                [ xOffset, yOffset ] = renderLayer.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset;
            
            let tileImagesData = [];
            if (!layerData) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }

            if (this.#gameOptions.render.collisionShapes.mapCollisionShapesEnabled) {
                pageData._setMapCollisionShapes();
            }

            for (let i = 0; i <= tilesets.length - 1; i++) {
                const tilesetData = tilesets[i],
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
                    atlasImage = tilesetImages[i],
                    atlasWidth = tilesetData.imagewidth,
                    atlasHeight = tilesetData.imageheight,
                    cellSpacing = typeof tilesetData.spacing === "number" ? tilesetData.spacing : 0,
                    cellMargin = typeof tilesetData.margin === "number" ? tilesetData.margin : 0,
                    layerTilesetData = tilesets[i]._temp;
                
                let mapIndex = 0,
                    v = layerTilesetData.vectors,
                    t = layerTilesetData.textures,
                    filledSize = 0;
                
                //v.fill(0);
                //t.fill(0);
                v = [];
                t = [];
                for (let row = 0; row < layerRows; row++) {
                    for (let col = 0; col < layerCols; col++) {
                        let tile = layerData.data[mapIndex];
                        
                        if (tile >= firstgid && (tile < nextgid)) {

                            tile -= firstgid;
                            const colNum = tile % atlasColumns,
                                rowNum = Math.floor(tile / atlasColumns),
                                atlasPosX = colNum * tilesetwidth + (colNum * cellSpacing) + cellMargin,
                                atlasPosY = rowNum * tilesetheight + (rowNum * cellSpacing) + cellMargin,
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
     * @returns {Promise<Array<any>}
     */
    #prepareRenderLayerWM = (renderLayer, pageData) => {
        return new Promise((resolve, reject) => {
            const tilemap = renderLayer.tilemap,
                tilesets = renderLayer.tilesets,
                tilesetImages = renderLayer.tilesetImages,
                layerData = renderLayer.layerData,
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                tilewidth = dtwidth,
                tileheight = dtheight,
                offsetDataItemsFullNum = layerData.data.length,
                offsetDataItemsFilteredNum = layerData.data.filter((item) => item !== 0).length,
                setCollisionShapes = false, //renderLayer.setCollisionShapes,
                [ settingsWorldWidth, settingsWorldHeight ] = pageData.worldDimensions,
                //[ canvasW, canvasH ] = this.stageData.drawDimensions,
                [ xOffset, yOffset ] = renderLayer.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset;
            const tileImagesData = [];
            // clear data
            // this.layerDataFloat32.fill(0);
            // set data for webgl processing
            this.layerDataFloat32.set(layerData.data);
            if (!layerData) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }

            if (this.#gameOptions.render.collisionShapes.mapCollisionShapesEnabled) {
                pageData._setMapCollisionShapes();
            }
            
            for (let i = 0; i < tilesets.length; i++) {
                const tilesetData = tilesets[i],
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
                    atlasWidth = tilesetData.imagewidth,
                    atlasHeight = tilesetData.imageheight,
                    items = layerRows * layerCols,
                    dataCellSizeBytes = 4,
                    vectorCoordsItemsNum = 12,
                    texturesCoordsItemsNum = 12,
                    vectorDataItemsNum = offsetDataItemsFilteredNum * vectorCoordsItemsNum,
                    texturesDataItemsNum = offsetDataItemsFilteredNum * texturesCoordsItemsNum,
                    cellSpacing = typeof tilesetData.spacing === "number" ? tilesetData.spacing : 0,
                    cellMargin = typeof tilesetData.margin === "number" ? tilesetData.margin : 0;
                
                const itemsProcessed = this.calculateBufferData(dataCellSizeBytes, offsetDataItemsFullNum, vectorDataItemsNum, layerRows, layerCols, dtwidth, dtheight, tilesetwidth, tilesetheight, atlasColumns, atlasWidth, atlasHeight, xOffset, yOffset, firstgid, nextgid, cellSpacing, setCollisionShapes);
                
                const verticesBufferData = itemsProcessed > 0 ? this.layerDataFloat32.slice(offsetDataItemsFullNum, vectorDataItemsNum + offsetDataItemsFullNum) : [],
                    texturesBufferData = itemsProcessed > 0 ? this.layerDataFloat32.slice(vectorDataItemsNum + offsetDataItemsFullNum, vectorDataItemsNum + texturesDataItemsNum + offsetDataItemsFullNum) : [];
                    
                tileImagesData.push([Array.from(verticesBufferData), Array.from(texturesBufferData), tilesetData.name, atlasImage]);
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
                    (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.TRIANGULATE_ISSUE, "Can't extract all triangles vertices.");
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

    getNextRenderObject = (renderObject, pageData) => {
        const objectIndex = pageData.renderObjects.indexOf(renderObject),
            nextObject = pageData.renderObjects[objectIndex + 1];
        return nextObject;
    }

    #glTextureIndex = (activeTexture) => {
        return activeTexture - 33984;
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
            minCycleTime: 16.666, // is turned off from 1.5.3
            cyclesTimeCalc: {
                check: _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.OPTIMIZATION.CYCLE_TIME_CALC.AVERAGES,
                averageFPStime: 10000
            },
            boundaries: { // depricated from 1.5.9
                mapBoundariesEnabled: true,
                realtimeCalculations: true,
                wholeWorldPrecalculations: false
            },
            collisionShapes: {
                mapCollisionShapesEnabled: true,
                realtimeCalculations: true,
                wholeWorldPrecalculations: false
            },
        },
        debug: {
            preserveDrawingBuffer: false, // testing
            checkWebGlErrors: false,
            debugMobileTouch: false,
            boundaries: { // depricated from 1.5.9
                drawLayerBoundaries: false,
                drawObjectBoundaries: false,
                boundariesColor: "rgba(224, 12, 21, 0.6)",
                boundariesWidth: 2
            },
            collisionShapes: {
                drawLayerCollisionShapes: false,
                drawObjectCollisionShapes: false,
                color: "rgba(224, 12, 21, 0.6)",
                width: 2
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
/* harmony export */   "DRAW_TYPE": () => (/* binding */ DRAW_TYPE),
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
            IMAGES: "drawImages",
            IMAGES_M: "drawImagesMerge"
        }
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
/** @enum {string} */
const DRAW_TYPE = {
    RECTANGLE: "rect",
    CONUS: "conus",
    CIRCLE: "circle",
    POLYGON: "polygon",
    LINE: "line",
    TEXT: "text",
    IMAGE: "image"
};

const ERROR_CODES = {
    CREATE_INSTANCE_ERROR: "CREATE_INSTANCE_ERROR",
    STAGE_NOT_EXIST: "STAGE_NOT_EXIST",
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
    ANOTHER_STAGE_ACTIVE: "ANOTHER_STAGE_ACTIVE",
    UNEXPECTED_TILE_ID: "UNEXPECTED_TILE_ID",
    UNEXPECTED_TOUCH_AREA: "UNEXPECTED TOUCH AREA",
    UNEXPECTED_METHOD_TYPE: "UNEXPECTED METHOD TYPE"
};

const WARNING_CODES =  {
    MULTIPLE_IMAGE_TILESET: "MULTIPLE_IMAGE_TILESET",
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
/* harmony export */   "calculateLinesVertices": () => (/* binding */ calculateLinesVertices),
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
/* harmony export */   "mat3Multiply": () => (/* binding */ mat3Multiply),
/* harmony export */   "mat3MultiplyPosCoords": () => (/* binding */ mat3MultiplyPosCoords),
/* harmony export */   "mat3MultiplyVector": () => (/* binding */ mat3MultiplyVector),
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
 * 
 * @param {Array<Array<number>>} arrayDots
 * @returns {Array<Array<number>>} 
 */
function calculateLinesVertices(x = 0, y = 0, r, arrayDots) {
    const len = arrayDots.length;
    let arrayLines = Array(len),
        arrayDotsIterator = 0;
        
    for (let i = 0; i < len; i++) {
        const dot1 = arrayDots[i];
        let dot2 = arrayDots[i+1];
        if (!dot2) {
            dot2 = arrayDots[0];
        }
        const x1 = dot1[0],
            y1 = dot1[1],
            x2 = dot2[0],
            y2 = dot2[1];

        const x1R = x1 * Math.cos(r) - y1 * Math.sin(r),
            y1R = x1 * Math.sin(r) + y1 * Math.cos(r),
            x2R = x2 * Math.cos(r) - y2 * Math.sin(r),
            y2R = x2 * Math.sin(r) + y2 * Math.cos(r);
        const line = [x1R + x, y1R + y, x2R + x, y2R + y];
        
        arrayLines[arrayDotsIterator] = line;
        arrayDotsIterator++;
    }
    return arrayLines;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} radiusX
 * @param {number} radiusY
 * @param {number} [angle = 2 * Math.PI]
 * @param {number} [step = Math.PI/12] 
 * @returns {Array<Array<number>>}
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

/**
 * 
 * @param { Array<number> } mat1 
 * @param { Array<number> } mat2 
 * @returns { Array<number> }
 */
function mat3Multiply(mat1, mat2) {
    let matResult = [];
    for (let resultIdx = 0; resultIdx < 9; resultIdx += 3) {
        let resultIndex = resultIdx;
        
        for (let i = 0; i < 3; i++) {
            let resultVal = 0,
                k = i;
                
            for (let j = 0; j < 3; j++) {
                const mat1Val = mat1[resultIdx + j],
                    mat2Val = mat2[k];

                resultVal += (mat1Val * mat2Val);
                k+=3;
            }
            matResult[resultIndex] = resultVal;
            resultIndex++;
        }
    }
    return matResult;
}

/**
 * 
 * @param {Array<number>} mat3 [a, b, c,
 *                              d. e, f,
 *                              g, h, i]
 * @param {Array<number>} vec3 [x1, y1]
 * @returns {Array<number>} [a * x1 + b * y1 + c * 1,  d * x1 + e * y1 + f * 1]
 */
function mat3MultiplyVector (mat3, vec3) {
    let result = [];
    let resultIndex = 0;
    for (let rowStartIdx = 0; rowStartIdx < 6; rowStartIdx += 3) {
        let resultVal = 0;
        const stopInt = rowStartIdx + 3;
        let vecIdx = 0;
        for (let rowIdx = rowStartIdx; rowIdx < stopInt; rowIdx++) {
            const matVal = mat3[rowIdx],
                vecVal = vec3[vecIdx] || 1; // z1 coord
            resultVal += (matVal * vecVal);
            vecIdx++;
        }
        result[resultIndex] = resultVal;
        resultIndex++;
    }
    return result;
}

/**
 * 
 * @param {Array<number>} mat3 [a, b, c,
 *                              d. e, f,
 *                              g, h, i]
 * @param {Array<number>} vec3 [x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2, ...]
 * @returns {Array<number>} [a*x1 + b*y1 + c*1, d*y1 + e*y1 + f*1, ...]
 */
function mat3MultiplyPosCoords (mat3, vec3) {
    const vec3Len = vec3.length;
    let result = [];
    let resultIndex = 0;
    for (let nPair = 0; nPair < vec3Len; nPair += 2) {
        for (let rowStartIdx = 0; rowStartIdx < 6; rowStartIdx += 3) {
            let resultVal = 0;
            const stopInt = rowStartIdx + 3;
            let vecIdx = nPair;
            let iteration = 1;
            for (let rowIdx = rowStartIdx; rowIdx < stopInt; rowIdx++) {
                const matVal = mat3[rowIdx],
                    vecVal = iteration === 3 ? 1 : vec3[vecIdx]; // 3: z1 = 1 coord
                resultVal += (matVal * vecVal);
                vecIdx++;
                iteration++;
            }
            result[resultIndex] = resultVal;
            resultIndex++;
        }
    }
    return result;
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