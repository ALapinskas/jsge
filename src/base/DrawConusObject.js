import { CONST } from "../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";
import { Point } from "./Primitives/Point.js";

/**
 * Conus object to draw
 * @augments DrawShapeObject
 */
export class DrawConusObject extends DrawShapeObject {
    /**
     * @type {Array<Point>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(vertices, radius, bgColor, subtractProgram) {
        super(CONST.DRAW_TYPE.CIRCLE, vertices[0], vertices[1], radius, radius, null, bgColor, subtractProgram);
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