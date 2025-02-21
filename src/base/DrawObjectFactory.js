import { DrawRectObject } from "./2d/DrawRectObject.js";
import { DrawTextObject } from "./2d/DrawTextObject.js";
import { DrawConusObject } from "./2d/DrawConusObject.js";
import { DrawImageObject } from "./2d/DrawImageObject.js";
import { DrawLineObject } from "./2d/DrawLineObject.js";
import { DrawPolygonObject } from "./2d/DrawPolygonObject.js";
import { DrawCircleObject } from "./2d/DrawCircleObject.js";
import { DrawTiledLayer } from "./2d/DrawTiledLayer.js";
import { DrawShapeObject } from "./2d/DrawShapeObject.js";
import { GameStageData } from "./GameStageData.js";
import { Exception, Warning } from "./Exception.js";
import { ERROR_CODES, WARNING_CODES } from "../constants.js";

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
     * @returns {void}
     */
    #addObjectToPageData(renderObject) {
        this.#currentPageData._renderObject = renderObject;
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
     * @param {number} [margin = 0] - for tilesets.margin > 0
     * @returns {DrawImageObject}
     */
    image(x, y, width, height, key, imageIndex = 0, boundaries, spacing = 0, margin = 0) {
        const image = this.#iLoader.getImage(key);

        if (!image) {
            Exception(ERROR_CODES.CANT_GET_THE_IMAGE, "iLoader can't get the image with key: " + key);
        }
            
        const renderObject = new DrawImageObject(x, y, width, height, key, imageIndex, boundaries, image, spacing, margin);
        
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
            layerData = Object.assign({}, tilemap.layers.find((layer) => layer.name === layerKey)), // copy to avoid change same tilemap instance in different tiledLayers
            tilesetIds = Array.from(new Set(layerData.data.filter((id) => id !== 0))).sort((a, b) => a - b),
            tilesets = tilemap.tilesets.map((tileset) => Object.assign({}, tileset)).filter((tileset) => {
                const tilesetStartI = tileset.firstgid,
                    tilesetLastI = tilesetStartI + tileset.data.tilecount;
                if (tilesetIds.find((id) => ((id >= tilesetStartI) && (id < tilesetLastI)))) {
                    return true;
                } else {
                    return false;
                }
            }), // copy to avoid change same tilemap instance in different tiledLayers
            tilesetImages = tilesets.map((tileset) => this.#iLoader.getImage(tileset.data.name)),
            renderObject = new DrawTiledLayer(layerKey, tileMapKey, tilemap, tilesets, tilesetImages, layerData, setBoundaries, shapeMask);
        if (tilesetImages.length > 1) {
            Warning(WARNING_CODES.MULTIPLE_IMAGE_TILESET, " tileset " + layerKey + " includes multiple images, it can case performance issues!");
        }
        //console.log(layerKey);
        //console.log(tilesetIds);
        //console.log(tilesets);
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
    };

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