import { ERROR_CODES, CONST, WARNING_CODES } from "../constants.js";
import { crossProduct } from "../utils.js";
import { Exception, Warning } from "./Exception.js";
import { WebGlDrawProgramData } from "./WebGlDrawProgramData.js";

export class WebGlInterface {
    #vertexShaderSource;
    #fragmentShaderSource;
    /**
     * @type {Map<String, WebGLProgram>}
     */
    #programs;
    /**
     * @type {Map<String, WebGLProgram>}
     */
    #programsData;
    /**
     * @type {WebGlDrawProgramData[]}
     */
    #coordsLocations;
    /**
     * @type {Map<String, ArrayBuffer>}
     */
    #buffers;
    /**
     * @type {Number}
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
     * @param  {Map<String, Number>}
     */
    #images_bind;
    /**
     * @param {Map<String, WebGLBuffer>}
     */
    #positionBuffer;
    /**
     * @param {Map<String, WebGLBuffer>}
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
        this.#buffers = [];
        this.#verticesNumber = 0;
        this.#positionBuffer = this.#gl.createBuffer();
        this.#texCoordBuffer = this.#gl.createBuffer();
    }

    get count() {
        return this.#verticesNumber;
    }

    setProgram(name, program) {
        this.#programs.set(name, program);
    }

    getProgram(name) {
        return this.#programs.get(name);
    }

    fixCanvasSize(width, height) {
        this.#gl.viewport(0, 0, width, height);
    }

    initiateImagesDrawProgram() {
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
        const program = this.initProgram(),
            programName = CONST.WEBGL.DRAW_PROGRAMS.IMAGES;

        this.setProgram(programName, program);

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

    initPrimitivesDrawProgram() {
        this.#vertexShaderSource = `
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
        void main(void) {
            gl_FragColor = u_color;
        }
        `;
        const program = this.initProgram(),
            programName = CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES;
        this.setProgram(programName, program);

        const gl = this.#gl,
            translationLocation = gl.getUniformLocation(program, "u_translation"),
            rotationRotation = gl.getUniformLocation(program, "u_rotation"),
            scaleLocation = gl.getUniformLocation(program, "u_scale"),
            resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution"),
            colorUniformLocation = gl.getUniformLocation(program, "u_color"),
            positionAttributeLocation = gl.getAttribLocation(program, "a_position");

        this.#coordsLocations.set(programName, {
            translationLocation,
            rotationRotation,
            scaleLocation,
            resolutionUniformLocation,
            colorUniformLocation,
            positionAttributeLocation
        });
        return Promise.resolve();
    }
    
    bindTileImages(vectors, textures, image, imageName, drawMask = ["SRC_ALPHA", "ONE_MINUS_SRC_ALPHA"], rotation = 0, translation = [0, 0], scale = [1, 1]) {
        return new Promise((resolve) => {
            const programName = CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
                existingProgramData = this.#programsData.filter((data) => data.programName === programName);
                
            let isProgramDataMerged = false;

            for(let i = 0; i < existingProgramData.length; i++) {
                const data = existingProgramData[i];
                if (data.isProgramDataCanBeMerged(imageName, drawMask)) {
                    data.mergeProgramData(vectors, textures);
                    isProgramDataMerged = true;
                }
            }

            if (!isProgramDataMerged) {
                this.#programsData.push(new WebGlDrawProgramData(programName, vectors, textures, image, imageName, drawMask, rotation, translation, scale));
            }

            resolve();
        });
    }
    
    executeTileImagesDraw() {
        return new Promise((resolve) => {
            const programName = CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
                program = this.getProgram(programName),
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
                // Upload the image into the texture.
                this.executeGlslProgram();
            }

            resolve();
        });
    }

    bindAndDrawTileImages(vectors, textures, image, image_name, rotation = 0, translation = [0, 0], scale = [1, 1]) {
        const programName = CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
            program = this.getProgram(programName),
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

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // Upload the image into the texture.
        this.executeGlslProgram();
    }

    bindText(x, y, renderObject) {
        const programName = CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
            program = this.getProgram(programName),
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
        gl.depthMask(false);
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
        this.executeGlslProgram();
    }

    bindPrimitives(renderObject, rotation = 0, translation = [0, 0], scale = [1, 1]) {
        const programName = CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.getProgram(programName),
            { 
                translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation 
            } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        switch (renderObject.type) {
            case CONST.DRAW_TYPE.RECTANGLE:
                this.#setSingleRectangle(renderObject.width, renderObject.height);
                this.#verticesNumber += 6;
                break;
            case CONST.DRAW_TYPE.TEXT:
                break;
            case CONST.DRAW_TYPE.CIRCLE:
                //this.#bindCircle(x, y, renderObject);
                break;
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
        
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.blendFunc(gl.ONE, gl.DST_COLOR );
        
        if (renderObject.subtract) {
            gl.blendEquation(gl.FUNC_SUBTRACT);
            //gl.blendFunc(gl.ONE, gl.DST_COLOR);
        }
        //disable attribute which is not used in this program
        //if (gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_ENABLED)) {
        //gl.disableVertexAttribArray(1);
        //}
        this.executeGlslProgram(0, null, true);
    }

    drawLines(linesArray, color, lineWidth = 1, rotation = 0, translation = [0, 0]) {
        const programName = CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.getProgram(programName),
            { resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation,
            
                translationLocation,
                rotationRotation,
                scaleLocation} = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, 1, 1);
        gl.uniform1f(rotationRotation, rotation);

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

        //gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        //gl.blendFunc(gl.ONE, gl.DST_COLOR );
        
        //disable attribute which is not used in this program
        //if (gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_ENABLED)) {
        //    gl.disableVertexAttribArray(1);
        //}
        this.executeGlslProgram(0, gl.LINES);
    }

    drawPolygon(vertices, color, lineWidth = 1, rotation = 0, translation = [0, 0]) {
        const programName = CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.getProgram(programName),
            { resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation,
            
                translationLocation,
                rotationRotation,
                scaleLocation} = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, 1, 1);
        gl.uniform1f(rotationRotation, rotation);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        const triangles = this.#triangulatePolygon(vertices);
        
        const polygonVerticesNum = triangles.length;
        if (polygonVerticesNum % 3 !== 0) {
            Warning(WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, `polygon boundaries vertices are not correct, skip drawing`);
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

        this.executeGlslProgram(0, null);
    }

    #bindPolygon(vertices) {
        this.#gl.bufferData(
            this.#gl.ARRAY_BUFFER, 
            new Float32Array(vertices),
            this.#gl.STATIC_DRAW);
    }

    bindConus(x, y, renderObject, rotation = 0, translation = [0, 0], scale = [1, 1]) {
        const programName = CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.getProgram(programName),
            { 
                translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation 
            } = this.#coordsLocations.get(programName),
            gl = this.#gl,
            coords = renderObject.vertices,
            fillStyle = renderObject.bgColor,
            cut = renderObject.subtract;

        gl.useProgram(program);
        
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        
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

        if (cut) {
            // cut bottom 
            gl.blendEquation(gl.FUNC_SUBTRACT);
            //gl.blendFunc( gl.ONE, gl.ONE );
            gl.blendFunc(gl.ONE, gl.DST_COLOR);
        } else {
            //gl.disable(gl.BLEND);
            // make transparent
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }

        const colorArray = this.#rgbaToArray(fillStyle);

        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        //disable attribute which is not used in this program
        //if (gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_ENABLED)) {
        //gl.disableVertexAttribArray(1);
        //}
        this.executeGlslProgram(0, gl.TRIANGLE_FAN, true);
    }

    #randomInt(range) {
        return Math.floor(Math.random() * range);
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
    
    executeGlslProgram(offset = 0, primitiveType, resetEquation) {
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
            if (resetEquation) {
                gl.blendEquation(  gl.FUNC_ADD );
            }
        }
    }

    initProgram() {
        const gl = this.#gl,
            program = gl.createProgram();

        gl.attachShader(program, this.#compileShader(this.#vertexShaderSource, gl.VERTEX_SHADER));
        gl.attachShader(program, this.#compileShader(this.#fragmentShaderSource, gl.FRAGMENT_SHADER));

        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            Exception(ERROR_CODES.WEBGL_ERROR, `Could not compile WebGL program. \n\n${info}`);
        }
        return program;
    }

    clearView() {
        const gl = this.#gl;
        // Set clear color to black, fully opaque
        this.#programsData = [];
        gl.clearColor(0, 0, 0, 0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    #createCanvasText(renderObject) {
        const ctx = document.createElement("canvas").getContext("2d");

        ctx.font = renderObject.font;
        renderObject.textMetrics = ctx.measureText(renderObject.text);
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
    }

    #compileShader(shaderSource, shaderType) {
        const shader = this.#gl.createShader(shaderType);
        this.#gl.shaderSource(shader, shaderSource);
        this.#gl.compileShader(shader);

        if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
            const info = this.#gl.getShaderInfoLog(shader);
            Exception(ERROR_CODES.WEBGL_ERROR, "Couldn't compile webGl program. \n\n" + info);
        }
        return shader;
    }

    #rgbaToArray (rgbaColor) {
        return rgbaColor.replace("rgba(", "").replace(")", "").split(",").map((item) => Number(item.trim()));
    }

    #triangulatePolygon(vertices) {
        const clonedVertices = [...vertices];
        return this.#triangulate(clonedVertices);
    }

    #triangulate (polygonVertices, triangulatedPolygon = []) {
        const len = polygonVertices.length,
            vectorsCS = (a, b, c) => crossProduct({x:c.x - a.x, y: c.y - a.y}, {x:b.x - a.x, y: b.y - a.y});

        if (len <= 3) {
            polygonVertices.forEach(vertex => {
                triangulatedPolygon.push(vertex.x);
                triangulatedPolygon.push(vertex.y);
            });
            return triangulatedPolygon;
        }
        const verticesSortedByY = [...polygonVertices].sort((curr, next) => next.y - curr.y);
        const topVertexIndex = polygonVertices.indexOf(verticesSortedByY[0]),
            startVertexIndex = topVertexIndex !== len - 1 ? topVertexIndex + 1 : 0;
        
        for (let j = startVertexIndex; j < polygonVertices.length + startVertexIndex; j++) {
            let i = j;
            const len =  polygonVertices.length;
            
            if (i >= len) {
                i = j - len;
            }
    
            const prevVertex = i === 0 ? polygonVertices[len - 1] : polygonVertices[i - 1],
                currentVertex = polygonVertices[i],
                nextVertex = len === i + 1 ? polygonVertices[0] : polygonVertices[i + 1];

    
            const cs = vectorsCS(prevVertex, currentVertex, nextVertex);
    
            if (cs < 0) {
                triangulatedPolygon.push(prevVertex.x);
                triangulatedPolygon.push(prevVertex.y);
                triangulatedPolygon.push(currentVertex.x);
                triangulatedPolygon.push(currentVertex.y);
                triangulatedPolygon.push(nextVertex.x);
                triangulatedPolygon.push(nextVertex.y);
                polygonVertices.splice(i, 1);
            }
        }
        
        if (polygonVertices.length >= 4) {
            return this.#triangulate(polygonVertices, triangulatedPolygon);
        } else {
            return triangulatedPolygon;
        }
    }
}