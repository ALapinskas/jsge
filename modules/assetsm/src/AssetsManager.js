
const PROGRESS_EVENT_TYPE = {
    loadstart: "loadstart", 
    progress: "progress", 
    abort: "abort", 
    error: "error", 
    load: "load", 
    timeout: "timeout"
}

const ERROR_MESSAGES = {
    RECURSION_ERROR: "Too much recursion. Stop iteration.",
    ATLAS_IMAGE_LOADING_FAILED: "Can't load atlas image ",
    TILESET_LOADING_FAILED: "Can't load related tileset ",
    TILEMAP_LOADING_FAILED: "Can't load tilemap ",
    AUDIO_LOADING_FAILED: "Can't load audio ",
    NOT_CORRECT_METHOD_TYPE: "uploadMethod should be instance of Promise and return upload result value",
    XML_FORMAT_INCORRECT: " XML format is not correct.",
    XML_FILE_EXTENSION_INCORRECT: "Only xml files are supported",
    TILESET_FILE_EXTENSION_INCORRECT: "Related Tileset file extension is not correct, only .tsj or .json files are supported",
    TILEMAP_FILE_EXTENSION_INCORRECT: "Tilemap file extension is not correct, only .tmj or .json files are supported",
    INPUT_PARAMS_ARE_INCORRECT: "fileKey and url should be provided"
}

class Loader {
    /**
     * @type {String}
     */
    #fileType;
    /**
     * @type { (...args: any[]) => Promise<any> | undefined }
     */
    #uploadMethod;
    /**
     * name: url
     * @type { Map<String, String[]>}
     */
    #loadingQueue = new Map();
    /**
     * name: file
     * @type { Map<String, any>}
     */
    #store = new Map();
    /**
     * 
     * @param {String} name 
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
     * @param {*} uploadResult 
     * @param {string} key 
     * @returns {Promise<void>}
     */
    #processUploadResult = (uploadResult, key) => {
        return new Promise((resolve,reject) => {
            if(!uploadResult || uploadResult.length === 0 ) {
                Warning("uploadMethod for " + this.#fileType + " should return Promise with upload value");
            }
            this.#addUploadResultValue(key, uploadResult);
            this.#removeUploadFromQueue(key);
            resolve();
        });
    }

    #addUploadResultValue(key, value) {
        this.#store.set(key, value);
    }

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

    _addFile = (key, paramsArr) => {
        if (this.#loadingQueue.has(key)) {
            Warning("File " + this.#fileType + " with key " + key + " is already added");
        }
        this.#loadingQueue.set(key, paramsArr);
    }

    _isFileInQueue = (key) => {
        return this.#loadingQueue.has(key);
    }

    _getFile = (key) => {
        return this.#store.get(key);
    }
}

/**
 *  This class is used to preload 
 *  tilemaps, tilesets, images and audio,
 *  and easy access loaded files by keys
 */
export default class AssetsManager {

