import { CONST, ERROR_CODES, WARNING_CODES } from "../constants.js";
import { Exception, Warning } from "./Exception.js";
import { INetwork } from "./INetwork.js";
import { ISystemAudio } from "./ISystemAudio.js";
import { SystemSettings } from "../configs.js";
import AssetsManager from "../../modules/assetsm/dist/assetsm.min.js";
import { DrawObjectFactory } from "./DrawObjectFactory.js";
import { GameStage } from "./GameStage.js";
import { IRender } from "./IRender.js";
import { IExtension } from "./IExtension.js";

/**
 * Public interface for a System<br>
 * Can be used to start/stop GameStage render, <br>
 * And provides access to SystemSettings, INetwork and ISystemAudio <br>
 * IRender, DrawObjectFactory, AssetsManager and external modules
 * accessible via GameStage.iSystem and System.system
 * @see {@link System} a part of System class instance
 * @see {@link GameStage} a part of GameStage class instance
 */
export class ISystem {
    /**
     * @type {Object}
     */
    #systemSettings;
    /**
     * @type {IExtension}
     */
    #iExtension;
    /**
     * @type {INetwork | null}
     */
    #systemServerConnection;
    /**
     * @type {ISystemAudio}
     */
    #systemAudioInterface;
    /**
     * @type {AssetsManager}
     */
    #iLoader = new AssetsManager();
    /**
     * @type {IRender}
     */
    #iRender;
    /**
     * @type {DrawObjectFactory}
     */
    #drawObjectFactory = new DrawObjectFactory(this.#iLoader);
    
    #modules = new Map();
    /**
     * @type {Map<string, GameStage>}
     */
    #registeredStagesReference;
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();
    /**
     * @hideconstructor
     */
    constructor(systemSettings, registeredStages, canvasContainer) {
        if (!systemSettings) {
            Exception(ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#systemSettings = systemSettings;
        
        this.#systemAudioInterface = new ISystemAudio(this.iLoader);
        this.#systemServerConnection = systemSettings.network.enabled ? new INetwork(systemSettings) : null;
        this.#iRender = new IRender(this.systemSettings, this.iLoader, canvasContainer);
        this.#iExtension = new IExtension(this, this.#iRender);
        this.#registeredStagesReference = registeredStages;
        // broadcast render events
        this.#iRender.addEventListener(CONST.EVENTS.SYSTEM.RENDER.START, () => this.emit(CONST.EVENTS.SYSTEM.RENDER.START));
        this.#iRender.addEventListener(CONST.EVENTS.SYSTEM.RENDER.END, () => this.emit(CONST.EVENTS.SYSTEM.RENDER.END));
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
     * @type { INetwork | null }
     */
    get iNetwork () {
        return this.#systemServerConnection;
    }

    /**
     * @type { SystemSettings }
     */
    get systemSettings() {
        return this.#systemSettings;
    }

    /**
     * @type { ISystemAudio }
     */
    get audio() {
        return this.#systemAudioInterface;
    }

    /**
     * @type {AssetsManager}
     */
    get iLoader() {
        return this.#iLoader;
    }

    /**
     * @type {IRender}
     */
    get iRender() {
        return this.#iRender;
    }

    /**
     * @type {DrawObjectFactory}
     */
    get drawObjectFactory() {
        return this.#drawObjectFactory;
    }

    get iExtension() {
        return this.#iExtension;
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
    };

    /**
     * @method
     * @param {string} screenPageName
     * @param {Object} [options] - options
     */
    startGameStage = (screenPageName, options) => {
        if (this.#registeredStagesReference.has(screenPageName)) {
            const stage = this.#registeredStagesReference.get(screenPageName),
                pageData = stage.stageData;
            this.#drawObjectFactory._attachPageData(pageData);
            if (stage.isInitiated === false) {
                stage._init();
            }
            //stage._attachCanvasToContainer(this.#canvasContainer);
            stage._start(options);
            this.emit(CONST.EVENTS.SYSTEM.START_PAGE);
            this.#iRender._startRender(pageData);
        } else {
            Exception(ERROR_CODES.VIEW_NOT_EXIST, "View " + screenPageName + " is not registered!");
        }
    };

    /**
     * @method
     * @param {string} screenPageName
     */
    stopGameStage = (screenPageName) => {
        if (this.#registeredStagesReference.has(screenPageName)) {
            this.emit(CONST.EVENTS.SYSTEM.STOP_PAGE);
            this.drawObjectFactory._detachPageData();
            this.#iRender._stopRender();
            this.#registeredStagesReference.get(screenPageName)._stop();
        } else {
            Exception(ERROR_CODES.VIEW_NOT_EXIST, "View " + screenPageName + " is not registered!");
        }
    };
}