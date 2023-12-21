/**
 * storing current WebGLTexture
 */
export class TextureStorage {
    /**
     * @type {Number}
     */
    #textureIndex;
    /**
     * @type {WebGLTexture}
     */
    #texture;
    /**
     * @type {boolean}
     */
    #isTextureRecalculated = true;
    constructor(texture, textureIndex = 0) {
        this.#texture = texture;
        this.#textureIndex = textureIndex;
    }

    get _isTextureRecalculated() {
        return this.#isTextureRecalculated;
    }

    set _isTextureRecalculated(value) {
        this.#isTextureRecalculated = value;
    }

    get _texture() {
        return this.#texture;
    }

    set _texture(value) {
        this.#texture = value;
    }

    get _textureIndex() {
        return this.#textureIndex;
    }
}