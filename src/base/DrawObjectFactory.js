import { DrawRectObject } from "./DrawRectObject.js";
import { DrawTextObject } from "./DrawTextObject.js";
import { DrawConusObject } from "./DrawConusObject.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawLineObject } from "./DrawLineObject.js";
import { DrawPolygonObject } from "./DrawPolygonObject.js";
import { DrawCircleObject } from "./DrawCircleObject.js";
import { TiledRenderLayer } from "./TiledRenderLayer.js";
import { DrawShapeObject } from "./DrawShapeObject.js";
import { ScreenPageData } from "./ScreenPageData.js";

/**
 * Creates drawObjects instances.<br>
 * accessible via ScreenPage.draw <br>
 * Attach images for image objects and tilemaps <br>
 * Adds drawObjects to current ScreenPage.screenPageData
 * @see {@link ScreenPage} a part of ScreenPage
 */
export class DrawObjectFactory {
    /**
     * @type {AssetsManager}
     */
    #loader;
    /**
     * @type {ScreenPageData | null}
     */
    #currentPageData;
    /**
     * @hideconstructor 
     */
    constructor(loader) {
        this.#loader = loader;
    }

    /**
     * @returns {ScreenPageData}
     */
    get screenPageData() {
        return this.#currentPageData;
    }
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} backgroundColor - rgba(r,g,b,a)
     * @returns {DrawRectObject}
     */
    rect(x, y, width, height, backgroundColor) {
        const renderObject = new DrawRectObject(x, y, width, height, backgroundColor);
        this.#currentPageData._renderObject = renderObject;
        this.#currentPageData._sortRenderObjectsBySortIndex(); 
        return renderObject; 
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
        const renderObject = new DrawTextObject(x, y, text, font, color);;
        this.#currentPageData._renderObject = renderObject;
        this.#currentPageData._sortRenderObjectsBySortIndex(); 
        return renderObject;
    }

    /**
     * 
     * @param {number} radius 
     * @param {string} bgColor - rgba(r,g,b,a)
     * @param {number=} angle
     * @param {number=} [fade=0] (0 - 1)
     * @returns {DrawConusObject}
     */
    conus(x, y, radius, bgColor, angle, fade = 0) {
        const renderObject = new DrawConusObject(x, y, radius, bgColor, angle, fade);
        this.#currentPageData._renderObject = renderObject;
        this.#currentPageData._sortRenderObjectsBySortIndex(); 
        return renderObject;
    }

    /**
     * 
     * @param {number} radius 
     * @param {string} bgColor - rgba(r,g,b,a)
     * @returns {DrawCircleObject}
     */
    circle(x, y, radius, bgColor) {
        const renderObject = new DrawCircleObject(x, y, radius, bgColor);
        this.#currentPageData._renderObject = renderObject;
        this.#currentPageData._sortRenderObjectsBySortIndex(); 
        return renderObject;
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} key 
     * @param {number} [imageIndex = 0]
     * @param {Array<{x:Number, y:Number}> | {r:number}=} boundaries - boundaries as polygon, or circle
     * @returns {DrawImageObject}
     */
    image(x, y, width, height, key, imageIndex = 0, boundaries) {
        const image = this.#loader.getImage(key),
            renderObject = new DrawImageObject(x, y, width, height, key, imageIndex, boundaries, image);
        this.#currentPageData._renderObject = renderObject;
        this.#currentPageData._sortRenderObjectsBySortIndex(); 
        return renderObject;
    }

    /**
     * @param {Array<number>} vertices 
     * @param {string} color - rgba(r,g,b,a)
     * @returns {DrawLineObject}
     */
    line(vertices, color) {
        const renderObject = new DrawLineObject(vertices, color);
        this.#currentPageData._renderObject = renderObject;
        this.#currentPageData._sortRenderObjectsBySortIndex(); 
        return renderObject;
    }

    /**
     * @param {Array<{x:number, y:number}>} vertices - should go in anticlockwise order
     * @param {string} bgColor - rgba(r,g,b,a)
     * @returns {DrawPolygonObject}
     */
    polygon(vertices, bgColor) {
        const renderObject = new DrawPolygonObject(vertices, bgColor);
        this.#currentPageData._renderObject = renderObject;
        this.#currentPageData._sortRenderObjectsBySortIndex(); 
        return renderObject;
    }

    /**
     * 
     * @param {string} layerKey 
     * @param {string} tileMapKey 
     * @param {boolean=} setBoundaries 
     * @param {DrawShapeObject=} shapeMask 
     * @returns {TiledRenderLayer}
     */
    tiledLayer(layerKey, tileMapKey, setBoundaries, shapeMask) {
        const tilemap = this.#loader.getTileMap(tileMapKey),
            tilesets = tilemap.tilesets,
            tilesetImages = tilesets.map((tileset) => this.#loader.getImage(tileset.data.name)),
            layerData = tilemap.layers.find((layer) => layer.name === layerKey),
            renderObject = new TiledRenderLayer(layerKey, tileMapKey, tilemap, tilesets, tilesetImages, layerData, setBoundaries, shapeMask);

        this.#currentPageData._renderObject = renderObject;
        this.#currentPageData._sortRenderObjectsBySortIndex(); 
        return renderObject;
    }

    /**
     * @ignore
     * @param {string} methodKey 
     * @param {Function} methodFn 
     */
    _addNewObject = (methodKey, methodFn) => {
        this[methodKey] = methodFn;
    }
    /**
     * @ignore
     * @param {ScreenPageData} pageData;
     */
    _attachPageData = (pageData) => {
        this.#currentPageData = pageData;
    }
    /**
     * @ignore
     */
    _detachPageData = () => {
        this.#currentPageData = null;
    }
}