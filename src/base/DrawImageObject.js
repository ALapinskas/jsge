import { AnimationEventImageObj } from "./AnimationEventImageObj.js";
import { CONST } from "../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";

/**
 * Image object to draw
 * @augments DrawShapeObject
 */
export class DrawImageObject extends DrawShapeObject {
    /**
     * @type {Number}
     */
    #w;
    /**
     * @type {Number}
     */
    #h;
    /**
     * Image sprite key
     * @type {String}
     */
    #key;
    /**
     * @type {EventTarget}
     */
    #emitter;
    /**
     * @type {Map<String, AnimationEventImageObj>}
     */
    #animations;
    /**
     * @type {Number}
     */
    #imageIndex;
    /**
     * @type {Array<Vertex> | null}
     */
    #boundaries = null;

    /**
     * @hideconstructor
     */
    constructor(mapX, mapY, width, height, key, imageIndex = 0, boundaries) {
        super(CONST.DRAW_TYPE.IMAGE, mapX, mapY);
        this.#key = key;
        this.#emitter = new EventTarget();
        this.#animations = new Map();
        this.#imageIndex = imageIndex;
        this.#boundaries = boundaries;
        this.#w = width;
        this.#h = height;
    }

    /**
     * @type {Number}
     */
    get width() {
        return this.#w;
    }

    /**
     * @type {Number}
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
     * @type {String}
     */
    get key() {
        return this.#key;
    }

    /**
     * Current image index
     * @type {Number}
     */
    get imageIndex() {
        return this.#imageIndex;
    }

    /**
     * Determines if image is animated or not
     * @type {Boolean}
     */
    get isAnimations() {
        return this.#animations.size > 0;
    }

     /**
     * @type {Array<Vertex>}
     */
    get boundaries() {
        return this.#boundaries;
    }

    _processActiveAnimations() {
        for (let animationEvent of this.#animations.values()) {
            if (animationEvent.isActive) {
                animationEvent.iterateSprite();
                this.#imageIndex = animationEvent.currentSprite;
            }
        }
    }

    /**
     * Emit event
     * @param {String} eventName 
     * @param  {...any} eventParams 
     */
    emit(eventName, ...eventParams) {
        const event = new Event(eventName);
        event.data = [...eventParams];
        this.#emitter.dispatchEvent(event);
    }

    /**
     * Subscribe
     * @param {String} eventName 
     * @param {*} listener 
     * @param {*} options 
     */
    addEventListener(eventName, listener, options) {
        this.#emitter.addEventListener(eventName, listener, options);
    }

    /**
     * Unsubscribe
     * @param {String} eventName 
     * @param {*} listener 
     * @param {*} options 
     */
    removeEventListener(eventName, listener, options) {
        this.#emitter.removeEventListener(eventName, listener, options);
    }

    /**
     * Adds image animations
     * @param { String } eventName -animation name
     * @param { Number[] } animationSpriteIndexes - animation image indexes
     */
    addAnimation (eventName, animationSpriteIndexes) {
        const animationEvent = new AnimationEventImageObj(eventName, animationSpriteIndexes);
        this.#animations.set(eventName, animationEvent);
        this.addEventListener(eventName, animationEvent.activateAnimation);
    }

    /**
     * Removes animations
     */
    removeAllAnimations() {
        for (let [eventName, animationEvent] of this.#animations.entries()) {
            this.removeEventListener(eventName, animationEvent.activateAnimation);
        }
        this.#animations.clear();
        this.#animations - undefined;
    }
}