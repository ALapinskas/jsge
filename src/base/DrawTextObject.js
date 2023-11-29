import { DrawShapeObject } from "./DrawShapeObject.js";
import { Rectangle } from "./Primitives.js";
import { CONST, ERROR_CODES } from "../constants.js";
import { Exception } from "./Exception.js";

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
     * @type {HTMLCanvasElement}
     */
    #texture;
    /**
     * @type {boolean}
     */
    #textureRebuilt = false;

    /**
     * @hideconstructor
     */
    constructor(mapX, mapY, text, font, fillStyle) {
        super(CONST.DRAW_TYPE.TEXT, mapX, mapY);
        this.#text = text;
        this.#font = font;
        this.#fillStyle = fillStyle;
        this.#textMetrics;
        this.#calculateCanvasTextureAndMeasurements();
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
        if (value !== this.#text) {
            this.#text = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * @type {string}
     */
    get font() {
        return this.#font;
    }

    set font(value) {
        if (value !== this.#font) {
            this.#font = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * @type {string}
     */
    get textAlign() {
        return this.#textAlign;
    }

    set textAlign(value) {
        if (value !== this.#textAlign) {
            this.#textAlign = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * @type {string}
     */
    get textBaseline() {
        return this.#textBaseline;
    }

    set textBaseline(value) {
        if (value !== this.#textBaseline) {
            this.#textBaseline = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * @type {string}
     */
    get fillStyle() {
        return this.#fillStyle;
    }

    set fillStyle(value) {
        if (value !== this.#fillStyle) {
            this.#fillStyle = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * @type {string}
     */
    get strokeStyle() {
        return this.#strokeStyle;
    }

    set strokeStyle(value) {
        if (value !== this.#strokeStyle) {
            this.#strokeStyle = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * @type {TextMetrics}
     */
    get textMetrics() {
        return this.#textMetrics;
    }

    /**
     * @ignore
     */
    set _textMetrics(value) {
        this.#textMetrics = value;
    }

    /**
     * @ignore
     */
    get _texture() {
        return this.#texture;
    }

    /**
     * @ignore
     */
    get _textureRebuilt() {
        return this.#textureRebuilt;
    }

    /**
     * @ignore
     */
    set _textureRebuilt(value) {
        this.#textureRebuilt = value;
    }

    /**
     * 
     * @returns {void}
     */
    #calculateCanvasTextureAndMeasurements() {
        const canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");
        if (ctx) { 
            ctx.font = this.font;
            this._textMetrics = ctx.measureText(this.text);
            const boxWidth = this.boundariesBox.width, 
                boxHeight = this.boundariesBox.height;
            ctx.canvas.width = boxWidth;
            ctx.canvas.height = boxHeight;
            ctx.font = this.font;
            ctx.textBaseline = "bottom";// bottom
            if (this.fillStyle) {
                ctx.fillStyle = this.fillStyle;
                ctx.fillText(this.text, 0, boxHeight);
            } 
            if (this.strokeStyle) {
                ctx.strokeStyle = this.strokeStyle;
                ctx.strokeText(this.text, 0, boxHeight);
            }
            this.#textureRebuilt = true;
            this.#texture = canvas;
        } else {
            Exception(ERROR_CODES.UNHANDLED_EXCEPTION, "can't getContext('2d')");
        }
    }
}