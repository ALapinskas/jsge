import { ERROR_CODES } from "../constants.js";
import { Exception } from "./Exception.js";
import { ScreenPage } from "./ScreenPage.js";
import { SystemInterface } from "./SystemInterface.js";
import { SystemSettings } from "../configs.js";
/**
 * A main app class, <br>
 * Holder class for ScreenPage,<br>
 * can register new ScreenPages,<br>
 * init and preload data for them,<br>
 */
export class System {
    #registeredPages;
    #system;
    /**
     * @param {SystemSettings} systemSettings - holds system settings
     * @param {HTMLElement} [canvasContainer] - If it is not passed, system will create div element and attach it to body
     */
    constructor(systemSettings, canvasContainer) {
        if (!systemSettings) {
            Exception(ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#registeredPages = new Map();

        if (!canvasContainer) {
            canvasContainer = document.createElement("div");
            document.body.appendChild(canvasContainer);
        }

        this.#system = new SystemInterface(systemSettings, canvasContainer, this.#registeredPages);
    }

    /**
     * @type {SystemInterface}
     */
    get system() {
        return this.#system;
    }

    /**
     * A main factory method for create ScreenPage instances, <br>
     * register them in a System and call ScreenPage.register() stage
     * @param {string} screenPageName
     * @param {ScreenPage} screen 
     */
    registerPage(screenPageName, screen) {
        if (screenPageName && typeof screenPageName === "string" && screenPageName.trim().length > 0) {
            const page = new screen();
            page._register(screenPageName, this.system);
            this.#registeredPages.set(screenPageName, page);
        } else {
            Exception(ERROR_CODES.CREATE_INSTANCE_ERROR, "valid class name should be provided");
        }
    }

    /**
     * Preloads assets for all registered pages
     * @return {Promise}
     */
    preloadAllData() {
        const promises = [];
        for (const key of this.#registeredPages.keys()) {
            promises.push(this.preloadPageData(key));
        }
        return Promise.all(promises);
    }

    /**
     * Preloads assets data for specific page
     * @param {string} screenPageName
     * @return {Promise}
     */
    preloadPageData(screenPageName) {
        return this.#registeredPages.get(screenPageName)._loadPageAssets();
    }
}