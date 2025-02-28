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
     * @hideconstructor
     */
    constructor(vertices, bgColor) {
        super(DRAW_TYPE.LINE, vertices[0][0], vertices[0][1], bgColor);
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
}