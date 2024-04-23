import { DrawTiledLayer } from "./DrawTiledLayer.js";
import { Exception, Warning } from "./Exception.js";
import { ERROR_CODES, WARNING_CODES } from "../constants.js";
import { WebGlEngine } from "./WebGl/WebGlEngine.js";
import { SystemSettings } from "../configs.js";
import { GameStageData } from "./GameStageData.js";
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
import { utils } from "../index.js";

/**
 * IRender class controls the render(start/stop/speed) 
 * And drawObjects(animations, removing, and rendering)
 * @see {@link GameStage} a part of GameStage
 * @hideconstructor
 */
export class IRender {
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
     * @type {GameStageData | null}
     */
    #currentGameStageData;

    /**
     * ISystem.systemSettings
     * @type {SystemSettings}
     */
    #systemSettingsReference;
    /**
     * A reference to the systemInterface.iLoader
     * @type {AssetsManager}
     */
    #loaderReference;
    /**
     * @type {Array<number>}
     */
    #tempRCircleT;
    /**
     * @type {NodeJS.Timer | null}
     */
    #fpsAverageCountTimer;
    /**
     * @type {boolean}
     */
    #isBoundariesPrecalculations = false;
    #minCycleTime;
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
    constructor(systemSettings, iLoader, canvasContainer) {
        this.#isCleared = false;
        this.#canvas = document.createElement("canvas");
        canvasContainer.appendChild(this.#canvas);
        this.#drawContext = this.#canvas.getContext("webgl", {stencil: true});

        this.#systemSettingsReference = systemSettings;
        this.#loaderReference = iLoader;

        this.#tempRCircleT = [];
        this.#minCycleTime = this.systemSettings.gameOptions.render.minCycleTime;

        this.#isBoundariesPrecalculations = this.systemSettings.gameOptions.render.boundaries.wholeWorldPrecalculations;

        this.#webGlEngine = new WebGlEngine(this.#drawContext, this.#systemSettingsReference.gameOptions);
        if (this.systemSettings.gameOptions.optimization === CONST.OPTIMIZATION.WEB_ASSEMBLY.NATIVE_WAT ||
            this.systemSettings.gameOptions.optimization === CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT) {
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

        this._registerObjectRender(CONST.DRAW_TYPE.IMAGE, this.#webGlEngine._bindImage, CONST.WEBGL.DRAW_PROGRAMS.IMAGES);
        this._registerObjectRender(CONST.DRAW_TYPE.TEXT, this.#webGlEngine._bindText, CONST.WEBGL.DRAW_PROGRAMS.IMAGES);
        this._registerObjectRender(CONST.DRAW_TYPE.RECTANGLE, this.#webGlEngine._bindPrimitives, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(CONST.DRAW_TYPE.POLYGON, this.#webGlEngine._bindPrimitives, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(CONST.DRAW_TYPE.CIRCLE, this.#webGlEngine._bindConus, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(CONST.DRAW_TYPE.CONUS, this.#webGlEngine._bindConus, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(CONST.DRAW_TYPE.TILED_LAYER, this.#webGlEngine._bindTileImages, CONST.WEBGL.DRAW_PROGRAMS.IMAGES);
        this._registerObjectRender(CONST.DRAW_TYPE.LINE, this.#webGlEngine._bindLine, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
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

    get stageData() {
        return this.#currentGameStageData;
    }

    get systemSettings() {
        return this.#systemSettingsReference;
    }

    get iLoader() {
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
        return this.iLoader.filesWaitingForUpload === 0;
    };

    initiateContext = () => {
        return Promise.all(this.#initPromises.map(method => method()));
    };

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
    };

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
        this.#initPromises.push(method);
        //} else {
        //    Exception(ERROR_CODES.UNEXPECTED_METHOD_TYPE, "registerRenderInit() accept only Promise based methods!");
        //}
    }

    /**
     * @ignore
     * @param {string} objectClassType - object type registered to DrawObjectFactory
     * @param {function(renderObject, gl, pageData, program, vars):Promise<any[]>} objectRenderMethod - should be promise based returns vertices number and draw program
     * @param {string=} objectWebGlDrawProgram 
     */
    _registerObjectRender(objectClassType, objectRenderMethod, objectWebGlDrawProgram) {
        this.#registeredRenderObjects.set(objectClassType, {method: objectRenderMethod, webglProgramName: objectWebGlDrawProgram});
    }

    /****************************
     *  End of Extend functionality
     ****************************/

    /**
     * @returns {Promise<void>}
     */
    async render() {
        let renderObjectsPromises = [],
            errors = [],
            isErrors = false;
        const renderObjects = this.stageData.renderObjects;
        if (renderObjects.length !== 0) {
            //this.#checkCollisions(view.renderObjects);
            for (let i = 0; i < renderObjects.length; i++) {
                const object = renderObjects[i];
                if (object.isRemoved) {
                    renderObjects.splice(i, 1);
                    i--;
                    continue;
                }
                if (object.hasAnimations) {
                    object._processActiveAnimations();
                }
                const promise = await this._bindRenderObject(object)
                    .catch((err) => Promise.reject(err));
                renderObjectsPromises.push(promise);
            }
            if (this.systemSettings.gameOptions.debug.boundaries.drawLayerBoundaries) {
                renderObjectsPromises.push(this.#drawBoundariesWebGl()
                    .catch((err) => Promise.reject(err))); 
            }
            if (this.systemSettings.gameOptions.debug.boundaries.drawObjectBoundaries && this.stageData._isRenderObjectsBoundaries()) {
                this.stageData._getObjectsBoundaries().forEach(drawObject => {
                    renderObjectsPromises.push(this.#webGlEngine._drawPolygon(drawObject, this.stageData));
                });
            }
            //const bindResults = await Promise.allSettled(renderObjectsPromises);
            //bindResults.forEach((result) => {
            //    if (result.status === "rejected") {
            //        reject(result.reason);
            //    }
            //});

            //await this.#webGlEngine._executeImagesDraw();

            //this.#postRenderActions();
        }
        const bindResults = await Promise.allSettled(renderObjectsPromises);
        bindResults.forEach((result) => {
            if (result.status === "rejected") {
                Promise.reject(result.reason);
                isErrors = true;
                errors.push(result.reason);
            }
        });

        this.#postRenderActions();
            
        this._isCleared = false;
        if (isErrors === false) {
            return Promise.resolve();
        } else {
            return Promise.reject(errors);
        }
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
        //const images = this.stageData.getObjectsByInstance(DrawImageObject);
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
     * @param {DrawTiledLayer} renderLayer 
     * @returns {Promise<void>}
     */
    #layerBoundariesPrecalculation(renderLayer) {
        return new Promise((resolve, reject) => {
            if (renderLayer.setBoundaries) {
                const tilemap = this.iLoader.getTileMap(renderLayer.tileMapKey),
                    tilesets = tilemap.tilesets,
                    layerData = tilemap.layers.find((layer) => layer.name === renderLayer.layerKey),
                    { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                    tilewidth = dtwidth,
                    tileheight = dtheight,
                    [ settingsWorldWidth, settingsWorldHeight ] = this.stageData.worldDimensions;
                
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
                        this.stageData._setWorldDimensions(worldW, worldH);
                    }
                    
                    if (renderLayer.setBoundaries && this.systemSettings.gameOptions.render.boundaries.mapBoundariesEnabled) {
                        this.stageData._setWholeWorldMapBoundaries();
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
                this.stageData._setWholeMapBoundaries(boundaries);
                this.stageData._mergeBoundaries(true);
                console.warn("precalculated boundaries set");
                console.log(this.stageData.getWholeWorldBoundaries());
                resolve();
            } else {
                resolve();
            }
        });
    }

    /**
     * @ignore
     * @param {DrawImageObject | DrawCircleObject | DrawConusObject | DrawLineObject | DrawPolygonObject | DrawRectObject | DrawTextObject | DrawTiledLayer} renderObject 
     * @returns {Promise<void>}
     */
    _bindRenderObject(renderObject) {
        const type = renderObject.type;
        if (!type) {
            return Promise.reject({code: ERROR_CODES.DRAW_OBJECT_TYPE_NOT_SET, message: renderObject.constructor.name + " , type property is not set, stop draw"});
        }
        const registeredRenderObject = this.#registeredRenderObjects.get(type);
        if (registeredRenderObject) {
            const name = registeredRenderObject.webglProgramName;
            if (name) {
                const program = this.#webGlEngine.getProgram(name),
                    vars = this.#webGlEngine.getProgramVarLocations(name);
                return registeredRenderObject.method(renderObject, this.drawContext, this.stageData, program, vars)
                    .then((results) => this.#webGlEngine._render(results[0], results[1]));  
            } else {
                return registeredRenderObject.method(renderObject, this.drawContext, this.stageData);
            }
        } else {
            return Promise.reject({code: ERROR_CODES.DRAW_METHOD_NOT_REGISTERED, message: "draw method for object type " + type + " is not registered, stop draw"});
        }
    }

    /**
     * 
     * @returns {Promise<void>}
     */
    #drawBoundariesWebGl() {
        return new Promise((resolve) => {
            const b = this.stageData.getBoundaries(),
                eB = this.stageData.getEllipseBoundaries(),
                pB = this.stageData.getPointBoundaries(),
                len = b.length,
                eLen = eB.length,
                pLen = pB.length,
                linesArray = [];
        
            //for (let i = 0; i < len; i++) {
            //    const item = b[i];
            //    linesArray.push(item[0], item[1]);
            //    linesArray.push(item[2], item[3]);
            //}
            this.#webGlEngine._drawLines(b.flat(), this.systemSettings.gameOptions.debug.boundaries.boundariesColor, this.systemSettings.gameOptions.debug.boundaries.boundariesWidth);
            if (eLen) {
                //draw ellipse boundaries
                eB.forEach(element => {
                    const x = element[0],
                        y = element[1],
                        radX = element[2],
                        radY = element[3],
                        vertices = utils.calculateEllipseVertices(x, y, radX, radY);
                        this.#webGlEngine._drawPolygon({x: 0, y: 0, vertices, isOffsetTurnedOff: true}, this.stageData);
                        //this.#webGlEngine._drawLines(vertices, this.systemSettings.gameOptions.debug.boundaries.boundariesColor, this.systemSettings.gameOptions.debug.boundaries.boundariesWidth);
                });
            }
            if (pLen) {
                //draw point boundaries
                pB.forEach(element => {
                    const x = element[0],
                        y = element[1],
                        vertices = [x,y, x+1,y+1];

                        this.#webGlEngine._drawLines(vertices, this.systemSettings.gameOptions.debug.boundaries.boundariesColor, this.systemSettings.gameOptions.debug.boundaries.boundariesWidth);
                });
            }
            resolve();
        });
    }

    #countFPSaverage() {
        const timeLeft = this.systemSettings.gameOptions.render.cyclesTimeCalc.averageFPStime,
            steps = this.#tempRCircleT.length;
        let fullTime = 0;
        for (let i = 0; i < steps; i++) {
            const timeStep = this.#tempRCircleT[i];
            fullTime += timeStep;
        }
        console.log("FPS average for", timeLeft/1000, "sec, is ", (1000 / (fullTime / steps)).toFixed(2));

        // cleanup
        this.#tempRCircleT = [];
    }

    /**
     * @ignore
     * @param {GameStageData} stageData 
     */
    _startRender = async (/*time*/stageData) => {
        const gameOptions = this.systemSettings.gameOptions;
        //Logger.debug("_render " + this.name + " class");
        this.#isActive = true;
        this.#currentGameStageData = stageData;
        this.fixCanvasSize();
        switch (gameOptions.library) {
            case CONST.LIBRARY.WEBGL:
                await this.#prepareViews();
                this.timeStart = Date.now();
                setTimeout(() => requestAnimationFrame(this.#drawViews));
                break;
        }
        if (gameOptions.render.cyclesTimeCalc.check === CONST.OPTIMIZATION.CYCLE_TIME_CALC.AVERAGES) {
            this.#fpsAverageCountTimer = setInterval(() => this.#countFPSaverage(), gameOptions.render.cyclesTimeCalc.averageFPStime);
        }
    };

    /**
     * @ignore
     */
    _stopRender = () => {
        this.#isActive = false;
        this.#currentGameStageData = null;
        this.#tempRCircleT = [];
        clearInterval(this.#fpsAverageCountTimer);
        this.#fpsAverageCountTimer = null;
    };
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
                //viewPromises.push(this.#iRender._createBoundariesPrecalculations());
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
        const timeStart = performance.now(),
            minCycleTime = this.#minCycleTime,
            isCyclesTimeCalcCheckCurrent = this.systemSettings.gameOptions.render.cyclesTimeCalc.check === CONST.OPTIMIZATION.CYCLE_TIME_CALC.CURRENT;
            
        this.emit(CONST.EVENTS.SYSTEM.RENDER.START);
        this.stageData._clearBoundaries();
        this.clearContext();
        
        this.render().then(() => {
            const currentRenderTime = performance.now() - timeStart,
                r_time_less = minCycleTime - currentRenderTime,
                wait_time = r_time_less > 0 ? r_time_less : 0,
                cycleTime = currentRenderTime + wait_time;
                
            if (isCyclesTimeCalcCheckCurrent && currentRenderTime > minCycleTime) {
                console.log("current draw take: ", (currentRenderTime), " ms");
            }

            this.emit(CONST.EVENTS.SYSTEM.RENDER.END);

            if (cycleTime > 0) {
                this.#tempRCircleT.push(cycleTime);
            }

            if (this.#isActive) {
                setTimeout(() => requestAnimationFrame(this.#drawViews), wait_time);
            }
        }).catch((errors) => {
            if (errors.forEach) {
                errors.forEach((err) => {
                    Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, err);
                });
            } else if (errors.code) {
                Warning(errors.code, errors.message);
            } else {
                Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, errors);
            }
            this._stopRender();
        });
    };
}