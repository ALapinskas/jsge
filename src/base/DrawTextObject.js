import { DrawShapeObject } from "./DrawShapeObject.js";
import { Rectangle } from "./Primitives.js";
import { CONST, ERROR_CODES } from "../constants.js";
import { Exception } from "./Exception.js";
import { TextureStorage } from "./WebGl/TextureStorage.js";

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
    #textureCanvas = document.createElement("canvas");

    /**
     * @type {TextureStorage}
     */
    #textureStorage;

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
        const width = this.textMetrics ? Math.floor(this.textMetrics.width) : 300,
            height = this.textMetrics ? Math.floor(this.textMetrics.fontBoundingBoxAscent + this.textMetrics.fontBoundingBoxDescent): 30;
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
     * font color
     * @type {string}
     */
    get fillStyle() {
        return this.#fillStyle;
    }

    /**
     * font color
     */
    set fillStyle(value) {
        if (value !== this.#fillStyle) {
            this.#fillStyle = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * font stroke color
     * @type {string}
     */
    get strokeStyle() {
        return this.#strokeStyle;
    }

    /**
     * font stroke color
     */
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
    get _textureStorage() {
        return this.#textureStorage;
    }

    /**
     * @ignore
     */
    set _textureStorage(texture) {
        this.#textureStorage = texture;
    }

    /**
     * @ignore
     */
    get _textureCanvas() {
        return this.#textureCanvas;
    }

    /**
     * 
     * @returns {void}
     */
    #calculateCanvasTextureAndMeasurements() {
        const ctx = this.#textureCanvas.getContext("2d", { willReadFrequently: true }); // cpu counting instead gpu
        if (ctx) {
            //ctx.clearRect(0, 0, this.#textureCanvas.width, this.#textureCanvas.height);
            ctx.font = this.font;
            this._textMetrics = ctx.measureText(this.text);
            const boxWidth = this.boundariesBox.width, 
                boxHeight = this.boundariesBox.height;
            
            ctx.canvas.width = boxWidth;
            ctx.canvas.height = boxHeight;
            // after canvas resize, have to cleanup and set the font again
            ctx.clearRect(0, 0, boxWidth, boxHeight);
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
            
            if (this.#textureStorage) {
                this.#textureStorage._isTextureRecalculated = true;
            }

            // debug canvas
            // this.#textureCanvas.style.position = "absolute";
            // document.body.appendChild(this.#textureCanvas);
            
        } else {
            Exception(ERROR_CODES.UNHANDLED_EXCEPTION, "can't getContext('2d')");
        }
    }
}