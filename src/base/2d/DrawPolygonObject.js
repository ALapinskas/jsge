import { CONST } from "../../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";

/**
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
export class DrawPolygonObject extends DrawShapeObject {
    /**
     * @type {Array<Array<number>>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(vertices, bgColor) {
        super(CONST.DRAW_TYPE.POLYGON, vertices[0].x, vertices[0].y, bgColor);
        this.#vertices = this._convertVerticesArray(vertices);
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