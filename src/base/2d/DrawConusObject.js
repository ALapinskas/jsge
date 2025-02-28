import { DRAW_TYPE } from "../../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";

/**
 * Conus object to draw.
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
export class DrawConusObject extends DrawShapeObject {
    /**
     * @type {number}
     */
    #radius;

    /**
     * @type {number}
     */
    #angle;

    /**
     * Array of [x,y] cords.
     * @type {Array<number>}
     */
    #vertices;
    #fade_min;

    /**
     * @hideconstructor
     */
    constructor(x, y, radius, bgColor, angle, fade = 0) {
        super(DRAW_TYPE.CONUS, x, y, bgColor);
        this.#radius = radius;
        this.#angle = angle;
        this.#fade_min = fade;
        this.#vertices = this._interpolateConus(radius, angle);
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

    /**
     * @type {number}
     */
    get angle() {
        return this.#angle;
    }

    /**
     * @type {number}
     */
    get fade_min() {
        return this.#fade_min;
    }

    /**
     * @param {number} value - fade start pos in px
     */
    set fade_min(value) {
        this.#fade_min = value;
    }
}