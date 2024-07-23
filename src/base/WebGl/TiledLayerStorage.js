/**
 * storing vectors and textures for DrawTiledLayer
 */
export class TiledLayerStorage {
    /**
     * @type {Float32Array}
     */
    #vectors;
    /**
     * @type {Float32Array}
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
    constructor(cells, nonEmptyCells) {
        this.#bufferSize = nonEmptyCells * 12;
        this.#vectors = new Float32Array(this.#bufferSize);
        this.#textures = new Float32Array(this.#bufferSize);
        this.#boundariesTempIndexes = new Int32Array(cells * 4);
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
}