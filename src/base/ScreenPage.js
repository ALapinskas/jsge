import { CONST, ERROR_CODES, WARNING_CODES } from "../constants.js";
import { ScreenPageData } from "./ScreenPageData.js";
import { Exception, Warning } from "./Exception.js";
import { Logger } from "./Logger.js";
import AssetsManager from "assetsm";
import { RenderLayer } from "./RenderLayer.js";
import { CanvasView } from "./CanvasView.js";
import { System } from "./System.js";
import { DrawObjectFactory } from "./DrawObjectFactory.js";
import { DrawConusObject } from "./DrawConusObject.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawLineObject } from "./DrawLineObject.js";
import { DrawPolygonObject } from "./DrawPolygonObject.js";
import { DrawRectObject } from "./DrawRectObject.js";
import { DrawShapeObject } from "./DrawShapeObject.js";
import { DrawTextObject } from "./DrawTextObject.js";
import { SystemInterface } from "./SystemInterface.js";
import { SystemAudioInterface } from "./SystemAudioInterface.js";
import { SystemSettings } from "../configs.js";
import { isPointLineIntersect, isPolygonLineIntersect, angle_2points } from "../utils.js";
import { Vector, Vertex } from "./Primitives.js";

/**
 * Represents the page of the game,
 * contains and rule page views
 */
export class ScreenPage {
    /**
     * @type {String}
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
     * @type {System}
     */
    #system;
    /**
     * @type {Map<CanvasView>}
     */
    #views;
    /**
     * @type {AssetsManager}
     */
    #loader;
    /**
     * @type {ScreenPageData}
     */
    #screenPageData;
    /**
     * @type {DrawObjectFactory}
     */
    #drawObjectFactory = new DrawObjectFactory();
    /**
     * @type {Number[]}
     */
    #tempFPStime;
    /**
     * @type {Function}
     */
    #fpsAverageCountTimer;
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();

    constructor() {
        this.#isActive = false;
        this.#views = new Map();
        this.#loader = new AssetsManager();
        this.#screenPageData = new ScreenPageData();
        this.#tempFPStime = [];
    }

    /**
     * 
     * @param {String} eventName 
     * @param  {...any} eventParams 
     */
    emit = (eventName, ...eventParams) => {
        const event = new Event(eventName);
        event.data = [...eventParams];
        this.#emitter.dispatchEvent(event);
    }

    /**
     * 
     * @param {String} eventName 
     * @param {*} listener 
     * @param {*} options 
     */
    addEventListener = (eventName, listener, options) => {
        this.#emitter.addEventListener(eventName, listener, options);
    }

    /**
     * 
     * @param {String} eventName 
     * @param {*} listener 
     * @param {*} options 
     */
    removeEventListener = (eventName, listener, options) => {
        this.#emitter.removeEventListener(eventName, listener, options);
    }

    /**
     * Register stage
     * @param {String} name
     * @param {SystemInterface} system 
     * @protected
     */
    _register(name, system) {
        this.#name = name;
        this.#system = system;
        this.#setWorldDimensions();
        this.#setCanvasSize();
        this.register();
    }

    /**
     * Initialization stage
     * @protected
     */
    _init() {
        this.init();
        this.#isInitiated = true;
    }

    /**
     * Custom logic for register stage
     */
    register() {}
    /**
     * Custom logic for init stage
     */
    init() {}
    /**
     * Custom logic for start stage
     */
    start() {}
    /**
     * Custom logic for stop stage
     */
    stop() {}
    /**
     * Custom logic for resize stage
     */
    resize() {}

