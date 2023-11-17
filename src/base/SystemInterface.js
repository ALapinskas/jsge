import { ERROR_CODES } from "../constants.js";
import { Exception, Warning } from "./Exception.js";
import { SystemSocketConnection } from "./SystemSocketConnection.js";
import { SystemAudioInterface } from "./SystemAudioInterface.js";
import { SystemSettings } from "../configs.js";
import AssetsManager from "../../node_modules/assetsm/dist/assetsm.min.js";
import { DrawObjectFactory } from "./DrawObjectFactory.js";

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
    #systemServerConnection;
    #systemAudioInterface;
    #loader = new AssetsManager();
    #drawObjectFactory = new DrawObjectFactory();
    /**
     * @hideconstructor
     */
    #modules = new Map();
    constructor(systemSettings, _startScreenPage, _stopScreenPage) {
        if (!systemSettings) {
            Exception(ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#systemSettings = systemSettings;
        this.#systemAudioInterface = new SystemAudioInterface(this.loader);
        this.#systemServerConnection = new SystemSocketConnection(systemSettings);
        this.startScreenPage = _startScreenPage;
        this.stopScreenPage = _stopScreenPage;
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

    get loader() {
        return this.#loader;
    }

    get drawObjectFactory() {
        return this.#drawObjectFactory;
    }

    get modules() {
        return this.#modules;
    }

    installModule = (moduleKey, moduleClass, ...args) => {
        const moduleInstance = new moduleClass(this, ...args);
        this.#modules.set(moduleKey, moduleInstance);
        return moduleInstance;
    }
    
    /**
     * 
     * @param {string} createInstanceKey 
     * @param {*} createInstanceMethod 
     */
    registerDrawObject(createInstanceKey, createInstanceMethod) {
        this.#drawObjectFactory[createInstanceKey] = createInstanceMethod;
    }
}