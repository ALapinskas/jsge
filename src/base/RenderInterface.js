import { TiledRenderLayer } from "./TiledRenderLayer.js";
import { Exception, Warning } from "./Exception.js";
import { ERROR_CODES, WARNING_CODES } from "../constants.js";
import { WebGlEngine } from "./WebGl/WebGlEngine.js";
import { SystemSettings } from "../configs.js";
import { ScreenPageData } from "./ScreenPageData.js";
import AssetsManager from "../../modules/assetsm/dist/assetsm.min.js";
//import { calculateBufferData } from "../wa/release.js";
import { CONST } from "../constants.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawCircleObject } from "./DrawCircleObject.js";
import { DrawConusObject } from "./DrawConusObject.js";
import { DrawLineObject } from "./DrawLineObject.js";
import { DrawPolygonObject } from "./DrawPolygonObject.js";
import { DrawRectObject } from "./DrawRectObject.js";
import { DrawTextObject } from "./DrawTextObject.js";
import { imgVertexShader, imgFragmentShader, imgUniforms, imgAttributes } from "./WebGl/ImagesDrawProgram.js";
import { primitivesVertexShader, primitivesFragmentShader, primitivesUniforms, primitivesAttributes } from "./WebGl/PrimitivesDrawProgram.js";

/**
 * RenderInterface class represents on how the drawObjects
 * should be drawn and the render itself
 * @see {@link ScreenPage} a part of ScreenPage
 * @hideconstructor
 */
export class RenderInterface {
    /**
     * @type {HTMLCanvasElement}
     */
    #canvas;
    /**
     * @type {WebGLRenderingContext}
     */
    #drawContext;
    /**
     * @type {boolean}
     */
    #isCleared;
    /**
     * @type {boolean}
     */
    #isActive;
    /**
     * @type {WebGlEngine}
     */
    #webGlEngine;
    /**
     * @type {ScreenPageData}
     */
    #currentScreenPageData;

    /**
     * SystemInterface.systemSettings
     * @type {SystemSettings}
     */
    #systemSettingsReference;
    /**
     * A reference to the systemInterface.loader
     * @type {AssetsManager}
     */
    #loaderReference;
    /**
     * @type {Array<number>}
     */
    #tempFPStime;
    /**
     * @type {NodeJS.Timer}
     */
    #fpsAverageCountTimer;
    /**
     * @type {boolean}
     */
    #isBoundariesPrecalculations = false;
    #minCircleTime;
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();
    #bindRenderLayerMethod;
    #registeredRenderObjects = new Map();

