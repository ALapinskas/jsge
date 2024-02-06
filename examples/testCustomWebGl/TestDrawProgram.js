const testVertexShader =  `
    attribute vec2 a_texCoord;

    attribute vec2 a_position;

    uniform vec2 u_resolution;
    varying vec2 v_texCoord;

    void main(void) {
        vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;

        gl_Position = vec4(clipSpace, 0, 1);
        
        v_texCoord = a_texCoord;
    }
`;
const testFragmentShader = 
`
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform float u_time;
    uniform sampler2D image0;
    uniform sampler2D image1;
    uniform sampler2D image2;

    varying vec2 v_texCoord;

    float avg(vec4 color) {
        return (color.r + color.g + color.b)/3.0;
    }

    void mainImage( out vec4 fragColor, in vec2 v_texCoord )
    {
        // Flow Speed, increase to make the water flow faster.
        float speed = 0.03;
        
        // Water Scale, scales the water, not the background.
        float scale = 1.0;
        
        // Water opacity, higher opacity means the water reflects more light.
        float opacity = 0.01;
    
        vec2 scaledUv = v_texCoord * scale;
        
        vec4 water1 = texture2D(image0, scaledUv + u_time*speed);
    
        // Background image
        // vec4 background = texture2D(image1, vec2(v_texCoord) + avg(water1) * 0.01);
        // vec4 background = texture2D(image1, vec2(v_texCoord) * 1.0);
        vec4 background = texture2D(image1, vec2(v_texCoord) + avg(water1) * 0.01);
        // Output to screen
        fragColor = background;
    }

    void main(void)
    {
        mainImage(gl_FragColor, v_texCoord.xy);
    }
`;
const testUniforms = ["u_resolution", "image0", "image1", "image2", "u_time"];
const testAttributes = ["a_position", "a_texCoord"];

export { testVertexShader, testFragmentShader, testUniforms, testAttributes };