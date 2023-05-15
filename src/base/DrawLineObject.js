import { CONST } from "../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";
import { Point } from "./Primitives/Point.js";

/**
 * Line object to draw
 * @augments DrawShapeObject
 */
export class DrawLineObject extends DrawShapeObject {
    /**
     * @type {Array<Number>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(vertices, bgColor) {
        super(CONST.DRAW_TYPE.LINE, vertices[0][0], vertices[0][1], null, null, null, bgColor);
        this.#vertices = vertices;
    }

    /**
     * @type {Array<Point>}
     */
    get vertices () {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
    }
}