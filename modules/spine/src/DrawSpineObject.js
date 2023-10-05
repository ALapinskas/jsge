export class DrawSpineObject extends DrawImageObject {
    #skeleton;
    constructor(mapX, mapY, width, height, key, imageIndex = 0, boundaries, skeleton) {
        super(mapX, mapY, width, height, key, imageIndex = 0, boundaries);
        this.#skeleton = skeleton;
    }
}