import { CONST } from "../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";

/**
 * Conus object to draw.
 * @augments DrawShapeObject
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
    constructor(x, y, radius, bgColor, subtractProgram) {
        super(CONST.DRAW_TYPE.CIRCLE, x, y, bgColor, subtractProgram);
        this.#radius = radius;
        this.#vertices = this._calculateConusVertices(radius);
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
}