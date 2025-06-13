import { WARNING_CODES } from "../constants.js";
import { Warning } from "./Exception.js";

import { DrawTiledLayer } from "./2d/DrawTiledLayer.js";
import { DrawImageObject } from "./2d/DrawImageObject.js";
import { DrawCircleObject } from "./2d/DrawCircleObject.js";
import { DrawConusObject } from "./2d/DrawConusObject.js";
import { DrawLineObject } from "./2d/DrawLineObject.js";
import { DrawPolygonObject } from "./2d/DrawPolygonObject.js";
import { DrawRectObject } from "./2d/DrawRectObject.js";
import { DrawTextObject } from "./2d/DrawTextObject.js";
/**
 * A storage for stage data, such as gameObjects,
 * collision shapes, worldDimensions and offset
 * @see {@link GameStage} a part of GameStage
 * @hideconstructor
 */
export class GameStageData {
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
            Warning(WARNING_CODES.WORLD_DIMENSIONS_NOT_SET, "Can't set map collision shapes.");
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
            Warning(WARNING_CODES.WORLD_DIMENSIONS_NOT_SET, "Can't set map collision shapes.");
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