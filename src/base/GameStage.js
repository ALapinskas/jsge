import { CONST, ERROR_CODES, WARNING_CODES } from "../constants.js";
import { GameStageData } from "./GameStageData.js";
import { Exception, Warning } from "./Exception.js";
import AssetsManager from "../../modules/assetsm/dist/assetsm.min.js";
import { DrawObjectFactory } from "./DrawObjectFactory.js";
import { DrawCircleObject } from "./DrawCircleObject.js";
import { DrawConusObject } from "./DrawConusObject.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawLineObject } from "./DrawLineObject.js";
import { DrawPolygonObject } from "./DrawPolygonObject.js";
import { DrawRectObject } from "./DrawRectObject.js";
import { DrawTextObject } from "./DrawTextObject.js";
import { ISystem } from "./ISystem.js";
import { ISystemAudio } from "./ISystemAudio.js";
import { SystemSettings } from "../configs.js";
import { isPointLineIntersect, isPolygonLineIntersect, angle_2points, isCircleLineIntersect } from "../utils.js";
import { Vector } from "./Primitives.js";

/**
 * Represents the stage of the game,<br>
 * Contains pages logic.<br>
 * Instances should be created and registered with System.registerStage() factory method
 * 
 * @see {@link System} instances of this class holds by the System class
 * @hideconstructor
 */
export class GameStage {
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
    #systemReference;
    /**
     * @type {GameStageData}
     */
    #stageData;

    constructor() {
        this.#isActive = false;
        this.#stageData = new GameStageData();
    }

    /**
     * Register stage
     * @param {string} name
     * @param {ISystem} system 
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
        return this.#systemReference.iLoader;
    }

    /**
     * @type {DrawObjectFactory}
     */
    get draw() {
        return this.#systemReference.drawObjectFactory;
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
            Warning(WARNING_CODES.NEW_BEHAVIOR_INTRODUCED, "stage.draw methods add objects to pageData, no need to call addRenderObject");
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
        return this.#systemReference.systemSettings;
    }

    /**
     * @type {ISystemAudio}
     */
    get audio() {
        return this.#systemReference.audio;
    }

    /**
     * @type {ISystem}
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
            
        const newX = centerX + (len * Math.cos(rotation + vertexAngle)),
            newY = centerY + (len * Math.sin(rotation + vertexAngle));
        return [newX, newY];
    }
    #isCircleToBoundariesCollision(x, y, r) {
        const mapObjects = this.stageData.getBoundaries(),
            [mapOffsetX, mapOffsetY] = this.stageData.worldOffset,
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
        const mapObjects = this.stageData.getBoundaries(),
            [mapOffsetX, mapOffsetY] = this.stageData.worldOffset,
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
        this.stageData._setCanvasDimensions(canvasWidth, canvasHeight);
    }
}