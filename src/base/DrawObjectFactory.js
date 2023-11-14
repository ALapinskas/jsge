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
     * @param {boolean=} isShapeMask
     * @returns {DrawRectObject}
     */
    rect(x, y, width, height, backgroundColor, isShapeMask) {
        return new DrawRectObject(x, y, width, height, backgroundColor, isShapeMask); 
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {string} text 
     * @param {string} font - size fontFamily
     * @param {string} color - rgba(r,g,b,a)
     * @param {boolean=} isShapeMask
     * @returns {DrawTextObject}
     */
    text(x, y, text, font, color, isShapeMask) {
        return new DrawTextObject(x, y, text, font, color, isShapeMask);
    }

    /**
     * 
     * @param {number} radius 
     * @param {string} bgColor - rgba(r,g,b,a)
     * @param {number=} angle
     * @param {boolean=} [isShapeMask=false]
     * @param {number=} [fade=0] (0 - 1)
     * @returns {DrawConusObject}
     */
    conus(x, y, radius, bgColor, angle, isShapeMask=false, fade = 0) {
        return new DrawConusObject(x, y, radius, bgColor, angle, isShapeMask, fade);
    }

    /**
     * 
     * @param {number} radius 
     * @param {string} bgColor - rgba(r,g,b,a)
     * @param {boolean=} isShapeMask
     * @returns {DrawCircleObject}
     */
    circle(x, y, radius, bgColor, isShapeMask) {
        return new DrawCircleObject(x, y, radius, bgColor, isShapeMask);
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
     * @param {boolean=} isShapeMask
     * @returns {DrawPolygonObject}
     */
    polygon(vertices, bgColor, isShapeMask) {
        return new DrawPolygonObject(vertices, bgColor, isShapeMask);
    }
}