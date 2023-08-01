import { CONST } from "../constants.js";
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

    /**
     * @hideconstructor
     */
    constructor(x, y, radius, bgColor, angle, cut) {
        super(CONST.DRAW_TYPE.CONUS, x, y, bgColor, cut);
        this.#radius = radius;
        this.#angle = angle;
        this.#vertices = this._calculateConusVertices(radius, angle);
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
}