    /**
     * @type {AssetsManager}
     */
    get loader() {
        return this.#loader;
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
     */
    createCanvasView = (name) => {
        if (name && name.trim().length > 0) {
            const newView = new CanvasView(name, this.#system.systemSettings, this.#screenPageData, this.#loader);
            this.#views.set(name, newView);
        } else
            Exception(ERROR_CODES.UNEXPECTED_INPUT_PARAMS);
    }

    /**
     * Attach all canvas elements from the #views to container
     * @param {HTMLDivElement} container
     * @protected
     */
    _attachViewsToContainer(container) {
        for (const view of this.#views.values()) {
            this.#attachElementToContainer(view.canvas, container);
        }
    }

    /**
     * Add render object to the view
     * @param {String} canvasKey 
     * @param { DrawConusObject | DrawImageObject | 
     *          DrawLineObject | DrawPolygonObject | 
     *          DrawRectObject | DrawShapeObject | 
     *          DrawTextObject } renderObject 
     */
    addRenderObject = (canvasKey, renderObject) => {
        if (!canvasKey) {
            Exception(ERROR_CODES.CANVAS_KEY_NOT_SPECIFIED, ", should pass canvasKey as 3rd parameter");
        } else if (!this.#views.has(canvasKey)) {
            Exception(ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", should create canvas view, with " + canvasKey + " key first");
        } else {
            const view = this.#views.get(canvasKey);
            view.renderObject = renderObject;
            view.sortRenderObjects();
        }
    }

    /**
     * Add render layer to the view
     * @param {String} canvasKey 
     * @param {String} layerKey 
     * @param {String} tileMapKey 
     * @param {Boolean} setBoundaries 
     */
    addRenderLayer = (canvasKey, layerKey, tileMapKey, setBoundaries) => {
        if (!canvasKey) {
            Exception(ERROR_CODES.CANVAS_KEY_NOT_SPECIFIED, ", should pass canvasKey as 3rd parameter");
        } else if (!this.#views.has(canvasKey)) {
            Exception(ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", should create canvas view, with " + canvasKey + " key first");
        } else {
            const view = this.#views.get(canvasKey);
            view.renderLayers = new RenderLayer(layerKey, tileMapKey, setBoundaries);
        }
    }

    /**
     * Determines if this page render is Active or not
     * @type {Boolean}
     */
    get isActive() {
        return this.#isActive;
    }

    /**
     * Determines if this page is initialized or not
     * @type {Boolean}
     */
    get isInitiated() {
        return this.#isInitiated;
    }

    /**
     * Current page name
     * @type {String}
     */
    get name () {
        return this.#name;
    }

    /**
     * Determines if all added files was loaded or not
     * @returns {Boolean}
     */
    isAllFilesLoaded = () => {
        return this.#loader.filesWaitingForUpload === 0;
    }

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
     * @param {String} key 
     * @returns {CanvasView}
     */
    getView = (key) => {
        const ctx = this.#views.get(key);
        if (ctx) {
            return this.#views.get(key);
        } else {
            Exception(ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", cannot find canvas with key " + key);
        }
    };

    /**
     * Load all assets,
     * previously added to a loader query
     * @returns {Promise}
     * @protected
     */
    _loadPageAssets() {
        return this.#loader.preload();
    }

    /** 
     * @returns {Promise}
     * @protected 
     */
    _registerPageAudio() {
        return this.audio._registerAllAudio(this.#loader);
    }

    /**
     * Start page render
     * @param {*} options 
     * @protected
     */
    _start(options) {
        this.#isActive = true;
        window.addEventListener("resize", this._resize);
        this._resize();
        if (this.#views.size > 0) {
            requestAnimationFrame(this.#render);
        }
        this.emit(CONST.EVENTS.SYSTEM.START_PAGE);
        this.start(options);
    }

    /**
     * Stop page render
     * @protected
     */
    _stop() {
        this.#isActive = false;
        window.removeEventListener("resize", this._resize);
        this.emit(CONST.EVENTS.SYSTEM.STOP_PAGE);
        this.#removeCanvasFromDom();
        clearInterval(this.#fpsAverageCountTimer);
        this.stop();
    }

    /**
     * Resize event
     * @protected
     */
    _resize = () => {
        this.#setCanvasSize();
        this.resize();
    }

    /**
     * 
     * @param {HTMLDivElement} htmlElement 
     * @param {HTMLDivElement} container 
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
        const width = this.systemSettings.worldSize.width,
            height = this.systemSettings.worldSize.height;
        if (!width || !height || width <= 0 || height <= 0) {
            Warning(WARNING_CODES.UNEXPECTED_WORLD_SIZE, "world size should be set");
        } else {
            this.screenPageData.setWorldDimensions(width, height);
            if (this.systemSettings.gameOptions.render.mapBoundariesEnabled) {
                this.screenPageData.setMapBoundaries();
            }
        }
    }

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @returns {boolean}
     */
    #isPointToBoundariesCollision(x, y) {
        const mapObjects = this.screenPageData.getBoundaries(),
            [mapOffsetX, mapOffsetY] = this.screenPageData.worldOffset,
            len = mapObjects.length;

        for (let i = 0; i < len; i+=1) {
            const item = mapObjects[i],
                object = {
                    x1: item[0],
                    y1: item[1],
                    x2: item[2],
                    y2: item[3]
                };
            if (isPointLineIntersect({x: x - mapOffsetX, y: y - mapOffsetY}, object)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param {Number} x
     * @param {Number} y
     * @param {Array<Vertex>} polygon
     * @param {Number} rotation 
     * @returns {boolean}
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
            const item = mapObjects[i],
                object = {
                    x1: item[0],
                    y1: item[1],
                    x2: item[2],
                    y2: item[3]
                },
                intersect = isPolygonLineIntersect(polygonWithOffsetAndRotation, object);
            if (intersect) {
                //console.log("rotation: ", rotation);
                //console.log("polygon: ", polygonWithOffsetAndRotation);
                //console.log("intersect: ", intersect);
                return intersect;
            }
        }
        return false;
    }

    #calculateShiftedVertexPos(vertex, centerX, centerY, rotation) {
        const vector = new Vector(0, 0, vertex.x, vertex.y),
            vertexAngle = angle_2points(0, 0, vertex.x, vertex.y),
            len = vector.length;
        //console.log("coords without rotation: ");
        //console.log(x + vertex.x);
        //console.log(y + vertex.y);
        //console.log("len: ", len);
        //console.log("angle: ", rotation);
        const newX = centerX + (len * Math.cos(rotation + vertexAngle)),
            newY = centerY + (len * Math.sin(rotation + vertexAngle));
        return { x: newX, y: newY };
    }

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {DrawShapeObject} drawObject 
     */
    isBoundariesCollision = (x, y, drawObject) => {
        const drawObjectType = drawObject.type;
        switch(drawObjectType) {
            case CONST.DRAW_TYPE.RECTANGLE:
                return this.#isPolygonToBoundariesCollision(x, y, drawObject.boundaries, drawObject.rotation);
            case CONST.DRAW_TYPE.CIRCLE:
            case CONST.DRAW_TYPE.LINE:
            case CONST.DRAW_TYPE.TEXT:
            default:
                if (drawObject.boundaries && drawObject.boundaries.length > 0) {
                    return this.#isPolygonToBoundariesCollision(x, y, drawObject.boundaries, drawObject.rotation);
                 } else {
                     return this.#isPointToBoundariesCollision(x, y);
                 }
        }
    }

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
                const renderObjectCheck = renderObjects[j];
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
                    if (isPolygonLineIntersect(objectBoundaries, object)) {
                        this.emit(CONST.EVENTS.GAME.BOUNDARIES_COLLISION, renderObject);
                    }
                } else {
                    if (isPointLineIntersect({ x: renderObject.x, y: renderObject.y }, object)) {
                        this.emit(CONST.EVENTS.GAME.BOUNDARIES_COLLISION, renderObject);
                        console.log("boundaries collision detected");
                    }
                }
            }
        }
    }

