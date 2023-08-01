import { DrawRectObject } from "./DrawRectObject.js";
import { DrawTextObject } from "./DrawTextObject.js";
import { DrawConusObject } from "./DrawConusObject.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawLineObject } from "./DrawLineObject.js";
import { DrawPolygonObject } from "./DrawPolygonObject.js";
import { Vertex } from "./Primitives.js";
import { DrawCircleObject } from "./DrawCircleObject.js";

/**
 * Creates drawObjects instances.<br>
 * accessible via ScreenPage.draw <br>
 * @see {@link ScreenPage} a part of ScreenPage
 */
export class DrawObjectFactory {

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} backgroundColor - rgba(r,g,b,a)
     * @param {boolean=} cut
     * @returns {DrawRectObject}
     */
    rect(x, y, width, height, backgroundColor, cut) {
        return new DrawRectObject(x, y, width, height, backgroundColor, cut); 
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {string} text 
     * @param {string} font - size fontFamily
     * @param {string} color - rgba(r,g,b,a)
     * @returns {DrawTextObject}
     */
    text(x, y, text, font, color) {
        return new DrawTextObject(x, y, text, font, color);
    }

    /**
     * 
     * @param {number} radius 
     * @param {string} bgColor - rgba(r,g,b,a)
     * @param {number=} angle
     * @param {boolean=} cut
     * @returns {DrawConusObject}
     */
    conus(x, y, radius, bgColor, angle, cut) {
        return new DrawConusObject(x, y, radius, bgColor, angle, cut);
    }

    /**
     * 
     * @param {number} radius 
     * @param {string} bgColor - rgba(r,g,b,a)
     * @param {boolean=} cut
     * @returns {DrawCircleObject}
     */
    circle(x, y, radius, bgColor, cut) {
        return new DrawCircleObject(x, y, radius, bgColor, cut);
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} key 
     * @param {number} [imageIndex = 0]
     * @param {Array<{x:Number, y:Number}>=} boundaries 
     * @returns {DrawImageObject}
     */
    image(x, y, width, height, key, imageIndex = 0, boundaries) {
        return new DrawImageObject(x, y, width, height, key, imageIndex, boundaries);
    }

    /**
     * @param {Array<number>} vertices 
     * @param {string} color - rgba(r,g,b,a)
     * @returns {DrawLineObject}
     */
    line(vertices, color) {
        return new DrawLineObject(vertices, color);
    }

    /**
     * @param {Array<{x:number, y:number}>} vertices - should go in anticlockwise order
     * @param {string} bgColor - rgba(r,g,b,a) 
     * @param {boolean=} cut
     * @returns {DrawPolygonObject}
     */
    polygon(vertices, bgColor, cut) {
        return new DrawPolygonObject(vertices, bgColor, cut);
    }
}