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
     * 
     * @param {string} createInstanceKey 
     * @param {function} createInstanceMethod 
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
     * 
     * @param {function():Promise<void>} method 
     * @returns {void}
     */
    registerRenderInit(method) {
        this.#systemReference.renderInterface._registerRenderInit(method);
    }

    /**
     * 
     * @param {string} objectClassName - object name registered to DrawObjectFactory
     * @param {function(renderObject, gl, pageData, program, vars):Promise<any[]>} objectRenderMethod - should be promise based returns vertices number and draw program
     * @param {string=} objectWebGlDrawProgram 
     */
    registerObjectRender(objectClassName, objectRenderMethod, objectWebGlDrawProgram) {
        this.#systemReference.renderInterface._registerObjectRender(objectClassName, objectRenderMethod, objectWebGlDrawProgram);
    }
}