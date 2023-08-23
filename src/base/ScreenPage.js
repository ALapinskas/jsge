import { CONST, ERROR_CODES, WARNING_CODES } from "../constants.js";
import { ScreenPageData } from "./ScreenPageData.js";
import { Exception, Warning } from "./Exception.js";
import { Logger } from "./Logger.js";
import AssetsManager from "../../modules/assetsm/dist/assetsm.min.js";
import { RenderLayer } from "./RenderLayer.js";
import { CanvasView } from "./CanvasView.js";
import { DrawObjectFactory } from "./DrawObjectFactory.js";
import { DrawCircleObject } from "./DrawCircleObject.js";
import { DrawConusObject } from "./DrawConusObject.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawLineObject } from "./DrawLineObject.js";
import { DrawPolygonObject } from "./DrawPolygonObject.js";
import { DrawRectObject } from "./DrawRectObject.js";
import { DrawTextObject } from "./DrawTextObject.js";
import { SystemInterface } from "./SystemInterface.js";
import { SystemAudioInterface } from "./SystemAudioInterface.js";
import { SystemSettings } from "../configs.js";
import { isPointLineIntersect, isPolygonLineIntersect, angle_2points } from "../utils.js";
import { Vector } from "./Primitives.js";

/**
 * Represents the page of the game,<br>
 * Register and holds CanvasView.<br>
 * Contains pages logic.<br>
 * Instances should be created and registered with System.registerPage() factory method
 * 
 * @see {@link System} instances of this class holds by the System class
 * @hideconstructor
 */
export class ScreenPage {
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
    #drawObjectFactory = new DrawObjectFactory();
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
        this.#screenPageData = new ScreenPageData();
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
            const newView = new CanvasView(name, this.#system.systemSettings, this.#screenPageData, this.loader, isOffsetTurnedOff);
            this.#views.set(name, newView);
        } else
            Exception(ERROR_CODES.UNEXPECTED_INPUT_PARAMS);
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
            Exception(ERROR_CODES.CANVAS_KEY_NOT_SPECIFIED, ", should pass canvasKey as 3rd parameter");
        } else if (!this.#views.has(canvasKey)) {
            Exception(ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", should create canvas view, with " + canvasKey + " key first");
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
            Exception(ERROR_CODES.CANVAS_KEY_NOT_SPECIFIED, ", should pass canvasKey as 3rd parameter");
        } else if (!this.#views.has(canvasKey)) {
            Exception(ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", should create canvas view, with " + canvasKey + " key first");
        } else {
            const view = this.#views.get(canvasKey);
            view._renderLayers = new RenderLayer(layerKey, tileMapKey, setBoundaries);
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
            Exception(ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", cannot find canvas with key " + key);
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
        this.emit(CONST.EVENTS.SYSTEM.START_PAGE);
        this.start(options);
    }

    /**
     * Stop page render
     * @ignore
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
            case CONST.DRAW_TYPE.TEXT:
            case CONST.DRAW_TYPE.RECTANGLE:
            case CONST.DRAW_TYPE.CONUS:
            case CONST.DRAW_TYPE.IMAGE:
                coll = this.#isPolygonToPolygonCollision(x, y, polygonVertices, polygonRotation, mapObject);
                break;
            case CONST.DRAW_TYPE.CIRCLE:
                console.warn("isObjectCollision.circle check is not implemented yet!");
                break;
            case CONST.DRAW_TYPE.LINE:
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
                intersect = isPolygonLineIntersect(polygonWithOffsetAndRotation, edge);
            if (intersect) {
                //console.log("polygon: ", polygonWithOffsetAndRotation);
                //console.log("intersect: ", intersect);
                return intersect;
            }
        }
        return false;
    }

    #calculateShiftedVertexPos(vertex, centerX, centerY, rotation) {
        const vector = new Vector(0, 0, vertex[0], vertex[1]),
            vertexAngle = angle_2points(0, 0, vertex[0], vertex[1]),
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
        case CONST.DRAW_TYPE.TEXT:
        case CONST.DRAW_TYPE.RECTANGLE:
        case CONST.DRAW_TYPE.CONUS:
        case CONST.DRAW_TYPE.IMAGE:
            return this.#isPolygonToBoundariesCollision(x, y, vertices, drawObject.rotation);
        case CONST.DRAW_TYPE.CIRCLE:
            Warning(CONST.WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.circle check is not implemented yet!");
            break;
        case CONST.DRAW_TYPE.LINE:
            Warning(CONST.WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.line check is not implemented yet, please use .rect instead line!");
            break;
        default:
            Warning(CONST.WARNING_CODES.UNKNOWN_DRAW_OBJECT, "unknown object type!");
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
        case CONST.DRAW_TYPE.TEXT:
        case CONST.DRAW_TYPE.RECTANGLE:
        case CONST.DRAW_TYPE.CONUS:
        case CONST.DRAW_TYPE.IMAGE:
            return this.#isPolygonToObjectsCollision(x, y, drawObjectBoundaries, drawObject.rotation, objects);
        case CONST.DRAW_TYPE.CIRCLE:
            Warning(CONST.WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.circle check is not implemented yet!");
            break;
        case CONST.DRAW_TYPE.LINE:
            Warning(CONST.WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.line check is not implemented yet, please use .rect instead line!");
            break;
        default:
            Warning(CONST.WARNING_CODES.UNKNOWN_DRAW_OBJECT, "unknown object type!");
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
            minCircleTime = this.#minCircleTime;
            
        let viewPromises = [];
        this.emit(CONST.EVENTS.SYSTEM.RENDER.START);
        this.screenPageData._clearBoundaries();

        for (const [key, view] of this.#views.entries()) {
            viewPromises.push(this.#executeRender(key, view));
        }
        Promise.allSettled(viewPromises).then((drawingResults) => {
            drawingResults.forEach((result) => {
                if (result.status === "rejected") {
                    Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason);
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
                            Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason);
                            this.#isActive = false;
                            return reject(WARNING_CODES.UNHANDLED_DRAW_ISSUE + ", reason: " + result.reason);
                        }
                    });
                    return view._executeTileImagesDraw();
                })
                .then(() => {
                    if (view.renderObjects.length !== 0) {
                        //this.#checkCollisions(view.renderObjects);
                        view._prepareBindRenderObjectPromises();
                    }
                    if (key === CONST.LAYERS.BOUNDARIES) {
                        view._prepareBindBoundariesPromise();
                    }
                    return view._executeBindRenderObjectPromises();
                })
                .then((bindResults) => {
                    bindResults.forEach((result) => {
                        if (result.status === "rejected") {
                            Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason);
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