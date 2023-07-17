import { CONST } from "../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";

/**
 * @augments DrawShapeObject
 * @ignore
 */
export class DrawRectObject extends DrawShapeObject {
    /**
     * @type {Number}
     */
    #w;
    /**
     * @type {Number}
     */
    #h;
    /**
     * @type {Array<Vertex>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(x, y, w, h, bgColor, subtractProgram) {
        super(CONST.DRAW_TYPE.RECTANGLE, x, y, bgColor, subtractProgram);
        this.#w = w;
        this.#h = h;
    }

    /**
     * @type {Array<Vertex>}
     */
    get vertices () {
        return this.#vertices;
    }
    /**
     * @type {Number}
     */
    get width() {
        return this.#w;
    }

    /**
     * @type {Number}
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