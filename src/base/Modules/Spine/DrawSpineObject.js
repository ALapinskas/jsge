import { DrawImageObject } from "../../DrawImageObject";

class DrawSpineObject extends DrawImageObject {
    constructor(mapX, mapY, width, height, key, imageIndex = 0, boundaries) {
        super(mapX, mapY, width, height, key, imageIndex = 0, boundaries);
    }
}