    #setCanvasSize() {
        const canvasWidth = this.systemSettings.canvasMaxSize.width && (this.systemSettings.canvasMaxSize.width < window.innerWidth) ? this.systemSettings.canvasMaxSize.width : window.innerWidth,
            canvasHeight = this.systemSettings.canvasMaxSize.height && (this.systemSettings.canvasMaxSize.height < window.innerHeight) ? this.systemSettings.canvasMaxSize.height : window.innerHeight;
        this.screenPageData.setCanvasDimensions(canvasWidth, canvasHeight);
        for (const view of this.#views.values()) {
            view.setCanvasSize(canvasWidth, canvasHeight);
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
        Logger.debug("_render " + this.name + " class");
        if (this.#isActive) {
            switch (this.systemSettings.gameOptions.library) {
            case CONST.LIBRARY.WEBGL:
                if (this.isAllFilesLoaded()) {
                    //render
                    await this.#prepareViews();
                } else {
                    Warning(WARNING_CODES.ASSETS_NOT_READY, "Is page initialization phase missed?");
                    this.#isActive = false;
                }
                // wait for the end of the execution stack, before start next iteration
                setTimeout(() => requestAnimationFrame(this.#drawViews));
                break;
            }
            this.#fpsAverageCountTimer = setInterval(() => this.#countFPSaverage(), this.systemSettings.gameOptions.render.averageFPStime);
        }
    };

    #prepareViews() {
        return new Promise((resolve, reject) => {
            let viewPromises = [];
            for (const view of this.#views.values()) {
                viewPromises.push(view.initiateWebGlContext(this.systemSettings.gameOptions.debugWebGl));
            }
            Promise.allSettled(viewPromises).then((drawingResults) => {
                drawingResults.forEach((result) => {
                    if (result.status === "rejected") {
                        const error = result.reason || result.value;
                        Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, error);
                        reject(error);
                    }
                });
                resolve();
            });
        });
    }

