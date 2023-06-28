import { CONST } from "../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";
import { Vertex } from "./Primitives.js";

/**
 * Conus object to draw
 * @augments DrawShapeObject
 */
export class DrawConusObject extends DrawShapeObject {
    /**
     * @type {Number}
     */
    #radius;

    /**
     * @type {Array<Vertex>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(x, y, radius, bgColor, angle, subtractProgram) {
        super(CONST.DRAW_TYPE.CIRCLE, x, y, bgColor, subtractProgram);
        this.#radius = radius;
        this.#vertices = this.#calculateConusVertices(radius, angle);
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

    get radius() {
        return this.#radius;
    }

    #calculateConusVertices(radius, angle = 2*Math.PI, step = Math.PI/12) {
        let conusPolygonCoords = [0, 0];

        for (let r = 0; r <= angle; r += step) {
            let x2 = Math.cos(r) * radius,
                y2 = Math.sin(r) * radius;

            conusPolygonCoords.push(x2, y2);
        }

        return conusPolygonCoords;
    }
}