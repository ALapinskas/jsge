import { ImageAtlasPosition } from "./ImageAtlasPosition.js";

/**
 * Atlas to store text images
 */
export class TextAtlas {
    #maxTextureSize;
    /**
     * @type {HTMLCanvasElement}
     */
    #image = document.createElement("canvas");
    /**
     * @type {Array<number, number>}
     */
    #currentPos = [0, 0];
    /**
     * @type {number}
     */
    #currentRowHeight = 0;
    /**
     * @type {number}
     */
    #currentRowIndex = 0;
    /**
     * @type {WebGLTexture}
     */
    #texture;
    /**
     * @type {number}
     */
    #textureIndex;
    /**
     * The atlas image size was recalculated,
     * and needed to reattached as a webgl texture
     * @type {boolean}
     */
    #isRecalculated = false;
    /**
     * @hideconstructor
     */
    constructor(maxTextureSize, texture, textureIndex) {
        // too big texture case memory leak
        this.#maxTextureSize = maxTextureSize;
        this.#image.width = 0;
        this.#image.height = 0;
        this.#texture = texture;
        this.#textureIndex = textureIndex;
        //console.log("max texture: ", this.#maxTextureSize);
    }

    /**
     * Check if increasing size of the atlas image is possible
     * @param {number} width 
     * @param {number} height 
     * @returns 
     */
    _isAddPossible(width, height) {
        return this.#image.width + width < this.#maxTextureSize || this.#image.height + height < this.#maxTextureSize;
    }

    /**
     * Add new text image to the atlas image 
     * and return its x, y,w, h atlas position coords
     * @param {HTMLCanvasElement} imageAdd 
     * @returns {Array<number, number>}
     */
    _addNewTextImage(imageAdd, boxWidth, boxHeight) {
        let [atlasPosX, atlasPosY] = this.#currentPos;
        let lastPosX, lastPosY;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = this.#image.width;
        tempCanvas.height = this.#image.height;
        // write to right ->
        if (atlasPosX + boxWidth < this.#maxTextureSize) {
            // add to column
            lastPosX = atlasPosX + boxWidth;
            // if we draw atlas first time, also increase size of canvas image
            if (lastPosX > tempCanvas.width) {
                tempCanvas.width = lastPosX;
            }
            lastPosY = atlasPosY;
            if (this.#currentRowHeight < boxHeight) {
                this.#currentRowHeight = boxHeight;
            }
            if (tempCanvas.height < atlasPosY + this.#currentRowHeight) {
                tempCanvas.height = atlasPosY + this.#currentRowHeight;
            }
            // adding x, y pos
            const ctx = tempCanvas.getContext('2d');
            if (!(atlasPosX === 0 && atlasPosY === 0)) {
                // copy old text
                ctx.drawImage(this.#image, 0, 0);
            }
            // draw text
            ctx.drawImage(imageAdd, atlasPosX, atlasPosY);
        // write down
        } else if (atlasPosY + boxHeight < this.#maxTextureSize) {
            // set x to 0;
            atlasPosX = 0;
            // add to row
            this.#currentRowIndex += 1;

            atlasPosY = atlasPosY + this.#currentRowHeight;
            lastPosY = atlasPosY;
            this.#currentRowHeight = boxHeight;

            if (tempCanvas.width < this.#image.width) {
                tempCanvas.width = this.#image.width;
            }
            if (lastPosY + boxHeight > tempCanvas.height) {
                tempCanvas.height = lastPosY + boxHeight;
            }
            
            lastPosX = boxWidth;
            // adding x, y pos
            const ctx = tempCanvas.getContext('2d');
            // copy old text
            ctx.drawImage(this.#image, 0, 0);
            // draw text
            ctx.drawImage(imageAdd, atlasPosX, atlasPosY);
        } else {
            //
            throw new Error("Overflow error, _isAddingPossible() should be called first");
        }
        // 
        this.#image = tempCanvas;
        //console.log(this.#image);
        //document.body.appendChild(this.#image);
        this._isRecalculated = true;
        this.#currentPos = [lastPosX, lastPosY];
        return [atlasPosX, atlasPosY];
    }

    /**
     * Update image on atlas
     * @param {HTMLCanvasElement} imageAdd 
     * @param {ImageAtlasPosition} atlasPos 
     */
    _updateTextImage(imageAdd, atlasPos) {
        const atlasX = atlasPos.x,
            atlasY = atlasPos.y,
            atlasW = atlasPos.width,
            atlasH = atlasPos.height;
        
        const ctx = this.#image.getContext('2d');
        ctx.clearRect(atlasX, atlasY, atlasW, atlasH);
        ctx.drawImage(imageAdd, atlasX, atlasY);
        
        this._isRecalculated = true;
        return [atlasX, atlasY];
    }

    get _atlasImage() {
        return this.#image;
    }
    get _texture() {
        return this.#texture;
    }

    set _texture(value) {
        this.#texture = value;
    }

    get _textureIndex() {
        return this.#textureIndex;
    }

    incrementIndex() {
        this.#textureIndex++;
    }

    /**
     * The atlas image size was recalculated,
     * and needed to reattached as a webgl texture
     * @returns {boolean}
     */
    get _isRecalculated() {
        return this.#isRecalculated;
    }

    /**
     * @param {boolean} val 
     */
    set _isRecalculated(val) {
        this.#isRecalculated = val;
    }
}