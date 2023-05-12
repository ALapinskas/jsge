export class Vector {
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