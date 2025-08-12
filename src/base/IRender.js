import { Exception, Warning } from "./Exception.js";
import { ERROR_CODES, WARNING_CODES } from "../constants.js";
import { WebGlEngine } from "./WebGl/WebGlEngine.js";
import { SystemSettings } from "../configs.js";
import { GameStageData } from "./GameStageData.js";
import AssetsManager from "../../modules/assetsm/src/AssetsManager.js";
//import { calculateBufferData } from "../wa/release.js";
import { CONST } from "../constants.js";
import { imgMVertexShader, imgMFragmentShader, imgMUniforms, imgMAttributes } from "./WebGl/ImagesDrawProgramM.js";
import { primitivesVertexShader, primitivesFragmentShader, primitivesUniforms, primitivesAttributes } from "./WebGl/PrimitivesDrawProgram.js";
import { primitivesMVertexShader, primitivesMFragmentShader, primitivesMUniforms, primitivesMAttributes } from "./WebGl/PrimitivesDrawProgramM.js";
import { RenderLoop } from "./RenderLoop.js";

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
     * @type {RenderingContext | null}
     */
    #drawContext;
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
     * @type {RenderLoop}
     */
    #renderLoopInstance;
    /**
     * @type {boolean}
     */
    #isBoundariesPrecalculations = false;

    /**
     * @type {Array<function():Promise<void>>}
     */
    #initPromises = [];
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();
    constructor(systemSettings, iLoader, canvasContainer) {
        const preserveDrawingBuffer = systemSettings.gameOptions.debug.preserveDrawingBuffer;
        let contextOpt = { stencil: true };
        if (preserveDrawingBuffer === true) {
            contextOpt.preserveDrawingBuffer = true;
        }
        this.#canvas = document.createElement("canvas");
        canvasContainer.appendChild(this.#canvas);
        this.#drawContext = this.#canvas.getContext("webgl", contextOpt);

        this.#systemSettingsReference = systemSettings;
        this.#loaderReference = iLoader;

        this.#isBoundariesPrecalculations = this.systemSettings.gameOptions.render.boundaries.wholeWorldPrecalculations;

        this.#webGlEngine = new WebGlEngine(this.#drawContext, this.#systemSettingsReference.gameOptions, this.iLoader);
        
        this._registerRenderInit(this.#webGlEngine._initiateJsRender);
        if (this.systemSettings.gameOptions.optimization === CONST.OPTIMIZATION.WEB_ASSEMBLY.NATIVE_WAT ||
            this.systemSettings.gameOptions.optimization === CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT) {
            this._registerRenderInit(this.#webGlEngine._initiateWasm);
        }

        this._registerRenderInit(this.fixCanvasSize);
        this._registerRenderInit(
            () => this._registerAndCompileWebGlProgram(CONST.WEBGL.DRAW_PROGRAMS.IMAGES_M, imgMVertexShader, imgMFragmentShader, imgMUniforms, imgMAttributes)
        );
        this._registerRenderInit(
            () => this._registerAndCompileWebGlProgram(CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES, primitivesVertexShader, primitivesFragmentShader, primitivesUniforms, primitivesAttributes)
        );
        this._registerRenderInit(
            () => this._registerAndCompileWebGlProgram(CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES_M, primitivesMVertexShader, primitivesMFragmentShader, primitivesMUniforms, primitivesMAttributes)
        );
        
        this._registerRenderInit(this.#webGlEngine._initWebGlAttributes);
    }

    _webGlEngine() {
        return this.#webGlEngine;
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

    /**
     * 
     * @returns {boolean}
     */
    _isRenderActive() {
        return this.#renderLoopInstance ? this.#renderLoopInstance._isActive : false;
    }

    initiateContext = (stageData) => {
        return Promise.all(this.#initPromises.map(method => method(stageData)));
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
     * @param {function(GameStageData):Promise<void>} method 
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
     * @param {string} objectClassName - object name registered to DrawObjectFactory
     * @param {function(renderObject, gl, pageData, program, vars):Promise<any[]>} objectRenderMethod - should be promise based returns vertices number and draw program
     * @param {string=} objectWebGlDrawProgram 
     */
    _registerObjectRender(objectClassName, objectRenderMethod, objectWebGlDrawProgram) {
        this.#webGlEngine._registerObjectRender(objectClassName, objectRenderMethod, objectWebGlDrawProgram);
    }

    /****************************
     *  End of Extend functionality
     ****************************/

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

    _createBoundariesPrecalculations() {
        //const promises = [];
        //for (const layer of this.#renderLayers) {
        //    promises.push(this.#layerBoundariesPrecalculation(layer).catch((err) => {
        //        Exception(ERROR_CODES.UNHANDLED_PREPARE_EXCEPTION, err);
        //    }));
        //}
        //return promises;
    }

    //#clearTileMapPromises() {
    //    this.#bindTileMapPromises = [];
    //}

    /**
     * @ignore
     * @param {GameStageData} stageData 
     */
    _startRender = async (/*time*/stageData) => {
        this.fixCanvasSize();
        this.#currentGameStageData = stageData;
        switch (this.systemSettings.gameOptions.library) {
        case CONST.LIBRARY.WEBGL:
            await this.#prepareViews();
            this.#renderLoopInstance = new RenderLoop(this.systemSettings, stageData, this._webGlEngine());
            // delegate render loop events
            this.#renderLoopInstance.addEventListener(CONST.EVENTS.SYSTEM.RENDER.START, () => this.emit(CONST.EVENTS.SYSTEM.RENDER.START));
            this.#renderLoopInstance.addEventListener(CONST.EVENTS.SYSTEM.RENDER.END, () => this.emit(CONST.EVENTS.SYSTEM.RENDER.END));

            this.#renderLoopInstance._start();
            break;
        }
    };

    /**
     * @ignore
     */
    _stopRender = () => {
        this.#renderLoopInstance.removeEventListener(CONST.EVENTS.SYSTEM.RENDER.START, this.emit(CONST.EVENTS.SYSTEM.RENDER.START));
        this.#renderLoopInstance.removeEventListener(CONST.EVENTS.SYSTEM.RENDER.END, this.emit(CONST.EVENTS.SYSTEM.RENDER.END));

        this.#renderLoopInstance._stop();
        this.#renderLoopInstance = undefined;

    };
    /**
     * 
     * @returns {Promise<void>}
     */
    #prepareViews() {
        return new Promise((resolve, reject) => {
            let viewPromises = [];
            const isBoundariesPrecalculations = this.#isBoundariesPrecalculations;
            viewPromises.push(this.initiateContext(this.#currentGameStageData));
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
}