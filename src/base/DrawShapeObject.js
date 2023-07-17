import { CONST } from "../constants.js";
import { generateUniqId } from "../utils.js";
import { Vertex } from "./Primitives.js";

/**
 * A base draw object
 * @ignore
 */
export class DrawShapeObject {
    #x;
    #y;
    #bg;
    /**
     * @type {CONST.DRAW_TYPE}
     */
    #type;
    #subtract;
    /**
     * Is used for blending pixel arithmetic
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
     * @type {Array<WebGL_API.Types>}
     */
    #blendFunc;
    
    /**
     * @type {Number}
     */
    #zIndex = 0;
    /**
     * @type {Number}
     */
    #rotation = 0;
    /**
     * @type {Number}
     */
    #id = generateUniqId();
    /**
     * @type {Boolean}
     */
    #isRemoved = false;

    /**
     * @hideconstructor
     */
    constructor(type, mapX, mapY, bgColor, subtractProgram) {
        this.#x = mapX;
        this.#y = mapY;
        this.#bg = bgColor;
        this.#type = type;
        this.#subtract = subtractProgram;
    }

    /**
     * background color as rgba(r,g,b,a)
     * @type {String}
     */
    get bgColor() {
        return this.#bg;
    }

    set bgColor(value) {
        this.#bg = value;
    }

    /**
     * @type {CONST.DRAW_TYPE}
     */
    get type() {
        return this.#type;
    }

    /**
     * @type {Number}
     */
    get x() {
        return this.#x;
    }

    /**
     * @type {Number}
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
     * @type {String}
     */
    get subtract() {
        return this.#subtract;
    }

    /**
     * @type {Number}
     */
    get zIndex () {
        return this.#zIndex;
    }

    set zIndex(value) {
        this.#zIndex = value;
    }

    get blendFunc () {
        return this.#blendFunc;
    }

    set blendFunc(value) {
        this.#blendFunc = value;
    }

    /**
     * @type {Number}
     */
    get rotation() {
        return this.#rotation;
    }

    set rotation(value) {
        this.#rotation = value;
    }

    /**
     * @type {Number}
     */
    get id() {
        return this.#id;
    }

    /**
     * @type {Boolean}
     */
    get isRemoved() {
        return this.#isRemoved;
    }

    /**
     * Destroy object on next render iteration
     */
    destroy() {
        this.#isRemoved = true;
    }
}