import { CONST } from "../constants.js";
import { DrawShapeObject } from "./DrawShapeObject.js";

/**
 * @augments DrawShapeObject
 */
export class DrawRectObject extends DrawShapeObject {
    /**
     * @hideconstructor
     */
    constructor(x, y, w, h, bgColor, subtractProgram) {
        super(CONST.DRAW_TYPE.RECTANGLE, x, y, w, h, null, bgColor, subtractProgram);
    }
}