    #drawViews = (/*drawTime*/) => {
        const pt0 = performance.now(),
            minCircleTime = this.systemSettings.gameOptions.render.minCircleTime;
        let viewPromises = [];
        this.emit(CONST.EVENTS.SYSTEM.RENDER.START);
        this.screenPageData.clearBoundaries();
        for (const [key, view] of this.#views.entries()) {
            viewPromises.push(this.#executeRender(key, view));
        }
        Promise.allSettled(viewPromises).then((drawingResults) => {
            drawingResults.forEach((result) => {
                if (result.status === "rejected") {
                    Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason || result.value);
                }
            });
            const r_time = performance.now() - pt0,
                r_time_less = minCircleTime - r_time,
                wait_time = r_time_less > 0 ? r_time_less : 0,
                fps = 1000 / (r_time + wait_time);
            //console.log("draw circle done, take: ", (r_time), " ms");
            //console.log("fps: ", fps);
            this.emit(CONST.EVENTS.SYSTEM.RENDER.END);
            this.#tempFPStime.push(fps);
            if (this.#isActive) {
                setTimeout(() => requestAnimationFrame(this.#drawViews), wait_time);
            }
        });
    };

    #executeRender (key, view) {
        return new Promise((resolve, reject) => {
            if (!view.isCleared) {
                view.clearWebGlContext();
            }
            if (view.renderLayers.length !== 0) {
                view.prepareBindRenderLayerPromises();
            }
            view.executeBindRenderLayerPromises()
                .then((bindResults) => {
                    bindResults.forEach((result) => {
                        if (result.status === "rejected") {
                            Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason || result.value);
                            this.#isActive = false;
                            return reject(WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason);
                        }
                    });
                    return view.executeTileImagesDraw();
                })
                .then(() => {
                    if (view.renderObjects.length !== 0) {
                        //this.#checkCollisions(view.renderObjects);
                        view.prepareBindRenderObjectPromises();
                    }
                    if (key === CONST.LAYERS.BOUNDARIES) {
                        view.prepareBindBoundariesPromise();
                    }
                    return view.executeBindRenderObjectPromises();
                })
                .then((bindResults) => {
                    bindResults.forEach((result) => {
                        if (result.status === "rejected") {
                            Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason || result.value);
                            this.#isActive = false;
                        }
                    });
                    
                    view.isCleared = false;
                    resolve();
                });
        });
    }
}