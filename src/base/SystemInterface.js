import { CONST, ERROR_CODES, WARNING_CODES } from "../constants.js";
import { Exception, Warning } from "./Exception.js";
import { SystemSocketConnection } from "./SystemSocketConnection.js";
import { SystemAudioInterface } from "./SystemAudioInterface.js";
import { SystemSettings } from "../configs.js";
import AssetsManager from "../../modules/assetsm/dist/assetsm.min.js";
import { DrawImageObject } from "./DrawImageObject.js";
import { DrawObjectFactory } from "./DrawObjectFactory.js";
import { ScreenPage } from "./ScreenPage.js";

/**
 * Public interface for a System<br>
 * Can be used to start/stop ScreenPage render, <br>
 * And provides access to SystemSettings, SystemSocketConnection and SystemAudioInterface <br>
 * accessible via ScreenPage.system and System.system
 * @see {@link System} a part of System class instance
 * @see {@link ScreenPage} a part of ScreenPage class instance
 */
export class SystemInterface {
    /**
     * @type {Object}
     */
    #systemSettings;
    /**
     * @type {HTMLElement}
     */
    #canvasContainer;
    /**
     * @type {Map<String, ScreenPage>}
     */
    #registeredPages;
    /**
     * @type {SystemSocketConnection}
     */
    #systemServerConnection;
    /**
     * @type {SystemAudioInterface}
     */
    #systemAudioInterface;
    /**
     * @type {AssetsManager}
     */
    #loader = new AssetsManager();
    /**
     * @type {DrawObjectFactory}
     */
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
        this.#registeredPages = registeredPages;
        this.#systemAudioInterface = new SystemAudioInterface(this.loader);
        this.#systemServerConnection = new SystemSocketConnection(systemSettings);
    }

    /**
     * @type {HTMLElement}
     * 
     */
    get canvasContainer() {
        return this.#canvasContainer;
    }

    /**
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

    /**
     * @type {AssetsManager}
     */
    get loader() {
        return this.#loader;
    }

    /**
     * @type {DrawObjectFactory}
     */
    get drawObjectFactory() {
        return this.#drawObjectFactory;
    }

    /**
     * @type {Map<string, Object>}
     */
    get modules() {
        return this.#modules;
    }

    /**
     * 
     * @param {string} moduleKey 
     * @param {Object} moduleClass 
     * @param  {...any} args 
     * @returns {Object}
     */
    installModule = (moduleKey, moduleClass, ...args) => {
        const moduleInstance = new moduleClass(this, ...args);
        if (this.#modules.has(moduleKey)) {
            Warning(WARNING_CODES.MODULE_ALREADY_INSTALLED, "module " + moduleKey + " is already installed");
            return this.#modules.get(moduleKey);
        } else {
            this.#modules.set(moduleKey, moduleInstance);
        }
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
            page._attachViewsToContainer(this.#canvasContainer);
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