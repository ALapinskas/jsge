
const PROGRESS_EVENT_TYPE = {
    loadstart: "loadstart", 
    progress: "progress", 
    abort: "abort", 
    error: "error", 
    load: "load", 
    timeout: "timeout"
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
                Exception("uploadMethod should be instance of Promise and return upload result value");
            }
        }
    }

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
        this.registerLoader("TileSet", this._loadTileSet)
    }

    get filesWaitingForUpload() {
        let files = 0;
        Array.from(this.#registeredLoaders.values()).map((fileType) => files += fileType.filesWaitingForUpload);
        return files;
    }

    /**
     * Register a new file type to upload
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
        return new Promise((resolve, reject) => {
            this.#uploadFiles().then(() => {
                // upload additional files
                if (this.filesWaitingForUpload) {
                    this.#uploadFiles().then(() => {
                        this.#dispatchLoadingFinish();
                        resolve()
                    });
                } else {
                    this.#dispatchLoadingFinish();
                    resolve();
                }
            });
        });
    }

    #uploadFiles() {
        let results = [];
        Array.from(this.#registeredLoaders.values()).forEach((fileType) => {
            Array.from(fileType.loadingQueue.entries()).forEach((key_value) => {
                results.push(fileType.uploadMethod(key_value[0], ...key_value[1]));
            })});
        return Promise.allSettled(results).then((results) => {
            results.forEach((result) => {
                if (result.status === "rejected") {
                    const error = result.reason;
                    Warning(error);
                    this.#dispatchLoadingError(error);
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
                const {name, image} = data;
                if (name && image && !this.isFileInQueue("Image", name)) {
                    this.addImage(name, relativePath ? relativePath + image : image);
                }
                data.gid = gid;
                return Promise.resolve(data);
            }).catch(() => {
                const err = new Error("Can't load related tileset " + url);
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
                let split = url.split("/"),
                    length = split.length,
                    relativePath;
                if (split[length - 1].includes(".tmj") || split[length - 1].includes(".json")) {
                    split.pop();
                    relativePath = split.join("/") + "/";
                } else if (split[length - 2].includes(".tmj") || split[length - 2].includes(".json")) {
                    split.splice(length - 2, 2);
                    relativePath = split.join("/") + "/";
                }
                
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
                    err = new Error("Can't load tilemap " + url);
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
                const err = new Error("Can't load audio " + url);
                this.#dispatchLoadingError(err);
                reject(err);
            });
        });
    }

    /**
     * Loads image file
     * @param {string} key 
     * @param {string} url 
     * @param {string} [cors="anonymous"] // https://hacks.mozilla.org/2011/11/using-cors-to-load-webgl-textures-from-cross-domain-images
     * @returns {Promise}
     */
    _loadImage = (key, url, cors = "anonymous") => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = cors;
            img.onload = () => {
                createImageBitmap(img).then((imageBitmap) => {
                    this.#dispatchCurrentLoadingProgress();
                    resolve(imageBitmap);
                });
            };
            img.onerror = () => {
                const err = new Error("Can't load image " + url);
                this.#dispatchLoadingError(err);
                reject(err);
            };
            img.src = url;
        });
    }

    #checkTilesetUrl(url) {
        if (url.includes(".tsj") || url.includes(".json")) {
            return;
        } else {
            Exception("Related Tileset file type is not correct, only .tsj or .json files are supported");
        }
    }

    #checkTilemapUrl(url) {
        if (url.includes(".tmj") || url.includes(".json")) {
            return;
        } else {
            Exception("Tilemap file type is not correct, only .tmj or .json files are supported");
        }
    }

    addFile(fileType, fileKey, url, ...args) {
        const iLoader = this.#registeredLoaders.get(fileType);
        if (iLoader) {
            this.#checkInputParams(fileKey, url);
            iLoader._addFile(fileKey, [url, ...args]);
        } else {
            Exception("Loader for " + fileType + " is not registered!");
        }

    }

    isFileInQueue(fileType, fileKey) {
        const iLoader = this.#registeredLoaders.get(fileType);
        if (iLoader) {
            return iLoader._isFileInQueue(fileKey);
        } else {
            Exception("Loader for " + fileType + " is not registered!");
        }
    }

    getFile(fileType, fileKey) {
        const iLoader = this.#registeredLoaders.get(fileType);
        if (iLoader) {
            return iLoader._getFile(fileKey);
        } else {
            Exception("Loader for " + fileType + " is not registered!");
        }
    }

    #checkInputParams(fileKey, url) {
        const errorMessage = "fileKey and url should be provided";
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