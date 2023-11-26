import { CONST, ERROR_CODES, WARNING_CODES } from "../constants.js";
import { Exception, Warning } from "./Exception.js";
import { SystemSocketConnection } from "./SystemSocketConnection.js";
import { SystemAudioInterface } from "./SystemAudioInterface.js";
import { SystemSettings } from "../configs.js";
import AssetsManager from "../../modules/assetsm/dist/assetsm.min.js";
import { DrawObjectFactory } from "./DrawObjectFactory.js";
import { ScreenPage } from "./ScreenPage.js";
import { RenderInterface } from "./RenderInterface.js";
import { ExtensionInterface } from "./ExtensionInterface.js";

/**
 * Public interface for a System<br>
 * Can be used to start/stop ScreenPage render, <br>
 * And provides access to SystemSettings, SystemSocketConnection and SystemAudioInterface <br>
 * RenderInterface, DrawObjectFactory, AssetsManager and external modules
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
     * @type {ExtensionInterface}
     */
    #extensionInterface;
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
     * @type {RenderInterface}
     */
    #renderInterface;
    /**
     * @type {DrawObjectFactory}
     */
    #drawObjectFactory = new DrawObjectFactory(this.#loader);
    
    #modules = new Map();
    /**
     * @type {Map<string, ScreenPage>}
     */
    #registeredPagesReference;
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();
    /**
     * @hideconstructor
     */
    constructor(systemSettings, registeredPages, canvasContainer) {
        if (!systemSettings) {
            Exception(ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#systemSettings = systemSettings;
        this.#extensionInterface = new ExtensionInterface(this);
        this.#systemAudioInterface = new SystemAudioInterface(this.loader);
        this.#systemServerConnection = new SystemSocketConnection(systemSettings);
        this.#renderInterface = new RenderInterface(this.systemSettings, this.loader, canvasContainer);
        this.#registeredPagesReference = registeredPages;
        // broadcast render events
        this.#renderInterface.addEventListener(CONST.EVENTS.SYSTEM.RENDER.START, () => this.emit(CONST.EVENTS.SYSTEM.RENDER.START));
        this.#renderInterface.addEventListener(CONST.EVENTS.SYSTEM.RENDER.END, () => this.emit(CONST.EVENTS.SYSTEM.RENDER.END));
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

    get renderInterface() {
        return this.#renderInterface;
    }

    get extensionInterface() {
        return this.#extensionInterface;
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
        if (this.#registeredPagesReference.has(screenPageName)) {
            const page = this.#registeredPagesReference.get(screenPageName),
                pageData = page.screenPageData;
            this.#drawObjectFactory._attachPageData(pageData);
            if (page.isInitiated === false) {
                page._init();
            }
            //page._attachCanvasToContainer(this.#canvasContainer);
            page._start(options);
            this.emit(CONST.EVENTS.SYSTEM.START_PAGE);
            this.#renderInterface._startRender(pageData);
        } else {
            Exception(ERROR_CODES.VIEW_NOT_EXIST, "View " + screenPageName + " is not registered!");
        }
    };

    /**
     * @method
     * @param {string} screenPageName
     */
    stopScreenPage = (screenPageName) => {
        if (this.#registeredPagesReference.has(screenPageName)) {
            this.emit(CONST.EVENTS.SYSTEM.STOP_PAGE);
            this.drawObjectFactory._detachPageData();
            this.#renderInterface._stopRender();
            this.#registeredPagesReference.get(screenPageName)._stop();
        } else {
            Exception(ERROR_CODES.VIEW_NOT_EXIST, "View " + screenPageName + " is not registered!");
        }
    };
}