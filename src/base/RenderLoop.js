import { SystemSettings } from "../configs.js";
import { GameStageData } from "./GameStageData.js";
import { CONST } from "../constants.js";
import { Warning } from "./Exception.js";
import { WARNING_CODES } from "../constants.js";

import { DrawTiledLayer } from "./2d/DrawTiledLayer.js";
import { DrawImageObject } from "./2d/DrawImageObject.js";
import { DrawCircleObject } from "./2d/DrawCircleObject.js";
import { DrawConusObject } from "./2d/DrawConusObject.js";
import { DrawLineObject } from "./2d/DrawLineObject.js";
import { DrawPolygonObject } from "./2d/DrawPolygonObject.js";
import { DrawRectObject } from "./2d/DrawRectObject.js";
import { DrawTextObject } from "./2d/DrawTextObject.js";
import { WebGlEngine } from "./WebGl/WebGlEngine.js";
import { RenderLoopDebug } from "./RenderLoopDebug.js";

import { utils } from "../index.js";
/**
 * Class represents the render loop,
 * on each time stage start, a new RenderLoop class instance created,
 * after stage stop, RenderLoop stops and its instance removed
 * @see {@link IRender} a part of iRender
 * @hideconstructor
 */
export class RenderLoop {
    /**
     * @type {boolean}
     */
    #isActive;
    /**
     * @type {boolean}
     */
    #isCleared;
    /**
     * @type {RenderLoopDebug}
     */
    #renderLoopDebug;
    #fpsAverageCountTimer;
    /**
     * 
     * @param {GameStageData} stageData 
     */
    #stageData;
    /**
     * @param { WebGlEngine }
     */
    #webGlEngine;
    /**
     * 
     * @param {SystemSettings} systemSettings
     */
    #systemSettings;
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();
    constructor(systemSettings, stageData, WebGlEngine) {
        this.#systemSettings = systemSettings;
        this.#stageData = stageData;
        this.#renderLoopDebug = new RenderLoopDebug(this.#systemSettings.gameOptions.render.cyclesTimeCalc.averageFPStime);
        this.#webGlEngine = WebGlEngine;

        this.#webGlEngine._initDrawCallsDebug(this.renderLoopDebug);
        
        if (this.#systemSettings.gameOptions.render.cyclesTimeCalc.check === CONST.OPTIMIZATION.CYCLE_TIME_CALC.AVERAGES) {
            this.#fpsAverageCountTimer = setInterval(() => this.#countFPSaverage(), this.#systemSettings.gameOptions.render.cyclesTimeCalc.averageFPStime);
        }
    }

    /**
     * @type { GameStageData }
     */
    get stageData() {
        return this.#stageData;
    }

