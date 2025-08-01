/**
 * Support class for DrawTextObject 
 * for store the atlas x, y, cords,
 * and the atlas index
 */
export class ImageAtlasPosition {
    /**
     * @type {number}
     */
    #atlasIndex;
    /**
     * @type {number}
     */
    #x;
    /**
     * @type {number}
     */
    #y;
    /**
     * @type {number}
     */
    #w;

    /**
     * @type {number}
     */
    #h;

    /**
     * @type {boolean}
     */
    #isMeasurementsSet = false;
    /**
     * @hideconstructor
     **/
    constructor(width, height) {
        this.#w = width;
        this.#h = height;
    }
    /**
     * @returns {number}
     */
    get x() {
        return this.#x;
    }
    /**
     * @returns {number}
     */
    get y() {
        return this.#y;
    }
    /**
     * @returns {number}
     */
    get width() {
        return this.#w;
    }
    /**
     * @returns {number}
     */
    get height() {
        return this.#h;
    }
    /**
     * @returns {number}
     */
    get atlasIndex() {
        return this.#atlasIndex;
    }

    get isMeasurementsSet() {
        return this.#isMeasurementsSet;
    }

    _setMeasurements(i, x, y) {
        this.#x = x;
        this.#y = y;
        this.#atlasIndex = i;
        this.#isMeasurementsSet = true;
    }
}