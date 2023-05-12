import { ERROR_CODES } from "../constants.js";
import { Exception } from "./Exception.js";
import { ScreenPage } from "./ScreenPage.js";
import { SystemInterface } from "./SystemInterface.js";
import { SystemSettings } from "../configs.js";
/**
 * Holder class for pages,
 * can register new pages
 * init and preload data for them
 */
export class System {
    #registeredPages;
    #system;
    /**
     * @param {SystemSettings} systemSettings 
     * @param {HTMLDivElement} [canvasContainer] - If it is not passed, system will create div element and attach it to body
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
     * Register page in a system and call init() stage
     * @param {String} screenPageName
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
     * 
     * @param {String} screenPageName
     * @return {Promise}
     */
    preloadPageData(screenPageName) {
        return this.#registeredPages.get(screenPageName)._loadPageAssets();
    }
}