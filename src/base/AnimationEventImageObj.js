export class AnimationEventImageObj {
    #eventName;
    #animationSpriteIndexes;
    #currentSprite;
    #isActive;
    
    constructor(eventName, animationSpriteIndexes, currentSprite, isActive = false) {
        this.#eventName = eventName;
        this.#animationSpriteIndexes = animationSpriteIndexes;
        this.#currentSprite = currentSprite ? currentSprite : animationSpriteIndexes[0];
        this.#isActive = isActive;
    }

    get isActive() {
        return this.#isActive;
    }

    set isActive(value) {
        this.#isActive = value;
    }

    get currentSprite() {
        return this.#currentSprite;
    }

    get isLastSprite() {
        return this.#animationSpriteIndexes[(this.#animationSpriteIndexes.length - 1)] === this.#currentSprite;
    }

    iterateSprite() {
        if (!this.isLastSprite) {
            this.#currentSprite = this.#currentSprite + 1;
        } else {
            this.#currentSprite = this.#animationSpriteIndexes[0];
            this.#isActive = false;
        }
    }

    set currentSprite(value) {
        this.#currentSprite = value;
    }

    activateAnimation = () => {
        this.isActive = true;
    };
}