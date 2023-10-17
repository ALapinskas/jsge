import { ERROR_CODES } from "../constants.js";
import { Exception, Warning } from "./Exception.js";
import { SystemSocketConnection } from "./SystemSocketConnection.js";
import { SystemAudioInterface } from "./SystemAudioInterface.js";
import { SystemSettings } from "../configs.js";
import AssetsManager from "../../node_modules/assetsm/dist/assetsm.min.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawObjectFactory } from "./DrawObjectFactory.js";
import { WebGlInterface } from "./WebGlInterface.js";

/**
 * Public interface for a System<br>
 * Can be used to start/stop ScreenPage render, <br>
 * And provides access to SystemSettings, SystemSocketConnection and SystemAudioInterface <br>
 * accessible via ScreenPage.system and System.system
 * @see {@link System} a part of System class instance
 * @see {@link ScreenPage} a part of ScreenPage class instance
 */
export class SystemInterface {
    #systemSettings;
    #canvas;
    #drawContext;
    #webGlInterface;
    #canvasContainer;
    #registeredPages;
    #systemServerConnection;
    #systemAudioInterface;
    #loader = new AssetsManager();
    #drawObjectFactory = new DrawObjectFactory();
    /**
     * @hideconstructor
     */
    #modules = new Map();
    constructor(systemSettings, canvasContainer, registeredPages) {
        if (!systemSettings) {
            Exception(ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#systemSettings = systemSettings;
        this.#canvasContainer = canvasContainer;
        this.#canvas = document.createElement("canvas");
        this.#drawContext = this.#canvas.getContext("webgl");
        this.#webGlInterface = new WebGlInterface(this.#drawContext, this.#systemSettings.gameOptions.checkWebGlErrors);
        this.#canvasContainer.appendChild(this.#canvas);
        this.#registeredPages = registeredPages;
        this.#systemAudioInterface = new SystemAudioInterface(this.loader);
        this.#systemServerConnection = new SystemSocketConnection(systemSettings);
    }

    /**
     * @type {HTMLCanvasElement}
     */
    get canvasContainer() {
        return this.#canvasContainer;
    }

    get canvas() {
        return this.#canvas;
    }

    get webGlInterface() {
        return this.#webGlInterface;
    }

    /**#webGlInterface
     * @type { SystemSocketConnection }
     */
    get network () {
        return this.#systemServerConnection;
    }

    /**
     * @type { SystemSettings }
     */
    get systemSettings() {
        return this.#systemSettings;
    }

    /**
     * @type { SystemAudioInterface }
     */
    get audio() {
        return this.#systemAudioInterface;
    }

    get loader() {
        return this.#loader;
    }

    get drawObjectFactory() {
        return this.#drawObjectFactory;
    }

    get modules() {
        return this.#modules;
    }

    initiateContext() {
        return Promise.all([this.#webGlInterface._initiateImagesDrawProgram(),
            this.#webGlInterface._initPrimitivesDrawProgram()]);
    }

    setCanvasSize(width, height) {
        this.#canvas.width = width;
        this.#canvas.height = height;
        if (this.#webGlInterface) {
            this.#webGlInterface._fixCanvasSize(width, height);
        }
    }

    installModule = (moduleKey, moduleClass, ...args) => {
        const moduleInstance = new moduleClass(this, ...args);
        this.#modules.set(moduleKey, moduleInstance);
        return moduleInstance;
    }
    /**
     * @method
     * @param {string} screenPageName
     * @param {Object} [options] - options
     */
    startScreenPage = (screenPageName, options) => {
        if (this.#registeredPages.has(screenPageName)) {
            const page = this.#registeredPages.get(screenPageName);
            if (page.isInitiated === false) {
                page._init();
            }
            //page._attachViewsToContainer(this.#canvasContainer);
            page._start(options);
        } else {
            Exception(ERROR_CODES.VIEW_NOT_EXIST, "View " + screenPageName + " is not registered!");
        }
    };

    /**
     * @method
     * @param {string} screenPageName
     */
    stopScreenPage = (screenPageName) => {
        if (this.#registeredPages.has(screenPageName)) {
            this.#registeredPages.get(screenPageName)._stop();
        } else {
            Exception(ERROR_CODES.VIEW_NOT_EXIST, "View " + screenPageName + " is not registered!");
        }
    };
}