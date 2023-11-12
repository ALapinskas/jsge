import { CONST } from "../constants.js";
import { utils } from "../index.js";

/**
 * A base draw object.
 */
export class DrawShapeObject {
    #x;
    #y;
    #bg;
    /**
     * @type {string}
     * @enum {CONST.DRAW_TYPE}
     */
    #type;
    #cut;
    /**
     * Is used for blending pixel arithmetic
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc.
     * @type {Array<number>}
     */
    #blendFunc;
    
    /**
     * @type {number}
     */
    #sortIndex = 0;
    /**
     * @type {number}
     */
    #zIndex = 0;
    /**
     * @type {number}
     */
    #rotation = 0;
    /**
     * @type {number}
     */
    #id = utils.generateUniqId();
    /**
     * @type {boolean}
     */
    #isRemoved = false;

    /**
     * @hideconstructor
     */
    constructor(type, mapX, mapY, bgColor, zIndex = 0, cut) {
        this.#x = mapX;
        this.#y = mapY;
        this.#bg = bgColor;
        this.#type = type;
        this.#cut = cut;
        this.#zIndex = zIndex;
    }

    /**
     * Background color as rgba(r,g,b,a).
     * @type {string}
     */
    get bgColor() {
        return this.#bg;
    }

    set bgColor(value) {
        this.#bg = value;
    }

    /**
     * @type {string}
     * @enum {CONST.DRAW_TYPE}
     */
    get type() {
        return this.#type;
    }

    /**
     * @type {number}
     */
    get x() {
        return this.#x;
    }

    /**
     * @type {number}
     */
    get y () {
        return this.#y;
    }

    set x(posX) {
        this.#x = posX;
    }

    set y(posY) {
        this.#y = posY;
    }

    /**
     * @type {boolean}
     */
    get cut() {
        return this.#cut;
    }

    /**
     * @type {number}
     */
    get zIndex () {
        return this.#zIndex;
    }

    /**
     * @type {number}
     */
    get sortIndex () {
        return this.#sortIndex;
    }

    set sortIndex(value) {
        this.#sortIndex = value;
    }

    get blendFunc () {
        return this.#blendFunc;
    }

    set blendFunc(value) {
        this.#blendFunc = value;
    }

    /**
     * @type {number}
     */
    get rotation() {
        return this.#rotation;
    }

    set rotation(value) {
        this.#rotation = value;
    }

    /**
     * @type {number}
     */
    get id() {
        return this.#id;
    }

    /**
     * @type {boolean}
     */
    get isRemoved() {
        return this.#isRemoved;
    }

    /**
     * Destroy object on next render iteration.
     */
    destroy() {
        this.#isRemoved = true;
    }

    /**
     * @param {number} width 
     * @param {number} height 
     * @returns {Array<Array<number>>}
     */
    _calculateRectVertices = (width, height) => {
        const halfW = width/2,
            halfH = height/2;
        return [[-halfW, -halfH], [halfW, -halfH], [halfW, halfH], [-halfW, halfH]];
    };

    /**
     * @param {number} radius 
     * @param {number} [angle = 2 * Math.PI]
     * @param {number} [step = Math.PI/12] 
     * @returns {Array<number>}
     * @ignore
     */
    _calculateConusVertices(radius, angle = 2*Math.PI, step = Math.PI/14) {
        let conusPolygonCoords = [0, 0];

        for (let r = 0; r <= angle; r += step) {
            let x2 = Math.cos(r) * radius,
                y2 = Math.sin(r) * radius;

            conusPolygonCoords.push(x2, y2);
        }

        return conusPolygonCoords;
    }

    /**
     * @param {Array<Array<number>> | Array<{x:number, y:number}>} boundaries
     * @returns {Array<Array<number>>}
     * @ignore
     */
    _convertVerticesArray(boundaries) {
        if (typeof boundaries[0].x !== "undefined" && typeof boundaries[0].y !== "undefined") {
            return utils.verticesArrayToArrayNumbers(boundaries);
        } else {
            return boundaries;
        }
    }
}