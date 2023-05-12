/**
 * Represents a rectangle object
 */
export class Rectangle {
    #x;
    #y;
    #w;
    #h;
    constructor(x, y, w, h) {
       this.#x = x;
       this.#y = y;
       this.#w = w;
       this.#h = h; 
    }
    /**
     * @type {Number}
     */
    get x() {
        return this.#x;
    }
    /**
     * @type {Number}
     */
    get y() {
        return this.#y;
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
}