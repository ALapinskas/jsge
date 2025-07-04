import { ERROR_CODES, CONST, DRAW_TYPE, WARNING_CODES } from "../../constants.js";
import { crossProduct } from "../../utils.js";
import { Exception, Warning } from "../Exception.js";
import { GameStageData } from "../GameStageData.js";
import { ImageTempStorage } from "../Temp/ImageTempStorage.js";

import { DrawTiledLayer } from "../2d/DrawTiledLayer.js";
import { DrawCircleObject } from "../2d/DrawCircleObject.js";
import { DrawConusObject } from "../2d/DrawConusObject.js";
import { DrawLineObject } from "../2d/DrawLineObject.js";
import { DrawPolygonObject } from "../2d/DrawPolygonObject.js";
import { DrawRectObject } from "../2d/DrawRectObject.js";
import { DrawTextObject } from "../2d/DrawTextObject.js";

import AssetsManager from "../../../modules/assetsm/src/AssetsManager.js";
import { utils } from "../../index.js";

export class WebGlEngine {
    /**
     * @type {WebGLRenderingContext}
     */
    #gl;
    /**
     * @type {number}
     */
    #MAX_TEXTURES;
    /**
     * @type {number}
     */
    #MAX_TEXTURE_SIZE;
    /**
     * @type {boolean}
     */
    #debug;
    /**
     * @type {Object}
     */
    #gameOptions;
    /**
     * @type {AssetsManager}
     */
    #loaderReference;
    /**
     * @type {WebGLBuffer | null}
     */
    #positionBuffer;
    /**
     * @type {WebGLBuffer | null}
     */
    #texCoordBuffer;
    /**
     * @type {Array<number> | null}
     */
    #currentVertices = null;
    /**
     * @type {Array<number> | null}
     */
    #currentTextures = null;
    /**
     * @type {Map<string, WebGLProgram>}
     */
    #registeredWebGlPrograms = new Map();
    /**
     * @type {Map<string, Object<string, WebGLUniformLocation | number>>}
     */
    #webGlProgramsVarsLocations = new Map();
    /**
     * @type {Map<string, {method: Function, webglProgramName: string}>}
     */
    #registeredRenderObjects = new Map();

    /**
     * @type {boolean}
     */
    #loopDebug;

    constructor(context, gameOptions, iLoader) {
        if (!context || !(context instanceof WebGLRenderingContext)) {
            Exception(ERROR_CODES.UNEXPECTED_INPUT_PARAMS, " context parameter should be specified and equal to WebGLRenderingContext");
        }
        
        this.#gl = context;
        this.#gameOptions = gameOptions;
        this.#loaderReference = iLoader;
        this.#debug = gameOptions.debug.checkWebGlErrors;
        this.#MAX_TEXTURES = context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS);
        this.#MAX_TEXTURE_SIZE = context.getParameter(context.MAX_TEXTURE_SIZE);
        this.#positionBuffer = context.createBuffer();
        this.#texCoordBuffer = context.createBuffer();

        this._registerObjectRender(DrawTextObject.name, this._bindText, CONST.WEBGL.DRAW_PROGRAMS.IMAGES_M);
        this._registerObjectRender(DrawRectObject.name, this._bindPrimitives, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES_M);
        this._registerObjectRender(DrawPolygonObject.name, this._bindPrimitives, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES_M);
        this._registerObjectRender(DrawCircleObject.name, this._bindConus, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(DrawConusObject.name, this._bindConus, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(DrawLineObject.name, this._bindLine, CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        this._registerObjectRender(DrawTiledLayer.name, this._bindTileImages, CONST.WEBGL.DRAW_PROGRAMS.IMAGES_M);
        this._registerObjectRender(DRAW_TYPE.IMAGE, this._bindImage, CONST.WEBGL.DRAW_PROGRAMS.IMAGES_M);
    }

    getProgram(name) {
        return this.#registeredWebGlPrograms.get(name);
    }

    getProgramVarLocations(name) {
        return this.#webGlProgramsVarsLocations.get(name);
    }

    _fixCanvasSize(width, height) {
        this.#gl.viewport(0, 0, width, height);
    }
    _initiateJsRender = (stageData) => {
        return new Promise((resolve, reject) => {
            const tileLayers = stageData.getObjectsByInstance(DrawTiledLayer),
                [ settingsWorldWidth, settingsWorldHeight ] = stageData.worldDimensions;

            // count max possible boundaries sizes
            let maxBSize = 0,
                maxESize = 0,
                maxPSize = 0,
                maxWorldW = 0,
                maxWorldH = 0;

            tileLayers.forEach(tiledLayer => {
                const setBoundaries = tiledLayer.setBoundaries,
                    layerData = tiledLayer.layerData,
                    tilemap = tiledLayer.tilemap,
                    tilesets = tiledLayer.tilesets,
                    { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                    tilewidth = dtwidth,
                    tileheight = dtheight;

                for (let i = 0; i < tilesets.length; i++) {
                    const layerCols = layerData.width,
                        layerRows = layerData.height,
                        worldW = tilewidth * layerCols,
                        worldH = tileheight * layerRows;
                        
                    const polygonBondMax = layerData.polygonBoundariesLen,
                        ellipseBondMax = layerData.ellipseBoundariesLen,
                        pointBondMax = layerData.pointBoundariesLen; 
    
                    if (maxWorldW < worldW) {
                        maxWorldW = worldW;
                    }
                    if (maxWorldH < worldH) {
                        maxWorldH = worldH;
                    }
                    
                    if (setBoundaries) {
                        maxBSize += polygonBondMax;
                        maxESize += ellipseBondMax;
                        maxPSize += pointBondMax;
    
                        // boundaries cleanups every draw cycles, we need to set world boundaries again
                        
                    }
                }
            });

            if (maxWorldW !== 0 && maxWorldH !== 0 && (maxWorldW !== settingsWorldWidth || maxWorldH !== settingsWorldHeight)) {
                Warning(WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                stageData._setWorldDimensions(maxWorldW, maxWorldH);
            }

            if (this.#gameOptions.render.boundaries.mapBoundariesEnabled) {
                maxBSize+=16; //4 sides * 4 cords x1,y1,x2,y,2
            }
            stageData._setMaxBoundariesSize(maxBSize, maxESize, maxPSize);
            stageData._initiateBoundariesData();

            resolve(true);
        });

    };
    _initWebGlAttributes = () => {
        const gl = this.#gl;
        gl.enable(gl.BLEND);
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
        //if stencil test and depth test pass we replace the initial value
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        return Promise.resolve();
    };

    /**
     * 
     * @returns {Promise<void>}
     */
    _initiateWasm = (stageData) => {
        const url = this.#gameOptions.optimization === CONST.OPTIMIZATION.WEB_ASSEMBLY.NATIVE_WAT ? this.#gameOptions.optimizationWASMUrl : this.#gameOptions.optimizationAssemblyUrl;
        return new Promise((resolve, reject) => {
            this.layerData = new WebAssembly.Memory({
                initial:1000 // 6.4MiB x 10 = 64MiB(~67,1Mb)
            });
            this.layerDataFloat32 = new Float32Array(this.layerData.buffer);
            const importObject = {
                env: {
                    memory: this.layerData,
                    logi: console.log,
                    logf: console.log
                }
            };

            fetch(url)
                .then((response) => response.arrayBuffer())
                .then((module) => WebAssembly.instantiate(module, importObject))
                .then((obj) => {
                    this.calculateBufferData = obj.instance.exports.calculateBufferData;
                    resolve();
                });
        });
    };

    _initDrawCallsDebug(debugObjReference) {
        this.#loopDebug = debugObjReference;
    }

    /**
     * 
     * @returns {void}
     */
    _clearView() {
        const gl = this.#gl;
        this.#loopDebug.cleanupDebugInfo();
        //cleanup buffer, is it required?
        //gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.clearColor(0, 0, 0, 0);// shouldn't be gl.clearColor(0, 0, 0, 1); ?
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    }
    
    /**
     * 
     * @returns {Promise<any>}
     */
    _render(verticesNumber, primitiveType, offset = 0) {
        this.#gl.drawArrays(primitiveType, offset, verticesNumber);
        // set blend to default
        return Promise.resolve(verticesNumber);
    }

    /**
     * 
     * @returns {Promise<void>}
     */
    _preRender() {
        return new Promise((resolve, reject) => {
            const gl = this.#gl;
            if (this.#debug) {
                const err = this.#debug ? gl.getError() : 0;
                if (err !== 0) {
                    console.error(err);
                    throw new Error("Error num: " + err);
                }
            } else {
                resolve();
            }
        });
    }

    /**
     * 
     * @returns {Promise<void>}
     */
    _postRender(inputData) {
        let verticesNumber = inputData;

        // A workaround for backward capability in 1.5.n
        if (Array.isArray(verticesNumber)) {
            const [vertices, primitiveType] = inputData;
            
            this.#gl.drawArrays(primitiveType, 0, vertices);
            verticesNumber = vertices;
        }

        return new Promise((resolve, reject) => {
            const gl = this.#gl;

            if (verticesNumber !== 0) {
                this.#loopDebug.incrementDrawCallsCounter();
                this.#loopDebug.verticesDraw = verticesNumber;
            }

            gl.stencilFunc(gl.ALWAYS, 1, 0xFF);

            if (this.#gameOptions.debug.delayBetweenObjectRender) {
                setTimeout(() => {
                    resolve();
                }, 1000);
            } else {
                resolve();
            }
        });
    }

    /*************************************
     * Register and compile programs
     ************************************/

    /**
     * 
     * @param {string} programName
     * @param {string} vertexShader - raw vertex shader program
     * @param {string} fragmentShader - raw fragment shader program 
     * @param {Array<string>} uVars - program uniform variables names
     * @param {Array<string>} aVars - program attribute variables names
     * @returns {Promise<void>}
     */
    _registerAndCompileWebGlProgram(programName, vertexShader, fragmentShader, uVars, aVars) {
        const program = this.#compileWebGlProgram(vertexShader, fragmentShader),
            varsLocations = this.#getProgramVarsLocations(program, uVars, aVars);
        this.#registeredWebGlPrograms.set(programName, program);
        this.#webGlProgramsVarsLocations.set(programName, varsLocations);

        return Promise.resolve();
    }

    /**
     * @returns {WebGLProgram}
     */
    #compileWebGlProgram (vertexShader, fragmentShader) {
        const gl = this.#gl,
            program = gl.createProgram();

        if (program) {
            const compVertexShader = this.#compileShader(gl, vertexShader, gl.VERTEX_SHADER);
            if (compVertexShader) {
                gl.attachShader(program, compVertexShader);
            } else {
                Exception(ERROR_CODES.WEBGL_ERROR, "#compileShader(vertexShaderSource) is null");
            }

            const compFragmentShader = this.#compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
            if (compFragmentShader) {
                gl.attachShader(program, compFragmentShader);
            } else {
                Exception(ERROR_CODES.WEBGL_ERROR, "#compileShader(fragmentShaderSource) is null");
            }

            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                const info = gl.getProgramInfoLog(program);
                Exception(ERROR_CODES.WEBGL_ERROR, `Could not compile WebGL program. \n\n${info}`);
            }
        } else {
            Exception(ERROR_CODES.WEBGL_ERROR, "gl.createProgram() is null");
        }
        return program;
    }

    /**
     * 
     * @param {WebGLProgram} program
     * @param {Array<string>} uVars - uniform variables
     * @param {Array<string>} aVars - attributes variables
     * @returns {Object<string, WebGLUniformLocation | number>} - uniform or attribute
     */
    #getProgramVarsLocations(program, uVars, aVars) {
        const gl = this.#gl;
        let locations = {};
        uVars.forEach(elementName => {
            locations[elementName] = gl.getUniformLocation(program, elementName);
        });
        aVars.forEach(elementName => {
            locations[elementName] = gl.getAttribLocation(program, elementName);
        });
        return locations;
    }

    #compileShader(gl, shaderSource, shaderType) {
        const shader = gl.createShader(shaderType);
        if (shader) {
            gl.shaderSource(shader, shaderSource);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                const info = gl.getShaderInfoLog(shader);
                Exception(ERROR_CODES.WEBGL_ERROR, "Couldn't compile webGl program. \n\n" + info);
            }
        } else {
            Exception(ERROR_CODES.WEBGL_ERROR, `gl.createShader(${shaderType}) is null`);
        }
        return shader;
    }
    /*------------------------------------
     * End of Register and compile programs
     -------------------------------------*/

