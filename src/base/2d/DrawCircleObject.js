import { DRAW_TYPE } from "../../constants.js";
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
        super(DRAW_TYPE.CIRCLE, x, y, bgColor);
        this.#radius = radius;
        this.#vertices = this._interpolateConus(radius);
    }
    get scale() {
        return super.scale;
    }
    set scale(value) {
        this.#vertices = this._interpolateConus(this.#radius * value);
        super.scale = value;
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