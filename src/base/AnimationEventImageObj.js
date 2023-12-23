export class AnimationEventImageObj {
    #eventName;
    /**
     * @type {Array<number>}
     */
    #animationSpriteIndexes;
    /**
     * @type {number}
     */
    #currentSpriteIndex;
    /**
     * @type {boolean}
     */
    #isActive;
    /**
     * @type {boolean}
     */
    #isRepeated;
    /**
     * @type {number}
     */
    #cyclesPerFrame;
    // first circle should be always skipped, eg showing the current frame
    #cyclesSkipped = 0;
    
    constructor(eventName, animationSpriteIndexes, isRepeated = false, cyclesPerFrame, currentSpriteIndex, isActive = false) {
        this.#eventName = eventName;
        this.#animationSpriteIndexes = animationSpriteIndexes;
        this.#cyclesPerFrame = cyclesPerFrame;
        this.#currentSpriteIndex = currentSpriteIndex ? currentSpriteIndex : 0;
        this.#isActive = isActive;
        this.#isRepeated = isRepeated;
    }

    get isActive() {
        return this.#isActive;
    }

    get currentSprite() {
        return this.#animationSpriteIndexes[this.#currentSpriteIndex];
    }

    get isLastSprite() {
        return (this.#animationSpriteIndexes.length - 1) === this.#currentSpriteIndex;
    }

    iterateSprite() {
        if (this.#cyclesPerFrame <= this.#cyclesSkipped) {
            if (!this.isLastSprite) {
                this.#currentSpriteIndex = this.#currentSpriteIndex + 1;
            } else {
                if (!this.#isRepeated) {
                    this.deactivateAnimation();
                } else {
                    this.#currentSpriteIndex = 0;
                }
            }
            // if animation is in progress, we reset it to the first item, because the first cycles already skipped
            this.#cyclesSkipped = 1;
        } else {
            this.#cyclesSkipped += 1;
        }
    }

    activateAnimation = () => {
        this.#isActive = true;
        this.#currentSpriteIndex = 0;
        this.#cyclesSkipped = 0;
    };

    deactivateAnimation = () => {
        this.#isActive = false;
        this.#cyclesSkipped = 0;
    };
}