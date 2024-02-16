import { CONST } from "../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";
import { TextureStorage } from "./WebGl/TextureStorage.js";
/**
 * A render object represents a layer from tiled editor
 * @see {@link DrawObjectFactory} should be created with factory method
 */
export class DrawTiledLayer {
    #type;
    #layerKey;
    #tileMapKey;
    #tilemap;
    #tilesets;
    #tilesetImages;
    /**
     * @type {Array<TextureStorage>}
     */
    #textureStorages;
    #layerData;
    #setBoundaries;
    #drawBoundaries;
    #attachedMaskId;
    /**
     * @type {number}
     */
    #sortIndex = 0;
    #isOffsetTurnedOff;

    /**
     * @hideconstructor
     */
    constructor(layerKey, tileMapKey, tilemap, tilesets, tilesetImages, layerData, setBoundaries = false, shapeMask) {
        this.#layerKey = layerKey;
        this.#tileMapKey = tileMapKey;
        this.#tilemap = tilemap;
        this.#tilesets = tilesets;
        this.#textureStorages = [];
        this.#tilesetImages = tilesetImages;
        this.#layerData = layerData;
        this.#setBoundaries = setBoundaries;
        this.#drawBoundaries = setBoundaries ? setBoundaries : false;
        this.#type = CONST.DRAW_TYPE.TILED_LAYER;
        if (shapeMask) {
            this.setMask(shapeMask);
        }
    }

    get type() {
        return this.#type;
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

    get tilemap() {
        return this.#tilemap;
    }
    
    get tilesets() {
        return this.#tilesets;
    }

    get tilesetImages() {
        return this.#tilesetImages;
    }

    get layerData() {
        return this.#layerData;
    }
    /**
     * Should the layer borders used as boundaries, or not
     * Can be set in GameStage.addRenderLayer() method.
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

    /**
     * @ignore
     */
    get _maskId() {
        return this.#attachedMaskId;
    }
    /**
     * 
     * @param {DrawShapeObject} mask 
     */
    setMask(mask) {
        mask._isMask = true;
        this.#attachedMaskId = mask.id;
    }

    removeMask() {
        this.#attachedMaskId = null;
    }

    /**
     * @type {number}
     */
    get sortIndex () {
        return this.#sortIndex;
    }

    set sortIndex(value) {
        this.#sortIndex = value;
    }

    get isOffsetTurnedOff() {
        return this.#isOffsetTurnedOff;
    }
    turnOffOffset() {
        this.#isOffsetTurnedOff = true;
    }

    get _textureStorages() {
        return this.#textureStorages;
    }

    _setTextureStorage(index, value) {
        this.#textureStorages[index] = value;
    }
}
