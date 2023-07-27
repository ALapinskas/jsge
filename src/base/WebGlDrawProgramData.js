export class WebGlDrawProgramData {
    /**
     * @type {string}
     */
    #programName;
    /**
     * @type {number[]}
     */
    #vectors;
    /**
     * @type {number[]}
     */ 
    #textures;
    /**
     * @type {}
     */ 
    #image;
    /**
     * @type {string}
     */ 
    #imageName;
    /**
     * @type {string[]}
     */
    #drawMask;
    /**
     * @type {number}
     */ 
    #rotation;
    /**
     * @type {number[]}
     */ 
    #translation;
    /**
     * @type {number[]}
     */ 
    #scale;
    /**
     * @type {number}
     */ 
    #programVerticesNum;

    constructor(programName, vectors, textures, image, imageName, drawMask = ["SRC_ALPHA", "ONE_MINUS_SRC_ALPHA"], rotation = 0, translation = [0,0], scale = [1, 1]) {
        this.#programName = programName;
        this.#vectors = vectors;
        this.#textures = textures;
        this.#image = image;
        this.#imageName = imageName;
        this.#drawMask = drawMask;
        this.#rotation = rotation;
        this.#translation = translation;
        this.#scale = scale;
        this.#programVerticesNum = vectors.length / 2; 
    }

    get programName() {
        return this.#programName;
    }
    
    get vectors() {
        return this.#vectors;
    }
    
    get textures() {
        return this.#textures;
    }
    
    get image() {
        return this.#image;
    }
    
    get imageName() {
        return this.#imageName;
    }
    
    get drawMask() {
        return this.#drawMask;
    }
    
    get rotation() {
        return this.#rotation;
    }
    
    get translation() {
        return this.#translation;
    }
    
    get scale() {
        return this.#scale;
    }

    get programVerticesNum() {
        return this.#programVerticesNum;
    }
    
    isProgramDataCanBeMerged(imageName, drawMask = ["SRC_ALPHA", "ONE_MINUS_SRC_ALPHA"], rotation = 0, translation = [0,0], scale = [1, 1]) {

        if (this.imageName === imageName 
            && this.drawMask[0] === drawMask[0] 
            && this.drawMask[1] === drawMask[1]
            && this.rotation === rotation
            && this.translation[0] === translation[0]
            && this.translation[1] === translation[1]
            && this.scale[0] === scale[0]
            && this.scale[1] === scale[1]) {
            return true;
        } else {
            return false;
        }
    }
    
    mergeProgramData(vectors, textures) {
        this.#vectors.push(...vectors);
        this.#textures.push(...textures);
        this.#programVerticesNum = this.#vectors.length / 2; 
    }

}
