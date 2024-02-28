import { DrawRectObject } from "./DrawRectObject.js";
import { DrawTextObject } from "./DrawTextObject.js";
import { DrawConusObject } from "./DrawConusObject.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawLineObject } from "./DrawLineObject.js";
import { DrawPolygonObject } from "./DrawPolygonObject.js";
import { DrawCircleObject } from "./DrawCircleObject.js";
import { DrawTiledLayer } from "./DrawTiledLayer.js";
import { DrawShapeObject } from "./DrawShapeObject.js";
import { GameStageData } from "./GameStageData.js";

/**
 * Creates drawObjects instances.<br>
 * accessible via GameStage.draw <br>
 * Attach images for image objects and tilemaps <br>
 * Adds drawObjects to current GameStage.stageData
 * @see {@link GameStage} a part of GameStage
 */
export class DrawObjectFactory {
    /**
     * @type {AssetsManager}
     */
    #iLoader;
    /**
     * @type {GameStageData | null}
     */
    #currentPageData;
    /**
     * @hideconstructor 
     */
    constructor(iLoader) {
        this.#iLoader = iLoader;
    }

    /**
     * @returns {GameStageData}
     */
    get stageData() {
        return this.#currentPageData;
    }

    /**
     * 
     * @param {*} renderObject 
     * @returns {Object}
     */
    #addObjectToPageData(renderObject) {
        this.#currentPageData._renderObject = renderObject;
        this.#currentPageData._sortRenderObjectsBySortIndex();
        return renderObject;
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
        this.#addObjectToPageData(renderObject);
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
        const renderObject = new DrawTextObject(x, y, text, font, color);
        this.#addObjectToPageData(renderObject);
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
        this.#addObjectToPageData(renderObject);
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
        this.#addObjectToPageData(renderObject);
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
     * @param {number} [spacing = 0] - for tilesets.spacing > 0
     * @returns {DrawImageObject}
     */
    image(x, y, width, height, key, imageIndex = 0, boundaries, spacing = 0) {
        const image = this.#iLoader.getImage(key),
            
            renderObject = new DrawImageObject(x, y, width, height, key, imageIndex, boundaries, image, spacing);
        
        this.#addObjectToPageData(renderObject);
        return renderObject;
    }

    /**
     * @param {Array<number>} vertices 
     * @param {string} color - rgba(r,g,b,a)
     * @returns {DrawLineObject}
     */
    line(vertices, color) {
        const renderObject = new DrawLineObject(vertices, color);
        this.#addObjectToPageData(renderObject);
        return renderObject;
    }

    /**
     * @param {Array<{x:number, y:number}>} vertices - should go in anticlockwise order
     * @param {string} bgColor - rgba(r,g,b,a)
     * @returns {DrawPolygonObject}
     */
    polygon(vertices, bgColor) {
        const renderObject = new DrawPolygonObject(vertices, bgColor);
        this.#addObjectToPageData(renderObject);
        return renderObject;
    }

    /**
     * 
     * @param {string} layerKey 
     * @param {string} tileMapKey 
     * @param {boolean=} setBoundaries 
     * @param {DrawShapeObject=} shapeMask 
     * @returns {DrawTiledLayer}
     */
    tiledLayer(layerKey, tileMapKey, setBoundaries, shapeMask) {
        const tilemap = this.#iLoader.getTileMap(tileMapKey),
            tilesets = tilemap.tilesets,
            tilesetImages = tilesets.map((tileset) => this.#iLoader.getImage(tileset.data.name)),
            layerData = tilemap.layers.find((layer) => layer.name === layerKey),
            renderObject = new DrawTiledLayer(layerKey, tileMapKey, tilemap, tilesets, tilesetImages, layerData, setBoundaries, shapeMask);

        this.#addObjectToPageData(renderObject);
        return renderObject;
    }

    /**
     * @ignore
     * @param {string} methodKey 
     * @param {Function} createObjectInstance
     */
    _registerNewObjectMethod = (methodKey, createObjectInstance) => {
        this[methodKey] = (...args) => this.#createObjectAndAddToPageData(createObjectInstance, ...args);
    };

    /**
     * @ignore
     * @param {Function} createInstance
     * @param {Array<any>} args
     */
    #createObjectAndAddToPageData = (createInstance, ...args) => {
        const instance = createInstance(...args);
        this.#addObjectToPageData(instance);
        return instance;
    }

    /**
     * @ignore
     * @param {GameStageData} pageData;
     */
    _attachPageData = (pageData) => {
        this.#currentPageData = pageData;
    };
    /**
     * @ignore
     */
    _detachPageData = () => {
        this.#currentPageData = null;
    };
}