import { DRAW_TYPE, ERROR_CODES, WARNING_CODES } from "../constants.js";
import { GameStageData } from "./GameStageData.js";
import { Exception, Warning } from "./Exception.js";
import AssetsManager from "../../modules/assetsm/src/AssetsManager.js";
import { DrawObjectFactory } from "./DrawObjectFactory.js";
import { DrawCircleObject } from "./2d/DrawCircleObject.js";
import { DrawConusObject } from "./2d/DrawConusObject.js";
import { DrawImageObject } from "./2d/DrawImageObject.js";
import { DrawLineObject } from "./2d/DrawLineObject.js";
import { DrawPolygonObject } from "./2d/DrawPolygonObject.js";
import { DrawRectObject } from "./2d/DrawRectObject.js";
import { DrawTextObject } from "./2d/DrawTextObject.js";
import { ISystem } from "./ISystem.js";
import { ISystemAudio } from "./ISystemAudio.js";
import { SystemSettings } from "../configs.js";
import { isPointLineIntersect, isEllipseCircleIntersect, isPointCircleIntersect, isEllipsePolygonIntersect, isPolygonLineIntersect, isPointPolygonIntersect, angle_2points, isCircleLineIntersect } from "../utils.js";
import { Vector } from "./2d/Primitives.js";

/**
 * Represents the stage of the game,<br>
 * Contains pages logic.<br>
 * Instances should be created and registered with System.registerStage() factory method
 * 
 * @see {@link System} instances of this class holds by the System class
 * @hideconstructor
 * @abstract
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
        this.#stageData = new GameStageData(this.#iSystemReference.systemSettings.gameOptions);
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
            Warning(WARNING_CODES.NEW_BEHAVIOR_INTRODUCED, "stage.draw methods add objects to pageData, no need to call addRenderObject");
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
            case DRAW_TYPE.TEXT:
            case DRAW_TYPE.RECTANGLE:
            case DRAW_TYPE.CONUS:
            case DRAW_TYPE.IMAGE:
                if (!circleCollisionShapes) {
                    return this.#isPolygonToCollisionShapesCollision(x, y, vertices, drawObject.rotation);
                } else {
                    return this.#isCircleToCollisionShapesCollision(x, y, drawObject.circleCollisionShapes.r);
                }
            case DRAW_TYPE.CIRCLE:
                Warning(WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.circle check is not implemented yet!");
                break;
            case DRAW_TYPE.LINE:
                Warning(WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.line check is not implemented yet, please use .rect instead line!");
                break;
            default:
                Warning(WARNING_CODES.UNKNOWN_DRAW_OBJECT, "unknown object type!");
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
            case DRAW_TYPE.TEXT:
            case DRAW_TYPE.RECTANGLE:
            case DRAW_TYPE.CONUS:
            case DRAW_TYPE.IMAGE:
                if (!circleCollisionShapes) {
                    return this.#isPolygonToObjectsCollision(x, y, drawObjectCollisionShapes, drawObject.rotation, objects);
                } else {
                    return this.#isCircleToObjectsCollision(x, y, circleCollisionShapes, objects);
                }
            case DRAW_TYPE.CIRCLE:
                Warning(WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.circle check is not implemented yet!");
                break;
            case DRAW_TYPE.LINE:
                Warning(WARNING_CODES.METHOD_NOT_IMPLEMENTED, "isObjectCollision.line check is not implemented yet, please use .rect instead line!");
                break;
            default:
                Warning(WARNING_CODES.UNKNOWN_DRAW_OBJECT, "unknown object type!");
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
            case DRAW_TYPE.TEXT:
            case DRAW_TYPE.RECTANGLE:
            case DRAW_TYPE.CONUS:
            case DRAW_TYPE.IMAGE:
                coll = this.#isPolygonToPolygonCollision(x, y, polygonVertices, polygonRotation, mapObject);
                break;
            case DRAW_TYPE.CIRCLE:
                console.warn("isObjectCollision.circle check is not implemented yet!");
                break;
            case DRAW_TYPE.LINE:
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
                case DRAW_TYPE.TEXT:
                case DRAW_TYPE.RECTANGLE:
                case DRAW_TYPE.CONUS:
                case DRAW_TYPE.IMAGE:
                    if (!circleCollisionShapes) {
                        coll = this.#isCircleToPolygonCollision(x, y, radius, mapObject);
                    } else {
                        coll = this.#isCircleToCircleCollision(x, y, radius, mapObject.x, mapObject.y, circleCollisionShapes.r);
                    }
                    break;
                case DRAW_TYPE.CIRCLE:
                    console.warn("isObjectCollision.circle check is not implemented yet!");
                    break;
                case DRAW_TYPE.LINE:
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
                const intersect = isCircleLineIntersect(xWithOffset, yWithOffset, r, {x1, y1, x2, y2});
                
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
                    intersect = isEllipseCircleIntersect(ellipse, {x:xWithOffset, y:yWithOffset, r});
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
                    intersect = isPointCircleIntersect(xP, yP, {x:xWithOffset, y:yWithOffset, r});
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
                const intersect = isPolygonLineIntersect(polygonWithOffsetAndRotation, {x1, y1, x2, y2});
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
                    intersect = isEllipsePolygonIntersect(ellipse, polygonWithOffsetAndRotation);
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
                    intersect = isPointPolygonIntersect(x, y, polygonWithOffsetAndRotation);
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