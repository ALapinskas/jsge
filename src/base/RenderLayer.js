import { DrawShapeObject } from "./DrawShapeObject.js";

export class RenderLayer {
    #layerKey;
    #tileMapKey;
    #setBoundaries;
    #drawBoundaries;
    #attachedMaskId;

    constructor(layerKey, tileMapKey, setBoundaries = false, shapeMask) {
        this.#layerKey = layerKey;
        this.#tileMapKey = tileMapKey;
        this.#setBoundaries = setBoundaries;
        this.#drawBoundaries = setBoundaries ? setBoundaries : false;
        if (shapeMask) {
            this.setMask(shapeMask);
        }
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

    get _maskId() {
        return this.#attachedMaskId;
    }
    /**
     * 
     * @param {DrawShapeObject} mask 
     */
    setMask(mask) {
        this.#attachedMaskId = mask.id;
    }

    removeMask() {
        this.#attachedMaskId = null;
    }
}
