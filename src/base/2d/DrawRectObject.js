import { DRAW_TYPE } from "../../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";

/**
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
export class DrawRectObject extends DrawShapeObject {
    /**
     * @type {number}
     */
    #w;
    /**
     * @type {number}
     */
    #h;
    /**
     * @type {Array<Array<number>>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(x, y, w, h, bgColor) {
        super(DRAW_TYPE.RECTANGLE, x, y, bgColor);
        this.#w = w;
        this.#h = h;
        this.#vertices = this._calculateRectVertices(w,h);
    }

    /**
     * @type {Array<Array<number>>}
     */
    get vertices () {
        return this.#vertices;
    }
    /**
     * @type {number}
     */
    get width() {
        return this.#w;
    }

    /**
     * @type {number}
     */
    get height() {
        return this.#h;
    }

    set width(w) {
        this.#w = w;
    }

    set height(h) {
        this.#h = h;
    }
}