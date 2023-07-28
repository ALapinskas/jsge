
const PROGRESS_EVENT_TYPE = {
    loadstart: "loadstart", 
    progress: "progress", 
    abort: "abort", 
    error: "error", 
    load: "load", 
    timeout: "timeout"
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
    #emitter;

    /**
     * @type {Map<String, HTMLAudioElement>}
     */
    #audio;

    /**
     * @type {Map<String, ImageBitmap>}
     */
    #images;

    /**
     * @type {Map<String, Object>}
     */
    #tilemaps;

    /**
     * @type {Map<String, String>}
     */
    #audioQueue;

    /**
     * @type {Map<String, String>}
     */
    #imagesQueue;

    /**
     * @type {Map<String, String>}
     */
    #tileMapsQueue;

    /**
     * @type {Number}
     */
    #itemsLoaded;

    constructor() {
        this.#audio = new Map();
        this.#images = new Map();
        this.#tilemaps = new Map();
        this.#audioQueue = new Map();
        this.#imagesQueue = new Map();
        this.#tileMapsQueue = new Map();
        this.#emitter = new EventTarget();
        this.#itemsLoaded = 0;
    }

    get filesWaitingForUpload() {
        return this.#audioQueue.size + this.#tileMapsQueue.size + this.#imagesQueue.size;
    }

    /**
     * @param {String} key 
     * @returns {HTMLAudioElement | undefined} cloned audio element
     */
    getAudio(key) {
        const val = this.#audio.get(key);
        if (val) {
            return val;
        } else {
            Warning("Audio with key '" + key + "' is not loaded");
        }
    }

    /**
     * @param {String} key 
     * @returns {ImageBitmap | undefined}
     */
    getImage(key) {
        const val = this.#images.get(key);
        if (val) {
            return val;
        } else {
            Warning("Image with key '" + key + "' is not loaded");
        }
    }

    /**
     * @param {String} key 
     * @returns {Object | undefined}
     */
    getTileMap(key) {
        const val = this.#tilemaps.get(key);
        if (val) {
            return val;
        } else {
            Warning("Tilemap with key '" + key + "' is not loaded");
        }
    }

    /**
     * Execute load audio, images from tilemaps and images queues
     * @returns {Promise}
     */
    preload() {
        this.#dispatchLoadingStart();
        return Promise.allSettled(Array.from(this.#audioQueue.entries()).map((key_value) => this.#loadAudio(key_value[0], key_value[1]))).then((loadingResults) => {
            loadingResults.forEach((result) => {
                if (result.status === "rejected") {
                    Warning(result.reason || result.value);
                }
            });

            return Promise.allSettled(Array.from(this.#tileMapsQueue.entries()).map((key_value) => this.#loadTileMap(key_value[0], key_value[1]))).then((loadingResults) => {
                loadingResults.forEach((result) => {
                    if (result.status === "rejected") {
                        Warning(result.reason || result.value);
                    }
                });

                return Promise.allSettled(Array.from(this.#imagesQueue.entries()).map((key_value) => this.#loadImage(key_value[0], key_value[1]))).then((loadingResults) => { 
                    loadingResults.forEach((result) => {
                        if (result.status === "rejected") {
                            Warning(result.reason || result.value);
                        }
                    });

                    this.#dispatchLoadingFinish();
                    return Promise.resolve();
                });
            });
        });
    }

    /**
     * Adds an audio file to a loading queue
     * @param {string} key 
     * @param {string} url
     */
    addAudio(key, url) {
        this.#checkInputParams(key, url);
        if (this.#audioQueue.has(key)) {
            Warning("Audio with key " + key + " is already registered");
        }
        this.#audioQueue.set(key, url);
    }

    /**
     * Adds an image file to a loading queue
     * @param {string} key 
     * @param {string} url
     */
    addImage(key, url) {
        this.#checkInputParams(key, url);
        if (this.#imagesQueue.has(key)) {
            Warning("Image with key " + key + " is already registered");
        }
        this.#imagesQueue.set(key, url);
    }

    /**
     * Adds a tilemap, including tilesets and tilesets images to a loading queue
     * @param {String} key 
     * @param {String} url 
     */
    addTileMap(key, url) {
        this.#checkInputParams(key, url);
        if (this.#tileMapsQueue.has(key)) {
            Warning("Tilemap with key " + key + " is already registered");
        }
        this.#tileMapsQueue.set(key, url);
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

    #loadTileSet(tileset, relativePath) {
        const { firstgid:gid, source:url } = tileset;
        this.#checkTilesetUrl(url);
        return fetch("./" + relativePath ? relativePath + url : url)
            .then((response) => response.json())
            .then((data) => {
                const {name, image} = data;
                if (name && image) {
                    this.addImage(name, relativePath ? relativePath + image : image, data);
                }
                data.gid = gid;
                return Promise.resolve(data);
            }).catch(() => {
                const err = new Error("Can't load related tileset ", url);
                return Promise.reject(err);
            });
    }

    /**
     * Loads tilemap file and related data
     * @param {string} key 
     * @param {string} url 
     * @returns {Promise}
     */
    #loadTileMap(key, url) {
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
                this.#addTileMap(key, data);
                this.#removeTileMapFromQueue(key);
                
                if (data.tilesets && data.tilesets.length > 0) {
                    const tilesetPromises = [];
                    data.tilesets.forEach((tileset, idx) => {
                        const loadTilesetPromise = this.#loadTileSet(tileset, relativePath).then((tileset) => {
                            this.#attachTilesetData(key, idx, tileset);
                            this.#dispatchCurrentLoadingProgress();
                            return Promise.resolve();
                        });
                        tilesetPromises.push(loadTilesetPromise);
                    });
                    return Promise.all(tilesetPromises);
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
    #loadAudio(key, url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(url);
            
            audio.addEventListener("loadeddata", () => {
                this.#addNewAudio(key, audio);
                this.#removeAudioFromQueue(key);
                this.#dispatchCurrentLoadingProgress();
                resolve();
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
    #loadImage(key, url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                createImageBitmap(img).then((imageBitmap) => {
                    this.#addNewImage(key, imageBitmap);
                    this.#removeImageFromQueue(key);
                    this.#dispatchCurrentLoadingProgress();
                    resolve();
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

    #checkInputParams(key, url) {
        const errorMessage = "image key and url should be provided";
        if (!key || key.trim().length === 0) {
            Exception(errorMessage);
        }
        if (!url || url.trim().length === 0) {
            Exception(errorMessage);
        }
        return;
    }

    #addNewAudio(key, audio) {
        this.#audio.set(key, audio);
    }

    #removeAudioFromQueue(key) {
        this.#audioQueue.delete(key);
    }

    #addNewImage(key, image) {
        this.#images.set(key, image);
    }

    #removeImageFromQueue(key) {
        this.#imagesQueue.delete(key);
    }

    #attachTilesetData(key, idx, tileset) {
        const tilemap = this.#tilemaps.get(key);
        tilemap.tilesets[idx].data = tileset;
    }

    #addTileMap(key, data) {
        this.#tilemaps.set(key, data);
    }

    #removeTileMapFromQueue(key) {
        this.#tileMapsQueue.delete(key);
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