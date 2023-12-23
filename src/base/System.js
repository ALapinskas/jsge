import { ERROR_CODES } from "../constants.js";
import { Exception } from "./Exception.js";
import { GameStage } from "./GameStage.js";
import { ISystem } from "./ISystem.js";
import { SystemSettings } from "../configs.js";

import { LoadingStage } from "../design/LoadingStage.js";

const loadingPageName = "loadingPage";
/**
 * A main app class, <br>
 * Holder class for GameStage,<br>
 * can register new GameStages,<br>
 * init and preload data for them,<br>
 */
export class System {
    /**
     * @type {Map<string, GameStage>}
     */
    #registeredStages;
    /**
     * @type {ISystem}
     */
    #iSystem;
    /**
     * @param {SystemSettings} iSystemSettings - holds iSystem settings
     * @param {HTMLElement} [canvasContainer] - If it is not passed, iSystem will create div element and attach it to body
     */
    constructor(iSystemSettings, canvasContainer) {
        if (!iSystemSettings) {
            Exception(ERROR_CODES.CREATE_INSTANCE_ERROR, "iSystemSettings should be passed to class instance");
        }
        this.#registeredStages = new Map();

        if (!canvasContainer) {
            canvasContainer = document.createElement("div");
            document.body.appendChild(canvasContainer);
        }

        this.#iSystem = new ISystem(iSystemSettings, this.#registeredStages, canvasContainer);

        this.registerStage(loadingPageName, LoadingStage);

        this.#iSystem.iLoader.addEventListener("loadstart", this.#loadStart);
        this.#iSystem.iLoader.addEventListener("progress", this.#loadProgress);
        this.#iSystem.iLoader.addEventListener("load", this.#loadComplete);
    }

    /**
     * @type {ISystem}
     */
    get iSystem() {
        return this.#iSystem;
    }

    /**
     * A main factory method for create GameStage instances, <br>
     * register them in a System and call GameStage.register() stage
     * @param {string} screenPageName
     * @param {GameStage} stage
     */
    registerStage(screenPageName, stage) {
        if (screenPageName && typeof screenPageName === "string" && screenPageName.trim().length > 0) {
            const stageInstance = new stage();
            stageInstance._register(screenPageName, this.iSystem);
            this.#registeredStages.set(screenPageName, stageInstance);
        } else {
            Exception(ERROR_CODES.CREATE_INSTANCE_ERROR, "valid class name should be provided");
        }
    }

    /**
     * Preloads assets for all registered pages
     * @return {Promise<void>}
     */
    preloadAllData() {
        return this.#iSystem.iLoader.preload();
    }

    #loadStart = (event) => {
        this.#iSystem.startGameStage(loadingPageName, {total: event.total});
    };

    #loadProgress = (event) => {
        const uploaded = event.loaded,
            left = event.total,
            loadingPage = this.#registeredStages.get(loadingPageName);
            
        loadingPage._progress(uploaded, left);
    };

    #loadComplete = () => {
        this.#iSystem.stopGameStage(loadingPageName);
    };
}