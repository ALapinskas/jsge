import { CONST } from "./constants.js";
/**
 * Settings object, should be passed as a parameter to System.constructor().
 */
export const SystemSettings = {
    mode: CONST.MODE.DEBUG,
    
    gameOptions: {
        library: CONST.LIBRARY.WEBGL,
        checkWebGlErrors: false,
        debugMobileTouch: false,
        optimization: CONST.OPTIMIZATION.NATIVE_JS.OPTIMIZED,
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
            minCircleTime: 16, //ms which is ~60 FPS
            cyclesTimeCalc: {
                check: CONST.OPTIMIZATION.CIRCLE_TIME_CALC.AVERAGES,
                averageFPStime: 10000
            },
            boundaries: {
                mapBoundariesEnabled: true,
                realtimeCalculations: true,
                wholeWorldPrecalculations: false
            }
        }
    },
    

    network: {
        address: "https://gameserver.reslc.ru:9009",
        gatherRoomsInfoInterval: 5000
    },

    canvasMaxSize: {
        width: 1800,
        height: 1800
    },

    worldSize: {
        width: 960,
        height: 960
    },

    defaultCanvasKey: "default"
};