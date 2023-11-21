const primitivesVertexShader =  `
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
const primitivesFragmentShader = `
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
const primitivesUniforms = ["u_translation", "u_rotation", "u_scale", "u_resolution", "u_fade_min", "u_fade_max", "u_color"];
const primitivesAttributes = ["a_position"];

export { primitivesVertexShader, primitivesFragmentShader, primitivesUniforms, primitivesAttributes };