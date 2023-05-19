class Point {
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

export { Point, Rectangle, Vector };