class Vertex {
    #x;
    #y;
    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }
}

class Rectangle {
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
     * @type {number}
     */
    get x() {
        return this.#x;
    }
    /**
     * @type {number}
     */
    get y() {
        return this.#y;
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
}

class Vector {
    #x;
    #y;
    constructor(x1, y1, x2, y2) {
        this.#x = x2 - x1;
        this.#y = y2 - y1;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get length() {
        return Math.sqrt(Math.pow(this.#x, 2) + Math.pow(this.#y, 2));
    }

    get tetaAngle() {
        return Math.atan2(this.#y, this.#x);
    }
}

export { Vertex, Rectangle, Vector };