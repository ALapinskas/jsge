import { CONST } from "./constants.js";
/**
 * @namespace SystemSettings
 */
/**
 * Default SystemSettings
 * @typedef {Object} DefaultSettings
 * @property {String} mode - DEBUG/PRODUCTION, debug mode system Logger will show debug information in the console
 * @property {gameOptions} gameOptions
 * @property {network} network - network settings
 * @property {canvasMaxSize} canvasMaxSize
 * @property {worldSize} worldSize
 * @property {string} defaultCanvasKey
 * @property {Object} customSettings - any custom settings
 * @memberof SystemSettings
 */
/**
 * @typedef {Object} gameOptions
 * @property {String} library
 * @property {render} render
 * @property {debug} debug
 * @property {String} optimization
 * @property {String} optimizationWASMUrl
 * @property {String} optimizationAssemblyUrl
 * @property {loadingScreen} loadingScreen
 * @memberof SystemSettings
 */
/**
 * @typedef {Object} loadingScreen
 * @property {String} backgroundColor
 * @property {String} loadingBarBg
 * @property {String} loadingBarProgress
 * @memberof SystemSettings
 */
/**
 * @typedef {Object} network
 * @property {boolean} enabled - disabled by default
 * @property {String} address - server address
 * @property {number} gatherRoomsInfoInterval
 * @memberof SystemSettings
 */
/**
 * @typedef {Object} canvasMaxSize
 * @property {number} width
 * @property {number} height
 * @memberof SystemSettings
 */
/**
 * @typedef {Object} worldSize
 * @property {number} width
 * @property {number} height
 * @memberof SystemSettings
 */
/**
 * render Settings
 * @typedef {Object} render
 * @property {cyclesTimeCalc} cyclesTimeCalc - DEBUG/PRODUCTION, debug mode system Logger will show debug information in the console
 * @property {boundaries} boundaries
 * @property {number} textAtlasMaxSize
 */

/**
 * cycles time calc
 * @typedef {Object} cyclesTimeCalc
 * @property {String} check
 * @property {Number} averageFPStime
 * @memberof SystemSettings
 */

/**
 * boundaries (collision shapes)
 * @typedef {Object} boundaries
 * @property {boolean} mapBoundariesEnabled
 * @property {boolean} realtimeCalculations
 * @property {boolean} wholeWorldPrecalculations
 * @memberof SystemSettings
 */

/**
 * debug Settings
 * @typedef {Object} debug
 * @property {boolean} preserveDrawingBuffer
 * @property {boolean} checkWebGlErrors
 * @property {boolean} debugMobileTouch
 * @property {debugBoundaries} boundaries
 * @property {boolean} delayBetweenObjectRender
 */

/**
 * debug boundaries
 * @typedef {Object} debugBoundaries
 * @property {boolean} drawLayerBoundaries
 * @property {boolean} drawObjectBoundaries
 * @property {string} boundariesColor
 * @property {Number} boundariesWidth
 */
/**
 * Settings object, should be passed as a parameter to System.constructor().
 * @type {DefaultSettings}
 * @memberof SystemSettings
 */
const SystemSettings = {
    mode: CONST.MODE.DEBUG,

    /**
     * game options
     */
    gameOptions: {
        // no other variants only WEBGL for now
        library: CONST.LIBRARY.WEBGL,
        optimization: CONST.OPTIMIZATION.NATIVE_JS.OPTIMIZED,
        optimizationWASMUrl: "./src/wa/calculateBufferDataWat.wasm",
        optimizationAssemblyUrl: "/src/wa/calculateBufferDataAssembly.wasm",
        loadingScreen: {
            backgroundColor:  "rgba(128, 128, 128, 0.6)",
            loadingBarBg: "rgba(128, 128, 128, 1)",
            loadingBarProgress: "rgba(128, 128, 128, 0.2)",
        },
        render: {
            cyclesTimeCalc: {
                check: CONST.OPTIMIZATION.CYCLE_TIME_CALC.AVERAGES,
                averageFPStime: 10000
            },
            boundaries: {
                mapBoundariesEnabled: true,
                realtimeCalculations: true,
                wholeWorldPrecalculations: false
            },
            textAtlasMaxSize: 500 // pixels.
        },
        debug: {
            preserveDrawingBuffer: false, // this option is used in testing environment
            checkWebGlErrors: false,
            debugMobileTouch: false,
            boundaries: {
                drawLayerBoundaries: false,
                drawObjectBoundaries: false,
                boundariesColor: "rgba(224, 12, 21, 0.6)",
                boundariesWidth: 2
            },
            delayBetweenObjectRender: false, // 1 sec delay for debug proposes
        }
    },
    
    /**
     * network options
     */
    network: {
        // disable INetwork by default
        enabled: false,
        address: "https://gameserver.reslc.ru:9009",
        gatherRoomsInfoInterval: 5000
    },

    canvasMaxSize: {
        width: 1800,
        height: 1800
    },

    /**
     * world size
     */
    worldSize: {
        width: 960,
        height: 960
    },

    /**
     * default canvas key
     */
    defaultCanvasKey: "default",

    /**
     * custom options
     */
    customSettings: {}
}

export { SystemSettings };