    /**
     * @type {Number}
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
     * @type {Number}
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

    get filesWaitingForUpload() {
        let files = 0;
        Array.from(this.#registeredLoaders.values()).map((fileType) => files += fileType.filesWaitingForUpload);
        return files;
    }

    /**
     * Register a new file type to upload. Method will dynamically add new methods.
     * @param {String} fileTypeName
     * @param {Function=} loadMethod loadMethod should return Promise<result>
     * @returns {Promise | void}
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

    #uploadFilesRecursive(loadCount = 0) {
        return this.#uploadFiles().then((res) => {
            if (this.filesWaitingForUpload === 0) {
                return Promise.resolve(res);
            } else {
                loadCount++;
                if (loadCount > this.#MAX_LOADING_CYCLES) {
                    return Promise.reject(new Error(ERROR_MESSAGES.RECURSION_ERROR));
                } else {
                    return this.#uploadFilesRecursive(loadCount);
                }
            }
        }).catch((err) => {
            return Promise.reject(err);
        });
    }

    #uploadFiles() {
        return new Promise((resolve, reject) => {
            let uploadPromises = [];
            Array.from(this.#registeredLoaders.values()).forEach((fileType) => {
                Array.from(fileType.loadingQueue.entries()).forEach((key_value) => {
                    const p = new Promise((res, rej) => fileType.uploadMethod(key_value[0], ...key_value[1]).then((r) => res(r)));
                    uploadPromises.push(p);
                });
            });
    
            Promise.allSettled(uploadPromises).then((results) => {
                for (const result of results) {
                    if (result.status === "rejected") {
                        const error = result.reason;
                        // incorrect method is a critical issue
                        if (this.#isUploadErrorCritical(error)){
                            reject(error);
                        } else {
                            Warning(error);
                            this.#dispatchLoadingError(error);
                        }
                    }
                    resolve(results);
                }
            });
        });
    }

    addEventListener(type, fn, ...args) {
        if (!PROGRESS_EVENT_TYPE[type]) {
            Warning("Event type should be one of the ProgressEvent.type");
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
     * @returns {Promise}
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
                    return Promise.resolve(atlas);
                } else {
                    const err = new Error(key + ERROR_MESSAGES.XML_FORMAT_INCORRECT);
                
                    return Promise.reject(err);
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
                    imageBitmapPromises.push(createImageBitmap(tempCtx.getImageData(x, y, width, height)));
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
                //createImageBitmap(img).then((imageBitmap) => {
                //    this.#dispatchCurrentLoadingProgress();
                //    resolve(imageBitmap);
                //});
            };
            img.onerror = () => {
                const err = new Error(ERROR_MESSAGES.ATLAS_IMAGE_LOADING_FAILED + url);
                this.#dispatchLoadingError(err);
                reject(err);
            };
            img.src = url;
        });
    }

    /**
     * Loads tileset
     * @param {string} key
     * @param {string} url 
     * @param {number} [gid=1]
     * @param {string=} relativePath
     * @returns {Promise}
     */
    _loadTileSet = (key, url, gid=1, relativePath) => {
        this.#checkTilesetUrl(url);
        return fetch(relativePath ? relativePath + url : url)
            .then((response) => response.json())
            .then((data) => {
                const {name, image, spacing, margin, tilewidth, tileheight} = data;
                if (name && image && !this.isFileInQueue("Image", name)) {
                    this.addImage(name, relativePath ? relativePath + image : image);
                }
                data.gid = gid;
                return Promise.resolve(data);
            }).catch(() => {
                const err = new Error(ERROR_MESSAGES.TILESET_LOADING_FAILED + url);
                return Promise.reject(err);
            });
    }

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
        this.#checkTilemapUrl(url);
        return fetch(url)
            .then((response) => response.json())
            .then((data) => {
                const relativePath = this.#calculateRelativePath(url);
                
                if (attachTileSetData === true && data.tilesets && data.tilesets.length > 0) {
                    const tilesetPromises = [];
                    // upload additional tileset data
                    data.tilesets.forEach((tileset, idx) => {
                        const { firstgid:gid, source:url } = tileset;
                        const loadTilesetPromise = this._loadTileSet("default-" + gid, url, gid, relativePath).then((tilesetData) => {
                            this.#dispatchCurrentLoadingProgress();
                            return Promise.resolve(tilesetData);
                        });
                        tilesetPromises.push(loadTilesetPromise);
                    });
                    //attach additional tileset data to tilemap data
                    return Promise.all(tilesetPromises).then((tilesetDataArray) => {
                        for (let i = 0; i < tilesetDataArray.length; i++) {
                            const tilesetData = tilesetDataArray[i];
                            data.tilesets[i].data = tilesetData;
                        }
                        return Promise.resolve(data);
                    });
                } else {
                    return Promise.resolve(data);
                }
            })
            .catch((err) => {
                if (err.message.includes("JSON.parse:")) {
                    err = new Error(ERROR_MESSAGES.TILEMAP_LOADING_FAILED + url);
                }
                this.#dispatchLoadingError(err);
                return Promise.reject(err);
            });
    }

    /**
     * Loads audio file
     * @param {string} key 
     * @param {string} url 
     * @returns {Promise}
     */
    _loadAudio = (key, url) => {
        return new Promise((resolve, reject) => {
            const audio = new Audio(url);
            
            audio.addEventListener("loadeddata", () => {
                this.#dispatchCurrentLoadingProgress();
                resolve(audio);
            });

            audio.addEventListener("error", () => {
                const err = new Error(ERROR_MESSAGES.AUDIO_LOADING_FAILED + url);
                this.#dispatchLoadingError(err);
                reject(err);
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
                    // do we need a bitmap?
                    // createImageBitmap(img).then((imageBitmap) => {
                    //    this.#dispatchCurrentLoadingProgress();
                    //    resolve(imageBitmap);
                    // });
                    resolve(img);
                };
                img.onerror = () => {
                    const err = new Error(ERROR_MESSAGES.IMAGE_LOADING_FAILED + url);
                    this.#dispatchLoadingError(err);
                    reject(err);
                };
                img.src = url;
            }
        });
    }

    #checkXmlUrl(url) {
        if (url.includes(".xml")) {
            return;
        } else {
            Exception(ERROR_MESSAGES.XML_FILE_EXTENSION_INCORRECT);
        }
    }

    #checkTilesetUrl(url) {
        if (url.includes(".tsj") || url.includes(".json")) {
            return;
        } else {
            Exception(ERROR_MESSAGES.TILESET_FILE_EXTENSION_INCORRECT);
        }
    }

    #checkTilemapUrl(url) {
        if (url.includes(".tmj") || url.includes(".json")) {
            return;
        } else {
            Exception(ERROR_MESSAGES.TILEMAP_FILE_EXTENSION_INCORRECT);
        }
    }

    #isUploadErrorCritical(error) {
        return error.message.includes(ERROR_MESSAGES.NOT_CORRECT_METHOD_TYPE);
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
        relativePath = "/";
        // url ends with .ext
        if (split[length - 1].includes(".tmj") || split[length - 1].includes(".xml") || split[length - 1].includes(".json")) {
            split.pop();
            relativePath = split.join("/") + "/";
        // url ends with /
        } else if (split[length - 2].includes(".tmj") || split[length - 2].includes(".xml") || split[length - 2].includes(".json")) {
            split.splice(length - 2, 2);
            relativePath = split.join("/") + "/";
        }
        return relativePath;
    }

    addFile(fileType, fileKey, url, ...args) {
        const loader = this.#registeredLoaders.get(fileType);
        if (loader) {
            this.#checkInputParams(fileKey, url);
            loader._addFile(fileKey, [url, ...args]);
        } else {
            Exception("Loader for " + fileType + " is not registered!");
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

    #checkInputParams(fileKey, url) {
        const errorMessage = ERROR_MESSAGES.INPUT_PARAMS_ARE_INCORRECT;
        if (!fileKey || fileKey.trim().length === 0) {
            Exception(errorMessage);
        }
        if (!url || url.trim().length === 0) {
            Exception(errorMessage);
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
        this.#emitter.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.error, { error }));
    }
}

function Exception (message) {
    throw new Error(message);
}

function Warning (message) {
    console.warn(message);
}