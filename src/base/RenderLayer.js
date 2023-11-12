export class RenderLayer {
    #layerKey;
    #tileMapKey;
    #setBoundaries;
    #drawBoundaries;
    #zIndex = 0;

    constructor(layerKey, tileMapKey, zIndex = 0, setBoundaries = false) {
        this.#layerKey = layerKey;
        this.#tileMapKey = tileMapKey;
        this.#setBoundaries = setBoundaries;
        this.#drawBoundaries = setBoundaries ? setBoundaries : false;
        this.#zIndex = zIndex;
    }

    /**
     * A layer name.
     * @type {string}
     */
    get layerKey() {
        return this.#layerKey;
    }

    /**
     * A tilemap layer key, should match key from the tilemap.
     * @type {string}
     */
    get tileMapKey() {
        return this.#tileMapKey;
    }

    /**
     * Should the layer borders used as boundaries, or not
     * Can be set in ScreenPage.addRenderLayer() method.
     * @type {boolean}
     */
    get setBoundaries() {
        return this.#setBoundaries;
    }

    /**
     * Should draw a boundaries helper, or not
     * Can be set in SystemSettings.
     * @type {boolean}
     */
    get drawBoundaries() {
        return this.#drawBoundaries;
    }

    set drawBoundaries(value) {
        this.#drawBoundaries = value;
    }

    get zIndex() {
        return this.#zIndex;
    }
}
