
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
     * @type { Map<String, String>}
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

    _addFile = (key, url) => {
        if (this.#loadingQueue.has(key)) {
            Warning("File " + this.#fileType + " with key " + key + " is already added");
        }
        this.#loadingQueue.set(key, url);
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
        const registeredFileType = this.#registeredLoaders.get(fileTypeName) || new Loader(fileTypeName, loadMethod);

        this["add" + fileTypeName] = (key, url) => {
            this.addFile(fileTypeName, key, url);
        }
        this["get" + fileTypeName] = (key) => {
            return this.getFile(fileTypeName, key);
        }
        this["is" + fileTypeName + ["InQueue"]] = (key) => {
            return this.isFileInQueue(fileTypeName, key);
        }
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
        const results = Array.from(this.#registeredLoaders.values()).map((fileType) => {
            return Promise.allSettled(Array.from(fileType.loadingQueue.entries()).map((key_value) => {
                return fileType.uploadMethod(key_value[0], key_value[1]);
            }));
        });
        return Promise.all(results);
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

    #loadTileSet = (tileset, relativePath) => {
        const { firstgid:gid, source:url } = tileset;
        this.#checkTilesetUrl(url);
        return fetch("./" + relativePath ? relativePath + url : url)
            .then((response) => response.json())
            .then((data) => {
                const {name, image} = data;
                if (name && image && !this.isImageInQueue(name)) {
                    this.addImage(name, relativePath ? relativePath + image : image, data);
                }
                data.gid = gid;
                return Promise.resolve(data);
            }).catch(() => {
                const err = new Error("Can't load related tileset ", url);
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
     * @returns {Promise}
     */
    _loadTileMap = (key, url) => {
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
                
                if (data.tilesets && data.tilesets.length > 0) {
                    const tilesetPromises = [];
                    // upload additional tileset data
                    data.tilesets.forEach((tileset, idx) => {
                        const loadTilesetPromise = this.#loadTileSet(tileset, relativePath).then((tilesetData) => {
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
     * @returns {Promise}
     */
    _loadImage = (key, url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
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

    addFile(fileType, fileKey, url) {
        const loader = this.#registeredLoaders.get(fileType);
        if (loader) {
            this.#checkInputParams(fileKey, url);
            loader._addFile(fileKey, url);
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