import { DrawShapeObject } from "./DrawShapeObject.js";
import { Rectangle } from "./Primitives.js";
import { DRAW_TYPE, ERROR_CODES } from "../../constants.js";
import { Exception } from "../Exception.js";
import { ImageAtlasPosition } from "../Temp/ImageAtlasPosition.js";

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

    /**
     * @type {number}
     */
    #lineHeight = 1;
    #text;
    /**
     * @type {HTMLCanvasElement}
     */
    #textureCanvas = document.createElement("canvas");
    /**
     * @type {boolean}
     */
    #isTextureUpdated = false;

    /**
     * @type {ImageAtlasPosition}
     */
    #atlasPosition;

    /**
     * @hideconstructor
     */
    constructor(mapX, mapY, text, font, fillStyle, boxWidth, boxHeight) {
        super(DRAW_TYPE.TEXT, mapX, mapY);
        this.#text = text;
        this.#font = font;
        this.#fillStyle = fillStyle;
        this.#calculateCanvasTextureAndMeasurements(boxWidth, boxHeight);
    }

    /**
     * Rectangle text box.
     * @return {Rectangle}
     */
    get boundariesBox() {
        const width = this._atlasPos.width,
            height = this._atlasPos.height;
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
    get scale() {
        return super.scale;
    }
    set scale(value) {
        if (value !== this.scale) {
            super.scale = value;
            this.#calculateCanvasTextureAndMeasurements();
        }
    }

    /**
     * @ignore
     * @returns {HTMLCanvasElement}
     */
    get _textureCanvas() {
        return this.#textureCanvas;
    }

    /**
     * @ignore
     * @returns {ImageAtlasPosition}
     */
    get _atlasPos() {
        return this.#atlasPosition;
    }

    get _isTextureUpdated() {
        return this.#isTextureUpdated;
    }

    /**
     * @param {number} value 
     */
    set lineHeight(value) {
        this.#lineHeight = value;
    }
    _setTextureUpdated() {
        this.#isTextureUpdated = false;
    }

    /**
     * 
     * @returns {void}
     */
    #calculateCanvasTextureAndMeasurements(atlasWidth, atlasHeight) {
        const ctx = this._textureCanvas.getContext("2d", { willReadFrequently: true }); // cpu counting instead gpu
        if (ctx) {
            //ctx.clearRect(0, 0, this.#textureCanvas.width, this.#textureCanvas.height);
            ctx.font = this.font;

            let atlasWidth = 0, 
                atlasHeight = 0,
                linePosY = [];
            const lines = this.text.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const metrics = ctx.measureText(lines[i]);
                const lineWidth =  metrics.width;
                if (lineWidth > atlasWidth) {
                    atlasWidth = Math.floor(lineWidth);
                }
                const fontHeight = Math.floor( metrics.fontBoundingBoxAscent +  metrics.fontBoundingBoxDescent);
                const actualLineHeight = fontHeight * this.#lineHeight;
                
                atlasHeight += actualLineHeight;
                linePosY[i] = atlasHeight;
            }
            
            if (!this._atlasPos || (this._atlasPos.width !== atlasWidth && this._atlasPos.height !== atlasHeight)) {
                this.#atlasPosition = new ImageAtlasPosition(atlasWidth, atlasHeight);
            }

            ctx.canvas.width = atlasWidth;
            ctx.canvas.height = atlasHeight;
            // after canvas resize, have to cleanup and set the font again
            ctx.clearRect(0, 0, atlasWidth, atlasHeight);
            ctx.font = this.font;
            ctx.textBaseline = "bottom";// bottom
            if (this.fillStyle) {
                ctx.fillStyle = this.fillStyle;
                for (let i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], 0, linePosY[i]);
                }
            } 

            // 6. Отрисовка обводки (strokeText) для всех строк
            if (this.strokeStyle) {
                ctx.strokeStyle = this.strokeStyle;
                // Обязательно дублируем настройки lineWidth / lineJoin, если они у вас есть
                if (this.lineWidth) ctx.lineWidth = this.lineWidth; 
                
                for (let i = 0; i < lines.length; i++) {
                    ctx.strokeText(lines[i], 0, linePosY[i]);
                }
            }
            this.#isTextureUpdated = true;
            // debug canvas
            //this.#textureCanvas.style.position = "absolute";
            //document.body.appendChild(this.#textureCanvas);
            
        } else {
            Exception(ERROR_CODES.UNHANDLED_EXCEPTION, "can't getContext('2d')");
        }
    }
}