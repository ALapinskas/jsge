import { CONST } from "../constants.js";
import { generateUniqId } from "../utils.js";
import { Point } from "./Primitives.js";

/**
 * A base draw object
 */
export class DrawShapeObject {
    #x;
    #y;
    #w;
    #h;
    #bg;
    /**
     * @type {CONST.DRAW_TYPE}
     */
    #type;
    #subtract;
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
     * @type {Array<Point>}
     */
    #boundaries = [];

    /**
     * @hideconstructor
     */
    constructor(type, mapX, mapY, width, height, boundaries, bgColor, subtractProgram) {
        this.#x = mapX;
        this.#y = mapY;
        this.#w = width;
        this.#h = height;
        this.#boundaries = boundaries;
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
    get width() {
        return this.#w;
    }

    /**
     * @type {Number}
     */
    get height() {
        return this.#h;
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

    set width(w) {
        this.#w = w;
    }

    set height(h) {
        this.#h = h;
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
     * @type {Number}
     */
    get isRemoved() {
        return this.#isRemoved;
    }

    /**
     * @type {Number}
     */
    get boundaries() {
        return this.#boundaries;
    }

    /**
     * Destroy object on next render iteration
     */
    destroy() {
        this.#isRemoved = true;
    }
}