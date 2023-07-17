import { DrawRectObject } from "./DrawRectObject.js";
import { DrawTextObject } from "./DrawTextObject.js";
import { DrawConusObject } from "./DrawConusObject.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawLineObject } from "./DrawLineObject.js";
import { DrawPolygonObject } from "./DrawPolygonObject.js";
import { Vertex } from "./Primitives.js";

/**
 * Creates drawObjects instances.<br>
 * accessible via ScreenPage.draw <br>
 * @see {@link ScreenPage} a part of ScreenPage
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
     * @param {Number} radius 
     * @param {String} bgColor - rgba(r,g,b,a)
     * @param {Number=} angle
     * @param {String=} subtractProgram 
     * @returns {DrawConusObject}
     */
    conus(x, y, radius, bgColor, angle, subtractProgram) {
        return new DrawConusObject(x, y, radius, bgColor, angle, subtractProgram);
    }

    /**
     * 
     * @param {Number} radius 
     * @param {String} bgColor - rgba(r,g,b,a)
     * @param {String=} subtractProgram 
     * @returns {DrawConusObject}
     */
    circle(x, y, radius, bgColor, subtractProgram) {
        return new DrawConusObject(x, y, radius, bgColor, 2*Math.PI, subtractProgram);
    }

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {String} key 
     * @param {Number} [imageIndex = 0]
     * @param {Array<Vertex>=} boundaries 
     * @returns {DrawImageObject}
     */
    image(x, y, width, height, key, imageIndex = 0, boundaries) {
        return new DrawImageObject(x, y, width, height, key, imageIndex, boundaries);
    }

    /**
     * @param {Array<Vertex>} vertices 
     * @param {String} bgColor - rgba(r,g,b,a)
     * @returns {DrawLineObject}
     */
    line(vertices, bgColor) {
        return new DrawLineObject(vertices, bgColor);
    }

    /**
     * @param {Array<Vertex>} vertices - should go in anticlockwise order
     * @param {String} bgColor - rgba(r,g,b,a) 
     * @param {String=} subtractProgram 
     * @returns {DrawPolygonObject}
     */
    polygon(vertices, bgColor, subtractProgram) {
        return new DrawPolygonObject(vertices, bgColor, subtractProgram);
    }
}