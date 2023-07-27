export class AnimationEventImageObj {
    #eventName;
    #animationSpriteIndexes;
    #currentSpriteIndex;
    #isActive;
    #isRepeated;
    #isReturnToBeginning;
    
    constructor(eventName, animationSpriteIndexes, isRepeated = false, currentSpriteIndex, isActive = false) {
        this.#eventName = eventName;
        this.#animationSpriteIndexes = animationSpriteIndexes;
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
        if (!this.isLastSprite) {
            this.#currentSpriteIndex = this.#currentSpriteIndex + 1;
        } else {
            if (!this.#isRepeated) {
                this.#isActive = false;
            } else {
                this.#currentSpriteIndex = 0;
            }
        }
    }

    activateAnimation = () => {
        this.#isActive = true;
        this.#currentSpriteIndex = 0;
    };

    deactivateAnimation = () => {
        this.#isActive = false;
    }
}