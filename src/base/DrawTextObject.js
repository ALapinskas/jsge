import { DrawShapeObject } from "./DrawShapeObject.js";
import { Rectangle } from "./Primitives/Rectangle.js";
import { CONST } from "../constants.js";

/**
 * @augments DrawShapeObject
 */
export class DrawTextObject extends DrawShapeObject {
    #font;
    #textAlign;
    #textBaseline;
    #fillStyle;
    #strokeStyle;
    #direction;
    #text;
    #textMetrics;

    /**
     * @hideconstructor
     */
    constructor(mapX, mapY, text, font, fillStyle) {
        super(CONST.DRAW_TYPE.TEXT, mapX, mapY);
        this.#text = text;
        this.#font = font;
        this.#fillStyle = fillStyle;
        this.#textMetrics;
    }

    /**
     * Rectangle text box
     * @type {Rectangle}
     */
    get boundariesBox() {
        const width = this.textMetrics ? this.textMetrics.width : 300,
            height = this.textMetrics ? this.textMetrics.actualBoundingBoxAscent + /*this.textMetrics.actualBoundingBoxDescent*/ 5: 30;
        return new Rectangle(this.x, this.y - height, width, height);
    }

    /**
     * @type {String}
     */
    get text() {
        return this.#text;
    }

    set text(value) {
        this.#text = value;
    }

    /**
     * @type {String}
     */
    get font() {
        return this.#font;
    }

    set font(value) {
        this.#font = value;
    }

    /**
     * @type {String}
     */
    get textAlign() {
        return this.#textAlign;
    }

    set textAlign(value) {
        this.#textAlign = value;
    }

    /**
     * @type {String}
     */
    get textBaseline() {
        return this.#textBaseline;
    }

    set textBaseline(value) {
        this.#textBaseline = value;
    }

    /**
     * @type {String}
     */
    get fillStyle() {
        return this.#fillStyle;
    }

    set fillStyle(value) {
        this.#fillStyle = value;
    }

    /**
     * @type {String}
     */
    get strokeStyle() {
        return this.#strokeStyle;
    }

    set strokeStyle(value) {
        this.#strokeStyle = value;
    }

    /**
     * @type {Number}
     */
    get direction() {
        return this.#direction;
    }

    set direction(value) {
        this.#direction = value;
    }

    /**
     * @type {String}
     */
    get textMetrics() {
        return this.#textMetrics;
    }

    set textMetrics(value) {
        this.#textMetrics = value;
    }
}