    /**********************************
     * Predefined Drawing programs
     **********************************/
    _bindPrimitives = (renderObject, gl, pageData, program, vars) => {
        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset,
            scale = [1, 1],
            blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA],
            { 
                u_resolution: resolutionUniformLocation,
                u_color: colorUniformLocation,
                a_position: positionAttributeLocation,
                u_fade_min: fadeMinLocation
            } = vars;
            
        let vertices = [];

        switch (renderObject.type) {
            case DRAW_TYPE.RECTANGLE:
                const x1 = 0,
                    x2 = 0 + renderObject.width,
                    y1 = 0,
                    y2 = 0 + renderObject.height;
                vertices = [
                    x1, y1,
                    x2, y1,
                    x1, y2,
                    x1, y2,
                    x2, y1,
                    x2, y2];
                break;
            case DRAW_TYPE.CIRCLE:
                const coords = renderObject.vertices;
                vertices = coords;
                break;
            case DRAW_TYPE.POLYGON:
                const triangles = this.#triangulatePolygon(renderObject.vertices);
                const len = triangles.length;
                vertices = triangles;
                if (len % 3 !== 0) {
                    Warning(WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, `polygons ${renderObject.id}, vertices are not correct, skip drawing`);
                    return Promise.reject();
                }
                break;
        }
        
        const c = Math.cos(renderObject.rotation),
              s = Math.sin(renderObject.rotation),
              translationMatrix = [
                  1, 0, x,
                  0, 1, y,
                  0, 0, 1],
              rotationMatrix = [
                  c, -s, 0,
                  s, c, 0,
                  0, 0, 1
              ],
              scaleMatrix = [
                  scale[0], 0, 0,
                  0, scale[1], 0,
                  0, 0, 1
              ];
        const matMultiply = utils.mat3Multiply(utils.mat3Multiply(translationMatrix, rotationMatrix), scaleMatrix);

        
        const verticesMat = utils.mat3MultiplyPosCoords(matMultiply, vertices);
        
        const nextObject = this.getNextRenderObject(renderObject, pageData);
        // 2. Is it have same texture and draw program?
        if (nextObject && this._canPrimitivesObjectsMerge(renderObject, nextObject)) {
            //
            if (this.#currentVertices === null) {
                this.#currentVertices = verticesMat;
                return Promise.resolve(0);
            } else {
                this.#currentVertices.push(...verticesMat);
                return Promise.resolve(0);
            }
        } else {
            gl.useProgram(program);
            // set the resolution
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            
            gl.uniform1f(fadeMinLocation, 0);
            if (this.#currentVertices === null) {
                this.#currentVertices = verticesMat;
            } else {
                this.#currentVertices.push(...verticesMat);
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

            gl.bufferData(gl.ARRAY_BUFFER, 
                        new Float32Array(this.#currentVertices), gl.STATIC_DRAW);

            //Tell the attribute how to get data out of positionBuffer
            const size = 2,
                type = gl.FLOAT, // data is 32bit floats
                normalize = false,
                stride = 0, // move forward size * sizeof(type) each iteration to get next position
                offset = 0; // start of beginning of the buffer
            gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

            const colorArray = this.#rgbaToArray(renderObject.bgColor);
            gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
            
            if (blend) {
                gl.blendFunc(blend[0], blend[1]);
            }
            
            if (renderObject.isMaskAttached) {
                gl.stencilFunc(gl.EQUAL, renderObject._maskId, 0xFF);
            } else if (renderObject._isMask) {
                gl.stencilFunc(gl.ALWAYS, renderObject.id, 0xFF);
            }
            const verticesNumber = this.#currentVertices.length / 2;
            this.#currentVertices = null;
            return this._render(verticesNumber, gl.TRIANGLES);
        }
    };

    _bindConus = (renderObject, gl, pageData, program, vars) => {
        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset,
            scale = [1, 1],
            rotation = renderObject.rotation,
            { 
                u_translation: translationLocation,
                u_rotation: rotationRotation,
                u_scale: scaleLocation,
                u_resolution: resolutionUniformLocation,
                u_color: colorUniformLocation,
                a_position: positionAttributeLocation,
                u_fade_max: fadeMaxLocation,
                u_fade_min: fadeMinLocation
            } = vars,
            coords = renderObject.vertices,
            fillStyle = renderObject.bgColor,
            fade_min = renderObject.fade_min,
            fadeLen = renderObject.radius,
            blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
        let verticesNumber = 0;

        gl.useProgram(program);
        
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, x, y);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, fade_min);
        gl.uniform1f(fadeMaxLocation, fadeLen);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, 
            new Float32Array(coords), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionAttributeLocation);
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        verticesNumber += coords.length / 2;

        if (blend) {
            gl.blendFunc(blend[0], blend[1]);
        }

        const colorArray = this.#rgbaToArray(fillStyle);

        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        if (renderObject.isMaskAttached) {
            gl.stencilFunc(gl.EQUAL, renderObject._maskId, 0xFF);
        } else if (renderObject._isMask) {
            gl.stencilFunc(gl.ALWAYS, renderObject.id, 0xFF);
        }
        
