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

    uniform sampler2D u_image;

    //texCoords passed in from the vertex shader
    varying vec2 v_texCoord;
    void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        gl_FragColor = color;
    }`;
const imgMUniforms = ["u_resolution", "u_image"];
const imgMAttributes = ["a_position", "a_texCoord"];

export { imgMVertexShader, imgMFragmentShader, imgMUniforms, imgMAttributes };