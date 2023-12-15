import { SystemInterface } from "./SystemInterface.js";

/**
 * Class for creating modules
 * Accessed via SystemInterface.extensionInterface
 */
export class ExtensionInterface {
    /**
     * @type {SystemInterface}
     */
    #systemReference;
    /**
     * @hideconstructor
     */
    constructor(system) {
        this.#systemReference = system;
    }
    /**
     * Is used for registering new Object in DrawObjectFactory, \
     * registered method could be then called with this.draw[createInstanceKey]
     * @param {string} createInstanceKey - a key for calling method from DrawObjectFactory
     * @param {function} createInstanceMethod - method 
     */
    registerDrawObject(createInstanceKey, createInstanceMethod) {
        this.#systemReference.drawObjectFactory._addNewObject(createInstanceKey, createInstanceMethod);
    }

    /**
     * 
     * @param {string} programName
     * @param {string} vertexShader - raw vertex shader program
     * @param {string} fragmentShader - raw fragment shader program 
     * @param {Array<string>} uVars - program uniform variables names
     * @param {Array<string>} aVars - program attribute variables names
     * @returns {Promise<void>}
     */
    registerAndCompileWebGlProgram(programName, vertexShader, fragmentShader, uVars, aVars) {
        return this.#systemReference.renderInterface._registerAndCompileWebGlProgram(programName, vertexShader, fragmentShader, uVars, aVars);
    }

    /**
     * Inject method to render.init stage. Should be Promise based.
     * @param {function():Promise<void>} method 
     * @returns {void}
     */
    registerRenderInit(method) {
        this.#systemReference.renderInterface._registerRenderInit(method);
    }

    /**
     * Register render method for class.
     * @param {string} objectClassName - object name registered to DrawObjectFactory
     * @param {function(renderObject, gl, pageData, program, vars):Promise<any[]>} objectRenderMethod - should be promise based returns vertices number and draw program
     * @param {string=} objectWebGlDrawProgram 
     */
    registerObjectRender(objectClassName, objectRenderMethod, objectWebGlDrawProgram) {
        this.#systemReference.renderInterface._registerObjectRender(objectClassName, objectRenderMethod, objectWebGlDrawProgram);
    }
}