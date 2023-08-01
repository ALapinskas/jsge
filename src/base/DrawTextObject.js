import { DrawShapeObject } from "./DrawShapeObject.js";
import { Rectangle } from "./Primitives.js";
import { CONST } from "../constants.js";

/**
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
export class DrawTextObject extends DrawShapeObject {
    #font;
    #textAlign;
    #textBaseline;
    #fillStyle;
    #strokeStyle;
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
     * Rectangle text box.
     * @type {Rectangle}
     */
    get boundariesBox() {
        const width = this.textMetrics ? this.textMetrics.width : 300,
            height = this.textMetrics ? this.textMetrics.actualBoundingBoxAscent + /*this.textMetrics.actualBoundingBoxDescent*/ 5: 30;
        return new Rectangle(this.x, this.y - height, width, height);
    }

    get vertices() {
        const bb = this.boundariesBox;
        return this._calculateRectVertices(bb.width, bb.height);
    }

    /**
     * @type {string}
     */
    get text() {
        return this.#text;
    }

    set text(value) {
        this.#text = value;
    }

    /**
     * @type {string}
     */
    get font() {
        return this.#font;
    }

    set font(value) {
        this.#font = value;
    }

    /**
     * @type {string}
     */
    get textAlign() {
        return this.#textAlign;
    }

    set textAlign(value) {
        this.#textAlign = value;
    }

    /**
     * @type {string}
     */
    get textBaseline() {
        return this.#textBaseline;
    }

    set textBaseline(value) {
        this.#textBaseline = value;
    }

    /**
     * @type {string}
     */
    get fillStyle() {
        return this.#fillStyle;
    }

    set fillStyle(value) {
        this.#fillStyle = value;
    }

    /**
     * @type {string}
     */
    get strokeStyle() {
        return this.#strokeStyle;
    }

    set strokeStyle(value) {
        this.#strokeStyle = value;
    }

    /**
     * @type {TextMetrics}
     */
    get textMetrics() {
        return this.#textMetrics;
    }

    set _textMetrics(value) {
        this.#textMetrics = value;
    }
}