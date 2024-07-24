import { CONST, WARNING_CODES } from "../constants.js";
import { AnimationEvent } from "./AnimationEvent.js";
import { DrawShapeObject } from "./DrawShapeObject.js";
import { Warning } from "./Exception.js";
import { TextureStorage } from "./WebGl/TextureStorage.js";
import { TiledLayerTempStorage } from "./WebGl/TiledLayerTempStorage.js";
/**
 * A render object represents a layer from tiled editor
 * @see {@link DrawObjectFactory} should be created with factory method
 */
export class DrawTiledLayer {
    #layerKey;
    #tileMapKey;
    #tilemap;
    #tilesets;
    /**
     * @type {string}
     */
    #DELIMITER = "-#-";
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
    /**
     * @type {Map<string, AnimationEvent>}
     */
    #animations = new Map();
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
        if (shapeMask) {
            this.setMask(shapeMask);
        }
        this.#processData(tilesets, layerData);
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

    /**
     * Determines if image is animated or not
     * @type {boolean}
     */
    get hasAnimations() {
        return this.#animations.size > 0;
    }

    /**
     * @ignore
     */
    get _textureStorages() {
        return this.#textureStorages;
    }

    /**
     * @ignore
     */
    _setTextureStorage(index, value) {
        this.#textureStorages[index] = value;
    }

    /**
     * Tilesets has a property tiles, which could contain tile animations
     * or object boundaries, this is workaround for split this and add
     * additional properties for use in draw phase:
     * _hasAnimations
     * _animations - Map<id:activeSprite>
     * _hasBoundaries
     * _boundaries - Map<id:objectgroup>
     * @param {*} tilesets
     */
    #processData(tilesets, layerData) {
        // границы для слоя создаются одни, даже если они высчитываются с разных тайлсетов
        // поэтому суммируем и находим максимальное их количество
        let ellipseBLen = 0,
            pointBLen = 0,
            polygonBLen = 0;
        tilesets.forEach((tileset, idx) => {
            const tiles = tileset.data.tiles,
                name = tileset.data.name,
                firstgid = tileset.firstgid,
                nextTileset = this.tilesets[idx + 1],
                nextgid = nextTileset ? nextTileset.firstgid : 1_000_000_000;
                
            if (tiles) {
                for (let tile of tiles) {
                    const animation = tile.animation,
                        objectgroup = tile.objectgroup,
                        id = tile.id;
                    if (animation) {
                        const eventName = name + this.#DELIMITER + id, 
                            animationIndexes = this.#fixAnimationsItems(animation),
                            animationEvent = new AnimationEvent(eventName, animationIndexes, true);

                        this.#animations.set(eventName, animationEvent);
                        // add additional properties
                        if (!tileset.data._hasAnimations) {
                            tileset.data._hasAnimations = true;
                            tileset.data._animations = new Map();
                            //
                            tileset.data._animations.set(id, animationIndexes[0][0]);
                        }
                        this.#activateAnimation(animationEvent);
                    }
                    if (objectgroup && this.#setBoundaries) {
                        if (tileset.data._hasBoundaries) {
                            tileset.data._boundaries.set(id, objectgroup);
                        } else {
                            // add additional properties
                            tileset.data._hasBoundaries = true;
                            tileset.data._boundaries = new Map();
                            tileset.data._boundaries.set(id, objectgroup);
                        }
                        objectgroup.objects.forEach((object) => {
                            if (object.ellipse) {
                                const cellsWithB = layerData.data.filter((tile) => tile === id + firstgid).length;
                                ellipseBLen += (4 * cellsWithB); // (x, y, wRad, hRad) * layer items
                            } else if (object.point) {
                                const cellsWithB = layerData.data.filter((tile) => tile === id + firstgid).length;
                                pointBLen += (2 * cellsWithB); // (x, y) * layer items
                            } else if (object.polygon) {
                                const cellsWithB = layerData.data.filter((tile) => tile === id + firstgid).length;
                                polygonBLen += (object.polygon.length * 2 * cellsWithB); // (each point * 2(x,y) ) * layer items
                            } else { // rect object
                                const cellsWithB = layerData.data.filter((tile) => tile === id + firstgid).length;
                                polygonBLen += (16 * cellsWithB); // (4 faces * 4 cords for each one) * layer items
                            }
                        });
                    }
                }
            }
            
            const data_name = tileset.data.name + "_" + layerData.name,
                nonEmptyCells = layerData.data.filter((tile) => ((tile >= firstgid) && (tile < nextgid))).length,
                cells = layerData.data.length;
            if (this.#setBoundaries) {
                polygonBLen+=(nonEmptyCells * 16); // potential boundaries also nonEmptyCells
            }
            // создаем вспомогательный объект для расчетов и хранения данных отрисовки
            layerData[data_name] = new TiledLayerTempStorage(cells, nonEmptyCells);
        });
        
        // save boundaries max possible lengths
        layerData.ellipseBoundariesLen = ellipseBLen;
        layerData.pointBoundariesLen = pointBLen;
        layerData.polygonBoundariesLen = polygonBLen;
    }

    /**
     * 
     * @param {Array<{duration:number, tileid:number}>} animation 
     * @returns {Array<{duration:number, id:number}>}
     */
    #fixAnimationsItems(animation) {
        return animation.map((animation_item) => ({duration:animation_item.duration, id: animation_item.tileid}));
    }
    /**
     * @ignore
     */
    _processActiveAnimations() {
        for (let animationEvent of this.#animations.values()) {
            if (animationEvent.isActive) {
                animationEvent.iterateAnimationIndex();
                this.#switchCurrentActiveSprite(animationEvent);
            }
        }
    }

    #activateAnimation = (animationEvent) => {
        animationEvent.activateAnimation();
        this.#switchCurrentActiveSprite(animationEvent);
    }; 

    #switchCurrentActiveSprite = (animationEvent) => {
        const [tilesetKey, animationId] = animationEvent.name.split(this.#DELIMITER),
            tilesetIndex = this.#tilesets.findIndex(tileset => tileset.data.name === tilesetKey),
            tileset = this.#tilesets[tilesetIndex];
            
        tileset.data._animations.set(parseInt(animationId), animationEvent.currentSprite);
    };

    /**
     *
     * @param {string} eventName - animation name
     */
    stopRepeatedAnimation (eventName) {
        this.#animations.get(eventName).deactivateAnimation();
    }

    /**
     * Removes animations
     */
    removeAllAnimations() {
        for (let [eventName, animationEvent] of this.#animations.entries()) {
            this.removeEventListener(eventName, animationEvent.activateAnimation);
            animationEvent.deactivateAnimation();
        }
        this.#animations.clear();
        this.#animations = undefined;
    }

    destroy() {
        this.removeAllAnimations();
        super.destroy();
    }
}