    /**
     * @type {Array<function():Promise<void>>}
     */
    #initPromises = [];
    constructor(systemSettings, loader, canvasContainer) {
        this.#isCleared = false;
        this.#canvas = document.createElement("canvas");
        canvasContainer.appendChild(this.#canvas);
        this.#drawContext = this.#canvas.getContext("webgl", {stencil: true});

        this.#systemSettingsReference = systemSettings;
        this.#loaderReference = loader;

        this.#tempFPStime = [];
        this.#minCircleTime = this.systemSettings.gameOptions.render.minCircleTime;

        this.#isBoundariesPrecalculations = this.systemSettings.gameOptions.render.boundaries.wholeWorldPrecalculations;

        this.#webGlEngine = new WebGlEngine(this.#drawContext, this.#systemSettingsReference.gameOptions);
        if (this.systemSettings.gameOptions.optimization === CONST.OPTIMIZATION.WEB_ASSEMBLY.WASM) {
            this._registerRenderInit(this.#webGlEngine._initiateWasm);
        }

        this._registerRenderInit(this.fixCanvasSize);
        this._registerRenderInit(
            () => this._registerAndCompileWebGlProgram(CONST.WEBGL.DRAW_PROGRAMS.IMAGES, imgVertexShader, imgFragmentShader, imgUniforms, imgAttributes)
        );
        this._registerRenderInit(
            () => this._registerAndCompileWebGlProgram(CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES, primitivesVertexShader, primitivesFragmentShader, primitivesUniforms, primitivesAttributes)
        );
        this._registerRenderInit(this.#webGlEngine._initWebGlAttributes);

        this._registerObjectRender("DrawTextObject", this.#webGlEngine._bindText, CONST.WEBGL.DRAW_PROGRAMS.IMAGES);
        this._registerObjectRender("DrawRectObject", this.#webGlEngine._bindPrimitives, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender("DrawPolygonObject", this.#webGlEngine._bindPrimitives, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender("DrawCircleObject", this.#webGlEngine._bindConus, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender("DrawConusObject", this.#webGlEngine._bindConus, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender("TiledRenderLayer", this.#webGlEngine._bindTileImages, CONST.WEBGL.DRAW_PROGRAMS.IMAGES);
        this._registerObjectRender("DrawLineObject", this.#webGlEngine._bindLine, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
    }

    /**
     * 
     * @param {string} eventName 
     * @param {*} listener 
     * @param {*=} options 
     */
    addEventListener = (eventName, listener, options) => {
        this.#emitter.addEventListener(eventName, listener, options);
    };

    /**
     * 
     * @param {string} eventName 
     * @param {*} listener 
     * @param {*=} options 
     */
    removeEventListener = (eventName, listener, options) => {
        this.#emitter.removeEventListener(eventName, listener, options);
    };

    get screenPageData() {
        return this.#currentScreenPageData;
    }

    get systemSettings() {
        return this.#systemSettingsReference;
    }

    get loader() {
        return this.#loaderReference;
    }

    get canvas() {
        return this.#canvas;
    }

    get drawContext() {
        return this.#drawContext;
    }

    /**
     * 
     * @param {string} eventName
     * @param  {...any} eventParams
     */
    emit = (eventName, ...eventParams) => {
        const event = new Event(eventName);
        event.data = [...eventParams];
        this.#emitter.dispatchEvent(event);
    };

    /**
     * Determines if all added files was loaded or not
     * @returns {boolean}
     */
    isAllFilesLoaded = () => {
        return this.loader.filesWaitingForUpload === 0;
    };

    initiateContext = () => {
        return Promise.all(this.#initPromises);
    }

    clearContext() {
        this.#webGlEngine._clearView();
    }

    setCanvasSize(width, height) {
        this.#canvas.width = width;
        this.#canvas.height = height;
        if (this.#webGlEngine) {
            this.#webGlEngine._fixCanvasSize(width, height);
        }
    }

    fixCanvasSize = () => {
        const settings = this.systemSettings, 
            canvasWidth = settings.canvasMaxSize.width && (settings.canvasMaxSize.width < window.innerWidth) ? settings.canvasMaxSize.width : window.innerWidth,
            canvasHeight = settings.canvasMaxSize.height && (settings.canvasMaxSize.height < window.innerHeight) ? settings.canvasMaxSize.height : window.innerHeight;
        this.setCanvasSize(canvasWidth, canvasHeight);
        return Promise.resolve();
    }

    /****************************
     *  Extend functionality
     ****************************/
    /**
     * @ignore
     * @param {string} programName
     * @param {string} vertexShader - raw vertex shader program
     * @param {string} fragmentShader - raw fragment shader program 
     * @param {Array<string>} uVars - program uniform variables names
     * @param {Array<string>} aVars - program attribute variables names
     * @returns {Promise<void>}
     */
    _registerAndCompileWebGlProgram(programName, vertexShader, fragmentShader, uVars, aVars) {
        this.#webGlEngine._registerAndCompileWebGlProgram(programName, vertexShader, fragmentShader, uVars, aVars);
        return Promise.resolve();
    }

    /**
     * @ignore
     * @param {function():Promise<void>} method 
     * @returns {void}
     */
    _registerRenderInit(method) {
        if (method() instanceof Promise) {
            this.#initPromises.push(method);
        } else {
            Exception(ERROR_CODES.UNEXPECTED_METHOD_TYPE, "registerRenderInit() accept only Promise based methods!");
        }
    }

    /**
     * @ignore
     * @param {string} objectClassName - object name registered to DrawObjectFactory
     * @param {function(renderObject, gl, pageData, program, vars):Promise<any[]>} objectRenderMethod - should be promise based returns vertices number and draw program
     * @param {string=} objectWebGlDrawProgram 
     */
    _registerObjectRender(objectClassName, objectRenderMethod, objectWebGlDrawProgram) {
        this.#registeredRenderObjects.set(objectClassName, {method: objectRenderMethod, webglProgramName: objectWebGlDrawProgram});
    }

    /****************************
     *  End of Extend functionality
     ****************************/

    /**
     * @returns {Promise<void>}
     */
    async render() {
        return new Promise(async(resolve, reject) => {
            let renderObjectsPromises = [];
            const renderObjects = this.screenPageData.renderObjects;
            if (renderObjects.length !== 0) {
                //this.#checkCollisions(view.renderObjects);
                for (let i = 0; i < renderObjects.length; i++) {
                    const object = renderObjects[i];
                    if (object.isRemoved) {
                        renderObjects.splice(i, 1);
                        i--;
                        continue;
                    }
                    const promise = await this._bindRenderObject(object).catch((err) => {
                        reject(err);
                    });
                    renderObjectsPromises.push(promise);
                    if (object.isAnimations) {
                        object._processActiveAnimations();
                    }
                }
                if (this.systemSettings.gameOptions.boundaries.drawLayerBoundaries) {
                    renderObjectsPromises.push(this.#drawBoundariesWebGl().catch((err) => {
                        reject(err);
                    })); 
                }
                const bindResults = await Promise.allSettled(renderObjectsPromises);
                bindResults.forEach((result) => {
                    if (result.status === "rejected") {
                        reject(result.reason);
                    }
                });

                //await this.#webGlEngine._executeImagesDraw();

                //this.#postRenderActions();
                    
                this._isCleared = false;
            }
            const bindResults = await Promise.allSettled(renderObjectsPromises);
            bindResults.forEach((result) => {
                if (result.status === "rejected") {
                    reject(result.reason);
                }
            });

            this.#postRenderActions();
                
            this._isCleared = false;
            resolve();
        });
    }

    /**
     * @ignore
     */
    set _isCleared(value) {
        this.#isCleared = value;
    }

    /**
     * @ignore
     */
    get _isCleared() {
        return this.#isCleared;
    }

    _createBoundariesPrecalculations() {
        //const promises = [];
        //for (const layer of this.#renderLayers) {
        //    promises.push(this.#layerBoundariesPrecalculation(layer).catch((err) => {
        //        Exception(ERROR_CODES.UNHANDLED_PREPARE_EXCEPTION, err);
        //    }));
        //}
        //return promises;
    }
    #postRenderActions() {
        //const images = this.screenPageData.getObjectsByInstance(DrawImageObject);
        //for (let i = 0; i < images.length; i++) {
        //    const object = images[i];
        //    if (object.isAnimations) {
        //        object._processActiveAnimations();
        //    }
        //}
    }

    //#clearTileMapPromises() {
    //    this.#bindTileMapPromises = [];
    //}

    /**
     * 
     * @param {TiledRenderLayer} renderLayer 
     * @returns {Promise<void>}
     */
    #layerBoundariesPrecalculation(renderLayer) {
        return new Promise((resolve, reject) => {
            if (renderLayer.setBoundaries) {
                const tilemap = this.loader.getTileMap(renderLayer.tileMapKey),
                    tilesets = tilemap.tilesets,
                    layerData = tilemap.layers.find((layer) => layer.name === renderLayer.layerKey),
                    { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                    tilewidth = dtwidth,
                    tileheight = dtheight,
                    [ settingsWorldWidth, settingsWorldHeight ] = this.screenPageData.worldDimensions;
                
                let boundaries = [];

                if (!layerData) {
                    Warning(WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                    reject();
                }
                
                for (let i = 0; i < tilesets.length; i++) {
                    const layerCols = layerData.width,
                        layerRows = layerData.height,
                        worldW = tilewidth * layerCols,
                        worldH = tileheight * layerRows;

                    if (worldW !== settingsWorldWidth || worldH !== settingsWorldHeight) {
                        Warning(WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                        this.screenPageData._setWorldDimensions(worldW, worldH);
                    }
                    
                    if (this.screenPageData.isWorldBoundariesEnabled) {
                        this.screenPageData._setWholeWorldMapBoundaries();
                    }

                    //calculate boundaries
                    let mapIndex = 0;

                    for (let row = 0; row < layerRows; row++) {
                        for (let col = 0; col < layerCols; col++) {
                            let tile = layerData.data[mapIndex],
                                mapPosX = col * tilewidth,
                                mapPosY = row * tileheight;
                            if (tile !== 0) {
                                tile -= 1;
                                
                                boundaries.push([mapPosX, mapPosY, mapPosX + tilewidth, mapPosY]);
                                boundaries.push([mapPosX + tilewidth, mapPosY, mapPosX + tilewidth, mapPosY + tileheight]);
                                boundaries.push([mapPosX + tilewidth, mapPosY + tileheight, mapPosX, mapPosY + tileheight]);
                                boundaries.push([mapPosX, mapPosY + tileheight, mapPosX, mapPosY ]);
    
                            }
                            mapIndex++;
                        }
                    }
                }
                this.screenPageData._setWholeMapBoundaries(boundaries);
                this.screenPageData._mergeBoundaries(true);
                console.warn("precalculated boundaries set");
                console.log(this.screenPageData.getWholeWorldBoundaries());
                resolve();
            } else {
                resolve();
            }
        });
    }

    /**
     * @ignore
     * @param {DrawImageObject | DrawCircleObject | DrawConusObject | DrawLineObject | DrawPolygonObject | DrawRectObject | DrawTextObject | TiledRenderLayer} renderObject 
     * @returns {Promise<void>}
     */
    _bindRenderObject(renderObject) {
        const name = renderObject.constructor.name,
            registeredRenderObject = this.#registeredRenderObjects.get(name);
        if (registeredRenderObject) {
            const name = registeredRenderObject.webglProgramName;
            if (name) {
                const program = this.#webGlEngine.getProgram(name),
                    vars = this.#webGlEngine.getProgramVarLocations(name);
                return registeredRenderObject.method(renderObject, this.drawContext, this.screenPageData, program, vars)
                    .then((results) => this.#webGlEngine._render(results[0], results[1]));  
            } else {
                return registeredRenderObject.method(renderObject, this.drawContext, this.screenPageData);
            }
        } else {
            // a workaround for images and its extend classes drawing
            if (renderObject.type === CONST.DRAW_TYPE.IMAGE) {
                const program = this.#webGlEngine.getProgram(CONST.WEBGL.DRAW_PROGRAMS.IMAGES),
                    vars = this.#webGlEngine.getProgramVarLocations(CONST.WEBGL.DRAW_PROGRAMS.IMAGES);

                if (!renderObject.image) {
                    renderObject.image = this.loader.getImage(renderObject.key);
                }
                return this.#webGlEngine._bindImage(renderObject, this.drawContext, this.screenPageData, program, vars)
                    .then((results) => this.#webGlEngine._render(results[0], results[1]))
                    .then(() => {
                        if (renderObject.vertices && this.systemSettings.gameOptions.boundaries.drawObjectBoundaries) {
                            return this.#webGlEngine._drawPolygon(renderObject, this.screenPageData);
                        } else {
                            return Promise.resolve();
                        }
                    });
            } else {
                console.warn("no registered draw object method for " + name + " skip draw");
                return Promise.resolve();
            }
        }
    }

    /**
     * 
     * @returns {Promise<void>}
     */
    #drawBoundariesWebGl() {
        return new Promise((resolve) => {
            const b = this.screenPageData.getBoundaries(),
                len = b.length,
                linesArray = [];
        
            for (let i = 0; i < len; i++) {
                const item = b[i];
                linesArray.push(item[0], item[1]);
                linesArray.push(item[2], item[3]);
            }
            this.#webGlEngine._drawLines(linesArray, this.systemSettings.gameOptions.boundaries.boundariesColor, this.systemSettings.gameOptions.boundaries.boundariesWidth);
            resolve();
        });
    }

    #countFPSaverage() {
        const timeLeft = this.systemSettings.gameOptions.render.averageFPStime,
            steps = this.#tempFPStime.length;
        let fullTime = 0;

        for(let i = 0; i < steps; i++) {
            const timeStep = this.#tempFPStime[i];
            fullTime += timeStep;
        }
        console.log("FPS average for ", timeLeft/1000, "sec, is ", fullTime / steps);

        // cleanup
        this.#tempFPStime = [];
    }

    /**
     * @ignore
     * @param {ScreenPageData} screenPageData 
     */
    _startRender = async (/*time*/screenPageData) => {
        //Logger.debug("_render " + this.name + " class");
        this.#isActive = true;
        this.#currentScreenPageData = screenPageData;
        //const settings = this.systemSettings;
        //const canvasWidth = settings.canvasMaxSize.width && (settings.canvasMaxSize.width < window.innerWidth) ? settings.canvasMaxSize.width : window.innerWidth,
        //    canvasHeight = settings.canvasMaxSize.height && (settings.canvasMaxSize.height < window.innerHeight) ? settings.canvasMaxSize.height : window.innerHeight;
        const [canvasWidth, canvasHeight] = this.#currentScreenPageData.canvasDimensions;
        this.setCanvasSize(canvasWidth, canvasHeight);
        switch (this.systemSettings.gameOptions.library) {
            case CONST.LIBRARY.WEBGL:
                await this.#prepareViews();
                setTimeout(() => requestAnimationFrame(this.#drawViews));
                break;
        }
        this.#fpsAverageCountTimer = setInterval(() => this.#countFPSaverage(), this.systemSettings.gameOptions.render.averageFPStime);
    };

    /**
     * @ignore
     */
    _stopRender = () => {
        this.#isActive = false;
        this.#currentScreenPageData = null;
        clearInterval(this.#fpsAverageCountTimer);
    }
    /**
     * 
     * @returns {Promise<void>}
     */
    #prepareViews() {
        return new Promise((resolve, reject) => {
            let viewPromises = [];
            const isBoundariesPrecalculations = this.#isBoundariesPrecalculations;
            viewPromises.push(this.initiateContext());
            if (isBoundariesPrecalculations) {
                console.warn("isBoundariesPrecalculations() is turned off");
                //for (const view of this.#views.values()) {
                //viewPromises.push(this.#renderInterface._createBoundariesPrecalculations());
                //}
            }
            Promise.allSettled(viewPromises).then((drawingResults) => {
                drawingResults.forEach((result) => {
                    if (result.status === "rejected") {
                        const error = result.reason;
                        Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, error);
                        reject(error);
                    }
                });
                resolve();
            });
        });
    }

    #drawViews = async (/*drawTime*/) => {
        const pt0 = performance.now(),
            minCircleTime = this.#minCircleTime;
            
        this.emit(CONST.EVENTS.SYSTEM.RENDER.START);
        this.screenPageData._clearBoundaries();
        this.clearContext();
        
        this.render().then(() => {
            const r_time = performance.now() - pt0,
                r_time_less = minCircleTime - r_time,
                wait_time = r_time_less > 0 ? r_time_less : 0,
                fps = 1000 / (r_time + wait_time);
            //console.log("draw circle done, take: ", (r_time), " ms");
            //console.log("fps: ", fps);
            this.emit(CONST.EVENTS.SYSTEM.RENDER.END);
            if(fps === Infinity) {
                console.log("infinity time");
            }
            this.#tempFPStime.push(fps);
            if (this.#isActive) {
                setTimeout(() => requestAnimationFrame(this.#drawViews), wait_time);
            }
        }).catch((err) => {
            Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, err);
            this._stopRender();
        });
    };
}