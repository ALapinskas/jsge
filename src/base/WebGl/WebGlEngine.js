import { ERROR_CODES, CONST, WARNING_CODES } from "../../constants.js";
import { crossProduct } from "../../utils.js";
import { Exception, Warning } from "../Exception.js";
import { ScreenPageData } from "../ScreenPageData.js";
import { TextureStorage } from "./TextureStorage.js";

export class WebGlEngine {
    /**
     * @type {WebGLRenderingContext}
     */
    #gl;
    /**
     * @type {boolean}
     */
    #debug;
    /**
     * @type {Object}
     */
    #gameOptions;
    /**
     * @type {WebGLBuffer | null}
     */
    #positionBuffer;
    /**
     * @type {WebGLBuffer | null}
     */
    #texCoordBuffer;

    /**
     * @type {Map<string, WebGLProgram}
     */
    #registeredWebGlPrograms = new Map();
    /**
     * @type {Map<string, Object<string, WebGLUniformLocation | number>>}
     */
    #webGlProgramsVarsLocations = new Map();

    constructor(context, gameOptions) {
        if (!context || !(context instanceof WebGLRenderingContext)) {
            Exception(ERROR_CODES.UNEXPECTED_INPUT_PARAMS, " context parameter should be specified and equal to WebGLRenderingContext");
        }
        
        this.#gl = context;
        this.#gameOptions = gameOptions;
        this.#debug = gameOptions.checkWebGlErrors;
        this.#positionBuffer = context.createBuffer();
        this.#texCoordBuffer = context.createBuffer();
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
    _initiateWasm = () => {
        return new Promise((resolve, reject) => {
            this.layerData = new WebAssembly.Memory({initial:50});
            this.layerDataFloat32 = new Float32Array(this.layerData.buffer);
            const importObject = {
                env: {
                    data: this.layerData,
                    logi: console.log,
                    logf: console.log
                }
            };

            fetch("/src/wa/calculateBufferData.wasm")
                .then((response) => response.arrayBuffer())
                .then((module) => WebAssembly.instantiate(module, importObject))
                .then((obj) => {
                    this.calculateBufferData = obj.instance.exports.calculateBufferData;
                    resolve();
                });
        });
    };

    _clearView() {
        const gl = this.#gl;
        gl.clearColor(0, 0, 0, 0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    }
    
    _render(verticesNumber, primitiveType, offset = 0) {
        const gl = this.#gl,
            err = this.#debug ? gl.getError() : 0;
        if (err !== 0) {
            console.error(err);
            throw new Error("Error num: " + err);
        } else {
            gl.drawArrays(primitiveType, offset, verticesNumber);
            // set blend to default
            gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
        }
        return Promise.resolve();
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
            rotation = renderObject.rotation,
            blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA],
            { 
                u_translation: translationLocation,
                u_rotation: rotationRotation,
                u_scale: scaleLocation,
                u_resolution: resolutionUniformLocation,
                u_color: colorUniformLocation,
                a_position: positionAttributeLocation,
                u_fade_min: fadeMinLocation
            } = vars;
            
        let verticesNumber = 0;
        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, x, y);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, 0);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        switch (renderObject.type) {
        case CONST.DRAW_TYPE.RECTANGLE:
            this.#setSingleRectangle(renderObject.width, renderObject.height);
            verticesNumber += 6;
            break;
        case CONST.DRAW_TYPE.TEXT:
            break;
        case CONST.DRAW_TYPE.CIRCLE: {
            const coords = renderObject.vertices;
            gl.bufferData(this.#gl.ARRAY_BUFFER, 
                new Float32Array(coords), this.#gl.STATIC_DRAW);
            verticesNumber += coords.length / 2;
            break;
        }
        case CONST.DRAW_TYPE.POLYGON: {
            const triangles = this.#triangulatePolygon(renderObject.vertices);
            this.#bindPolygon(triangles);
            const len = triangles.length;
            if (len % 3 !== 0) {
                Warning(WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, `polygons ${renderObject.id}, vertices are not correct, skip drawing`);
                return Promise.reject();
            }
            verticesNumber += len / 2;
            break;
        }
        }
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
        return Promise.resolve([verticesNumber, gl.TRIANGLES]);
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

        gl.bufferData(this.#gl.ARRAY_BUFFER, 
            new Float32Array(coords), this.#gl.STATIC_DRAW);

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
        
        return Promise.resolve([verticesNumber, gl.TRIANGLE_FAN]);
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

        const rotation = 0,
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
        
        let textureStorage = renderObject._textureStorage;
        if (!textureStorage) {
            textureStorage = new TextureStorage(gl.createTexture());
            renderObject._textureStorage = textureStorage;
        } 
        if (textureStorage._isTextureRecalculated === true) { 
            this.#updateWebGlTexture(gl, textureStorage._texture, renderObject._textureCanvas);
            textureStorage._isTextureRecalculated = false;
        } else {
            this.#bindTexture(gl, textureStorage._texture);
        }
        gl.uniform1i(u_imageLocation, textureStorage._textureIndex);
        
        return Promise.resolve([verticesNumber, gl.TRIANGLES]);
    };

    _bindImage = (renderObject, gl, pageData, program, vars) => {
        const { 
            u_translation: translationLocation,
            u_rotation: rotationRotation,
            u_scale: scaleLocation,
            u_resolution: resolutionUniformLocation,
            a_position: positionAttributeLocation,
            a_texCoord: texCoordLocation,
            u_image: u_imageLocation } = vars;

        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset;

        const atlasImage = renderObject.image,
            animationIndex = renderObject.imageIndex,
            image_name = renderObject.key,
            shapeMaskId = renderObject._maskId,
            spacing = renderObject.spacing,
            blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA],
            scale = [1, 1];
        let imageX = 0,
            imageY = 0,
            colNum = 0,
            rowNum = 0,
            verticesNumber = 0;
        if (animationIndex !== 0) {
            const imageColsNumber = (atlasImage.width + spacing) / (renderObject.width + spacing);
            colNum = animationIndex % imageColsNumber;
            rowNum = Math.floor(animationIndex / imageColsNumber);
            imageX = colNum * renderObject.width + (colNum * spacing),
            imageY = rowNum * renderObject.height + (rowNum * spacing);
        }
        const posX = x - renderObject.width / 2,
            posY = y - renderObject.height / 2;
        const vecX1 = posX,
            vecY1 = posY,
            vecX2 = vecX1 + renderObject.width,
            vecY2 = vecY1 + renderObject.height,
            texX1 = 1 / atlasImage.width * imageX,
            texY1 = 1 / atlasImage.height * imageY,
            texX2 = texX1 + (1 / atlasImage.width * renderObject.width),
            texY2 = texY1 + (1 / atlasImage.height * renderObject.height);
        const vectors = [
                vecX1, vecY1,
                vecX2, vecY1,
                vecX1, vecY2,
                vecX1, vecY2,
                vecX2, vecY1,
                vecX2, vecY2
            ],
            textures = [
                texX1, texY1,
                texX2, texY1,
                texX1, texY2,
                texX1, texY2,
                texX2, texY1,
                texX2, texY2
            ];
        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, x, y);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, renderObject.rotation);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vectors), gl.STATIC_DRAW);

        verticesNumber += vectors.length / 2;
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
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        let textureStorage = renderObject._textureStorage;
        if (!textureStorage) {
            textureStorage = new TextureStorage(gl.createTexture());
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

        return Promise.resolve([verticesNumber, gl.TRIANGLES]);
    };

    _bindTileImages = async(renderLayer, gl, pageData, program, vars) => {
        const { u_translation: translationLocation,
            u_rotation: rotationRotation,
            u_scale: scaleLocation,
            u_resolution: resolutionUniformLocation,
            a_position: positionAttributeLocation,
            a_texCoord: texCoordLocation,
            u_image: u_imageLocation } = vars;

        gl.useProgram(program);
        let renderLayerData;
        switch (this.#gameOptions.optimization) {
        case CONST.OPTIMIZATION.NATIVE_JS.NOT_OPTIMIZED:
            renderLayerData = await this.#prepareRenderLayerOld(renderLayer, pageData);
            break;
        case CONST.OPTIMIZATION.WEB_ASSEMBLY.WASM:
            renderLayerData = await this.#prepareRenderLayerWM(renderLayer, pageData);
            break;
        case CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT:
            Warning("Sorry, " + CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT + ", is not supported, switching to default");
        case CONST.OPTIMIZATION.NATIVE_JS.OPTIMIZED:
        default:
            renderLayerData = await this.#prepareRenderLayer(renderLayer, pageData);
        }
        const translation = [0, 0],
            scale = [1, 1],
            rotation = 0,
            drawMask = ["ONE", "ONE_MINUS_SRC_ALPHA"],
            shapeMaskId = renderLayer._maskId;

        let verticesNumber = 0;
        for (let i = 0; i < renderLayerData.length; i++) {
            const data = renderLayerData[i],
                vectors = data[0],
                textures = data[1],
                image_name = data[2],
                image = data[3];
            // set the resolution
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform2f(translationLocation,translation[0], translation[1]);
            gl.uniform2f(scaleLocation, scale[0], scale[1]);
            gl.uniform1f(rotationRotation, rotation);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vectors, gl.STATIC_DRAW);

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
            gl.bufferData(gl.ARRAY_BUFFER, textures, gl.STATIC_DRAW);

            gl.enableVertexAttribArray(texCoordLocation);
            gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, offset);

            let textureStorage = renderLayer._textureStorages[i];
            if (!textureStorage) {
                textureStorage = new TextureStorage(gl.createTexture(), i);
                renderLayer._setTextureStorage(i, textureStorage);
            } 
            if (textureStorage._isTextureRecalculated === true) { 
                this.#updateWebGlTexture(gl, textureStorage._texture, image, textureStorage._textureIndex);
                textureStorage._isTextureRecalculated = false;
            } else {
                this.#bindTexture(gl, textureStorage._texture, textureStorage._textureIndex);
            }
            gl.uniform1i(u_imageLocation, textureStorage._textureIndex);
            gl.blendFunc(gl[drawMask[0]], gl[drawMask[1]]);
            verticesNumber += vectors.length / 2;
            if (shapeMaskId) {
                gl.stencilFunc(gl.EQUAL, shapeMaskId, 0xFF);
            }
        }
        return Promise.resolve([verticesNumber, gl.TRIANGLES]);
    };

    _drawPolygon(renderObject, pageData) {
        const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
            x = renderObject.x - xOffset,
            y = renderObject.y - yOffset,
            rotation = renderObject.rotation || 0,
            vertices = renderObject.vertices,
            color =  this.#gameOptions.boundaries.boundariesColor;
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
            lineWidth = this.#gameOptions.boundariesWidth;
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

        this.#gl.bufferData(
            this.#gl.ARRAY_BUFFER, 
            new Float32Array(coords),
            this.#gl.STATIC_DRAW);

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

        return Promise.resolve([0, gl.LINES]);
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

        this.#gl.bufferData(
            this.#gl.ARRAY_BUFFER, 
            new Float32Array(linesArray),
            this.#gl.STATIC_DRAW);

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
     * 
     * @param {TiledRenderLayer} renderLayer 
     * @param {ScreenPageData} pageData
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
                [ settingsWorldWidth, settingsWorldHeight ] = pageData.worldDimensions,
                [ canvasW, canvasH ] = pageData.canvasDimensions,
                [ xOffset, yOffset ] = renderLayer.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
                boundariesCalculations = this.#gameOptions.render.boundaries.realtimeCalculations,
                setBoundaries = renderLayer.setBoundaries;
                
            let boundariesRowsIndexes = new Map(),
                boundaries = [],
                tileImagesData = [];

            if (!layerData) {
                Warning(WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }
            
            for (let i = 0; i < tilesets.length; i++) {
                const tileset = tilesets[i].data,
                    firstgid = tilesets[i].firstgid,
                    nextTileset = tilesets[i + 1],
                    nextgid = nextTileset ? nextTileset.firstgid : null,
                    tilesetwidth = tileset.tilewidth,
                    tilesetheight = tileset.tileheight,
                    atlasImage = tilesetImages[i],
                    //atlasWidth = atlasImage.width,
                    //atlasHeight = atlasImage.height,
                    atlasWidth = tileset.imagewidth,
                    atlasHeight = tileset.imageheight,
                    //atlasRows = atlasHeight / tileheight,
                    atlasColumns = tileset.columns,
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
                    skipColsRight = layerCols - screenCols - skipColsLeft,
                    cellSpacing = tileset.spacing,
                    cellMargin = tileset.margin,

                    verticesBufferData = [],
                    texturesBufferData = [];
                //@toDo: move this check upper level
                if (setBoundaries) {
                    if (worldW !== settingsWorldWidth || worldH !== settingsWorldHeight) {
                        Warning(WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                        pageData._setWorldDimensions(worldW, worldH);
                    }
                    // boundaries cleanups every draw circle, we need to set world boundaries again
                    if (this.#gameOptions.render.boundaries.mapBoundariesEnabled) {
                        pageData._setMapBoundaries();
                    }
                }

                let mapIndex = skipRowsTop * layerCols;
                for (let row = 0; row < screenRows; row++) {
                    mapIndex += skipColsLeft;
                    let currentRowIndexes = new Map();
                    for (let col = 0; col < screenCols; col++) {
                        let tile = layerData.data[mapIndex];
                        //if (tile !== 0)
                        if (tile >= firstgid && (nextgid === null || tile < nextgid)) {
                            const mapPosX = col * dtwidth - moduleLeft,
                                mapPosY = row * dtheight - moduloTop;

                            tile -= firstgid;
                            const colNum = tile % atlasColumns,
                                rowNum = Math.floor(tile / atlasColumns),
                                atlasPosX = colNum * tilesetwidth + (colNum * cellSpacing),
                                atlasPosY = rowNum * tilesetheight + (rowNum * cellSpacing),
                                vecX1 = mapPosX,
                                vecY1 = mapPosY,
                                vecX2 = mapPosX + tilesetwidth,
                                vecY2 = mapPosY + tilesetheight,
                                texX1 = (1 / atlasWidth) * atlasPosX,
                                texY1 = (1 / atlasHeight) * atlasPosY,
                                texX2 = texX1 + (1 / atlasWidth * tilesetwidth),
                                texY2 = texY1 + (1 / atlasHeight * tilesetheight);
                            verticesBufferData.push(
                                vecX1, vecY1,
                                vecX2, vecY1,
                                vecX1, vecY2,
                                vecX1, vecY2,
                                vecX2, vecY1,
                                vecX2, vecY2);
                            texturesBufferData.push(
                                texX1, texY1,
                                texX2, texY1,
                                texX1, texY2,
                                texX1, texY2,
                                texX2, texY1,
                                texX2, texY2
                            );
                            if (setBoundaries) {
                                let rightLine = [ mapPosX + tilesetwidth, mapPosY, mapPosX + tilesetwidth, mapPosY + tilesetheight ],
                                    bottomLine = [ mapPosX + tilesetwidth, mapPosY + tilesetheight, mapPosX, mapPosY + tilesetheight ],
                                    topLine = [ mapPosX, mapPosY, mapPosX + tilesetwidth, mapPosY],
                                    leftLine = [ mapPosX, mapPosY + tilesetheight, mapPosX, mapPosY ],
                                    currentAddedCellIndexes = [null, null, null, null];
                                
                                const topRow = row !== 0 ? boundariesRowsIndexes.get(row - 1) : undefined;
                                if (topRow ) {
                                    const topCellIndexes = topRow.get(col);
                                    if (topCellIndexes) {
                                        //remove double lines from top
                                        const bottomTopCellIndex = topCellIndexes[INDEX_BOTTOM_LINE],
                                            bottomTopCell = boundaries[bottomTopCellIndex];
                                        if (bottomTopCell) {
                                            const bottomTopCellX1 = bottomTopCell[INDEX_X1],
                                                bottomTopCellY1 = bottomTopCell[INDEX_Y1],
                                                bottomTopCellX2 = bottomTopCell[INDEX_X2],
                                                bottomTopCellY2 = bottomTopCell[INDEX_Y2],
                                                topX1 = topLine[INDEX_X1],
                                                topY1 = topLine[INDEX_Y1],
                                                topX2 = topLine[INDEX_X2],
                                                topY2 = topLine[INDEX_Y2];
                                            
                                            if (topX1 === bottomTopCellX2 && topY1 === bottomTopCellY2 &&
                                                topX2 === bottomTopCellX1 && topY2 === bottomTopCellY1) {
                                                boundaries[bottomTopCellIndex] = undefined;
                                                topLine = undefined;
                                            }
                                        }

                                        // merge line from top right
                                        const rightTopCellIndex = topCellIndexes[INDEX_RIGHT_LINE],
                                            rightTopCell = boundaries[rightTopCellIndex];
                                        if (rightTopCell) {
                                            const rightTopCellX1 = rightTopCell[INDEX_X1],
                                                rightTopCellY1 = rightTopCell[INDEX_Y1],
                                                rightTopCellX2 = rightTopCell[INDEX_X2],
                                                rightX1 = rightLine[INDEX_X1],
                                                rightX2 = rightLine[INDEX_X2];
                                            if (rightTopCellX1 === rightX2 && rightTopCellX2 === rightX1) {
                                                boundaries[rightTopCellIndex] = undefined;
                                                rightLine[INDEX_X1] = rightTopCellX1;
                                                rightLine[INDEX_Y1] = rightTopCellY1;
                                            }
                                        }
                                        // merge line from top left
                                        const leftTopCellIndex = topCellIndexes[INDEX_LEFT_LINE],
                                            leftTopCell = boundaries[leftTopCellIndex];
                                        if (leftTopCell) {
                                            const leftTopCellX1 = leftTopCell[INDEX_X1],
                                                leftTopCellX2 = leftTopCell[INDEX_X2],
                                                leftTopCellY2 = leftTopCell[INDEX_Y2],
                                                leftX1 = leftLine[INDEX_X1],
                                                leftX2 = leftLine[INDEX_X2];
                                            if (leftTopCellX1 === leftX2 && leftTopCellX2 === leftX1) {
                                                boundaries[leftTopCellIndex] = undefined;
                                                leftLine[INDEX_X2] = leftTopCellX2;
                                                leftLine[INDEX_Y2] = leftTopCellY2;
                                            }
                                        }
                                    }
                                }
                                const leftCellIndexes = col !== 0 ? currentRowIndexes.get(col - 1) : undefined;
                                if (leftCellIndexes) {

                                    //remove double lines from left
                                    const rightLeftCellIndex = leftCellIndexes[INDEX_RIGHT_LINE],
                                        rightLeftCell = boundaries[rightLeftCellIndex],
                                        rightLeftCellX1 = rightLeftCell[INDEX_X1],
                                        rightLeftCellY1 = rightLeftCell[INDEX_Y1],
                                        rightLeftCellX2 = rightLeftCell[INDEX_X2],
                                        rightLeftCellY2 = rightLeftCell[INDEX_Y2],
                                        leftX1 = leftLine[INDEX_X1],
                                        leftY1 = leftLine[INDEX_Y1],
                                        leftX2 = leftLine[INDEX_X2],
                                        leftY2 = leftLine[INDEX_Y2];

                                    if (leftX1 === rightLeftCellX2 && leftY1 === rightLeftCellY2 &&
                                        leftX2 === rightLeftCellX1 && leftY2 === rightLeftCellY1) {
                                        boundaries[rightLeftCellIndex] = undefined;
                                        leftLine = undefined;
                                    }

                                    //merge long lines from left top
                                    const topLeftCellIndex = leftCellIndexes[INDEX_TOP_LINE],
                                        topLeftCell = boundaries[topLeftCellIndex];
                                    if (topLeftCell && topLine) {
                                        const topLeftCellX1 = topLeftCell[INDEX_X1],
                                            topLeftCellY1 = topLeftCell[INDEX_Y1],
                                            topLeftCellY2 = topLeftCell[INDEX_Y2],
                                            topY1 = topLine[INDEX_Y1],
                                            topY2 = topLine[INDEX_Y2];
                                        if (topLeftCellY1 === topY2 && topLeftCellY2 === topY1 ) {
                                            boundaries[topLeftCellIndex] = undefined;
                                            topLine[INDEX_X1] = topLeftCellX1;
                                            topLine[INDEX_Y1] = topLeftCellY1;
                                        }
                                    }

                                    // merge long lines from left bottom
                                    const bottomLeftCellIndex = leftCellIndexes[INDEX_BOTTOM_LINE],
                                        bottomLeftCell = boundaries[bottomLeftCellIndex];
                                    if (bottomLeftCell) {
                                        const bottomLeftCellY1 = bottomLeftCell[INDEX_Y1],
                                            bottomLeftCellX2 = bottomLeftCell[INDEX_X2],
                                            bottomLeftCellY2 = bottomLeftCell[INDEX_Y2],
                                            bottomY1 = bottomLine[INDEX_Y1],
                                            bottomY2 = bottomLine[INDEX_Y2];
                                        if (bottomLeftCellY1 === bottomY2 && bottomLeftCellY2 === bottomY1 ) {
                                            boundaries[bottomLeftCellIndex] = undefined;
                                            //opposite direction
                                            bottomLine[INDEX_X2] = bottomLeftCellX2;
                                            bottomLine[INDEX_Y2] = bottomLeftCellY2;
                                        }
                                    }

                                }

                                if (topLine) {
                                    boundaries.push(topLine);
                                    currentAddedCellIndexes[INDEX_TOP_LINE] = boundaries.length - 1;
                                }
                                boundaries.push(rightLine);
                                currentAddedCellIndexes[INDEX_RIGHT_LINE] = boundaries.length - 1;
                                boundaries.push(bottomLine);
                                currentAddedCellIndexes[INDEX_BOTTOM_LINE] = boundaries.length - 1;
                                if (leftLine) {
                                    boundaries.push(leftLine);
                                    currentAddedCellIndexes[INDEX_LEFT_LINE] = boundaries.length - 1;
                                }
                                //save values indexes cols info
                                currentRowIndexes.set(col, currentAddedCellIndexes);
                            }

                        }
                        mapIndex++;
                    }
                    if (currentRowIndexes.size > 0) {
                        //save values indexes rows info
                        boundariesRowsIndexes.set(row, currentRowIndexes);
                    }
                    mapIndex += skipColsRight;
                }
                if (verticesBufferData.length > 0 && texturesBufferData.length > 0) {
                    //this.#bindTileImages(verticesBufferData, texturesBufferData, atlasImage, tileset.name, renderLayer._maskId);
                    tileImagesData.push([new Float32Array(verticesBufferData), new Float32Array(texturesBufferData), tileset.name, atlasImage]);
                }
            }
            
            if (setBoundaries) {
                // filter undefined value
                const filtered = boundaries.filter(array => array);
                pageData._addBoundariesArray(filtered);
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
                setBoundaries = renderLayer.setBoundaries,
                [ settingsWorldWidth, settingsWorldHeight ] = pageData.worldDimensions,
                [ canvasW, canvasH ] = pageData.canvasDimensions,
                [ xOffset, yOffset ] = pageData.worldOffset,
                verticesBufferData = [],
                texturesBufferData = [];
            
            let tileImagesData = [];
            if (!layerData) {
                Warning(WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }
            for (let i = 0; i <= tilesets.length - 1; i++) {
                const tileset = tilesets[i].data,
                    //tilesetImages = this.loader.getTilesetImageArray(tileset.name),
                    
                    tilewidth = tileset.tilewidth,
                    tileheight = tileset.tileheight,
                    atlasRows = tileset.imageheight / tileheight,
                    atlasColumns = tileset.imagewidth / tilewidth,
                    layerCols = layerData.width,
                    layerRows = layerData.height,
                    worldW = tilewidth * layerCols,
                    worldH = tileheight * layerRows,
                    visibleCols = Math.ceil(canvasW / tilewidth),
                    visibleRows = Math.ceil(canvasH / tileheight),
                    offsetCols = layerCols - visibleCols,
                    offsetRows = layerRows - visibleRows,
                    atlasImage = tilesetImages[i],
                    atlasWidth = atlasImage.width,
                    atlasHeight = atlasImage.height;
                    
                let mapIndex = 0;
                if (worldW !== settingsWorldWidth || worldH !== settingsWorldHeight) {
                    Warning(WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                    pageData._setWorldDimensions(worldW, worldH);
                }
                for (let row = 0; row < layerRows; row++) {
                    for (let col = 0; col < layerCols; col++) {
                        let tile = layerData.data[mapIndex],
                            mapPosX = col * dtwidth,
                            mapPosY = row * dtheight,
                            mapPosXWithOffset = col * dtwidth - xOffset,
                            mapPosYWithOffset = row * dtheight - yOffset;
                        
                        if (tile !== 0) {
                            tile -= 1;
                            const atlasPosX = tile % atlasColumns * tilewidth,
                                atlasPosY = Math.floor(tile / atlasColumns) * tileheight,
                                vecX1 = mapPosXWithOffset,
                                vecY1 = mapPosYWithOffset,
                                vecX2 = mapPosXWithOffset + tilewidth,
                                vecY2 = mapPosYWithOffset + tileheight,
                                texX1 = 1 / atlasWidth * atlasPosX,
                                texY1 = 1 / atlasHeight * atlasPosY,
                                texX2 = texX1 + (1 / atlasWidth * tilewidth),
                                texY2 = texY1 + (1 / atlasHeight * tileheight);
                            verticesBufferData.push(
                                vecX1, vecY1,
                                vecX2, vecY1,
                                vecX1, vecY2,
                                vecX1, vecY2,
                                vecX2, vecY1,
                                vecX2, vecY2);
                            texturesBufferData.push(
                                texX1, texY1,
                                texX2, texY1,
                                texX1, texY2,
                                texX1, texY2,
                                texX2, texY1,
                                texX2, texY2
                            );

                        }
                        mapIndex++;
                    }
                }
                const v = new Float32Array(verticesBufferData);
                const t = new Float32Array(texturesBufferData);
                tileImagesData.push([v, t, tileset.name, atlasImage]);
            }
            resolve(tileImagesData);
        });
    }

    /**
     * 
     * @param {TiledRenderLayer} renderLayer 
     * @param {ScreenPageData} pageData
     * @returns {Promise<void>}
     */
    #prepareRenderLayerWM = (renderLayer, pageData) => {
        return new Promise((resolve, reject) => {
            const tilemap = renderLayer.tilemap,
                tilesets = tilemap.tilesets,
                tilesetImages = renderLayer.tilesetImages,
                layerData = renderLayer.layerData,
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                offsetDataItemsFullNum = layerData.data.length,
                offsetDataItemsFilteredNum = layerData.data.filter((item) => item !== 0).length,
                setBoundaries = false, //renderLayer.setBoundaries,
                [ settingsWorldWidth, settingsWorldHeight ] = pageData.worldDimensions;
                //[ canvasW, canvasH ] = this.screenPageData.drawDimensions,
                //[ xOffset, yOffset ] = this.screenPageData.worldOffset;
            const tileImagesData = [];
            //clear data
            //this.layerDataFloat32.fill(0);
            this.layerDataFloat32.set(layerData.data);
            if (!layerData) {
                Warning(WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }
            
            for (let i = 0; i < tilesets.length; i++) {
                const tileset = tilesets[i].data,
                    //tilesetImages = this.loader.getTilesetImageArray(tileset.name),
                    tilewidth = tileset.tilewidth,
                    tileheight = tileset.tileheight,
                    //atlasRows = tileset.imageheight / tileheight,
                    atlasColumns = tileset.imagewidth / tilewidth,
                    layerCols = layerData.width,
                    layerRows = layerData.height,
                    //visibleCols = Math.ceil(canvasW / tilewidth),
                    //visibleRows = Math.ceil(canvasH / tileheight),
                    //offsetCols = layerCols - visibleCols,
                    //offsetRows = layerRows - visibleRows,
                    worldW = tilewidth * layerCols,
                    worldH = tileheight * layerRows,
                    atlasImage = tilesetImages[i],
                    atlasWidth = atlasImage.width,
                    atlasHeight = atlasImage.height,
                    items = layerRows * layerCols,
                    dataCellSizeBytes = 4,
                    vectorCoordsItemsNum = 12,
                    texturesCoordsItemsNum = 12,
                    vectorDataItemsNum = offsetDataItemsFilteredNum * vectorCoordsItemsNum,
                    texturesDataItemsNum = offsetDataItemsFilteredNum * texturesCoordsItemsNum;
                
                if (worldW !== settingsWorldWidth || worldH !== settingsWorldHeight) {
                    Warning(WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                    pageData._setWorldDimensions(worldW, worldH);
                }

                //if (this.canvas.width !== worldW || this.canvas.height !== worldH) {
                //    this._setCanvasSize(worldW, worldH);
                //}

                // boundaries cleanups every draw circle, we need to set world boundaries again
                if (this.#gameOptions.render.boundaries.mapBoundariesEnabled) {
                    pageData._setMapBoundaries();
                }
                this.calculateBufferData(dataCellSizeBytes, offsetDataItemsFullNum, vectorDataItemsNum, layerRows, layerCols, dtwidth, dtheight, tilewidth, tileheight, atlasColumns, atlasWidth, atlasHeight, setBoundaries);
                //const [verticesBufferData, texturesBufferData] = calculateBufferData(layerRows, layerCols, layerData.data, dtwidth, dtheight, tilewidth, tileheight, atlasColumns, atlasWidth, atlasHeight, setBoundaries);
                
                const verticesBufferData = this.layerDataFloat32.slice(offsetDataItemsFullNum, vectorDataItemsNum + offsetDataItemsFullNum),
                    texturesBufferData = this.layerDataFloat32.slice(vectorDataItemsNum + offsetDataItemsFullNum, vectorDataItemsNum + texturesDataItemsNum + offsetDataItemsFullNum);
                //console.log(verticesBufferData);
                //console.log(texturesBufferData);
                tileImagesData.push([verticesBufferData, texturesBufferData, tileset.name, atlasImage]);
                if (setBoundaries) {
                    pageData._mergeBoundaries();
                    renderLayer.setBoundaries = false;
                }
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
        return this.#triangulate(vertices);
    }

    /**
     * 
     * @param {Array<Array<number>>} polygonVertices 
     * @param {Array<number>} triangulatedPolygon 
     * @returns {Array<number>}
     */
    #triangulate (polygonVertices, triangulatedPolygon = []) {
        const len = polygonVertices.length,
            vectorsCS = (a, b, c) => crossProduct({x:c[0] - a[0], y: c[1] - a[1]}, {x:b[0] - a[0], y: b[1] - a[1]});

        if (len <= 3) {
            polygonVertices.forEach(vertex => {
                triangulatedPolygon.push(vertex[0]);
                triangulatedPolygon.push(vertex[1]);
            });
            return triangulatedPolygon;
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
                triangulatedPolygon.push(prevVertex[0]);
                triangulatedPolygon.push(prevVertex[1]);
                triangulatedPolygon.push(currentVertex[0]);
                triangulatedPolygon.push(currentVertex[1]);
                triangulatedPolygon.push(nextVertex[0]);
                triangulatedPolygon.push(nextVertex[1]);
                processedVertices = processedVertices.filter((val, index) => index !== i);
            } else {
                skipCount += 1;
                if (skipCount > processedVerticesLen) {
                    Exception(ERROR_CODES.DRAW_PREPARE_ERROR, "Can't extract triangles. Probably vertices input is not correct, or the order is wrong");
                }
            }
            i++;
        }
        
        return triangulatedPolygon;
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
        // already default value
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // for textures not power of 2 (texts for example)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, useMipMaps ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST);
        if (useMipMaps)
            gl.generateMipmap(gl.TEXTURE_2D);
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
}