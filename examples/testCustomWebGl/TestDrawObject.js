class CustomDrawObject {
    #renderStartTime;
    constructor(x, y, w, h, noiseImg, picImg, rocksImg) {
        //console.log("customDrawObject is called. Create an object");
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.noiseImg = noiseImg;
        this.picImg = picImg; 
        this.rocksImg = rocksImg;
        this.type = "custom_webgl_object";
    }

    set renderStartTime(time) {
        this.#renderStartTime = time;
    }

    get renderPlaybackTime() {
        return (Date.now() - this.#renderStartTime) / 1000;
    }
}

const createCustomDrawObjectInstance = (x, y, w, h, noiseImg, picImg, rocksImg) => {
    const renderObject = new CustomDrawObject(x, y, w, h, noiseImg, picImg, rocksImg);
    return renderObject;
}

const drawCustomObject = (object, gl, pageData, program, vars) => {
    //console.log("draw custom object method called");
    //console.log(object.webglProgramName);
    const noiseImg = object.noiseImg,
        picImg = object.picImg,
        rocksImg = object.rocksImg;
        
    const {
        u_resolution: resolutionUniformLocation,
        a_texCoord: texCoordLocation,
        a_position: positionAttributeLocation,
        image0: image0Location,
        image1: image1Location,
        image2: image2Location,
        u_time: timeLocation
    } = vars;
    
    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(timeLocation, object.renderPlaybackTime)

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

    gl.bufferData(gl.ARRAY_BUFFER, 
        new Float32Array([
            0, 0,
            object.w, 0,
            0, object.h,
            0, object.h,
            object.w, 0,
            object.w, object.h]), gl.STATIC_DRAW);

    const size = 2,
        type = gl.FLOAT, // data is 32bit floats
        normalize = false,
        stride = 0, // move forward size * sizeof(type) each iteration to get next position
        offset = 0; // start of beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    //gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    bindTexture(gl, gl.createTexture(), noiseImg, image0Location, 5);
    bindTexture(gl, gl.createTexture(), picImg, image1Location, 6);
    bindTexture(gl, gl.createTexture(), rocksImg, image2Location, 7);
    return Promise.resolve([6, gl.TRIANGLES]);//[verticesNumber, gl.TRIANGLES]
}

const bindTexture = (gl, texture, textureImage, u_imageLocation, textureNum) => {
    gl.activeTexture(gl.TEXTURE0 + textureNum);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
    // already default value
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // for textures not power of 2 (texts for example)
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // растягивание текстуры
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // растягивание текстуры
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);//gl.LINEAR
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.uniform1i(u_imageLocation, textureNum);
}

export { CustomDrawObject, createCustomDrawObjectInstance, drawCustomObject }