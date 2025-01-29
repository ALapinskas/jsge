/**
 * Debug info fro RenderLoop
 * @see {@link RenderLoop} a part of RenderLoop
 * @hideconstructor
 */
export class RenderLoopDebug {
    /**
     * @type {number}
     */
    #verticesNum = 0;
    /**
     * @type {number}
     */
    #drawCalls = 0;
    /**
     * @type {number}
     */
    #prevDrawTime = 0;
    /**
     * @type {Float32Array}
     */
    #tempRCircleT;
    /**
     * @type {number}
     */
    #tempRCircleTPointer = 0;
    /**
     * @type {NodeJS.Timeout | null}
     */
    constructor(averageFPStime) {
        this.#tempRCircleT = new Float32Array(averageFPStime);
    }

    get drawCalls() {
        return this.#drawCalls;
    }

    get verticesDraw() {
        return this.#verticesNum;
    }

    /**
     * @returns {Float32Array}
     */
    get tempRCircleT() {
        return this.#tempRCircleT;
    }

    get tempRCircleTPointer() {
        return this.#tempRCircleTPointer;
    }

    /**
     * @param {number} time
     */
    set tempRCircleT(time) {
        this.#tempRCircleT[this.#tempRCircleTPointer] = time;
    }

    set prevDrawTime(drawTime) {
        this.#prevDrawTime = drawTime;
    }

    currentDrawTime(drawTimestamp) {
        return drawTimestamp - this.#prevDrawTime;
    }

    incrementTempRCircleTPointer() {
        this.#tempRCircleTPointer++;
    }

    incrementDrawCallsCounter() {
        this.#drawCalls+=1;
    }

    set verticesDraw(vertices) {
        this.#verticesNum += vertices;
    }

    cleanupDebugInfo() {
        this.#verticesNum = 0;
        this.#drawCalls = 0;
    }

    cleanupDrawCallsCounter() {
        this.#drawCalls = 0;
    }

    cleanupTempVars() {
        this.#tempRCircleT.fill(0);
        this.#tempRCircleTPointer = 0;
    }
}