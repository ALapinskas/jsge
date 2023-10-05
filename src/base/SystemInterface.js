import { ERROR_CODES } from "../constants.js";
import { Exception } from "./Exception.js";
import { SystemSocketConnection } from "./SystemSocketConnection.js";
import { SystemAudioInterface } from "./SystemAudioInterface.js";
import { SystemSettings } from "../configs.js";
import AssetsManager from "../../node_modules/assetsm/dist/assetsm.min.js";
import { DrawImageObject } from "./DrawImageObject.js";
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
    #canvasContainer;
    #registeredPages;
    #systemServerConnection;
    #systemAudioInterface;
    #loader;
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
        this.#loader = new AssetsManager();
        this.#systemAudioInterface = new SystemAudioInterface(this.loader);
        this.#systemServerConnection = new SystemSocketConnection(systemSettings);

        for(const moduleKey in systemSettings.gameOptions.modules) {
            //console.log(moduleKey);
            const moduleOptions = systemSettings.gameOptions.modules[moduleKey],
                modulePath = moduleOptions.path;
                
            import(modulePath).then((moduleArgs) => {
                console.log("import module");
                //console.log(moduleArgs);
                
                //this.#modules.set(moduleKey, );
            });                
        }
        
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

    #registerSpineLoaders() {
        const spineTextLoader = (key, url) => fetch(url).then(result => result.text()),
            spineBinaryLoader = (key, url) => fetch(url).then(result => result.arrayBuffer()),
            spineAtlasLoader = (key, url) => fetch(url).then(result => result.text()).then(text => {
                const spineImage = text.split("\r\n")[0];
                this.loader.addImage(key, this.#systemSettings.gameOptions.modules.spineFolder + "/" + spineImage);
                return text;
            });

        this.loader.registerLoader("SpineText", spineTextLoader);
        this.loader.registerLoader("SpineBinary", spineBinaryLoader);
        this.loader.registerLoader("SpineAtlas", spineAtlasLoader);
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