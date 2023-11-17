export class WebGlDrawProgramData {
    /**
     * @type {string}
     */
    #programName;
    /**
     * @type {Float32Array}
     */
    #vectorsBuffer;
    /**
     * @type {Float32Array}
     */ 
    #texturesBuffer;
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
    /**
     * @type {number | undefined}
     */
    #shapeMaskId

    constructor(programName, vectors, textures, image, imageName, shapeMaskId, drawMask = ["SRC_ALPHA", "ONE_MINUS_SRC_ALPHA"], rotation = 0, translation = [0,0], scale = [1, 1]) {
        this.#programName = programName;
        this.#vectorsBuffer = vectors;
        this.#texturesBuffer = textures;
        this.#image = image;
        this.#imageName = imageName;
        this.#shapeMaskId = shapeMaskId;
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
        return this.#vectorsBuffer;
    }
    
    get textures() {
        return this.#texturesBuffer;
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

    get shapeMaskId() {
        return this.#shapeMaskId;
    }
    
    isProgramDataCanBeMerged(imageName, shapeMaskId, drawMask = ["SRC_ALPHA", "ONE_MINUS_SRC_ALPHA"], rotation = 0, translation = [0,0], scale = [1, 1]) {

        if (this.imageName === imageName 
            && this.shapeMaskId === shapeMaskId
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
        const currentArrayLen = this.#vectorsBuffer.length,
            newArrayLength = currentArrayLen + vectors.length,
            newVectorArray = new Float32Array(newArrayLength),
            newTexturesArray = new Float32Array(newArrayLength);
            
        newVectorArray.set(this.#vectorsBuffer);
        newVectorArray.set(vectors, currentArrayLen);
        newTexturesArray.set(this.#texturesBuffer);
        newTexturesArray.set(textures, currentArrayLen);
        this.#vectorsBuffer = newVectorArray;
        this.#texturesBuffer = newTexturesArray;
        this.#programVerticesNum = this.#vectorsBuffer.length / 2; 
    }

}
