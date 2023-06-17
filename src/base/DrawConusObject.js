import { CONST } from "../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";
import { Vertex } from "./Primitives.js";

/**
 * Conus object to draw
 * @augments DrawShapeObject
 */
export class DrawConusObject extends DrawShapeObject {
    /**
     * @type {Array<Vertex>}
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
     * @type {Array<Vertex>}
     */
    get vertices () {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
    }
}