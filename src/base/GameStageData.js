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
 * boundaries, worldDimensions and offset
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
    #maxBoundariesSize = 0;
    /**
     * @type {number}
     */
    #maxEllipseBoundSize = 0;
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
     * current screen boundaries, recalculated every render cycles
     * stored as floatArray, 
     * each 4 cells, represent a line with coords x1,y1,x2,y2
     * @type {Float32Array}
     */
    #boundaries;
    /**
     * ellipse boundaries
     * stored as floatArray, 
     * each 4 cells, represent am ellipse with cords centerX, centerY, radiusX, radiusY
     * @type {Float32Array}
     */
    #ellipseBoundaries;
    /**
     * point boundaries
     * stored as floatArray, 
     * each 2 cells, represent a point with coords x1,y1
     * @type {Float32Array}
     */
    #pointBoundaries;
    /**
     * whole world boundaries, calculated once on prepare stage
     * @type {Array<Array<number>>}
     */
    #wholeWorldBoundaries;
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
    #isWorldBoundariesEnabled = false;

    /**
     * @type {Array<number>}
     */
    #debugObjectBoundaries = [];
    /**
     * 
     * @type {boolean}
     */
    #isDebugObjectBoundaries = false;

    constructor(gameOptions) {
        //this.#boundaries = new Float32Array(this.#maxBoundariesSize);
        //this.#ellipseBoundaries = new Float32Array(this.#maxBoundariesSize);
        //this.#pointBoundaries = new Float32Array(this.#maxBoundariesSize);
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
     * Add a Boundaries line
     * @param {{x1:number,y1:number,x2:number, y2:number}} boundaries 
     */
    #addBoundaries(boundaries) {
        this._addBoundaryLine(boundaries.x1,boundaries.y1, boundaries.x2, boundaries.y2);
    }

    /**
     * Add array of boundaries lines
     * @param {Array<Array<number>>} boundaries 
     * @ignore
     */
    _addImageDebugBoundaries(boundaries) {
        const len = boundaries.length;
        for (let i = 0; i < len; i++) {
            this.#debugObjectBoundaries.push(...boundaries[i]);
        }
    }

    _enableDebugObjectBoundaries() {
        this.#isDebugObjectBoundaries = true;
    }
    /**
     * Add array of boundaries lines
     * @param {Array<Array<number>>} boundaries 
     * @ignore
     */
    _addBoundariesArray(boundaries) {
        const len = boundaries.length;
        for (let i = 0; i < len; i++) {
            const boundary = boundaries[i];
            this._addBoundaryLine(boundary[0], boundary[1], boundary[2], boundary[3]);
        }
    }

    _addBoundaryLine(x1, y1, x2, y2) {
        this.#boundaries[this.#bPointer] = x1;
        this.#bPointer++;
        this.#boundaries[this.#bPointer] = y1;
        this.#bPointer++;
        this.#boundaries[this.#bPointer] = x2;
        this.#bPointer++;
        this.#boundaries[this.#bPointer] = y2;
        this.#bPointer++;
    }

    _addEllipseBoundary(w, h, x, y) {
        this.#ellipseBoundaries[this.#ePointer] = w;
        this.#ePointer++;
        this.#ellipseBoundaries[this.#ePointer] = h;
        this.#ePointer++;
        this.#ellipseBoundaries[this.#ePointer] = x;
        this.#ePointer++;
        this.#ellipseBoundaries[this.#ePointer] = y;
        this.#ePointer++;
    }

    _addPointBoundary(x,y) {
        this.#pointBoundaries[this.#pPointer] = x;
        this.#pPointer++;
        this.#pointBoundaries[this.#pPointer] = y;
        this.#pPointer++;
    }

    _removeBoundaryLine(startPos) {
        this.#boundaries[startPos] = 0;
        this.#boundaries[startPos + 1] = 0;
        this.#boundaries[startPos + 2] = 0;
        this.#boundaries[startPos + 3] = 0;
    }

    /**
     * Clear map boundaries
     * @ignore
     */
    _clearBoundaries() {
        this.#boundaries.fill(0);
        this.#ellipseBoundaries.fill(0);
        this.#pointBoundaries.fill(0);
        
        this.#bPointer = 0;
        this.#ePointer = 0;
        this.#pPointer = 0;
        if (this.#isDebugObjectBoundaries) {
            this.#debugObjectBoundaries = [];
        }
    }

    _initiateBoundariesData() {
        this.#boundaries = new Float32Array(this.#maxBoundariesSize);
        this.#ellipseBoundaries = new Float32Array(this.#maxEllipseBoundSize);
        this.#pointBoundaries = new Float32Array(this.#maxPointBSize);
    }

    /**
     * 
     * @param {number} bSize
     * @param {number} eSize - ellipse boundaries size
     * @param {number} pSize - points boundaries size
     * @ignore
     */
    _setMaxBoundariesSize(bSize, eSize = 0, pSize = 0) {
        this.#maxBoundariesSize = bSize;
        this.#maxEllipseBoundSize = eSize;
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
    _setMapBoundaries() {
        const [w, h] = [this.#worldWidth, this.#worldHeight],
            [offsetX, offsetY] = [this.#xOffset, this.#yOffset],
            wOffset = w - offsetX,
            hOffset = h -offsetY;
        if (!w || !h) {
            Warning(WARNING_CODES.WORLD_DIMENSIONS_NOT_SET, "Can't set map boundaries.");
        }
        this.#addBoundaries({x1: 0, y1: 0, x2: wOffset, y2: 0});
        this.#addBoundaries({x1: wOffset, y1: 0, x2: wOffset, y2: hOffset});
        this.#addBoundaries({x1: wOffset, y1: hOffset, x2: 0, y2: hOffset});
        this.#addBoundaries({x1: 0, y1: hOffset, x2: 0, y2: 0});
    }

    /**
     * @ignore
     */
    _setWholeWorldMapBoundaries() {
        const [w, h] = [this.#worldWidth, this.#worldHeight];
        if (!w || !h) {
            Warning(WARNING_CODES.WORLD_DIMENSIONS_NOT_SET, "Can't set map boundaries.");
        }
        this.#wholeWorldBoundaries.push([0, 0, w, 0]);
        this.#wholeWorldBoundaries.push([w, 0, w, h]);
        this.#wholeWorldBoundaries.push([w, h, 0, h]);
        this.#wholeWorldBoundaries.push([0, h, 0, 0]);
    }

    /**
     * Merge same boundaries
     * !not used
     * @ignore
     * @deprecated
     */
    _mergeBoundaries(isWholeMapBoundaries = false) {
        const boundaries = isWholeMapBoundaries ? this.getWholeWorldBoundaries() : this.getBoundaries(),
            boundariesSet = new Set(boundaries);

        for (const line of boundariesSet.values()) {
            const lineX1 = line[0],
                lineY1 = line[1],
                lineX2 = line[2],
                lineY2 = line[3];
            for (const line2 of boundariesSet.values()) {
                const line2X1 = line2[0],
                    line2Y1 = line2[1],
                    line2X2 = line2[2],
                    line2Y2 = line2[3];
                if (lineX1 === line2X2 && lineY1 === line2Y2 &&
                    lineX2 === line2X1 && lineY2 === line2Y1) {
                    //remove double lines
                    boundariesSet.delete(line);
                    boundariesSet.delete(line2);
                }
                if (lineX2 === line2X1 && lineY2 === line2Y1 && (lineX1 === line2X2 || lineY1 === line2Y2)) {
                    //merge lines
                    line2[0] = lineX1;
                    line2[1] = lineY1;
                    boundariesSet.delete(line);
                }
            }
        }
        if (isWholeMapBoundaries) {
            this.#boundaries = Array.from(boundariesSet);
        } else {
            this.#wholeWorldBoundaries = Array.from(boundariesSet);
        }
        boundariesSet.clear();
    }

    /**
     * @ignore
     * @param {Array<Array<number>>} boundaries 
     */
    _setWholeMapBoundaries(boundaries) {
        this.#wholeWorldBoundaries.push(...boundaries);
    }

    /**
     * @deprecated
     * @ignore
     */
    _enableMapBoundaries() {
        this.#isWorldBoundariesEnabled = true;
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
     * current screen boundaries, 
     * this method is for backward capability with jsge@1.4.4
     * recommended to use getRawBoundaries()
     * @returns {Array<Array<number>>}
     */
    getBoundaries() {
        const boundaries = this.#boundaries, 
            len = this.#bPointer;

        let bTempArray = [],
            bArray = [];
        
        for (let i = 0; i < len; i++) {
            const element = boundaries[i];
            bTempArray.push(element);
            if (((i + 1) % 4) === 0) {
                bArray.push(bTempArray);
                bTempArray = [];
            }
        }
        return bArray;
    }

    /**
     * current screen boundaries
     * polygon boundaries from Tiled and Tiled boundaries layers are merged here
     * each 4 cells, represent a line with coords x1,y1,x2,y2
     * @returns {Float32Array}
     */
    getRawBoundaries() {
        return this.#boundaries;
    }

    /**
     * ellipse boundaries from Tiled,
     * stored as floatArray, 
     * each 4 cells, represent am ellipse with cords centerX, centerY, radiusX, radiusY
     * @returns {Float32Array}
     */
    getEllipseBoundaries() {
        return this.#ellipseBoundaries;
    }

    /**
     * point boundaries from Tiled,
     * stored as floatArray, 
     * each 2 cells, represent a point with coords x1,y1
     * @returns {Float32Array}
     */
    getPointBoundaries() {
        return this.#pointBoundaries;
    }

    getWholeWorldBoundaries() {
        return this.#wholeWorldBoundaries;
    }

    getDebugObjectBoundaries() {
        return this.#debugObjectBoundaries;
    }

    /**
     * @deprecated
     */
    get isWorldBoundariesEnabled() {
        return this.#isWorldBoundariesEnabled;
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
     * Tiled polygon and Tiled layer boundaries length
     * @returns {number}
     */
    get boundariesLen() {
        return this.#bPointer;
    }

    /**
     * Tiled ellipse boundaries length
     * @returns {number}
     */
    get ellipseBLen() {
        return this.#ePointer;
    }

    /**
     * Tiled point length
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
        this._clearBoundaries();
    }
}