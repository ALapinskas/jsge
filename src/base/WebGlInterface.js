import { ERROR_CODES, CONST, WARNING_CODES } from "../constants.js";
import { crossProduct } from "../utils.js";
import { Exception, Warning } from "./Exception.js";
import { WebGlDrawProgramData } from "./WebGlDrawProgramData.js";

export class WebGlInterface {
    /**
     * @type {string}
     */
    #vertexShaderSource;
    /**
     * @type {string}
     */
    #fragmentShaderSource;
    /**
     * @type {Map<string, WebGLProgram>}
     */
    #programs;
    /**
     * @type {Array<WebGlDrawProgramData>}
     */
    #programsData;
    /**
     * @type {Map<string, Object>}
     */
    #coordsLocations;
    /**
     * @type {number}
     */
    #verticesNumber;
    /**
     * @type {WebGLRenderingContext}
     */
    #gl;
    /**
     * @type {boolean}
     */
    #debug;
    /**
     * @type  {Map<string, number>}
     */
    #images_bind;
    /**
     * @type {WebGLBuffer | null}
     */
    #positionBuffer;
    /**
     * @type {WebGLBuffer | null}
     */
    #texCoordBuffer;

    constructor(context, debug) {
        if (!context || !(context instanceof WebGLRenderingContext)) {
            Exception(ERROR_CODES.UNEXPECTED_INPUT_PARAMS, " context parameter should be specified and equal to WebGLRenderingContext");
        }
        
        this.#gl = context;
        this.#debug = debug;
        this.#programs = new Map();
        this.#programsData = [];
        this.#coordsLocations = new Map();
        this.#images_bind = new Map();
        this.#verticesNumber = 0;
        this.#positionBuffer = this.#gl.createBuffer();
        this.#texCoordBuffer = this.#gl.createBuffer();
    }

    _fixCanvasSize(width, height) {
        this.#gl.viewport(0, 0, width, height);
    }

