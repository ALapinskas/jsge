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
        optimization: null,
        boundaries: {
            drawLayerBoundaries: false,
            drawObjectBoundaries: false,
            boundariesColor: "rgba(224, 12, 21, 0.6)",
            boundariesWidth: 2
        },
        render: {
            averageFPStime: 10000,
            minCircleTime: 16, //ms which is ~60 FPS
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
        width: 900,
        height: 960
    },

    worldSize: {
        width: 960,
        height: 960
    },

    defaultCanvasKey: "default"
};