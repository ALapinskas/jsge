import { ERROR_MESSAGES } from "./const.js";

class BaseDrawDialog {   
    /**
     * @type {string}
     */
    #text;
    /**
     * @type {Map<string, BaseDrawDialog> | undefined}
     */
    #children = new Map();
    /**
     * @type {number}
     */
    #sortIndex = 0;
    constructor(dialogJson) {
        this.#text = dialogJson.text ? dialogJson.text : (typeof dialogJson === "string") ? dialogJson : undefined;
        if (this.#text === undefined) {
            throw(new Error(ERROR_MESSAGES.INCORRECT_FILE_STRUCTURE));
        }
        const opts = dialogJson.opts;
        if (opts) {
            for (const key in opts) {
                const nestedDialog = opts[key];
                this.#children.set(key, new BaseDrawDialog(nestedDialog));
            }
        }
    }

    get isChildren() {
        return this.#children.size > 0;
    }

    /**
     * @type {number}
     */
    get sortIndex () {
        return this.#sortIndex;
    }

    set sortIndex(value) {
        this.#sortIndex = value;
    }
}
class DrawDialogBlock extends BaseDrawDialog {
    constructor(dialogJson) {
        super(dialogJson);
    }
}

class DrawDialogBubble extends BaseDrawDialog {
    /**
     * @type {number}
     */
    #x;
    /**
     * @type {number}
     */
    #y;
    /**
     * @type {number}
     */
    #width;
    /**
     * @type {number}
     */
    #height;

    constructor(dialogJson) {
        super(dialogJson);
    }
    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }
}
export default class DialogModuleInit {
    constructor(systemInterface) {
        this.#registerDialogLoaders(systemInterface.loader);
        this.#registerDrawObjects(systemInterface);
        this.#extendRenderInterface(systemInterface);
    }

    #validateURL = (url) => {
        const split = url.split("."),
            ext = split[split.length - 1].trim();
        if (ext !== "json") {
            throw(new Error(ERROR_MESSAGES.INCORRECT_FILE_TYPE));
        } else {
            return url;
        }
    }

    #registerDialogLoaders(loader) {
        const dialogJsonLoader = (key, url) => fetch(this.#validateURL(url)).then(result => result.json());
        loader.registerLoader("DialogJson", dialogJsonLoader);
    }

    #registerDrawObjects(systemInterface) {
        const loader = systemInterface.loader;

        const dialogs = (key) => {
            const dialogsJson = loader.getDialogJson(key),
                dialogInstances = this.#createDialogInstances(dialogsJson)
            return dialogInstances;
        }
       
        systemInterface.extensionInterface.registerDrawObject("dialogs", dialogs);
    }

    #createDialogInstances = (dialogsJson) => {
        const dialogKeys = Object.keys(dialogsJson);
        let dialogsMap = new Map();

        for (let i = 0; i < dialogKeys.length; i++) {
            const key = dialogKeys[i],
                dialog = new DrawDialogBlock(dialogsJson[key]);
            dialogsMap.set(key, dialog);
        }

        return dialogsMap;
    }

    /**
     * 
     * @param {SystemInterface} systemInterface
     */
    #extendRenderInterface(systemInterface) {
        const renderInterface = systemInterface.renderInterface;

        const drawDialogObjectMethod = () => {
            return Promise.resolve();
        }
        
        systemInterface.extensionInterface.registerObjectRender("DrawDialogObject", drawDialogObjectMethod);
    }
}