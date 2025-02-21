const imgMVertexShader =  `
    attribute vec2 a_texCoord;

    attribute vec2 a_position;

    uniform vec2 u_resolution;

    varying vec2 v_texCoord;

    void main(void) {
        vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_texCoord = a_texCoord;
    }`;

const imgMFragmentShader = `
    precision mediump float;

    uniform sampler2D u_images[16];

    //texCoords passed in from the vertex shader
    varying vec2 v_texCoord;
    varying float v_textureId;
    
    varying vec4 vColor;
    void main () {
        vec4 color;
        if(v_textureId < 0.5) {
            color = texture2D(u_images[0], v_texCoord);
        }
        else if(v_textureId < 1.5) {
            color = texture2D(u_images[1], v_texCoord);
        }
        else if(v_textureId < 2.5) {
            color = texture2D(u_images[2], v_texCoord);
        }
        else if(v_textureId < 3.5) {
            color = texture2D(u_images[3], v_texCoord);
        }
        else if(v_textureId < 4.5) {
            color = texture2D(u_images[4], v_texCoord);
        }
        else if(v_textureId < 5.5) {
            color = texture2D(u_images[5], v_texCoord);
        }
        else if(v_textureId < 6.5) {
            color = texture2D(u_images[6], v_texCoord);
        }
        else if(v_textureId < 7.5) {
            color = texture2D(u_images[7], v_texCoord);
        }
        else if(v_textureId < 8.5) {
            color = texture2D(u_images[8], v_texCoord);
        }
        else if(v_textureId < 9.5) {
            color = texture2D(u_images[9], v_texCoord);
        }
        else if(v_textureId < 10.5) {
            color = texture2D(u_images[10], v_texCoord);
        }
        else if(v_textureId < 11.5) {
            color = texture2D(u_images[11], v_texCoord);
        }
        else if(v_textureId < 12.5) {
            color = texture2D(u_images[12], v_texCoord);
        }
        else if(v_textureId < 13.5) {
            color = texture2D(u_images[13], v_texCoord);
        }
        else if(v_textureId < 14.5) {
            color = texture2D(u_images[14], v_texCoord);
        }
        else {
            color = texture2D(u_images[15], v_texCoord);
        }
        gl_FragColor = color * vColor;
    }`;
const imgMUniforms = ["u_resolution", "u_image"];
const imgMAttributes = ["a_position", "a_texCoord"];

export { imgMVertexShader, imgMFragmentShader, imgMUniforms, imgMAttributes };