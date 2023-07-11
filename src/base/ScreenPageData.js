import { ERROR_CODES, WARNING_CODES } from "../constants.js";
import { Exception, Warning } from "./Exception.js";
import { Logger } from "./Logger.js";
/**
 * An interface for common views data such as
 * boundaries, world dimensions, options
 */
export class ScreenPageData {
    #worldWidth;
    #worldHeight;
    #viewWidth;
    #viewHeight;
    #drawWith;
    #drawHeight;
    #xOffset;
    #yOffset;
    #centerX = 0;
    #centerY = 0;
    #rotate = 0;
    /**
     * @type {Array.<Number[]>}
     */
    #boundaries;

    /**
     * @hideconstructor
     */
    constructor() {
        this.#xOffset = 0;
        this.#yOffset = 0;
        this.#boundaries = [];
    }

    /**
     * Add a Boundaries line
     * @param {*} boundaries 
     */
    addBoundaries(boundaries) {
        this.#boundaries.push([boundaries.x1, boundaries.y1, boundaries.x2, boundaries.y2]);
    }

    /**
     * Add array of boundaries lines
     * @param {Array} boundaries 
     */
    addBoundariesArray(boundaries) {
        this.#boundaries.push(...boundaries);
    }

    /**
     * Clear map boundaries
     */
    clearBoundaries() {
        this.#boundaries = [];
    }

    /**
     * 
     * @param {Number} width 
     * @param {Number} height 
     */
    setWorldDimensions(width, height) {
        this.#worldWidth = width;
        this.#worldHeight = height;
    }

    /**
     * @type {Number}
     */
    set xOffset(x) {
        if (!Number.isInteger(x)) {
            Exception(ERROR_CODES.WRONG_TYPE_ERROR, "Only Integers are allowed");
        }
        this.#xOffset = x;
    }

    /**
     * @type {Number}
     */
    set yOffset(y) {
        if (!Number.isInteger(y)) {
            Exception(ERROR_CODES.WRONG_TYPE_ERROR, "Only Integers are allowed");
        }
        this.#yOffset = y;
    }

    /**
     * @type {Number}
     */
    set centerX(x) {
        if (!Number.isInteger(x)) {
            Exception(ERROR_CODES.WRONG_TYPE_ERROR, "Only Integers are allowed");
        }
        this.#centerX = x;
    }

    /**
     * @type {Number}
     */
    set centerY(y) {
        if (!Number.isInteger(y)) {
            Exception(ERROR_CODES.WRONG_TYPE_ERROR, "Only Integers are allowed");
        }
        this.#centerY = y;
    }

    set mapRotate(value) {
        this.#rotate = value;
    }

    /**
     * 
     * @param {Number} width 
     * @param {Number} height 
     */
    setCanvasDimensions(width, height) {
        this.#viewWidth = width;
        this.#viewHeight = height;
    }

    /**
     * 
     * @param {Number} width 
     * @param {Number} height 
     */
    setDrawDimensions(width, height) {
        this.#drawWith = width;
        this.#drawHeight = height;
    }

    /**
     * Set map borders
     */
    setMapBoundaries() {
        const [w, h] = [this.#worldWidth, this.#worldHeight];
        if (!w || !h) {
            Warning(WARNING_CODES.WORLD_DIMENSIONS_NOT_SET, "Can't set map boundaries.");
        }
        this.addBoundaries({x1: 0, y1: 0, x2: w, y2: 0});
        this.addBoundaries({x1: w, y1: 0, x2: w, y2: h});
        this.addBoundaries({x1: w, y1: h, x2: 0, y2: h});
        this.addBoundaries({x1: 0, y1: h, x2: 0, y2: 0});
    }

    /**
     * Merge same boundaries
     */
    mergeBoundaries() {
        const boundaries = this.getBoundaries(),
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

        this.#boundaries = Array.from(boundariesSet);
        boundariesSet.clear();
    }

    /**
     * 
     * @returns {Array}
     */
    getBoundaries() {
        return this.#boundaries;
    }

    /**
     * @type {Array<Number>}
     */
    get drawDimensions() {
        if (this.#drawWith && this.#drawHeight) {
            return [ this.#drawWith, this.#drawHeight ];
        } else {
            return this.canvasDimensions;
        }
    }

    /**
     * @type {Array<Number>}
     */
    get canvasDimensions() {
        return [this.#viewWidth, this.#viewHeight];
    }

    /**
     * @type {Array<Number>}
     */
    get worldDimensions() {
        return [this.#worldWidth, this.#worldHeight];
    }
    
    /**
     * @type {Array<Number>}
     */
    get worldOffset() {
        return [this.#xOffset, this.#yOffset];
    }

    /**
     * @type {Array<Number>}
     */
    get mapCenter() {
        return [this.#centerX, this.#centerY];
    }

    /**
     * @type {Number}
     */
    get mapRotate() {
        return this.#rotate;
    }

    /**
     * @method
     * @param {Number} x 
     * @param {Number} y 
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
                    this.xOffset = Math.round(newXOffset);
            } else if (mapWidth > canvasWidth) {
                const newXOffset = mapWidth - canvasWidth;
                this.xOffset = Math.round(newXOffset);
            }
        }
        if (currentCenterY < y) {
            if (y < mapHeight - halfScreenHeight) {
                const newYOffset = y - halfScreenHeight;
                if (newYOffset >= 0)
                    this.yOffset = Math.round(newYOffset);
            } else if (mapHeight > canvasHeight) {
                const newYOffset = mapHeight - canvasHeight;
                this.yOffset = Math.round(newYOffset);
            }
        }

        this.#centerX = x;
        this.#centerY = y;
        //Logger.debug("center camera position, offset: ", this.worldOffset);
        //Logger.debug("center: ", this.mapCenter);   
    }

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
                    this.xOffset = Math.round(newXOffset);
            } else if (mapWidth > canvasWidth) {
                const newXOffset = mapWidth - canvasWidth;
                this.xOffset = Math.round(newXOffset);
            }
        }
        if (currentCenterY < y) {
            if (y < mapHeight - halfScreenHeight) {
                const newYOffset = y - halfScreenHeight;
                if (newYOffset >= 0)
                    this.yOffset = Math.round(newYOffset);
            } else if (mapHeight > canvasHeight) {
                const newYOffset = mapHeight - canvasHeight;
                this.yOffset = Math.round(newYOffset);
            }
        }

        this.#centerX = x;
        this.#centerY = y;
        Logger.debug("center camera position, offset: ", this.worldOffset);
        Logger.debug("center: ", this.mapCenter);   
        */
    }
}