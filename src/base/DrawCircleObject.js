import { CONST } from "../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";

/**
 * Circle object to draw.
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
export class DrawCircleObject extends DrawShapeObject {
    /**
     * @type {number}
     */
    #radius;

    /**
     * @type {Array<number>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(x, y, radius, bgColor) {
        super(CONST.DRAW_TYPE.CIRCLE, x, y, bgColor);
        this.#radius = radius;
        this.#vertices = this._interpolateConus(radius);
    }

    /**
     * Array of [x,y] cords.
     * @type {Array<number>}
     */
    get vertices () {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
    }

    /**
     * @type {number}
     */
    get radius() {
        return this.#radius;
    }

    prepareDraw(pageData, gl) {
        const [ xOffset, yOffset ] = rthis.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
        x = this.x - xOffset,
        y = this.y - yOffset,
        scale = [1, 1],
        rotation = this.rotation,
        coords = this.vertices,
        fillStyle = this.bgColor,
        fade_min = this.fade_min,
        fadeLen = this.radius,
        blend = this.blendFunc ? this.blendFunc : [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
    }
}