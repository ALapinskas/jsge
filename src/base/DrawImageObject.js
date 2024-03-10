import { AnimationEvent } from "./AnimationEvent.js";
import { CONST, ERROR_CODES } from "../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";
import { TextureStorage } from "./WebGl/TextureStorage.js";
import { Exception } from "./Exception.js";
/**
 * Image object to draw
 * @extends DrawShapeObject
 * @see {@link DrawObjectFactory} should be created with factory method
 */
export class DrawImageObject extends DrawShapeObject {
    /**
     * @type {number}
     */
    #w;
    /**
     * @type {number}
     */
    #h;
    /**
     * Image sprite key
     * @type {string}
     */
    #key;
    /**
     * @type {ImageBitmap}
     */
    #image;
    /**
     * @type {EventTarget}
     */
    #emitter;
    /**
     * @type {Map<string, AnimationEvent>}
     */
    #animations;
    /**
     * @type {number}
     */
    #imageIndex;
    /**
     * @type {number}
     */
    #spacing = 0;
    /**
     * @type {Array<Array<number>>}
     */
    #vertices;
    /**
     * @type {Object | null}
     */
    #circleBoundaries;
    /**
     * @type {TextureStorage}
     */
    #textureStorage;

    /**
     * @hideconstructor
     */
    constructor(mapX, mapY, width, height, key, imageIndex = 0, boundaries, image, spacing = 0) {
        super(CONST.DRAW_TYPE.IMAGE, mapX, mapY);
        this.#key = key;
        this.#emitter = new EventTarget();
        this.#animations = new Map();
        this.image = image;
        this.#imageIndex = imageIndex;
        this.#spacing = spacing;
        this.#w = width;
        this.#h = height;
        this.#vertices = boundaries && !boundaries.r ? this._convertVerticesArray(boundaries) : boundaries && boundaries.r ? this._calculateConusBoundaries(boundaries.r) : this._calculateRectVertices(width, height);
        this.#circleBoundaries = boundaries && typeof boundaries.r !== "undefined" ? boundaries : null;
    }

    /**
     * @type {number}
     */
    get width() {
        return this.#w;
    }

    /**
     * @type {number}
     */
    get height() {
        return this.#h;
    }

    set width(w) {
        this.#w = w;
    }

    set height(h) {
        this.#h = h;
    }

    /**
     * A key should match an image loaded through AssetsManager
     * @type {string}
     */
    get key() {
        return this.#key;
    }

    /**
     * @type {ImageBitmap}
     */
    get image() {
        return this.#image;
    }

    set image(value) {
        if (this.#textureStorage) {
            this.#textureStorage._isTextureRecalculated = true;
        }

        this.#image = value;
    }

    /**
     * Current image index
     * @type {number}
     */
    get imageIndex() {
        return this.#imageIndex;
    }

    set imageIndex(value) {
        this.#imageIndex = value;
    }

    /**
     * Image spacing (for tilesets.spacing > 0)
     * @type {number}
     */
    get spacing() {
        return this.#spacing;
    }

    /**
     * Determines if image is animated or not
     * @type {boolean}
     */
    get hasAnimations() {
        return this.#animations.size > 0;
    }

    /**
     * @deprecated - use .vertices instead 
     * @type {Array<Array<number>>}
     */
    get boundaries() {
        return this.#vertices;
    }

    get vertices() {
        return this.#vertices;
    }

    get circleBoundaries() {
        return this.#circleBoundaries;
    }

    /**
     * @ignore
     */
    _processActiveAnimations() {
        for (let animationEvent of this.#animations.values()) {
            if (animationEvent.isActive) {
                animationEvent.iterateAnimationIndex();
                this.#imageIndex = animationEvent.currentSprite;
            }
        }
    }
    /**
     * @ignore
     */
    get _textureStorage() {
        return this.#textureStorage;
    }

    /**
     * @ignore
     */
    set _textureStorage(texture) {
        this.#textureStorage = texture;
    }

    /**
     * Emit event
     * @param {string} eventName 
     * @param  {...any} eventParams 
     */
    emit(eventName, ...eventParams) {
        const event = new Event(eventName);
        event.data = [...eventParams];
        this.#emitter.dispatchEvent(event);
    }

    /**
     * Subscribe
     * @param {string} eventName 
     * @param {*} listener 
     * @param {*} options 
     */
    addEventListener(eventName, listener, options) {
        this.#emitter.addEventListener(eventName, listener, options);
    }

    /**
     * Unsubscribe
     * @param {string} eventName 
     * @param {*} listener 
     * @param {*} options 
     */
    removeEventListener(eventName, listener, options) {
        this.#emitter.removeEventListener(eventName, listener, options);
    }

    /**
     * Adds image animations
     * @param { string } eventName -animation name
     * @param { Array<number> | Array<{duration:number, id:number}> } animationSpriteIndexes - animation image indexes
     * @param { boolean } [isRepeated = false] - animation is cycled or not, cycled animation could be stopped only with stopRepeatedAnimation();
     */
    addAnimation (eventName, animationSpriteIndexes, isRepeated) {
        if (!this.#checkAnimationParams(animationSpriteIndexes)) {
            Exception(ERROR_CODES.UNEXPECTED_INPUT_PARAMS, " animationSpriteIndexes should be Array of indexes, or Array of objects {duration:number, id:number}");
        }
        const animationEvent = new AnimationEvent(eventName, animationSpriteIndexes, isRepeated);
        this.#animations.set(eventName, animationEvent);
        this.addEventListener(eventName, this.#activateAnimation);
    }

    #checkAnimationParams (animationSpriteIndexes) {
        let isCorrect = true;
        animationSpriteIndexes.forEach(element => {
            if (typeof element !== "number") {
                if (typeof element.duration !== "number" || typeof element.id !== "number") {
                    isCorrect = false;
                }
            }     
        });
        return isCorrect;
    }
    #activateAnimation = (event) => {
        const animationEvent = this.#animations.get(event.type);
        animationEvent.activateAnimation();
        this.#imageIndex = animationEvent.currentSprite;
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