import { CONST, ERROR_CODES, WARNING_CODES } from "../constants.js";
import { ScreenPageData } from "./ScreenPageData.js";
import { Exception, Warning } from "./Exception.js";
import { Logger } from "./Logger.js";
import AssetsManager from "../../modules/assetsm/dist/assetsm.min.js";
import { TiledRenderLayer } from "./TiledRenderLayer.js";
import { RenderInterface } from "./RenderInterface.js";
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
import { isPointLineIntersect, isPolygonLineIntersect, angle_2points, isCircleLineIntersect } from "../utils.js";
import { Vector } from "./Primitives.js";
import { DrawShapeObject } from "./DrawShapeObject.js";

/**
 * Represents the page of the game,<br>
 * Register and holds CanvasInterface.<br>
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
    #systemReference;
    /**
     * @type {ScreenPageData}
     */
    #screenPageData;

    constructor() {
        this.#isActive = false;
        this.#screenPageData = new ScreenPageData();
    }

    /**
     * Register stage
     * @param {string} name
     * @param {SystemInterface} system 
     * @ignore
     */
    _register(name, system) {
        this.#name = name;
        this.#systemReference = system;
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
        return this.#systemReference.loader;
    }

    /**
     * @type {DrawObjectFactory}
     */
    get draw() {
        return this.#systemReference.drawObjectFactory;
    }

    /**
     * Creates new canvas layer
     * and set it to the #views
     * @param {string} name
     * @param {boolean} [isOffsetTurnedOff = false] - determines if offset is affected on this layer or not
     * @returns {CanvasView}
     */
    createCanvasView = (name, isOffsetTurnedOff = false) => {
        if (name && name.trim().length > 0) {
            console.warn("createCanvasView is deprecated. For layer masks use .setMask(drawObject).");
            //const newView = new CanvasView(name, this.#system.systemSettings, this.#screenPageData, this.loader, this.system.webGlInterface, isOffsetTurnedOff);
            //this.#views.set(name, newView);
            return {};//newView;
        } else
            Exception(ERROR_CODES.UNEXPECTED_INPUT_PARAMS);
    };

    /**
     * Attach all canvas elements from the #views to container
     * @param {HTMLElement} container
     * @ignore
     */
    _attachCanvasToContainer(container) {
        this.#attachElementToContainer(this.canvasHtmlElement, container);
        //for (const view of this.#views.values()) {
        //    this.#attachElementToContainer(view.canvas, container);
        //}
    }

    /**
     * Add render object to the view
     * @param {string} canvasKey - deprecated parameter
     * @param { DrawConusObject | DrawImageObject | 
     *          DrawLineObject | DrawPolygonObject | 
     *          DrawRectObject | DrawCircleObject | 
     *          DrawTextObject } renderObject 
     */
    addRenderObject = (canvasKey, renderObject) => {
        //a small workaround for 
        if (!renderObject) {
            renderObject = canvasKey;
        } else {
            Warning(WARNING_CODES.DEPRECATED_PARAMETER, "canvasKey parameter is deprecated and no longer needed");
        }
        const data = this.screenPageData,
            isDataAlreadyAdded = data.renderObjects.indexOf(renderObject) !== -1;
        if (isDataAlreadyAdded) {
            Warning(WARNING_CODES.NEW_BEHAVIOR_INTRODUCED, "page.draw methods add objects to pageData, no need to call addRenderObject");
        } else {
            data._renderObject = renderObject;
            data._sortRenderObjectsBySortIndex(); 
        }
    };

    /**
     * Add render layer to the view
     * @deprecated
     * @param {string} canvasKey 
     * @param {string} layerKey 
     * @param {string} tileMapKey 
     * @param {boolean=} setBoundaries 
     * @param {DrawShapeObject=} shapeMask
     */
    addRenderLayer = (canvasKey, layerKey, tileMapKey, setBoundaries, shapeMask) => {
        if (!canvasKey) {
            Exception(ERROR_CODES.CANVAS_KEY_NOT_SPECIFIED, ", should pass canvasKey as 3rd parameter");
        //} else if (!this.#views.has(canvasKey)) {
        //    Exception(ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", should create canvas view, with " + canvasKey + " key first");
        } else {
            Warning(WARNING_CODES.DEPRECATED_PARAMETER, "page.addRenderLayer is deprecated and will be removed, use page.draw.tiledLayer instead");
            //const view = this.#views.get(canvasKey);
            const data = this.screenPageData;
            data._renderObject = this.draw.tiledLayer(layerKey, tileMapKey, setBoundaries, shapeMask);
            if (setBoundaries && this.systemSettings.gameOptions.render.boundaries.mapBoundariesEnabled) {
                data._enableMapBoundaries();
            }
            data._sortRenderObjectsBySortIndex();
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
    //isAllFilesLoaded = () => {
    //   return this.loader.filesWaitingForUpload === 0;
    //};

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
        return this.#systemReference.systemSettings;
    }

    /**
     * @type {SystemAudioInterface}
     */
    get audio() {
        return this.#systemReference.audio;
    }

    /**
     * @type {SystemInterface}
     */
    get system() {
        return this.#systemReference;
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
        this.system.addEventListener(eventName, listener, options);
    };

    /**
     * 
     * @param {string} eventName 
     * @param {*} listener 
     * @param {*=} options 
     */
    removeEventListener = (eventName, listener, options) => {
        this.system.removeEventListener(eventName, listener, options);
    };

    /**
     * 
     */
    //get renderInterface() {
    //    return this.#renderInterface;
    //}
    
    /**
     * @deprecated
     * @method
     * @param {string} key 
     * @returns {CanvasView | undefined}
     */
    getView = (key) => {
        console.warn("ScreenPage.getView() is deprecated. Use ScreenPage.system.renderInterface for render, and ScreenPage.screenPageData for data instead");
        return;
        /*
        const ctx = this.#views.get(key);
        if (ctx) {
            return this.#views.get(key);
        } else {
            Exception(ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", cannot find canvas with key " + key);
        }*/
    };

    /**
     * Start page render
     * @param {Object=} options 
     * @ignore
     */
    _start(options) {
        this.start(options);
        //this.#renderInterfaceReference = renderInterface;
        this.#isActive = true;
        window.addEventListener("resize", this._resize);
        this._resize();
        //if (this.#views.size > 0) {
            //requestAnimationFrame(this.#render);
        //}
    }

    /**
     * Stop page render
     * @ignore
     */
    _stop() {
        this.#isActive = false;
        window.removeEventListener("resize", this._resize);
        //this.#removeCanvasFromDom();
        //clearInterval(this.#fpsAverageCountTimer);
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
        for (const canvas of document.getElementsByTagName("canvas")) {
            canvas.remove();
        }
        //for (const view of this.#views.values()) {
        //        document.getElementById(view.canvas.id).remove();
        //    }
    }

    #setWorldDimensions() {
        const width = this.systemSettings.worldSize ? this.systemSettings.worldSize.width : 0,
            height = this.systemSettings.worldSize ? this.systemSettings.worldSize.height : 0;
            
        this.screenPageData._setWorldDimensions(width, height);
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
        case CONST.DRAW_TYPE.TEXT:
        case CONST.DRAW_TYPE.RECTANGLE:
        case CONST.DRAW_TYPE.CONUS:
        case CONST.DRAW_TYPE.IMAGE:
            if (!circleBoundaries) {
                return this.#isPolygonToBoundariesCollision(x, y, vertices, drawObject.rotation);
            } else {
                return this.#isCircleToBoundariesCollision(x, y, drawObject.circleBoundaries.r);
            }
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
            drawObjectBoundaries = drawObject.vertices,
            circleBoundaries = drawObject.circleBoundaries;
        switch(drawObjectType) {
        case CONST.DRAW_TYPE.TEXT:
        case CONST.DRAW_TYPE.RECTANGLE:
        case CONST.DRAW_TYPE.CONUS:
        case CONST.DRAW_TYPE.IMAGE:
            if (!circleBoundaries) {
                return this.#isPolygonToObjectsCollision(x, y, drawObjectBoundaries, drawObject.rotation, objects);
            } else {
                return this.#isCircleToObjectsCollision(x, y, circleBoundaries, objects);
            }
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
                case CONST.DRAW_TYPE.TEXT:
                case CONST.DRAW_TYPE.RECTANGLE:
                case CONST.DRAW_TYPE.CONUS:
                case CONST.DRAW_TYPE.IMAGE:
                    if (!circleBoundaries) {
                        coll = this.#isCircleToPolygonCollision(x, y, radius, mapObject);
                    } else {
                        coll = this.#isCircleToCircleCollision(x, y, radius, mapObject.x, mapObject.y, circleBoundaries.r);
                    }
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
 
    #takeTheClosestCollision(collisions) {
        return collisions.sort((a,b) => a.p < b.p)[0];
    }

    #isCircleToPolygonCollision(x, y, radius, mapObject) {
        const [mapOffsetX, mapOffsetY] = this.screenPageData.worldOffset,
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
            intersect = isCircleLineIntersect(xWithOffset, yWithOffset, radius, edge);
        if (intersect) {
            //console.log("polygon: ", polygonWithOffsetAndRotation);
            //console.log("intersect: ", intersect);
            return intersect;
        }
    }
    return false;
    }

    #isCircleToCircleCollision(circle1X, circle1Y, circle1R, circle2X, circle2Y, circle2R) {
        const len = new Vector(circle1X, circle1Y, circle2X, circle2Y).length;
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
                        //console.log("boundaries collision detected");
                    }
                }
            }
        }
    }

    #isCircleToBoundariesCollision(x, y, r) {
        const mapObjects = this.screenPageData.getBoundaries(),
            [mapOffsetX, mapOffsetY] = this.screenPageData.worldOffset,
            xWithOffset = x - mapOffsetX,
            yWithOffset = y - mapOffsetY,
            len = mapObjects.length;

        for (let i = 0; i < len; i+=1) {
            const item = mapObjects[i];
            const object = {
                    x1: item[0],
                    y1: item[1],
                    x2: item[2],
                    y2: item[3]
                },
                intersect = isCircleLineIntersect(xWithOffset, yWithOffset, r, object);
            if (intersect) {
                //console.log("rotation: ", rotation);
                //console.log("polygon: ", polygonWithOffsetAndRotation);
                //console.log("intersect: ", intersect);
                return intersect;
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
    //****************** End Collisions ****************//

    #setCanvasSize() {
        const canvasWidth = this.systemSettings.canvasMaxSize.width && (this.systemSettings.canvasMaxSize.width < window.innerWidth) ? this.systemSettings.canvasMaxSize.width : window.innerWidth,
            canvasHeight = this.systemSettings.canvasMaxSize.height && (this.systemSettings.canvasMaxSize.height < window.innerHeight) ? this.systemSettings.canvasMaxSize.height : window.innerHeight;
        this.screenPageData._setCanvasDimensions(canvasWidth, canvasHeight);
        //this.#renderInterface.setCanvasSize(canvasWidth, canvasHeight)
        //for (const view of this.#views.values()) {
        //    view._setCanvasSize(canvasWidth, canvasHeight);
        //}
    }
}