import { CONST } from "./constants.js";

export const SystemSettings = {
    mode: CONST.MODE.DEBUG,
    
    gameOptions: {
        library: CONST.LIBRARY.WEBGL,
        debugWebGl: false,
        debugMobileTouch: false,
        optimization: null,
        boundaries: {
            drawLayerBoundaries: false,
            drawObjectBoundaries: false,
            boundariesColor: "rgba(224, 12, 21, 1)",
            boundariesWidth: 2
        },
        render: {
            averageFPStime: 10000,
            minCircleTime: 16, //ms which is ~60 FPS
            mapBoundariesEnabled: true
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
}