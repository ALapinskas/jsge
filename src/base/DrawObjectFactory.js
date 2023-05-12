import { DrawRectObject } from "./DrawRectObject.js";
import { DrawTextObject } from "./DrawTextObject.js";
import { DrawConusObject } from "./DrawConusObject.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawLineObject } from "./DrawLineObject.js";
import { DrawPolygonObject } from "./DrawPolygonObject.js";
import { Point } from "./Primitives/Point.js";

/**
 * Creates drawObjects instances.
 */
export class DrawObjectFactory {

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {String} backgroundColor - rgba(r,g,b,a)
     * @param {String} subtractProgram
     * @returns {DrawRectObject}
     */
    rect(x, y, width, height, backgroundColor, subtractProgram) {
        return new DrawRectObject(x, y, width, height, backgroundColor, subtractProgram); 
    }

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {String} text 
     * @param {String} font - size fontFamily
     * @param {String} color - rgba(r,g,b,a)
     * @returns {DrawTextObject}
     */
    text(x, y, text, font, color) {
        return new DrawTextObject(x, y, text, font, color);
    }

    /**
     * 
     * @param {Array<Point>} vertices 
     * @param {Number} radius 
     * @param {String} bgColor - rgba(r,g,b,a)
     * @param {String=} subtractProgram 
     * @returns {DrawConusObject}
     */
    conus(vertices, radius, bgColor, subtractProgram) {
        return new DrawConusObject(vertices, radius, bgColor, subtractProgram);
    }

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {String} key 
     * @param {Number} [imageIndex = 0]
     * @param {Array<Point>=} boundaries 
     * @returns {DrawImageObject}
     */
    image(x, y, width, height, key, imageIndex = 0, boundaries) {
        return new DrawImageObject(x, y, width, height, key, imageIndex, boundaries);
    }

    /**
     * @param {Array<Point>} vertices 
     * @param {String} bgColor - rgba(r,g,b,a)
     * @returns {DrawLineObject}
     */
    line(vertices, bgColor) {
        return new DrawLineObject(vertices, bgColor);
    }

    /**
     * 
     * @param {Array<Point>} vertices 
     * @param {String} bgColor - rgba(r,g,b,a) 
     * @param {String=} subtractProgram 
     * @returns {DrawPolygonObject}
     */
    polygon(vertices, bgColor, subtractProgram) {
        return new DrawPolygonObject(vertices, bgColor, subtractProgram);
    }
}