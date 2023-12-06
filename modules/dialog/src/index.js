import { ERROR_MESSAGES } from "./const.js";

class DrawDialog {
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
    /**
     * @type {number}
     */
    #sortIndex = 0;
    constructor(x,y, width, height) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
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

    #validateFileStructure = (jsonStruct, root = false) => {
        if (typeof jsonStruct === "string" && root === false) {
            return;
        }
        if (jsonStruct.text || jsonStruct.opts || root === true) {
            const keys = Object.keys(jsonStruct);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const root = !!jsonStruct.opts;
                this.#validateFileStructure(jsonStruct[key], root);
            }
        } else {
            throw(new Error(ERROR_MESSAGES.INCORRECT_FILE_STRUCTURE));
        }
    }

    #registerDialogLoaders(loader) {
        const dialogJsonLoader = (key, url) => fetch(this.#validateURL(url)).then(result => {
            return result.json().then((jsonData) => {
                this.#validateFileStructure(jsonData, true);
                return jsonData;
            });
        });
        loader.registerLoader("DialogJson", dialogJsonLoader);
    }

    #registerDrawObjects(systemInterface) {
        const loader = systemInterface.loader;

        const dialog = (key) => {
            const dialogJson = loader.getDialogJson(key),
                dialogInstance = this.#createDialogInstance(dialogJson)
            return dialogInstance;
        }
       
        systemInterface.extensionInterface.registerDrawObject("dialog", dialog);
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