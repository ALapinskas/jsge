import { DRAW_TYPE } from "../../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";

/**
 * Line object to draw.
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
export class DrawLineObject extends DrawShapeObject {
    /**
     * @type {Array<Array<number>>}
     */
    #vertices;

    /**
     * @type {Number}
     */
    #lineWidth = 1;

    /**
     * @hideconstructor
     */
    constructor(vertices, bgColor) {
        super(DRAW_TYPE.LINE, bgColor);
        this.#vertices = vertices;
    }
    /**
     * @type {Array<Array<number>>}
     */
    get vertices () {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
    }

    /**
     * @type {Number}
     */
    get lineWidth() {
        return this.#lineWidth;
    }

    set lineWidth(value) {
        this.#lineWidth = value;
    }
}