    _initiateImagesDrawProgram() {
        this.#vertexShaderSource = `
        attribute vec2 a_texCoord;

        attribute vec2 a_position;

        uniform vec2 u_translation;
        uniform float u_rotation;
        uniform vec2 u_scale;

        uniform vec2 u_resolution;

        varying vec2 v_texCoord;

        void main(void) {
            float c = cos(-u_rotation);
            float s = sin(-u_rotation);

            mat3 translationMatrix1 = mat3(
                1, 0, 0,
                0, 1, 0,
                u_translation.x, u_translation.y, 1
            );

            mat3 translationMatrix2 = mat3(
                1, 0, 0,
                0, 1, 0,
                -u_translation.x, -u_translation.y, 1
            );
            
            mat3 rotationMatrix = mat3(
                c, -s, 0,
                s, c, 0,
                0, 0, 1
            );

            mat3 scalingMatrix = mat3(
                u_scale.x, 0, 0,
                0, u_scale.y, 0,
                0, 0, 1
            );

            mat3 matrix = translationMatrix1 * rotationMatrix * translationMatrix2 * scalingMatrix;
            //Scale
            // vec2 scaledPosition = a_position * u_scale;
            // Rotate the position
            // vec2 rotatedPosition = vec2(
            //    scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
            //    scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x
            //);
            
            //vec2 position = rotatedPosition + u_translation;
            vec2 position = (matrix * vec3(a_position, 1)).xy;

            //convert position from pixels to 0.0 to 1.0
            vec2 zeroToOne = position / u_resolution;

            //convert from 0->1 to 0->2
            vec2 zeroToTwo = zeroToOne * 2.0;

            //convert from 0->2 to -1->+1
            vec2 clipSpace = zeroToTwo - 1.0;

            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            
            v_texCoord = a_texCoord;
        }
        `;
        this.#fragmentShaderSource = `
        precision mediump float;

        uniform sampler2D u_image;

        //texCoords passed in from the vertex shader
        varying vec2 v_texCoord;

        void main() {
            vec4 color = texture2D(u_image, v_texCoord);
            gl_FragColor = color;
        }
        `;
        const program = this.#initProgram(),
            programName = CONST.WEBGL.DRAW_PROGRAMS.IMAGES;

        this.#setProgram(programName, program);

        const gl = this.#gl,
            translationLocation = gl.getUniformLocation(program, "u_translation"),
            rotationRotation = gl.getUniformLocation(program, "u_rotation"),
            scaleLocation = gl.getUniformLocation(program, "u_scale"),
            resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution"),
            positionAttributeLocation = gl.getAttribLocation(program, "a_position"),
            texCoordLocation = gl.getAttribLocation(program, "a_texCoord"),
            u_imageLocation = gl.getUniformLocation(program, "u_image");

        gl.enable(gl.BLEND);
        // turn attribute on

        this.#coordsLocations.set(programName, {
            translationLocation,
            rotationRotation,
            scaleLocation,
            resolutionUniformLocation,
            positionAttributeLocation,
            texCoordLocation,
            u_imageLocation
        });
        return Promise.resolve();
    }

    _initPrimitivesDrawProgram() {
        this.#vertexShaderSource = `
        precision mediump float;

        attribute vec2 a_position;

        uniform vec2 u_translation;
        uniform float u_rotation;
        uniform vec2 u_scale;

        uniform vec2 u_resolution;

        void main(void) {
            float c = cos(-u_rotation);
            float s = sin(-u_rotation);

            mat3 translationMatrix1 = mat3(
                1, 0, 0,
                0, 1, 0,
                u_translation.x, u_translation.y, 1
            );

            //mat3 translationMatrix2 = mat3(
            //    1, 0, 0,
            //    0, 1, 0,
            //    -u_translation.x, -u_translation.y, 1
            //);
            
            mat3 rotationMatrix = mat3(
                c, -s, 0,
                s, c, 0,
                0, 0, 1
            );

            mat3 scalingMatrix = mat3(
                u_scale.x, 0, 0,
                0, u_scale.y, 0,
                0, 0, 1
            );

            //mat3 matrix = translationMatrix1 * rotationMatrix * translationMatrix2 * scalingMatrix;

            mat3 matrix = translationMatrix1 * rotationMatrix * scalingMatrix;

            //Scale
            // vec2 scaledPosition = a_position * u_scale;
            // Rotate the position
            // vec2 rotatedPosition = vec2(
            //    scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
            //    scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x
            //);
            
            //vec2 position = rotatedPosition + u_translation;
            vec2 position = (matrix * vec3(a_position, 1)).xy;

            //convert position from pixels to 0.0 to 1.0
            vec2 zeroToOne = position / u_resolution;

            //convert from 0->1 to 0->2
            vec2 zeroToTwo = zeroToOne * 2.0;

            //convert from 0->2 to -1->+1
            vec2 clipSpace = zeroToTwo - 1.0;

            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        }
        `;
        this.#fragmentShaderSource = `
        precision mediump float;

        uniform vec4 u_color;
        uniform float u_fade_min; 
        uniform float u_fade_max;
        uniform vec2 a_position;
        uniform vec2 u_resolution;
        uniform vec2 u_translation;
        
        void main(void) {
            vec4 p = u_color;
            if (u_fade_min > 0.0) {
                vec2 fix_tr = vec2(u_translation.x, u_resolution.y - u_translation.y); 
                float distance = distance(fix_tr.xy, gl_FragCoord.xy);
                if (u_fade_min <= distance && distance <= u_fade_max) {
                    float percent = ((distance - u_fade_max) / (u_fade_min - u_fade_max)) * 100.0;
                    p.a = u_color.a * (percent / 100.0);
                }
            }

            gl_FragColor = p;
        }
        `;
        const program = this.#initProgram(),
            programName = CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES;
        this.#setProgram(programName, program);

        const gl = this.#gl,
            translationLocation = gl.getUniformLocation(program, "u_translation"),
            rotationRotation = gl.getUniformLocation(program, "u_rotation"),
            scaleLocation = gl.getUniformLocation(program, "u_scale"),
            resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution"),
            colorUniformLocation = gl.getUniformLocation(program, "u_color"),
            positionAttributeLocation = gl.getAttribLocation(program, "a_position"),
            fadeMinLocation = gl.getUniformLocation(program, "u_fade_min"),
            fadeMaxLocation =  gl.getUniformLocation(program, "u_fade_max");

        this.#coordsLocations.set(programName, {
            translationLocation,
            rotationRotation,
            scaleLocation,
            resolutionUniformLocation,
            colorUniformLocation,
            positionAttributeLocation,
            fadeMinLocation,
            fadeMaxLocation
        });
        return Promise.resolve();
    }

    _initWebGlAttributes() {
        const gl = this.#gl;
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        return Promise.resolve();
    }
    
    /**
     * 
     * @param {*} vectors 
     * @param {*} textures 
     * @param {*} image 
     * @param {*} imageName 
     * @param {*} drawMask 
     * @param {*} rotation 
     * @param {*} translation 
     * @param {*} scale 
     * @returns {Promise<void>}
     */
    _bindTileImages(vectors, textures, image, imageName, shapeMaskId, drawMask = ["SRC_ALPHA", "ONE_MINUS_SRC_ALPHA"], rotation = 0, translation = [0, 0], scale = [1, 1]) {
        return new Promise((resolve) => {
            const programName = CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
                existingProgramData = this.#programsData.filter((data) => data.programName === programName);
                
            let isProgramDataMerged = false;

            for(let i = 0; i < existingProgramData.length; i++) {
                const data = existingProgramData[i];
                if (data.isProgramDataCanBeMerged(imageName, shapeMaskId, drawMask, 0, [0,0], [1,1])) {
                    data.mergeProgramData(vectors, textures);
                    isProgramDataMerged = true;
                }
            }

            if (!isProgramDataMerged) {
                this.#programsData.push(new WebGlDrawProgramData(programName, vectors, textures, image, imageName, shapeMaskId, drawMask, rotation, translation, scale));
            }

            resolve();
        });
    }
    
    /**
     * 
     * @returns {Promise<void>}
     */
    _executeTileImagesDraw() {
        return new Promise((resolve) => {
            const programName = CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
                program = this.#getProgram(programName),
                { translationLocation,
                    rotationRotation,
                    scaleLocation,
                    resolutionUniformLocation,
                    positionAttributeLocation,
                    texCoordLocation,
                    u_imageLocation } = this.#coordsLocations.get(programName),
                gl = this.#gl,
                programsData = this.#programsData.filter(programData => programData.programName === programName);
           
            gl.useProgram(program);

            for (let i = 0; i < programsData.length; i++) {
                const data = programsData[i];
                // set the resolution
                gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
                gl.uniform2f(translationLocation, data.translation[0], data.translation[1]);
                gl.uniform2f(scaleLocation, data.scale[0], data.scale[1]);
                gl.uniform1f(rotationRotation, data.rotation);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vectors), gl.STATIC_DRAW);

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
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.textures), gl.STATIC_DRAW);

                gl.enableVertexAttribArray(texCoordLocation);
                gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, offset);

                let bind_number  = this.#images_bind.get(data.imageName);

                if (!bind_number ) {
                    bind_number  = this.#images_bind.size + 1;
                    gl.activeTexture(gl["TEXTURE" + bind_number]);
                    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data.image);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    this.#images_bind.set(data.imageName, bind_number);
                } else {
                    gl.activeTexture(gl["TEXTURE" + bind_number]);
                }
                gl.uniform1i(u_imageLocation, bind_number);
                gl.blendFunc(gl[data.drawMask[0]], gl[data.drawMask[1]]);
                this.#verticesNumber = data.programVerticesNum;
                if (data.shapeMaskId) {
                    gl.stencilFunc(gl.EQUAL, data.shapeMaskId, 0xFF);
                    //gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
                }
                
                // Upload the image into the texture.
                this.#executeGlslProgram();
            }
            //clear the array
            this.#programsData = [];
            resolve();
        });
    }

    _bindAndDrawTileImages(vectors, textures, image, image_name, rotation = 0, translation = [0, 0], scale = [1, 1], shapeMaskId) {
        const programName = CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
            program = this.#getProgram(programName),
            { translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                positionAttributeLocation,
                texCoordLocation,
                u_imageLocation } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vectors), gl.STATIC_DRAW);

        this.#verticesNumber += vectors.length / 2;
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

        let bind_number  = this.#images_bind.get(image_name);

        if (!bind_number ) {
            bind_number  = this.#images_bind.size + 1;

            gl.activeTexture(gl["TEXTURE" + bind_number]);
            gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
            
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            this.#images_bind.set(image_name, bind_number);
        } else {
            gl.activeTexture(gl["TEXTURE" + bind_number]);
        }
        gl.uniform1i(u_imageLocation, bind_number );
        // make image transparent parts transparent
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        if (shapeMaskId) {
            gl.stencilFunc(gl.EQUAL, shapeMaskId, 0xFF);
            //gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        }
        // Upload the image into the texture.
        this.#executeGlslProgram();
    }

    _bindText(x, y, renderObject) {
        const programName = CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
            program = this.#getProgram(programName),
            { translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                positionAttributeLocation,
                texCoordLocation,
                u_imageLocation } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        //@toDo: add additional info to the #images_bind and avoid this call, if image is already created
        const { boxWidth, boxHeight, ctx } = this.#createCanvasText(renderObject),
            texture = ctx.canvas,
            image_name = renderObject.text;

        y = y - boxHeight;

        const rotation = 0, 
            translation = [0, 0], 
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

        gl.useProgram(program);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
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
        
        this.#verticesNumber += 6;
        // remove box
        // fix text edges
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        //gl.depthMask(false);
        let bind_number = this.#images_bind.get(image_name);
        if (!bind_number) {
            bind_number  = this.#images_bind.size + 1;

            gl.activeTexture(gl["TEXTURE" + bind_number]);
            gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
            // Upload the image into the texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            // As image properties such as text stroke changes, image_name still the same,
            // and image won't replaced
            //this.#images_bind.set(image_name, bind_number);
        } else {
            gl.activeTexture(gl["TEXTURE" + bind_number]);
        }
        gl.uniform1i(u_imageLocation, bind_number);
        //console.log("vertex attrib 1 :", gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING));
        this.#executeGlslProgram();
    }

    _bindPrimitives(renderObject, rotation = 0, translation = [0, 0], scale = [1, 1]) {
        const programName = CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.#getProgram(programName),
            { 
                translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation,
                fadeMinLocation
            } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        gl.uniform1f(fadeMinLocation, 0);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        switch (renderObject.type) {
        case CONST.DRAW_TYPE.RECTANGLE:
            this.#setSingleRectangle(renderObject.width, renderObject.height);
            this.#verticesNumber += 6;
            break;
        case CONST.DRAW_TYPE.TEXT:
            break;
        case CONST.DRAW_TYPE.CIRCLE: {
            const coords = renderObject.vertices;
            gl.bufferData(this.#gl.ARRAY_BUFFER, 
                new Float32Array(coords), this.#gl.STATIC_DRAW);
            this.#verticesNumber += coords.length / 2;
            break;
        }
        case CONST.DRAW_TYPE.POLYGON: {
            const triangles = this.#triangulatePolygon(renderObject.vertices);
            this.#bindPolygon(triangles);
            const len = triangles.length;
            if (len % 3 !== 0) {
                Warning(WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, `polygons ${renderObject.id}, vertices are not correct, skip drawing`);
                return;
            }
            this.#verticesNumber += len / 2;
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
        
        if (renderObject.blendFunc) {
            gl.blendFunc(renderObject.blendFunc[0], renderObject.blendFunc[1]);
        }
        if (renderObject.cut) {
            gl.blendEquation(gl.FUNC_SUBTRACT);
        }
        //disable attribute which is not used in this program
        //if (gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_ENABLED)) {
        //gl.disableVertexAttribArray(1);
        //}
        this.#executeGlslProgram(0, null, true);
    }

    _drawLines(linesArray, color, lineWidth = 1, rotation = 0, translation = [0, 0]) {
        const programName = CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.#getProgram(programName),
            { resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation,
            
                translationLocation,
                rotationRotation,
                scaleLocation,
                fadeMinLocation
            } = this.#coordsLocations.get(programName),
            gl = this.#gl;

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

        this.#verticesNumber += linesArray.length / 2;
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

        //gl.blendFunc(gl.ONE, gl.DST_COLOR );
        
        //disable attribute which is not used in this program
        //if (gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_ENABLED)) {
        //    gl.disableVertexAttribArray(1);
        //}
        this.#executeGlslProgram(0, gl.LINES);
    }

    _drawPolygon(vertices, color, lineWidth = 1, rotation = 0, translation = [0, 0]) {
        const programName = CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.#getProgram(programName),
            { resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation,
            
                translationLocation,
                rotationRotation,
                scaleLocation,
                fadeMinLocation
            } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, translation[0], translation[1]);
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
        this.#verticesNumber += polygonVerticesNum / 2;
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const colorArray = this.#rgbaToArray(color);
        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);

        this.#executeGlslProgram(0, null);
    }

    _bindConus(renderObject, rotation = 0, translation = [0, 0], scale = [1, 1]) {
        const programName = CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.#getProgram(programName),
            { 
                translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation,
                fadeMinLocation,
                fadeMaxLocation
            } = this.#coordsLocations.get(programName),
            gl = this.#gl,
            coords = renderObject.vertices,
            fillStyle = renderObject.bgColor,
            fade_min = renderObject.fade_min,
            fadeLen = renderObject.radius;
            
        gl.useProgram(program);
        
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
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

        this.#verticesNumber += coords.length / 2;

        if (renderObject.blendFunc) {
            gl.blendFunc(renderObject.blendFunc[0], renderObject.blendFunc[1]);
        }

        if (renderObject.cut) {
            // cut bottom 
            gl.blendEquation(gl.FUNC_SUBTRACT);
            //gl.blendFunc( gl.ONE, gl.ONE );
            //gl.blendFunc(gl.ONE, gl.DST_COLOR);
        } //else {
        //gl.disable(gl.BLEND);
        // make transparent
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        //}

        const colorArray = this.#rgbaToArray(fillStyle);

        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        //disable attribute which is not used in this program
        //if (gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_ENABLED)) {
        //gl.disableVertexAttribArray(1);
        //}
        if (renderObject.isMaskAttached) {
            gl.stencilFunc(gl.EQUAL, renderObject._maskId, 0xFF);
        } else {
            gl.stencilFunc(gl.ALWAYS, renderObject.id, 0xFF);
        }
        //gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        this.#executeGlslProgram(0, gl.TRIANGLE_FAN, true);
    }

    _clearView() {
        const gl = this.#gl;
        // Set clear color to black, fully opaque
        this.#programsData = [];
        gl.clearColor(0, 0, 0, 0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    }

    #setProgram(name, program) {
        this.#programs.set(name, program);
    }

    #getProgram(name) {
        return this.#programs.get(name);
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
    
    #executeGlslProgram(offset = 0, primitiveType, resetEquation) {
        const primitiveTypeValue = primitiveType ? primitiveType : this.#gl.TRIANGLES,
            gl = this.#gl;
            
        const err = this.#debug ? gl.getError() : 0;
        if (err !== 0) {
            console.error(err);
            throw new Error("Error num: " + err);
        } else {
            gl.drawArrays(primitiveTypeValue, offset, this.#verticesNumber);
            this.#verticesNumber = 0;
            // set blend to default
            gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
            if (resetEquation) {
                gl.blendEquation(  gl.FUNC_ADD );
            }
        }
    }

    /**
     * @returns {WebGLProgram}
     */
    #initProgram() {
        const gl = this.#gl,
            program = gl.createProgram();

        if (program) {
            const compVertexShader = this.#compileShader(this.#vertexShaderSource, gl.VERTEX_SHADER);
            if (compVertexShader) {
                gl.attachShader(program, compVertexShader);
            } else {
                Exception(ERROR_CODES.WEBGL_ERROR, "#compileShader(vertexShaderSource) is null");
            }

            const compFragmentShader = this.#compileShader(this.#fragmentShaderSource, gl.FRAGMENT_SHADER);
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
     * @param {*} renderObject 
     * @returns {{boxWidth:number, boxHeight:number, ctx:CanvasRenderingContext2D}}
     */
    #createCanvasText(renderObject) {
        const ctx = document.createElement("canvas").getContext("2d");
        if (ctx) { 
            ctx.font = renderObject.font;
            renderObject._textMetrics = ctx.measureText(renderObject.text);
            const boxWidth = renderObject.boundariesBox.width, 
                boxHeight = renderObject.boundariesBox.height;
            ctx.canvas.width = boxWidth;
            ctx.canvas.height = boxHeight;
            ctx.font = renderObject.font;
            ctx.textBaseline = "bottom";// bottom
            if (renderObject.fillStyle) {
                ctx.fillStyle = renderObject.fillStyle;
                ctx.fillText(renderObject.text, 0, boxHeight);
            } 
            if (renderObject.strokeStyle) {
                ctx.strokeStyle = renderObject.strokeStyle;
                ctx.strokeText(renderObject.text, 0, boxHeight);
            }
            return { boxWidth, boxHeight, ctx };
        } else {
            Exception(ERROR_CODES.WEBGL_ERROR, "can't getContext('2d')");
        }
    }

    #compileShader(shaderSource, shaderType) {
        const shader = this.#gl.createShader(shaderType);
        if (shader) {
            this.#gl.shaderSource(shader, shaderSource);
            this.#gl.compileShader(shader);

            if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
                const info = this.#gl.getShaderInfoLog(shader);
                Exception(ERROR_CODES.WEBGL_ERROR, "Couldn't compile webGl program. \n\n" + info);
            }
        } else {
            Exception(ERROR_CODES.WEBGL_ERROR, `gl.createShader(${shaderType}) is null`);
        }
        return shader;
    }

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
}