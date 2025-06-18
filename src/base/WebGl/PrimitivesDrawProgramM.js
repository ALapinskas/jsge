const primitivesMVertexShader =  `
    precision mediump float;

    attribute vec2 a_position;

    uniform vec2 u_resolution;

    void main(void) {
        vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
`;
const primitivesMFragmentShader = `
    precision mediump float;

    uniform vec4 u_color;
    uniform float u_fade_min; 
    uniform float u_fade_max;
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
const primitivesMUniforms = ["u_resolution", "u_fade_min", "u_fade_max", "u_color"];
const primitivesMAttributes = ["a_position"];

export { primitivesMVertexShader, primitivesMFragmentShader, primitivesMUniforms, primitivesMAttributes };