        return this._render(verticesNumber, gl.TRIANGLE_FAN);
    };

    _bindText = (renderObject, gl, pageData, program, vars) => {
        const { u_translation: translationLocation,
            u_rotation: rotationRotation,
            u_scale: scaleLocation,
            u_resolution: resolutionUniformLocation,
            a_position: positionAttributeLocation,
            a_texCoord: texCoordLocation,
            u_image: u_imageLocation } = vars;

        const {width:boxWidth, height:boxHeight} = renderObject.boundariesBox,
            image_name = renderObject.text,
            [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset - boxHeight,
            blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];

        const rotation = renderObject.rotation || 0,
            scale = [1, 1];
        const vecX1 = x,
            vecY1 = y,
            vecX2 = vecX1 + boxWidth,
            vecY2 = vecY1 + boxHeight;

        const verticesBufferData = [
            vecX1, vecY1,
            vecX2, vecY1,
            vecX1, vecY2,
            vecX1, vecY2,
            vecX2, vecY1,
            vecX2, vecY2
        ],
        texturesBufferData = [
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1
        ];
        let verticesNumber = 0;

        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, x, y);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesBufferData), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        //textures buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturesBufferData), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        
        verticesNumber += 6;
        // remove box
        // fix text edges
        gl.blendFunc(blend[0], blend[1]);
        //
        //var currentTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
        
        let textureStorage = renderObject._textureStorage;
        if (!textureStorage) {
            //const activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
            textureStorage = new ImageTempStorage(gl.createTexture());
            renderObject._textureStorage = textureStorage;
        }
        if (textureStorage._isTextureRecalculated === true) {
            this.#updateTextWebGlTexture(gl, textureStorage._texture, renderObject._textureCanvas);
            textureStorage._isTextureRecalculated = false;
        } else {
            this.#bindTexture(gl, textureStorage._texture);
        }
        gl.uniform1i(u_imageLocation, textureStorage._textureIndex);
        gl.depthMask(false);
        return this._render(verticesNumber, gl.TRIANGLES);
        
    };

    _bindImage = (renderObject, gl, pageData, program, vars) => {
        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset;

        if (renderObject.vertices && this.#gameOptions.debug.boundaries.drawObjectBoundaries) {
            pageData._enableDebugObjectBoundaries();
            pageData._addImageDebugBoundaries(utils.calculateLinesVertices(x, y, renderObject.rotation, renderObject.vertices));
        }
        
        const {
            u_resolution: resolutionUniformLocation,
            a_position: positionAttributeLocation,
            a_texCoord: texCoordLocation,
            u_image: u_imageLocation } = vars;

        if (!renderObject.image) {
            const image = this.#loaderReference.getImage(renderObject.key);
            if (!image) {
                Exception(ERROR_CODES.CANT_GET_THE_IMAGE, "iLoader can't get the image with key: " + renderObject.key);
            } else {
                renderObject.image = image;
            }
        }
        const atlasImage = renderObject.image,
              animationIndex = renderObject.imageIndex,
              shapeMaskId = renderObject._maskId,
              spacing = renderObject.spacing,
              margin = renderObject.margin,
              blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.ONE, gl.ONE_MINUS_SRC_ALPHA],
              scale = [1, 1];
        
        let imageX = margin,
            imageY = margin,
            colNum = 0,
            rowNum = 0;

        if (animationIndex !== 0) {
            const imageColsNumber = (atlasImage.width + spacing - (2*margin)) / (renderObject.width + spacing);
            colNum = animationIndex % imageColsNumber;
            rowNum = Math.floor(animationIndex / imageColsNumber);
            imageX = colNum * renderObject.width + (colNum * spacing) + margin,
            imageY = rowNum * renderObject.height + (rowNum * spacing) + margin;
        }

        // transform, scale and rotate should be done in js side
        //gl.uniform2f(translationLocation, x, y);
        //gl.uniform2f(scaleLocation, scale[0], scale[1]);
        //gl.uniform1f(rotationRotation, renderObject.rotation);
        // multiple matrices:
        const c = Math.cos(renderObject.rotation),
              s = Math.sin(renderObject.rotation),
              translationMatrix = [
                  1, 0, x,
                  0, 1, y,
                  0, 0, 1],
              rotationMatrix = [
                  c, -s, 0,
                  s, c, 0,
                  0, 0, 1
              ],
              scaleMatrix = [
                  scale[0], 0, 0,
                  0, scale[1], 0,
                  0, 0, 1
              ];
        const matMultiply = utils.mat3Multiply(utils.mat3Multiply(translationMatrix, rotationMatrix), scaleMatrix);

        const posX = 0 - renderObject.width / 2,
              posY = 0 - renderObject.height / 2;

        const vecX1 = posX,
              vecY1 = posY,
              vecX2 = vecX1 + renderObject.width,
              vecY2 = vecY1 + renderObject.height,
              texX1 = 1 / atlasImage.width * imageX,
              texY1 = 1 / atlasImage.height * imageY,
              texX2 = texX1 + (1 / atlasImage.width * renderObject.width),
              texY2 = texY1 + (1 / atlasImage.height * renderObject.height);
        //console.log("mat1: ", matMult1);
        //console.log("mat2: ", matMult2);
        //console.log("x1y1: ", x1y1);
        const verticesD =  [
            vecX1, vecY1,
            vecX2, vecY1,
            vecX1, vecY2,
            vecX1, vecY2,
            vecX2, vecY1,
            vecX2, vecY2
        ];
        const verticesMat = utils.mat3MultiplyPosCoords(matMultiply, verticesD),
        textures = [
            texX1, texY1,
            texX2, texY1,
            texX1, texY2,
            texX1, texY2,
            texX2, texY1,
            texX2, texY2
        ];
        
        //vec2 position = (u_transformMat * vec3(a_position, 1)).xy;
        //console.log("translation x: ", x, " y: ", y);
        //console.log("scale x: ", scale[0], " y: ", scale[1]);
        //console.log("rotation: ", renderObject.rotation);
        // Determine could we merge next drawObject or not
        // 1. Find next object
        const nextObject = this.getNextRenderObject(renderObject, pageData);
        // 2. Is it have same texture and draw program?
        if (nextObject && this._canImageObjectsMerge(renderObject, nextObject)) {
            //
            if (this.#currentVertices === null) {
                this.#currentVertices = verticesMat;
                this.#currentTextures = textures;
                return Promise.resolve(0);
            } else {
                this.#currentVertices.push(...verticesMat);
                this.#currentTextures.push(...textures);
                return Promise.resolve(0);
            }
        } else {
            
            gl.useProgram(program);
            // set the resolution
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            // bind data and call draw
            if (this.#currentVertices === null) {
                this.#currentVertices = verticesMat;
                this.#currentTextures = textures;
            } else {
                this.#currentVertices.push(...verticesMat);
                this.#currentTextures.push(...textures);
            }
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#currentVertices), gl.STATIC_DRAW);

            const verticesNumber = this.#currentVertices.length / 2;
            gl.enableVertexAttribArray(positionAttributeLocation);
            //Tell the attribute how to get data out of positionBuffer
            const size = 2,
                type = gl.FLOAT, // data is 32bit floats
                normalize = false,
                stride = 0, // move forward size * sizeof(type) each iteration to get next position
                offset = 0; // start of beginning of the buffer
            gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

            //textures buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#currentTextures), gl.STATIC_DRAW);

            gl.enableVertexAttribArray(texCoordLocation);
            gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

            let textureStorage = renderObject._textureStorage;
            if (!textureStorage) {
                textureStorage = new ImageTempStorage(gl.createTexture());
                renderObject._textureStorage = textureStorage;
            } 
            if (textureStorage._isTextureRecalculated === true) {
                this.#updateWebGlTexture(gl, textureStorage._texture, renderObject.image);
                textureStorage._isTextureRecalculated = false;
            } else {
                this.#bindTexture(gl, textureStorage._texture);
            }    

            gl.uniform1i(u_imageLocation, textureStorage._textureIndex);
            // make image transparent parts transparent
            gl.blendFunc(blend[0], blend[1]);
            if (shapeMaskId) {
                gl.stencilFunc(gl.EQUAL, shapeMaskId, 0xFF);
                //gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
            }
            this.#currentVertices = null;
            this.#currentTextures = null;
            return this._render(verticesNumber, gl.TRIANGLES);
        }
    };

    /**
     * 
     * @param {*} obj1 
     * @param {*} obj2
     * @returns {boolean} 
     */
    _canImageObjectsMerge = (obj1, obj2) => {
        const registeredO1 = this.#registeredRenderObjects.get(obj1.constructor.name) || this.#registeredRenderObjects.get(obj1.type),
            registeredO2 = this.#registeredRenderObjects.get(obj2.constructor.name) || this.#registeredRenderObjects.get(obj2.type);
        if ((registeredO1.webglProgramName === registeredO2.webglProgramName)
            && (obj1.type === obj2.type)
            && (obj1.image === obj2.image)
            && (obj2.isRemoved === false)) {
                return true;
        } else {
            return false;
        }
    }

    _canPrimitivesObjectsMerge = (obj1, obj2) => {
        const registeredO1 = this.#registeredRenderObjects.get(obj1.constructor.name) || this.#registeredRenderObjects.get(obj1.type),
            registeredO2 = this.#registeredRenderObjects.get(obj2.constructor.name) || this.#registeredRenderObjects.get(obj2.type);

        if ((registeredO1.webglProgramName === registeredO2.webglProgramName)
            // colors match
            && (obj1.bgColor === obj2.bgColor)
            && (obj2.isRemoved === false)) {
                return true;
        } else {
            return false;
        }
    }

    /**
     * 
     * @param {*} obj1 
     * @param {*} obj2 
     * @returns {boolean}
     */
    _canMergeNextTileObject = (obj1, obj2) => {
        if ((obj2 instanceof DrawTiledLayer) 
            && (obj1.tilesetImages.length === 1) 
            && (obj2.tilesetImages.length === 1) 
            && (obj1.tilesetImages[0] === obj2.tilesetImages[0])
            && (obj2.isRemoved === false)) {
                return true;
        } else {
            return false;
        }
    }

    _canTextBeMerged = (obj1, obj2) => {
        const registeredO1 = this.#registeredRenderObjects.get(obj1.constructor.name) || this.#registeredRenderObjects.get(obj1.type),
            registeredO2 = this.#registeredRenderObjects.get(obj2.constructor.name) || this.#registeredRenderObjects.get(obj2.type);
        if ((registeredO1.webglProgramName === registeredO2.webglProgramName) 
            && (obj1.type === obj2.type)
            && (obj2.isRemoved === false)) {
                return true;
        } else {
            return false;
        }
    }
    _bindTileImages = async(renderLayer, gl, pageData, program, vars) => {
        const { u_translation: translationLocation,
            u_rotation: rotationRotation,
            u_scale: scaleLocation,
            u_resolution: resolutionUniformLocation,
            a_position: positionAttributeLocation,
            a_texCoord: texCoordLocation,
            u_image: u_imageLocation } = vars;

        gl.useProgram(program);
        /**
         * @type {Array<any> | null}
         */
        let renderLayerData = null;
        switch (this.#gameOptions.optimization) {
            case CONST.OPTIMIZATION.NATIVE_JS.NOT_OPTIMIZED:
                renderLayerData = await this.#prepareRenderLayerOld(renderLayer, pageData);
                break;
            case CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT:
            case CONST.OPTIMIZATION.WEB_ASSEMBLY.NATIVE_WAT:
                renderLayerData = await this.#prepareRenderLayerWM(renderLayer, pageData);
                break;
            case CONST.OPTIMIZATION.NATIVE_JS.OPTIMIZED:
            default:
                renderLayerData = await this.#prepareRenderLayer(renderLayer, pageData);
        }
        
        const translation = [0, 0],
              scale = [1, 1],
              rotation = renderLayer.rotation || 0,
              drawMask = ["ONE", "ONE_MINUS_SRC_ALPHA"],
              shapeMaskId = renderLayer._maskId;

        /*
        const c = Math.cos(renderLayer.rotation || 0),
              s = Math.sin(renderLayer.rotation || 0),
              translationMatrix = [
                  1, 0, translation[0],
                  0, 1, translation[1],
                  0, 0, 1],
              rotationMatrix = [
                  c, -s, 0,
                  s, c, 0,
                  0, 0, 1
              ],
              scaleMatrix = [
                  scale[0], 0, 0,
                  0, scale[1], 0,
                  0, 0, 1
              ];
        const matMultiply = utils.mat3Multiply(utils.mat3Multiply(translationMatrix, rotationMatrix), scaleMatrix);
        for (let i = 0; i < renderLayerData.length; i++) {
            renderLayerData[i][0] = utils.mat3MultiplyPosCoords(matMultiply, renderLayerData[i][0]);
        }*/
        //console.log("mat1: ", matMult1);
        //console.log("mat2: ", matMult2);
        /*
        const x1y1 = utils.mat3MultiplyVector(matMultiply, [vecX1, vecY1, 1]),
              x2y1 = utils.mat3MultiplyVector(matMultiply, [vecX2, vecY1, 1]),
              x1y2 = utils.mat3MultiplyVector(matMultiply, [vecX1, vecY2, 1]),
              x2y2 = utils.mat3MultiplyVector(matMultiply, [vecX2, vecY2, 1]);
        */
        const nextObject = this.getNextRenderObject(renderLayer, pageData);
              
        if (this._canMergeNextTileObject(renderLayer, nextObject)) {
            if (this.#currentVertices === null) {
                this.#currentVertices = renderLayerData[0][0];
                this.#currentTextures = renderLayerData[0][1];
                return Promise.resolve(0);
            } else {
                this.#currentVertices.push(...renderLayerData[0][0]);
                this.#currentTextures.push(...renderLayerData[0][1]);
                return Promise.resolve(0);
            }
        } else {
            let verticesNumber = 0,
                isTextureBind = false,
                renderLayerDataLen = renderLayerData.length;
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.enableVertexAttribArray(texCoordLocation);

            // set the resolution
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            //gl.uniform2f(translationLocation,translation[0], translation[1]);
            //gl.uniform2f(scaleLocation, scale[0], scale[1]);
            //gl.uniform1f(rotationRotation, rotation);

            // MULTIPLE_IMAGE_TILESET drawing, no merging possible
            if (renderLayerDataLen > 1) {
                for (let i = 0; i < renderLayerDataLen; i++) {
                    const data = renderLayerData[i],
                        vectors = data[0],
                        textures = data[1],
                        image_name = data[2],
                        image = data[3];
                    // if layer use multiple tilesets
                    // the issue is: when we add some layer data to the temp arrays, and then
                    // process empty layer, it actually skips the draw with this check
                    if (vectors.length > 0 && textures.length > 0) {
                        // need to have additional draw call for each new texture added
                        // probably it could be combined in one draw call if multiple textures 
                        // could be used in one draw call
                        if (isTextureBind) {
                            await this._render(verticesNumber, gl.TRIANGLES);
                        }
                        
                        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vectors), gl.STATIC_DRAW);
    
                        //Tell the attribute how to get data out of positionBuffer
                        const size = 2,
                            type = gl.FLOAT, // data is 32bit floats
                            normalize = false,
                            stride = 0, // move forward size * sizeof(type) each iteration to get next position
                            offset = 0;  // verticesNumber * 4; // start of beginning of the buffer
                        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    
                        //textures buffer
                        gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);
    
                        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, offset);
    
                        let textureStorage = renderLayer._textureStorages[i];
                        
                        if (!textureStorage) {
                            textureStorage = new ImageTempStorage(gl.createTexture(), i);
                            renderLayer._setTextureStorage(i, textureStorage);
                        }
                        if (textureStorage._isTextureRecalculated === true) {
                            this.#updateWebGlTexture(gl, textureStorage._texture, image, textureStorage._textureIndex);
                            textureStorage._isTextureRecalculated = false;
                        } else {
                            //console.log("bind texture");
                            this.#bindTexture(gl, textureStorage._texture, textureStorage._textureIndex);
                        }
                        gl.uniform1i(u_imageLocation, textureStorage._textureIndex);
                        gl.blendFunc(gl[drawMask[0]], gl[drawMask[1]]);
                        
                        verticesNumber = vectors.length / 2;
                        if (shapeMaskId) {
                            gl.stencilFunc(gl.EQUAL, shapeMaskId, 0xFF);
                        }
                        isTextureBind = true;
                    }
                }
            // Single image tileset draw, with merging
            } else {
                const data = renderLayerData[0],
                    vectors = data[0],
                    textures = data[1],
                    image_name = data[2],
                    image = data[3];
                // if layer use multiple tilesets
                // the issue is: when we add some layer data to the temp arrays, and then
                // process empty layer, it actually skips the draw with this check
                if (this.#currentVertices === null) {
                    this.#currentVertices = vectors;
                    this.#currentTextures = textures;
                } else {
                    this.#currentVertices.push(...vectors);
                    this.#currentTextures.push(...textures);
                }
                
                gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#currentVertices), gl.STATIC_DRAW);

                //Tell the attribute how to get data out of positionBuffer
                const size = 2,
                    type = gl.FLOAT, // data is 32bit floats
                    normalize = false,
                    stride = 0, // move forward size * sizeof(type) each iteration to get next position
                    offset = 0;  // verticesNumber * 4; // start of beginning of the buffer
                gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

                //textures buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#currentTextures), gl.STATIC_DRAW);

                gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, offset);

                let textureStorage = renderLayer._textureStorages[0];
                
                if (!textureStorage) {
                    textureStorage = new ImageTempStorage(gl.createTexture(), 0);
                    renderLayer._setTextureStorage(0, textureStorage);
                }
                if (textureStorage._isTextureRecalculated === true) {
                    this.#updateWebGlTexture(gl, textureStorage._texture, image, textureStorage._textureIndex);
                    textureStorage._isTextureRecalculated = false;
                } else {
                    //console.log("bind texture");
                    this.#bindTexture(gl, textureStorage._texture, textureStorage._textureIndex);
                }
                gl.uniform1i(u_imageLocation, textureStorage._textureIndex);
                gl.blendFunc(gl[drawMask[0]], gl[drawMask[1]]);
                
                verticesNumber = this.#currentVertices.length / 2;
                if (shapeMaskId) {
                    gl.stencilFunc(gl.EQUAL, shapeMaskId, 0xFF);
                }
                this.#currentVertices = null;
                this.#currentTextures = null;
            }
            
            renderLayerData = null;
            return this._render(verticesNumber, gl.TRIANGLES);
        }
    };

    _drawPolygon(renderObject, pageData) {
        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset,
            rotation = renderObject.rotation || 0,
            vertices = renderObject.vertices,
            color =  this.#gameOptions.debug.boundaries.boundariesColor;
        const program = this.getProgram(CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        const { u_translation: translationLocation,
                u_rotation: rotationRotation,
                u_scale: scaleLocation,
                u_resolution: resolutionUniformLocation,
                u_color: colorUniformLocation,
                a_position: positionAttributeLocation,
                u_fade_max: fadeMaxLocation,
                u_fade_min: fadeMinLocation
            } = this.getProgramVarLocations(CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES),
            gl = this.#gl;

        let verticesNumber = 0;
        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, x, y);
        gl.uniform2f(scaleLocation, 1, 1);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, 0);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        const triangles = this.#triangulatePolygon(vertices);

        const polygonVerticesNum = triangles.length;
        if (polygonVerticesNum % 3 !== 0) {
            Warning(WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, "polygon boundaries vertices are not correct, skip drawing");
            return;
        }
        this.#bindPolygon(triangles);
        verticesNumber += polygonVerticesNum / 2;
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const colorArray = this.#rgbaToArray(color);
        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);

        this._render(verticesNumber, gl.TRIANGLES);
    }

    _bindLine = (renderObject, gl, pageData, program, vars) => {
        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset,
            scale = [1, 1],
            rotation = renderObject.rotation,
            { 
                u_translation: translationLocation,
                u_rotation: rotationRotation,
                u_scale: scaleLocation,
                u_resolution: resolutionUniformLocation,
                u_color: colorUniformLocation,
                a_position: positionAttributeLocation,
                u_fade_max: fadeMaxLocation,
                u_fade_min: fadeMinLocation
            } = vars,
            coords = renderObject.vertices,
            fillStyle = renderObject.bgColor,
            fade_min = renderObject.fade_min,
            fadeLen = renderObject.radius,
            lineWidth = this.#gameOptions.debug.boundaries.boundariesWidth;
        let verticesNumber = 0;

        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, x, y);
        gl.uniform2f(scaleLocation, 1, 1);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, 0);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER, 
            new Float32Array(coords),
            gl.STATIC_DRAW);

        verticesNumber += coords.length / 2;
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const colorArray = this.#rgbaToArray(fillStyle);
        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        gl.lineWidth(lineWidth);

        return this._render(0, gl.LINES);
    };
    
    _drawLines(linesArray, color, lineWidth = 1, rotation = 0, translation = [0, 0]) {
        const program = this.getProgram(CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES);
        const { u_translation: translationLocation,
                u_rotation: rotationRotation,
                u_scale: scaleLocation,
                u_resolution: resolutionUniformLocation,
                u_color: colorUniformLocation,
                a_position: positionAttributeLocation,
                u_fade_max: fadeMaxLocation,
                u_fade_min: fadeMinLocation
            } = this.getProgramVarLocations(CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES),
            gl = this.#gl;

        let verticesNumber = 0;
        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, 1, 1);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, 0);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER, 
            (linesArray instanceof Float32Array ? linesArray : new Float32Array(linesArray)),
            gl.STATIC_DRAW);

        verticesNumber += linesArray.length / 2;
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const colorArray = this.#rgbaToArray(color);
        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        gl.lineWidth(lineWidth);
        
        this._render(verticesNumber, gl.LINES);
    }

    /**
     * @ignore
     * @param {string} objectType - object name registered to DrawObjectFactory | object type registered to DrawObjectFactory
     * @param {function(renderObject, gl, pageData, program, vars):Promise<any>} objectRenderMethod - should be promise based returns vertices number and draw program
     * @param {string=} objectWebGlDrawProgram 
     */
    _registerObjectRender(objectType, objectRenderMethod, objectWebGlDrawProgram) {
        this.#registeredRenderObjects.set(objectType, {method: objectRenderMethod, webglProgramName: objectWebGlDrawProgram});
    }

    _drawRenderObject(renderObject, pageData) {
        const name = renderObject.constructor.name,
            registeredRenderObject = this.#registeredRenderObjects.get(name) || this.#registeredRenderObjects.get(renderObject.type);
        if (registeredRenderObject) {
            const name = registeredRenderObject.webglProgramName,
                program = name ? this.getProgram(name) : null,
                vars = name ? this.getProgramVarLocations(name) : null;

            return registeredRenderObject.method(renderObject, this.#gl, pageData, program, vars);
        } else {
            console.warn("no registered draw object method for " + name + " skip draw");
            return Promise.resolve();
        }
    }
    /**
     * 
     * @param {DrawTiledLayer} renderLayer 
     * @param {GameStageData} pageData
     * @returns {Promise<Array<Array>>}
     */
    #prepareRenderLayer(renderLayer, pageData) {
        const INDEX_TOP_LINE = 0,
            INDEX_RIGHT_LINE = 1,
            INDEX_BOTTOM_LINE = 2,
            INDEX_LEFT_LINE = 3;

        const INDEX_X1 = 0,
            INDEX_Y1 = 1,
            INDEX_X2 = 2,
            INDEX_Y2 = 3;
        return new Promise((resolve, reject) => {
            const tilemap = renderLayer.tilemap,
                tilesets = renderLayer.tilesets,
                tilesetImages = renderLayer.tilesetImages,
                layerData = renderLayer.layerData,
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                tilewidth = dtwidth,
                tileheight = dtheight,
                [ canvasW, canvasH ] = pageData.canvasDimensions,
                [ xOffset, yOffset ] = renderLayer.isOffsetTurnedOff === true ? [0, 0] : pageData.worldOffset,
                boundariesCalculations = this.#gameOptions.render.boundaries.realtimeCalculations,
                setBoundaries = renderLayer.setBoundaries,
                tileImagesData = [];

            if (!layerData) {
                Warning(WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }

            if (this.#gameOptions.render.boundaries.mapBoundariesEnabled) {
                pageData._setMapBoundaries();
            }
            
            for (let i = 0; i < tilesets.length; i++) {
                
                const tilesetData = tilesets[i],
                    firstgid = tilesets[i].firstgid,
                    nextTileset = tilesets[i + 1],
                    nextgid = nextTileset ? nextTileset.firstgid : 1_000_000_000, // a workaround to avoid multiple conditions
                    tilesetwidth = tilesetData.tilewidth,
                    tilesetheight = tilesetData.tileheight,
                    tileoffsetX = tilesetData.tileoffset ? tilesetData.tileoffset.x : 0,
                    tileoffsetY = tilesetData.tileoffset ? tilesetData.tileoffset.y : 0,
                    atlasImage = tilesetImages[i],
                    //atlasWidth = atlasImage.width,
                    //atlasHeight = atlasImage.height,
                    atlasWidth = tilesetData.imagewidth,
                    atlasHeight = tilesetData.imageheight,
                    //atlasRows = atlasHeight / tileheight,
                    atlasColumns = tilesetData.columns,
                    layerCols = layerData.width,
                    layerRows = layerData.height,
                    worldW = tilewidth * layerCols,
                    worldH = tileheight * layerRows,
                    moduloTop = yOffset % tileheight,
                    moduleLeft = xOffset % tilewidth,
                    skipRowsTop = yOffset !== 0 ? Math.floor(yOffset / tileheight) : 0,
                    skipColsLeft = xOffset !== 0 ? Math.floor(xOffset / tilewidth) : 0,
                    // sometimes canvasW/H may be bigger than world itself
                    screenRows = worldH > canvasH ? Math.ceil(canvasH / tileheight) + 1 : layerRows,
                    screenCols = worldW > canvasW ? Math.ceil(canvasW / tilewidth) + 1 : layerCols,
                    screenCells = screenRows * screenCols,
                    skipColsRight = layerCols - screenCols - skipColsLeft,
                    cellSpacing = typeof tilesetData.spacing === "number" ? tilesetData.spacing : 0,
                    cellMargin = typeof tilesetData.margin === "number" ? tilesetData.margin : 0,
                    hasAnimations = tilesetData._hasAnimations;
                    //console.log("non empty: ", layerData.nonEmptyCells);
                    // additional property which is set in DrawTiledLayer
                const hasBoundaries = tilesetData._hasBoundaries,
                    tilesetBoundaries = tilesetData._boundaries,
                    layerTilesetData = tilesets[i]._temp;

                if (layerTilesetData.cells !== screenCells) {
                    layerTilesetData._initiateStorageData(screenCells);
                }
                let v = layerTilesetData.vectors,
                    t = layerTilesetData.textures,
                    filledSize = 0;
                    
                //v.fill(0);
                //t.fill(0);
                v = [];
                t = [];
                let boundariesRowsIndexes = layerTilesetData._bTempIndexes;
                const fullRowCellsNum = screenCols * 4;
                
                let mapIndex = skipRowsTop * layerCols;
                for (let row = 0; row < screenRows; row++) {
                    mapIndex += skipColsLeft;
                    for (let col = 0; col < screenCols; col++) {
                        let tile = layerData.data[mapIndex];

                        if ((tile >= firstgid) && (tile < nextgid)) {
                            const mapPosX = col * dtwidth - moduleLeft + tileoffsetX,
                                // this fix is used to draw items with height different that the actual tilecell height
                                posYFix = tilesetheight - dtheight,
                                mapPosY = row * dtheight - posYFix - moduloTop + tileoffsetY;

                            // actual tile index
                            tile -= firstgid;
                            // switch if animations are set
                            if (hasAnimations) {
                                const activeTile = tilesetData._animations.get(tile);
                                if (typeof activeTile !== "undefined") {
                                    tile = activeTile;
                                }   
                            }

                            // calculate map position and atlas position
                            const colNum = tile % atlasColumns,
                                rowNum = Math.floor(tile / atlasColumns),
                                atlasPosX = colNum * tilesetwidth + (colNum * cellSpacing) + cellMargin,
                                atlasPosY = rowNum * tilesetheight + (rowNum * cellSpacing) + cellMargin,
                                vecX1 = mapPosX,
                                vecY1 = mapPosY,
                                vecX2 = mapPosX + tilesetwidth,
                                vecY2 = mapPosY + tilesetheight,
                                texX1 = (1 / atlasWidth) * atlasPosX,
                                texY1 = (1 / atlasHeight) * atlasPosY,
                                texX2 = texX1 + (1 / atlasWidth * tilesetwidth),
                                texY2 = texY1 + (1 / atlasHeight * tilesetheight);

                            // 0 vecX1
                            v[filledSize] = vecX1;
                            t[filledSize] = texX1;

                            // 1 vecY1
                            filledSize++;
                            v[filledSize] = vecY1;
                            t[filledSize] = texY1;
                            
                            // 2 vecX2
                            filledSize++;
                            v[filledSize] = vecX2;
                            t[filledSize] = texX2;

                            // 3 vecY1
                            filledSize++;
                            v[filledSize] = vecY1;
                            t[filledSize] = texY1;

                            // 4 vecX1
                            filledSize++;
                            v[filledSize] = vecX1;
                            t[filledSize] = texX1;

                            // 5 vecY2
                            filledSize++;
                            v[filledSize] = vecY2;
                            t[filledSize] = texY2;

                            // 6 vecX1
                            filledSize++;
                            v[filledSize] = vecX1;
                            t[filledSize] = texX1;

                            // 7 vecY2
                            filledSize++;
                            v[filledSize] = vecY2;
                            t[filledSize] = texY2;

                            // 8 vecX2
                            filledSize++;
                            v[filledSize] = vecX2;
                            t[filledSize] = texX2;

                            // 9 vecY1
                            filledSize++;
                            v[filledSize] = vecY1;
                            t[filledSize] = texY1;

                            // 10 vecX2, 
                            filledSize++;
                            v[filledSize] = vecX2;
                            t[filledSize] = texX2;

                            // 11 vecY2
                            filledSize++;
                            v[filledSize] = vecY2;
                            t[filledSize] = texY2;

                            filledSize++;
                        
                            if (setBoundaries) {
                                // if boundary is set in tilesetData
                                let isBoundaryPreset = false;
                                if (hasBoundaries && tilesetBoundaries.size > 0) {
                                    const tilesetBoundary = tilesetBoundaries.get(tile);
                                    if (tilesetBoundary) {
                                        isBoundaryPreset = true;
                                        const objectGroup = tilesetBoundary,
                                            objects = objectGroup.objects;
                                            
                                        objects.forEach((object) => {
                                            const baseX = mapPosX + object.x, 
                                                baseY = mapPosY + object.y,
                                                rotation = object.rotation;
                                            if (rotation !== 0) {
                                                Warning("tilesetData.tiles.rotation property is not supported yet");
                                            }
                                            if (object.polygon) {
                                                object.polygon.forEach(
                                                    (point, idx) => {
                                                        const next = object.polygon[idx + 1];
                                                        if (next) {
                                                            pageData._addBoundaryLine(point.x + baseX, point.y + baseY, next.x + baseX, next.y + baseY);
                                                        } else {
                                                            // last point -> link to the first
                                                            const first = object.polygon[0];
                                                            pageData._addBoundaryLine(point.x + baseX, point.y + baseY, first.x + baseX, first.y + baseY);
                                                        }
                                                    });
                                            } else if (object.point) {
                                                // x/y coordinate
                                                pageData._addPointBoundary(baseX, baseY);
                                            } else if (object.ellipse) {
                                                const radX = object.width / 2,
                                                    radY = object.height / 2;
                                                    
                                                pageData._addEllipseBoundary(baseX + radX, baseY + radY, radX, radY);
                                            } else {
                                                // object is rect
                                                const width = object.width,
                                                    height = object.height,
                                                    x2 = width + baseX,
                                                    y2 = height + baseY;

                                                //boundaries.push([baseX, baseY, x2, baseY]);
                                                pageData._addBoundaryLine(baseX, baseY, x2, baseY);

                                                //boundaries.push([x2, baseY, x2, y2]);
                                                pageData._addBoundaryLine(x2, baseY, x2, y2);

                                                //boundaries.push([x2, y2, baseX, y2]);
                                                pageData._addBoundaryLine(x2, y2, baseX, y2);

                                                //boundaries.push([baseX, y2, baseX, baseY]);
                                                pageData._addBoundaryLine(baseX, y2, baseX, baseY);
                                            }
                                        });
                                    }

                                // extract rect boundary for the whole tile
                                }
                                if (isBoundaryPreset === false) {
                                    const boundaries = pageData.getRawBoundaries();

                                    let rightLine = [ mapPosX + tilesetwidth, mapPosY, mapPosX + tilesetwidth, mapPosY + tilesetheight ],
                                        bottomLine = [ mapPosX + tilesetwidth, mapPosY + tilesetheight, mapPosX, mapPosY + tilesetheight ],
                                        topLine = [ mapPosX, mapPosY, mapPosX + tilesetwidth, mapPosY],
                                        leftLine = [ mapPosX, mapPosY + tilesetheight, mapPosX, mapPosY ];
                                    
                                    // top cell7
                                    if (row !== 0) {
                                        const topCellFirstIndex =  (row - 1) * fullRowCellsNum + (col * 4),
                                            bottomTopLeftFirstIndex = boundariesRowsIndexes[topCellFirstIndex + INDEX_BOTTOM_LINE];
                                        if (bottomTopLeftFirstIndex) {
                                            //remove double lines from top
                                            const bottomTopCellX1 = boundaries[bottomTopLeftFirstIndex];
                                            if (bottomTopCellX1) {
                                                const bottomTopCellY1 = boundaries[bottomTopLeftFirstIndex + INDEX_Y1],
                                                    bottomTopCellX2 = boundaries[bottomTopLeftFirstIndex + INDEX_X2],
                                                    bottomTopCellY2 = boundaries[bottomTopLeftFirstIndex + INDEX_Y2],
                                                    topX1 = topLine[INDEX_X1],
                                                    topY1 = topLine[INDEX_Y1],
                                                    topX2 = topLine[INDEX_X2],
                                                    topY2 = topLine[INDEX_Y2];
                                                
                                                if (topX1 === bottomTopCellX2 && topY1 === bottomTopCellY2 &&
                                                    topX2 === bottomTopCellX1 && topY2 === bottomTopCellY1) {
                                                    pageData._removeBoundaryLine(bottomTopLeftFirstIndex);
                                                    topLine = undefined;
                                                }
                                            }

                                            // merge line from top right
                                            const rightTopRightFirstIndex = boundariesRowsIndexes[ topCellFirstIndex + INDEX_RIGHT_LINE],
                                                rightTopCellX1 = boundaries[rightTopRightFirstIndex];
                                            if (rightTopCellX1) {
                                                const rightTopCellY1 = boundaries[rightTopRightFirstIndex + INDEX_Y1],
                                                    rightTopCellX2 = boundaries[rightTopRightFirstIndex + INDEX_X2],
                                                    rightX1 = boundaries[rightTopRightFirstIndex + INDEX_X1],
                                                    rightX2 = boundaries[rightTopRightFirstIndex + INDEX_X2];
                                                if (rightTopCellX1 === rightX2 && rightTopCellX2 === rightX1) {
                                                    pageData._removeBoundaryLine(rightTopRightFirstIndex);
                                                    rightLine[INDEX_X1] = rightTopCellX1;
                                                    rightLine[INDEX_Y1] = rightTopCellY1;
                                                }
                                            }
                                            // merge line from top left
                                            const leftTopRightFirstIndex =  boundariesRowsIndexes[topCellFirstIndex + INDEX_LEFT_LINE],
                                                leftTopCellX1 = boundaries[leftTopRightFirstIndex];
                                            if (leftTopCellX1) {
                                                const leftTopCellX2 = boundaries[leftTopRightFirstIndex + INDEX_X2],
                                                    leftTopCellY2 = boundaries[leftTopRightFirstIndex + INDEX_Y2],
                                                    leftX1 = leftLine[INDEX_X1],
                                                    leftX2 = leftLine[INDEX_X2];
                                                if (leftTopCellX1 === leftX2 && leftTopCellX2 === leftX1) {
                                                    pageData._removeBoundaryLine(leftTopRightFirstIndex);
                                                    leftLine[INDEX_X2] = leftTopCellX2;
                                                    leftLine[INDEX_Y2] = leftTopCellY2;
                                                }
                                            }
                                        }
                                    }
                                    // leftCell
                                    if (col !== 0) {
                                        
                                        const leftCell = row * fullRowCellsNum + ((col - 1) * 4),
                                            topLeftFirstCellIndex = boundariesRowsIndexes[leftCell];
                                        if (topLeftFirstCellIndex) {

                                            //remove double lines from left
                                            const rightLeftCellIndex = boundariesRowsIndexes[leftCell + INDEX_RIGHT_LINE],
                                                rightLeftX1 = boundaries[rightLeftCellIndex],
                                                rightLeftCellX1 = rightLeftX1,
                                                rightLeftCellY1 = boundaries[rightLeftCellIndex + INDEX_Y1],
                                                rightLeftCellX2 = boundaries[rightLeftCellIndex + INDEX_X2],
                                                rightLeftCellY2 = boundaries[rightLeftCellIndex + INDEX_Y2],
                                                leftX1 = leftLine[INDEX_X1],
                                                leftY1 = leftLine[INDEX_Y1],
                                                leftX2 = leftLine[INDEX_X2],
                                                leftY2 = leftLine[INDEX_Y2];

                                            if (leftX1 === rightLeftCellX2 && leftY1 === rightLeftCellY2 &&
                                                leftX2 === rightLeftCellX1 && leftY2 === rightLeftCellY1) {
                                                pageData._removeBoundaryLine(rightLeftCellIndex);
                                                leftLine = undefined;
                                            }

                                            //merge long lines from left top
                                            const topLeftCellX1 = boundaries[topLeftFirstCellIndex];
                                            if (topLeftCellX1 && topLine) {
                                                const topLeftCellY1 = boundaries[topLeftFirstCellIndex + INDEX_Y1],
                                                    topLeftCellY2 = boundaries[topLeftFirstCellIndex + INDEX_Y2],
                                                    topY1 = topLine[INDEX_Y1],
                                                    topY2 = topLine[INDEX_Y2];
                                                if (topLeftCellY1 === topY2 && topLeftCellY2 === topY1 ) {
                                                    pageData._removeBoundaryLine(topLeftFirstCellIndex);
                                                    topLine[INDEX_X1] = topLeftCellX1;
                                                    topLine[INDEX_Y1] = topLeftCellY1;
                                                }
                                            }

                                            // merge long lines from left bottom
                                            const bottomLeftFirstCellIndex = boundariesRowsIndexes[leftCell + INDEX_BOTTOM_LINE],
                                                bottomLeftCellX1 = boundaries[bottomLeftFirstCellIndex];
                                            if (bottomLeftCellX1) {
                                                const bottomLeftCellY1 = boundaries[bottomLeftFirstCellIndex + INDEX_Y1],
                                                    bottomLeftCellX2 = boundaries[bottomLeftFirstCellIndex + INDEX_X2],
                                                    bottomLeftCellY2 = boundaries[bottomLeftFirstCellIndex + INDEX_Y2],
                                                    bottomY1 = bottomLine[INDEX_Y1],
                                                    bottomY2 = bottomLine[INDEX_Y2];
                                                if (bottomLeftCellY1 === bottomY2 && bottomLeftCellY2 === bottomY1 ) {
                                                    pageData._removeBoundaryLine(bottomLeftFirstCellIndex);
                                                    //opposite direction
                                                    bottomLine[INDEX_X2] = bottomLeftCellX2;
                                                    bottomLine[INDEX_Y2] = bottomLeftCellY2;
                                                }
                                            }

                                        }
                                    }
                                    const currentCellIndex = row * fullRowCellsNum + (col * 4);
                                    if (topLine) {
                                        pageData._addBoundaryLine(topLine[0], topLine[1], topLine[2], topLine[3]);
                                        boundariesRowsIndexes[currentCellIndex + INDEX_TOP_LINE] = pageData.boundariesLen - 4;
                                    }
                                    pageData._addBoundaryLine(rightLine[0], rightLine[1], rightLine[2], rightLine[3]);
                                    boundariesRowsIndexes[currentCellIndex + INDEX_RIGHT_LINE] = pageData.boundariesLen - 4;
                                    pageData._addBoundaryLine(bottomLine[0], bottomLine[1], bottomLine[2], bottomLine[3]);
                                    boundariesRowsIndexes[currentCellIndex + INDEX_BOTTOM_LINE] = pageData.boundariesLen - 4;
                                    if (leftLine) {
                                        pageData._addBoundaryLine(leftLine[0], leftLine[1], leftLine[2], leftLine[3]);
                                        boundariesRowsIndexes[currentCellIndex + INDEX_LEFT_LINE] = pageData.boundariesLen - 4;
                                    }
                                    
                                }
                            }
                        }
                        mapIndex++;
                    }
                    mapIndex += skipColsRight;
                }
                //console.log(boundariesRowsIndexes);
                //this.#bindTileImages(verticesBufferData, texturesBufferData, atlasImage, tilesetData.name, renderLayer._maskId);
                tileImagesData.push([v, t, tilesetData.name, atlasImage]);
                //cleanup
                boundariesRowsIndexes.fill(0);
            }
            
            resolve(tileImagesData);
        });
    }

    #prepareRenderLayerOld(renderLayer, pageData) {
        return new Promise((resolve, reject) => {
            const tilemap = renderLayer.tilemap,
                tilesets = renderLayer.tilesets,
                tilesetImages = renderLayer.tilesetImages,
                layerData = renderLayer.layerData,
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                [ xOffset, yOffset ] = renderLayer.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset;
            
            let tileImagesData = [];
            if (!layerData) {
                Warning(WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }

            if (this.#gameOptions.render.boundaries.mapBoundariesEnabled) {
                pageData._setMapBoundaries();
            }

            for (let i = 0; i <= tilesets.length - 1; i++) {
                const tilesetData = tilesets[i],
                    firstgid = tilesets[i].firstgid,
                    nextTileset = tilesets[i + 1],
                    nextgid = nextTileset ? nextTileset.firstgid : 1_000_000_000, // a workaround to avoid multiple conditions
                    //tilesetImages = this.iLoader.getTilesetImageArray(tilesetData.name),
                    tilesetwidth = tilesetData.tilewidth,
                    tilesetheight = tilesetData.tileheight,
                    //atlasRows = tilesetData.imageheight / tileheight,
                    //atlasColumns = tilesetData.imagewidth / tilewidth,
                    atlasColumns = tilesetData.columns,
                    layerCols = layerData.width,
                    layerRows = layerData.height,
                    atlasImage = tilesetImages[i],
                    atlasWidth = tilesetData.imagewidth,
                    atlasHeight = tilesetData.imageheight,
                    cellSpacing = typeof tilesetData.spacing === "number" ? tilesetData.spacing : 0,
                    cellMargin = typeof tilesetData.margin === "number" ? tilesetData.margin : 0,
                    layerTilesetData = tilesets[i]._temp;
                
                let mapIndex = 0,
                    v = layerTilesetData.vectors,
                    t = layerTilesetData.textures,
                    filledSize = 0;
                
                //v.fill(0);
                //t.fill(0);
                v = [];
                t = [];
                for (let row = 0; row < layerRows; row++) {
                    for (let col = 0; col < layerCols; col++) {
                        let tile = layerData.data[mapIndex];
                        
                        if (tile >= firstgid && (tile < nextgid)) {

                            tile -= firstgid;
                            const colNum = tile % atlasColumns,
                                rowNum = Math.floor(tile / atlasColumns),
                                atlasPosX = colNum * tilesetwidth + (colNum * cellSpacing) + cellMargin,
                                atlasPosY = rowNum * tilesetheight + (rowNum * cellSpacing) + cellMargin,
                                vecX1 = col * dtwidth - xOffset,
                                vecY1 = row * dtheight - yOffset,
                                vecX2 = vecX1 + tilesetwidth,
                                vecY2 = vecY1 + tilesetheight,
                                texX1 = 1 / atlasWidth * atlasPosX,
                                texY1 = 1 / atlasHeight * atlasPosY,
                                texX2 = texX1 + (1 / atlasWidth * tilesetwidth),
                                texY2 = texY1 + (1 / atlasHeight * tilesetheight);
                             
                            // 0 vecX1
                            v[filledSize] = vecX1;
                            t[filledSize] = texX1;

                            // 1 vecY1
                            filledSize++;
                            v[filledSize] = vecY1;
                            t[filledSize] = texY1;
                            
                            // 2 vecX2
                            filledSize++;
                            v[filledSize] = vecX2;
                            t[filledSize] = texX2;

                            // 3 vecY1
                            filledSize++;
                            v[filledSize] = vecY1;
                            t[filledSize] = texY1;

                            // 4 vecX1
                            filledSize++;
                            v[filledSize] = vecX1;
                            t[filledSize] = texX1;

                            // 5 vecY2
                            filledSize++;
                            v[filledSize] = vecY2;
                            t[filledSize] = texY2;

                            // 6 vecX1
                            filledSize++;
                            v[filledSize] = vecX1;
                            t[filledSize] = texX1;

                            // 7 vecY2
                            filledSize++;
                            v[filledSize] = vecY2;
                            t[filledSize] = texY2;

                            // 8 vecX2
                            filledSize++;
                            v[filledSize] = vecX2;
                            t[filledSize] = texX2;

                            // 9 vecY1
                            filledSize++;
                            v[filledSize] = vecY1;
                            t[filledSize] = texY1;

                            // 10 vecX2, 
                            filledSize++;
                            v[filledSize] = vecX2;
                            t[filledSize] = texX2;

                            // 11 vecY2
                            filledSize++;
                            v[filledSize] = vecY2;
                            t[filledSize] = texY2;

                            filledSize++;
                            
                        }
                        mapIndex++;
                    }
                }
                tileImagesData.push([v, t, tilesetData.name, atlasImage]);
            }
            resolve(tileImagesData);
        });
    }

    /**
     * 
     * @param {DrawTiledLayer} renderLayer 
     * @param {GameStageData} pageData
     * @returns {Promise<Array<any>}
     */
    #prepareRenderLayerWM = (renderLayer, pageData) => {
        return new Promise((resolve, reject) => {
            const tilemap = renderLayer.tilemap,
                tilesets = renderLayer.tilesets,
                tilesetImages = renderLayer.tilesetImages,
                layerData = renderLayer.layerData,
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                tilewidth = dtwidth,
                tileheight = dtheight,
                offsetDataItemsFullNum = layerData.data.length,
                offsetDataItemsFilteredNum = layerData.data.filter((item) => item !== 0).length,
                setBoundaries = false, //renderLayer.setBoundaries,
                [ settingsWorldWidth, settingsWorldHeight ] = pageData.worldDimensions,
                //[ canvasW, canvasH ] = this.stageData.drawDimensions,
                [ xOffset, yOffset ] = renderLayer.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset;
            const tileImagesData = [];
            // clear data
            // this.layerDataFloat32.fill(0);
            // set data for webgl processing
            this.layerDataFloat32.set(layerData.data);
            if (!layerData) {
                Warning(WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }

            if (this.#gameOptions.render.boundaries.mapBoundariesEnabled) {
                pageData._setMapBoundaries();
            }
            
            for (let i = 0; i < tilesets.length; i++) {
                const tilesetData = tilesets[i],
                    firstgid = tilesets[i].firstgid,
                    nextTileset = tilesets[i + 1],
                    nextgid = nextTileset ? nextTileset.firstgid : 1_000_000_000, // a workaround to avoid multiple conditions
                    //tilesetImages = this.iLoader.getTilesetImageArray(tilesetData.name),
                    tilesetwidth = tilesetData.tilewidth,
                    tilesetheight = tilesetData.tileheight,
                    //atlasRows = tilesetData.imageheight / tileheight,
                    atlasColumns = tilesetData.columns,
                    layerCols = layerData.width,
                    layerRows = layerData.height,
                    //visibleCols = Math.ceil(canvasW / tilewidth),
                    //visibleRows = Math.ceil(canvasH / tileheight),
                    //offsetCols = layerCols - visibleCols,
                    //offsetRows = layerRows - visibleRows,
                    worldW = tilewidth * layerCols,
                    worldH = tileheight * layerRows,
                    atlasImage = tilesetImages[i],
                    atlasWidth = tilesetData.imagewidth,
                    atlasHeight = tilesetData.imageheight,
                    items = layerRows * layerCols,
                    dataCellSizeBytes = 4,
                    vectorCoordsItemsNum = 12,
                    texturesCoordsItemsNum = 12,
                    vectorDataItemsNum = offsetDataItemsFilteredNum * vectorCoordsItemsNum,
                    texturesDataItemsNum = offsetDataItemsFilteredNum * texturesCoordsItemsNum,
                    cellSpacing = typeof tilesetData.spacing === "number" ? tilesetData.spacing : 0,
                    cellMargin = typeof tilesetData.margin === "number" ? tilesetData.margin : 0;
                
                const itemsProcessed = this.calculateBufferData(dataCellSizeBytes, offsetDataItemsFullNum, vectorDataItemsNum, layerRows, layerCols, dtwidth, dtheight, tilesetwidth, tilesetheight, atlasColumns, atlasWidth, atlasHeight, xOffset, yOffset, firstgid, nextgid, cellSpacing, setBoundaries);
                
                const verticesBufferData = itemsProcessed > 0 ? this.layerDataFloat32.slice(offsetDataItemsFullNum, vectorDataItemsNum + offsetDataItemsFullNum) : [],
                    texturesBufferData = itemsProcessed > 0 ? this.layerDataFloat32.slice(vectorDataItemsNum + offsetDataItemsFullNum, vectorDataItemsNum + texturesDataItemsNum + offsetDataItemsFullNum) : [];
                    
                tileImagesData.push([Array.from(verticesBufferData), Array.from(texturesBufferData), tilesetData.name, atlasImage]);
            }
            resolve(tileImagesData);
        });
    };

    /**
     * 
     * @param {string} rgbaColor 
     * @returns {number[]}
     */
    #rgbaToArray (rgbaColor) {
        return rgbaColor.replace("rgba(", "").replace(")", "").split(",").map((/** @param {string} */item) => Number(item.trim()));
    }

    #triangulatePolygon(vertices) {
        const triangulatedPolygon = new Float32Array(vertices.length * vertices.length),
            pointer = 0;
            
        const [triangulated, len] = this.#triangulate(vertices, triangulatedPolygon, pointer);
        
        const sliced = triangulated.slice(0, len);
        
        return sliced;
    }

    /**
     * 
     * @param {Array<Array<number>>} polygonVertices 
     * @param {Float32Array} triangulatedPolygon 
     * @returns {Array}
     */
    #triangulate (polygonVertices, triangulatedPolygon, pointer) {
        const len = polygonVertices.length,
            vectorsCS = (a, b, c) => crossProduct({x:c[0] - a[0], y: c[1] - a[1]}, {x:b[0] - a[0], y: b[1] - a[1]});

        if (len <= 3) {
            polygonVertices.forEach(vertex => {
                triangulatedPolygon[pointer] = vertex[0];
                pointer++;
                triangulatedPolygon[pointer] = vertex[1];
                pointer++;
            });
            return [triangulatedPolygon, pointer];
        }
        const verticesSortedByY = [...polygonVertices].sort((curr, next) => next[1] - curr[1]);
        const topVertexIndex = polygonVertices.indexOf(verticesSortedByY[0]),
            startVertexIndex = topVertexIndex !== len - 1 ? topVertexIndex + 1 : 0;
        
        let processedVertices = polygonVertices,
            processedVerticesLen = processedVertices.length,
            skipCount = 0,
            i = startVertexIndex;
        
        while(processedVertices.length > 2) {
            // if overflowed, start from beginning
            const currLen = processedVertices.length;
            if (i >= currLen) {
                i -= currLen;
            }
    
            const prevVertex = i === 0 ? processedVertices[currLen - 1] : processedVertices[i - 1],
                currentVertex = processedVertices[i],
                nextVertex = currLen === i + 1 ? processedVertices[0] : processedVertices[i + 1];
    
            
            const cs = vectorsCS(prevVertex, currentVertex, nextVertex);
    
            if (cs < 0) {
                triangulatedPolygon[pointer] = prevVertex[0];
                pointer++;
                triangulatedPolygon[pointer] = prevVertex[1];
                pointer++;
                triangulatedPolygon[pointer] = currentVertex[0];
                pointer++;
                triangulatedPolygon[pointer] = currentVertex[1];
                pointer++;
                triangulatedPolygon[pointer] = nextVertex[0];
                pointer++;
                triangulatedPolygon[pointer] = nextVertex[1];
                pointer++;
                processedVertices = processedVertices.filter((val, index) => index !== i);
            } else {
                skipCount += 1;
                if (skipCount > processedVerticesLen) {
                    // sometimes fails
                    Warning(WARNING_CODES.TRIANGULATE_ISSUE, "Can't extract all triangles vertices.");
                    return [triangulatedPolygon, pointer];
                }
                i++;
            }
            // if (cs < 0): it's jumping over next vertex, maybe not a good solution? Moving up
            // i++;
        }
        
        return [triangulatedPolygon, pointer];
    }

    #bindPolygon(vertices) {
        this.#gl.bufferData(
            this.#gl.ARRAY_BUFFER, 
            new Float32Array(vertices),
            this.#gl.STATIC_DRAW);
    }

    #setSingleRectangle(width, height) {
        const x1 = 0,
            x2 = 0 + width,
            y1 = 0,
            y2 = 0 + height;
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, 
            new Float32Array([
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2]), this.#gl.STATIC_DRAW);
    }
    /*------------------------------------
     * End of Predefined Drawing programs
     -------------------------------------*/

    /**-----------------------------------
     * Textures
     ------------------------------------*/
    #updateWebGlTexture(gl, texture, textureImage, textureNum = 0, useMipMaps = false) {
        this.#bindTexture(gl, texture, textureNum);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
        // LINEAR filtering is better for images and tiles, but for texts it produces a small blur
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // for textures not power of 2 (texts for example)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, useMipMaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    }

    #updateTextWebGlTexture(gl, texture, textureImage, textureNum = 0) {
        this.#bindTexture(gl, texture, textureNum);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
        // LINEAR filtering is better for images and tiles, but for texts it produces a small blur
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // for textures not power of 2 (texts for example)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    }

    #bindTexture(gl, texture, textureNum = 0) {
        gl.activeTexture(gl.TEXTURE0 + textureNum);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    #removeTexture(gl, texture) {
        gl.deleteTexture(texture);
    }
    /*------------------------------------
     * End Textures
    --------------------------------------*/

    isPowerOfTwo(value) {
        return (value & (value - 1)) === 0;
    }

    nextHighestPowerOfTwo(x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    }

    getNextRenderObject = (renderObject, pageData) => {
        const objectIndex = pageData.renderObjects.indexOf(renderObject),
            nextObject = pageData.renderObjects[objectIndex + 1];
        return nextObject;
    }

    #glTextureIndex = (activeTexture) => {
        return activeTexture - 33984;
    }
}