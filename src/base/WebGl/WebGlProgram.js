export class WebGlProgram {
    #vertexShader = "";
    #fragmentShader = "";
    #name = "unknown";
    #compiled = false;

    constructor() {

    }

    set vertexShader(vertexShader) {
        this.#vertexShader = vertexShader;
    }

    set fragmentShader(fragmentShader) {
        this.#fragmentShader = fragmentShader;
    }
}