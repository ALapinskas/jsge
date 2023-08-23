import { ERROR_CODES } from "../constants.js";
import { Exception } from "./Exception.js";
import { ScreenPage } from "./ScreenPage.js";
import { SystemInterface } from "./SystemInterface.js";
import { SystemSettings } from "../configs.js";

import { LoadingScreen } from "../design/LoadingScreen.js";

const loadingPageName = "loadingPage";
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
        
        this.registerPage(loadingPageName, LoadingScreen);

        this.#system.loader.addEventListener("loadstart", this.#loadStart);
        this.#system.loader.addEventListener("progress", this.#loadProgress);
        this.#system.loader.addEventListener("load", this.#loadComplete);
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
     * @return {Promise<void>}
     */
    preloadAllData() {
        return this.#system.loader.preload();
    }

    #loadStart = (event) => {
        this.#system.startScreenPage(loadingPageName, {total: event.total});
    };

    #loadProgress = (event) => {
        const uploaded = event.loaded,
            left = event.total,
            loadingPage = this.#registeredPages.get(loadingPageName);
            
        loadingPage._progress(uploaded, left);
    };

    #loadComplete = () => {
        this.#system.stopScreenPage(loadingPageName);
    };
}