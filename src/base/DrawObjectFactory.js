import { DrawRectObject } from "./DrawRectObject.js";
import { DrawTextObject } from "./DrawTextObject.js";
import { DrawConusObject } from "./DrawConusObject.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawLineObject } from "./DrawLineObject.js";
import { DrawPolygonObject } from "./DrawPolygonObject.js";
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
     * @param {number=} zIndex
     * @returns {DrawRectObject}
     */
    rect(x, y, width, height, backgroundColor, cut, zIndex) {
        return new DrawRectObject(x, y, width, height, backgroundColor, zIndex, cut); 
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {string} text 
     * @param {string} font - size fontFamily
     * @param {string} color - rgba(r,g,b,a)
     * @param {number=} [zIndex=0]
     * @returns {DrawTextObject}
     */
    text(x, y, text, font, color, zIndex = 0) {
        return new DrawTextObject(x, y, text, font, color, zIndex);
    }

    /**
     * 
     * @param {number} radius 
     * @param {string} bgColor - rgba(r,g,b,a)
     * @param {number=} angle
     * @param {boolean=} [cut=false]
     * @param {number=} [fade=0] (0 - 1)
     * @param {number=} [zIndex=0]
     * @returns {DrawConusObject}
     */
    conus(x, y, radius, bgColor, angle, cut=false, fade = 0, zIndex) {
        return new DrawConusObject(x, y, radius, bgColor, angle, zIndex, cut, fade);
    }

    /**
     * 
     * @param {number} radius 
     * @param {string} bgColor - rgba(r,g,b,a)
     * @param {boolean=} cut
     * @param {number=} [zIndex=0]
     * @returns {DrawCircleObject}
     */
    circle(x, y, radius, bgColor, cut, zIndex) {
        return new DrawCircleObject(x, y, radius, bgColor, zIndex, cut);
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} key
     * @param {number} [imageIndex = 0]
     * @param {Array<{x:Number, y:Number}>=} boundaries
     * @param {number=} [zIndex=0]
     * @returns {DrawImageObject}
     */
    image(x, y, width, height, key, imageIndex = 0, boundaries, zIndex) {
        return new DrawImageObject(x, y, width, height, key, zIndex, imageIndex, boundaries);
    }

    /**
     * @param {Array<number>} vertices 
     * @param {string} color - rgba(r,g,b,a)
     * @param {number=} [zIndex=0]
     * @returns {DrawLineObject}
     */
    line(vertices, color, zIndex) {
        return new DrawLineObject(vertices, color, zIndex);
    }

    /**
     * @param {Array<{x:number, y:number}>} vertices - should go in anticlockwise order
     * @param {string} bgColor - rgba(r,g,b,a) 
     * @param {boolean=} cut
     * @param {number=} [zIndex=0]
     * @returns {DrawPolygonObject}
     */
    polygon(vertices, bgColor, cut, zIndex) {
        return new DrawPolygonObject(vertices, bgColor, zIndex, cut);
    }
}