/**
 * storing vectors and textures for DrawTiledLayer
 */
export class TiledLayerTempStorage {
    /**
     * @type {Array}
     */
    #vectors;
    /**
     * @type {Array}
     */
    #textures;
    /**
     * @type {Int32Array}
     */
    #boundariesTempIndexes;
    /**
     * @type {number}
     */
    #bufferSize = 0;
    /**
     * @param {number} cells 
     **/
    #cells = 0;
    /**
     * @param {number} nonEmptyCells 
     */
    #nonEmptyCells = 0;
    constructor(cells, nonEmptyCells) {
        this._initiateStorageData(cells, nonEmptyCells);
    }

    get cells() {
        return this.#cells;
    }

    get vectors() {
        return this.#vectors;
    }

    get textures() {
        return this.#textures;
    }

    get _bTempIndexes() {
        return this.#boundariesTempIndexes;
    }

    get bufferSize() {
        return this.#bufferSize;
    }

    _initiateStorageData(cellsSize, emptyCells) {
        this.#cells = cellsSize;
        this.#nonEmptyCells = emptyCells ? emptyCells : cellsSize;
        if (this.#nonEmptyCells > cellsSize) {
            this.#nonEmptyCells  = cellsSize;
        }
        this.#bufferSize = this.#nonEmptyCells * 12;

        this.#vectors = new Array(this.#bufferSize);
        this.#textures = new Array(this.#bufferSize);
        this.#boundariesTempIndexes = new Int32Array(this.#cells * 4);
    }
}