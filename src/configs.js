import { CONST } from "./constants.js";
/**
 * Settings object, should be passed as a parameter to System.constructor().
 */
export class SystemSettings {
    /**
     * @hideconstructor
     */
    constructor(){}
    /**
     * DEBUG/PRODUCTION, for debug mode system Logger will show debug information in the console
     */
    static mode = CONST.MODE.DEBUG;

    static gameOptions = {
        // no other variants only WEBGL for now
        library: CONST.LIBRARY.WEBGL,
        checkWebGlErrors: false,
        debugMobileTouch: false,
        optimization: CONST.OPTIMIZATION.NATIVE_JS.OPTIMIZED,
        optimizationWASMUrl: "/src/wa/calculateBufferDataWat.wasm",
        optimizationAssemblyUrl: "/src/wa/calculateBufferDataAssembly.wasm",
        loadingScreen: {
            backgroundColor:  "rgba(128, 128, 128, 0.6)",
            loadingBarBg: "rgba(128, 128, 128, 1)",
            loadingBarProgress: "rgba(128, 128, 128, 0.2)",
        },
        boundaries: {
            drawLayerBoundaries: false,
            drawObjectBoundaries: false,
            boundariesColor: "rgba(224, 12, 21, 0.6)",
            boundariesWidth: 2
        },
        render: {
            minCycleTime: 16, //ms which is ~60 FPS
            cyclesTimeCalc: {
                check: CONST.OPTIMIZATION.CYCLE_TIME_CALC.AVERAGES,
                averageFPStime: 10000
            },
            boundaries: {
                mapBoundariesEnabled: true,
                realtimeCalculations: true,
                wholeWorldPrecalculations: false
            }
        }
    };
    

    static network = {
        address: "https://gameserver.reslc.ru:9009",
        gatherRoomsInfoInterval: 5000
    };

    static canvasMaxSize = {
        width: 1800,
        height: 1800
    };

    static worldSize = {
        width: 960,
        height: 960
    };

    static defaultCanvasKey = "default";
}