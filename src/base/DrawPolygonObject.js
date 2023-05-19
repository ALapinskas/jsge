import { CONST } from "../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";
import { Point } from "./Primitives.js";

/**
 * @augments DrawShapeObject
 */
export class DrawPolygonObject extends DrawShapeObject {
    /**
     * @type {Array<Point>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(vertices, bgColor, subtractProgram) {
        super(CONST.DRAW_TYPE.POLYGON, vertices[0].x, vertices[0].y, null, null, null, bgColor, subtractProgram);
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