    /**
     * @type { RenderLoopDebug }
     */
    get renderLoopDebug() {
        return this.#renderLoopDebug;
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

    _start() {
        this.#isActive = true;
        requestAnimationFrame(this.#runRenderLoop);
    }

    _stop() {
        this.#isActive = false;
        this.#stageData = null;
        this.renderLoopDebug.cleanupTempVars();
        clearInterval(this.#fpsAverageCountTimer);
        //this.#fpsAverageCountTimer = null;
    }

    /**
     * 
     * @param {Number} drawTimestamp - end time of previous frame's rendering 
     */
    #runRenderLoop = (drawTimestamp) => {
        if (!this.#isActive) {
            return;
        }
        
        const currentDrawTime = this.renderLoopDebug.currentDrawTime(drawTimestamp);
        this.renderLoopDebug.prevDrawTime = drawTimestamp;
        
        const timeStart = performance.now(),
            isCyclesTimeCalcCheckCurrent = this.#systemSettings.gameOptions.render.cyclesTimeCalc.check === CONST.OPTIMIZATION.CYCLE_TIME_CALC.CURRENT;
            
        this.emit(CONST.EVENTS.SYSTEM.RENDER.START);
        this.#stageData._clearBoundaries();
        this.#clearContext();
        
        this.render().then(() => {
            const currentRenderTime = performance.now() - timeStart,
                //r_time_less = minCycleTime - currentRenderTime,
                wait_time = 0, // нужна ли вообще возможность контролировать время отрисовки?
                cycleTime = currentRenderTime + wait_time;
                
            if (isCyclesTimeCalcCheckCurrent) {
                console.log("current draw take: ", (currentDrawTime), " ms");
                console.log("current render() time: ", currentRenderTime);
                console.log("draw calls: ", this.renderLoopDebug.drawCalls);
                console.log("vertices draw: ", this.renderLoopDebug.verticesDraw);
            } else {
                this.renderLoopDebug.tempRCircleT = currentDrawTime;
                this.renderLoopDebug.incrementTempRCircleTPointer();
            }

            this.emit(CONST.EVENTS.SYSTEM.RENDER.END);

            if (this.#isActive) {
                setTimeout(() => requestAnimationFrame(this.#runRenderLoop), wait_time);
            }
        }).catch((errors) => {
            if (errors.forEach) {
                errors.forEach((err) => {
                    Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, err);
                });
            } else {
                Warning(WARNING_CODES.UNHANDLED_DRAW_ISSUE, errors.message);
            }
            this._stop();
        });
    };

    /**
     * @returns {Promise<void>}
     */
    async render() {
        const renderObjects = this.#stageData.renderObjects;
            
        let errors = [],
            isErrors = false,
            len = renderObjects.length,
            renderObjectsPromises = new Array(len);

        if (len !== 0) {
            //this.#checkCollisions(view.renderObjects);
            for (let i = 0; i < len; i++) {
                const object = renderObjects[i];
                if (object.isRemoved) {
                    renderObjects.splice(i, 1);
                    i--;
                    len--;
                    continue;
                }
                if (object.hasAnimations) {
                    object._processActiveAnimations();
                }
                const promise = await this.#drawRenderObject(object)
                    .catch((err) => Promise.reject(err));
                renderObjectsPromises[i] = promise;
            }
            if (this.#systemSettings.gameOptions.debug.boundaries.drawLayerBoundaries) {
                renderObjectsPromises.push(this.#drawBoundariesWebGl()
                    .catch((err) => Promise.reject(err))); 
            }
        }
        const bindResults = await Promise.allSettled(renderObjectsPromises);
        bindResults.forEach((result) => {
            if (result.status === "rejected") {
                Promise.reject(result.reason);
                isErrors = true;
                errors.push(result.reason);
            }
        });
            
        this._isCleared = false;
        if (isErrors === false) {
            this.#stageData._processPendingRenderObjects();
            return Promise.resolve();
        } else {
            return Promise.reject(errors);
        }
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
     * @ignore
     * @param {DrawImageObject | DrawCircleObject | DrawConusObject | DrawLineObject | DrawPolygonObject | DrawRectObject | DrawTextObject | DrawTiledLayer} renderObject 
     * @returns {Promise<void>}
     */
    #drawRenderObject(renderObject) {
        return this.#webGlEngine._preRender()
            .then(() => this.#isActive ? this.#webGlEngine._drawRenderObject(renderObject, this.stageData) : Promise.resolve())
            .then((args) => this.#webGlEngine._postRender(args));
    }

    #clearContext() {
        this.#webGlEngine._clearView();
    }

    /**
     * 
     * @returns {Promise<void>}
     */
    #drawBoundariesWebGl() {
        return new Promise((resolve) => {
            const b = this.stageData.getRawBoundaries(),
                eB = this.stageData.getEllipseBoundaries(),
                pB = this.stageData.getPointBoundaries(),
                bDebug = this.stageData.getDebugObjectBoundaries(),
                len = this.stageData.boundariesLen,
                eLen = this.stageData.ellipseBLen,
                pLen = this.stageData.pointBLen,
                bDebugLen = this.#systemSettings.gameOptions.debug.boundaries.drawObjectBoundaries ? bDebug.length : 0;
        
            if (len)
                this.#webGlEngine._drawLines(b, this.#systemSettings.gameOptions.debug.boundaries.boundariesColor, this.#systemSettings.gameOptions.debug.boundaries.boundariesWidth);
            this.renderLoopDebug.incrementDrawCallsCounter();
            if (eLen) {
                //draw ellipse boundaries
                for (let i = 0; i < eLen; i+=4) {
                    const x = eB[i],
                        y = eB[i+1],
                        radX = eB[i+2],
                        radY = eB[i+3],
                        vertices = utils.calculateEllipseVertices(x, y, radX, radY);
                    this.#webGlEngine._drawPolygon({x: 0, y: 0, vertices, isOffsetTurnedOff: true}, this.stageData);
                    this.renderLoopDebug.incrementDrawCallsCounter();
                    //this.#webGlEngine._drawLines(vertices, this.systemSettings.gameOptions.debug.boundaries.boundariesColor, this.systemSettings.gameOptions.debug.boundaries.boundariesWidth);
                }
            }
            if (pLen) {
                //draw point boundaries
                for (let i = 0; i < pLen; i+=2) {
                    const x = pB[i],
                        y = pB[i+1],
                        vertices = [x,y, x+1,y+1];

                    this.#webGlEngine._drawLines(vertices, this.#systemSettings.gameOptions.debug.boundaries.boundariesColor, this.#systemSettings.gameOptions.debug.boundaries.boundariesWidth);
                    this.renderLoopDebug.incrementDrawCallsCounter();
                }
            }
            if (bDebugLen > 0) {
                this.#webGlEngine._drawLines(bDebug, this.#systemSettings.gameOptions.debug.boundaries.boundariesColor, this.#systemSettings.gameOptions.debug.boundaries.boundariesWidth);
            }
            resolve();
        });
    }

    
    /**
     * 
     * @param {DrawTiledLayer} renderLayer 
     * @returns {Promise<void>}
     */
    #layerBoundariesPrecalculation(renderLayer) {
        return new Promise((resolve, reject) => {
            /*
            if (renderLayer.setBoundaries) {
                const tilemap = this.#iLoader.getTileMap(renderLayer.tileMapKey),
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
                    
                    if (renderLayer.setBoundaries && this.#systemSettings.gameOptions.render.boundaries.mapBoundariesEnabled) {
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
                resolve();
            } else {
                resolve();
            }*/
        });
    }

    #countFPSaverage() {
        const timeLeft = this.#systemSettings.gameOptions.render.cyclesTimeCalc.averageFPStime,
            steps = this.renderLoopDebug.tempRCircleTPointer;
        let fullTime = 0;
        for (let i = 0; i < steps; i++) {
            const timeStep = this.renderLoopDebug.tempRCircleT[i];
            fullTime += timeStep;
        }
        console.log("FPS average for", timeLeft/1000, "sec, is ", (1000 / (fullTime / steps)).toFixed(2));
        console.log("Last loop info:");
        console.log("Webgl draw calls: ", this.renderLoopDebug.drawCalls);
        console.log("Vertices draw: ", this.renderLoopDebug.verticesDraw);
        // cleanup
        this.renderLoopDebug.cleanupTempVars();
    }
}