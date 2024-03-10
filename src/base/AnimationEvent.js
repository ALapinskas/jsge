export class AnimationEvent {
    #eventName;
    /**
     * @type {number}
     */
    #defaultDurationTime = 100;
    /**
     * Array [sprite index, duration]
     * @type { Array<Array<number, number>> }
     */
    #animationSpriteIndexes;
    /**
     * 
     * @type {number}
     */
    #currentAnimationItemIndex;
    /**
     * @type {boolean}
     */
    #isActive;
    /**
     * @type {boolean}
     */
    #isRepeated;
    #lastAnimationTimeStamp;
    
    constructor(eventName, animationSpriteIndexes, isRepeated = false, currentSpriteIndex, isActive = false) {
        this.#eventName = eventName;
        this.#animationSpriteIndexes = this.#convertToArray(animationSpriteIndexes);
        this.#currentAnimationItemIndex = currentSpriteIndex ? currentSpriteIndex : 0;
        this.#isActive = isActive;
        this.#isRepeated = isRepeated;
    }

    get name() {
        return this.#eventName;
    }

    get isActive() {
        return this.#isActive;
    }

    get currentSprite() {
        return this.#animationSpriteIndexes[this.#currentAnimationItemIndex][0];
    }

    get _isLastSprite() {
        return (this.#animationSpriteIndexes.length - 1) === this.#currentAnimationItemIndex;
    }

    iterateAnimationIndex() {
        const currentIndex = this.#currentAnimationItemIndex,
            currentDuration = this.#animationSpriteIndexes[currentIndex][1],
            lastIterationTime = Date.now() - this.#lastAnimationTimeStamp;
        // iterate or skip
        if (currentDuration < lastIterationTime) {
            if (!this._isLastSprite) {
                this.#currentAnimationItemIndex++;
            } else {
                if (!this.#isRepeated) {
                    this.deactivateAnimation();
                } else {
                    // take first element
                    this.#currentAnimationItemIndex = 0;
                    
                }
            }
            // reset timestamp
            this.#lastAnimationTimeStamp = Date.now();
        }
    }

    activateAnimation = () => {
        this.#isActive = true;
        this.#currentAnimationItemIndex = 0;
        this.#lastAnimationTimeStamp = Date.now();
    };

    deactivateAnimation = () => {
        this.#isActive = false;
    };

    #convertToArray(animationSpriteIndexes) {
        let animationArray = [];
        animationSpriteIndexes.forEach(element => {
            if (typeof element.id === "number" && typeof element.duration === "number") {
                animationArray.push([element.id, element.duration]);
            } else {
                animationArray.push([element, this.#defaultDurationTime]);
            }
            
        });
        return animationArray;
    }
}