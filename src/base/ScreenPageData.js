import { WARNING_CODES } from "../constants.js";
import { Warning } from "./Exception.js";
/**
 * An interface for common views data such as
 * boundaries, world dimensions, options
 * accessible via ScreenPage.screenPageData 
 * @see {@link ScreenPage} a part of ScreenPage
 * @hideconstructor
 */
export class ScreenPageData {
    #worldWidth;
    #worldHeight;
    #viewWidth;
    #viewHeight;
    #xOffset = 0;
    #yOffset = 0;
    #centerX = 0;
    #centerY = 0;
    #rotate = 0;
    /**
     * current screen boundaries, recalculated every render circle
     * @type {Array<Array<number>>}
     */
    #boundaries = [];

    /**
     * whole world boundaries, calculated once on prepare stage
     * @type {Array<Array<number>>}
     */
    #wholeWorldBoundaries = [];
    /**
     * @type {Array<DrawImageObject | DrawCircleObject | DrawConusObject | DrawLineObject | DrawPolygonObject | DrawRectObject | DrawTextObject | TiledRenderLayer>}
     */
    #renderObjects = [];
    
    /**
     * @type {boolean}
     */
    #isOffsetTurnedOff;
    /**
     * @type {boolean}
     */
    #isWorldBoundariesEnabled = false;

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
        this.#boundaries.push([boundaries.x1, boundaries.y1, boundaries.x2, boundaries.y2]);
    }

    /**
     * Add array of boundaries lines
     * @param {Array<Array<number>>} boundaries 
     * @ignore
     */
    _addBoundariesArray(boundaries) {
        this.#boundaries.push(...boundaries);
    }

    /**
     * Clear map boundaries
     * @ignore
     */
    _clearBoundaries() {
        this.#boundaries = [];
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
     * @ignore
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
     * @ignore
     */
    _enableMapBoundaries() {
        this.#isWorldBoundariesEnabled = true;
    }

    /**
     * 
     * @returns {Array<Array<number>>}
     */
    getBoundaries() {
        return this.#boundaries;
    }

    getWholeWorldBoundaries() {
        return this.#wholeWorldBoundaries;
    }

    get isWorldBoundariesEnabled() {
        return this.#isWorldBoundariesEnabled;
    }
    /**
     * @type {Array<number>}
     */
    get canvasDimensions() {
        return [this.#viewWidth, this.#viewHeight];
    }

    /**
     * @type {Array<number>}
     */
    get worldDimensions() {
        return [this.#worldWidth, this.#worldHeight];
    }
    
    /**
     * @type {Array<number>}
     */
    get worldOffset() {
        return [this.#xOffset, this.#yOffset];
    }

    /**
     * @type {Array<number>}
     */
    get mapCenter() {
        return [this.#centerX, this.#centerY];
    }

    /**
     * @type {number}
     */
    get mapRotate() {
        return this.#rotate;
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
     * @ignore
     */
    _sortRenderObjectsBySortIndex() {
        this.#renderObjects = this.#renderObjects.sort((obj1, obj2) => obj1.sortIndex - obj2.sortIndex);
    }

    /**
     * @ignore
     */
    set _renderObject(object) {
        this.#renderObjects.push(object);
    } 

    /**
     * @ignore
     */
    set _renderObjects(objects) {
        this.#renderObjects = objects;
    } 
}