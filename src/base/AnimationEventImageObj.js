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
    #circlesPerFrame;
    // first circle should be always skipped, eg showing the current frame
    #circlesSkipped = 0;
    
    constructor(eventName, animationSpriteIndexes, isRepeated = false, circlesPerFrame, currentSpriteIndex, isActive = false) {
        this.#eventName = eventName;
        this.#animationSpriteIndexes = animationSpriteIndexes;
        this.#circlesPerFrame = circlesPerFrame;
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
        if (this.#circlesPerFrame <= this.#circlesSkipped) {
            if (!this.isLastSprite) {
                this.#currentSpriteIndex = this.#currentSpriteIndex + 1;
            } else {
                if (!this.#isRepeated) {
                    this.deactivateAnimation();
                } else {
                    this.#currentSpriteIndex = 0;
                }
            }
            // if animation is in progress, we reset it to the first item, because the first circle already skipped
            this.#circlesSkipped = 1;
        } else {
            this.#circlesSkipped += 1;
        }
    }

    activateAnimation = () => {
        this.#isActive = true;
        this.#currentSpriteIndex = 0;
        this.#circlesSkipped = 0;
    };

    deactivateAnimation = () => {
        this.#isActive = false;
        this.#circlesSkipped = 0;
    };
}