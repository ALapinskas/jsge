/**
 * Represents a tilemap render layer
 */
export class RenderLayer {
    #layerKey;
    #tileMapKey;
    #setBoundaries;
    #drawBoundaries;

    constructor(layerKey, tileMapKey, setBoundaries = false) {
        this.#layerKey = layerKey;
        this.#tileMapKey = tileMapKey;
        this.#setBoundaries = setBoundaries;
        this.#drawBoundaries = setBoundaries ? setBoundaries : false;
    }

    /**
     * A layer name
     * @type {String}
     */
    get layerKey() {
        return this.#layerKey;
    }

    /**
     * A tilemap layer key, should match key from the tilemap
     * @type {String}
     */
    get tileMapKey() {
        return this.#tileMapKey;
    }

    /**
     * Should the layer borders used as boundaries, or not
     * Can be set in ScreenPage.addRenderLayer() method
     * @type {Boolean}
     */
    get setBoundaries() {
        return this.#setBoundaries;
    }

    /**
     * Should draw a boundaries helper, or not
     * Can be set in SystemSettings
     * @type {Boolean}
     */
    get drawBoundaries() {
        return this.#drawBoundaries;
    }

    set drawBoundaries(value) {
        this.#drawBoundaries = value;
    }
}
