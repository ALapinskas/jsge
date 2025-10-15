/**
 * @namespace CONSTANTS
 */
/**
 * @typedef {Object} CONST
 * @property {MODE} MODE
 * @property {Object} AUDIO
 * @property {CONNECTION_STATUS} CONNECTION_STATUS
 * @property {EVENTS} EVENTS
 * @property {WEBGL} WEBGL
 * @property {Object} GAME_OPTIONS
 * @property {LIBRARY} LIBRARY
 * @property {OPTIMIZATION} OPTIMIZATION
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} MODE
 * @property {String} DEBUG
 * @property {String} PRODUCTION
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} CONNECTION_STATUS
 * @property {String} DISCONNECTED
 * @property {String} CONNECTED
 * @property {String} CONNECTION_LOST
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} EVENTS
 * @property {SYSTEM} SYSTEM
 * @property {WEBSOCKET} WEBSOCKET
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} SYSTEM
 * @property {String} START_PAGE
 * @property {String} STOP_PAGE
 * @property {RENDER} RENDER
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} RENDER
 * @property {String} START - Start render loop
 * @property {String} END - End render loop
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} WEBSOCKET
 * @property {SERVER_CLIENT} SERVER_CLIENT
 * @property {CLIENT_SERVER} CLIENT_SERVER
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} SERVER_CLIENT
 * @property {String} CONNECTION_STATUS_CHANGED
 * @property {String} ROOMS_INFO
 * @property {String} CREATED
 * @property {String} JOINED
 * @property {String} FULL
 * @property {String} DISCONNECTED
 * @property {String} SERVER_MESSAGE
 * @property {String} RESTARTED
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} CLIENT_SERVER
 * @property {String} ROOMS_INFO_REQUEST
 * @property {String} CREATE_OR_JOIN
 * @property {String} RESTART_REQUEST
 * @property {String} CLIENT_MESSAGE
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} WEBGL
 * @property {DRAW_PROGRAMS} DRAW_PROGRAMS
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} DRAW_PROGRAMS
 * @property {String} PRIMITIVES
 * @property {String} PRIMITIVES_M
 * @property {String} IMAGES_M
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} OPTIMIZATION
 * @property {CYCLE_TIME_CALC} CYCLE_TIME_CALC
 * @property {NATIVE_JS} NATIVE_JS
 * @property {WEB_ASSEMBLY} WEB_ASSEMBLY
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} CYCLE_TIME_CALC
 * @property {String} AVERAGES
 * @property {String} CURRENT
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} NATIVE_JS
 * @property {String} NOT_OPTIMIZED
 * @property {String} OPTIMIZED
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} WEB_ASSEMBLY
 * @property {String} ASSEMBLY_SCRIPT
 * @property {String} NATIVE_WAT
 * @memberof CONSTANTS
 */
/**
 * @typedef {Object} LIBRARY
 * @property {String} WEBGL
 * @memberof CONSTANTS
 */
/**
 * Constants variables
 * @type {CONST}
 **/
export const CONST = {
    MODE: {
        DEBUG: "DEBUG",
        PRODUCTION: "PRODUCTION"
    },
    AUDIO: {},
    CONNECTION_STATUS: {
        DISCONNECTED: "disconnected",
        CONNECTED: "connected",
        CONNECTION_LOST: "connection lost"
    },
    EVENTS: {
        SYSTEM: {
            START_PAGE:"START_PAGE",
            STOP_PAGE: "STOP_PAGE",
            RENDER: {
                START: "start",
                END: "end"
            }
        },
        WEBSOCKET: {
            SERVER_CLIENT: {
                CONNECTION_STATUS_CHANGED: "CONNECTION_STATUS_CHANGED",
                ROOMS_INFO: "roomsInfo",
                CREATED: "created",
                JOINED: "joined",
                FULL: "full",
                DISCONNECTED: "disconnected",
                SERVER_MESSAGE: "message",
                RESTARTED: "restarted",
            },
            CLIENT_SERVER: {
                ROOMS_INFO_REQUEST: "gatherRoomsInfo",
                CREATE_OR_JOIN: "create or join",
                RESTART_REQUEST: "restart",
                CLIENT_MESSAGE: "message"
            }
        }
    },
    WEBGL: {
        DRAW_PROGRAMS: {
            PRIMITIVES: "drawPrimitives",
            PRIMITIVES_M: "drawPrimitivesMerge",
            IMAGES_M: "drawImagesMerge"
        }
    },
    GAME_OPTIONS: {},
    LIBRARY: {
        WEBGL: "webgl"
    },
    OPTIMIZATION: {
        CYCLE_TIME_CALC: {
            AVERAGES: "AVERAGES",
            CURRENT: "CURRENT"
        },
        NATIVE_JS: {
            NOT_OPTIMIZED: "NOT_OPTIMIZED",
            OPTIMIZED: "OPTIMIZED"
        },
        WEB_ASSEMBLY: {
            ASSEMBLY_SCRIPT: "ASSEMBLY_SCRIPT",
            NATIVE_WAT: "WASM"
        }
    }
};
/** @enum {string} */
export const DRAW_TYPE = {
    RECTANGLE: "rect",
    CONUS: "conus",
    CIRCLE: "circle",
    POLYGON: "polygon",
    LINE: "line",
    TEXT: "text",
    IMAGE: "image"
};

export const ERROR_CODES = {
    STAGE_NOT_EXIST: "STAGE_NOT_EXIST",
    ELEMENT_NOT_EXIST: "ELEMENT_NOT_EXIST",
    FILE_NOT_EXIST: "FILE_NOT_EXIST",
    CANT_GET_THE_IMAGE: "CANT_GET_THE_IMAGE",
    UNEXPECTED_INPUT_PARAMS: "UNEXPECTED_INPUT_PARAMS",
    UNHANDLED_EXCEPTION: "UNHANDLED_EXCEPTION",
    CANVAS_KEY_NOT_SPECIFIED: "CANVAS_KEY_NOT_SPECIFIED",
    CANVAS_WITH_KEY_NOT_EXIST: "CANVAS_WITH_KEY_NOT_EXIST",
    WRONG_TYPE_ERROR: "WRONG_TYPE_ERROR",
    UNEXPECTED_WS_MESSAGE: "UNEXPECTED_WS_MESSAGE",
    UNEXPECTED_PLAYER_ID: "UNEXPECTED_PLAYER_ID",
    UNEXPECTED_BULLET_ID: "UNEXPECTED_BULLET_ID",
    UNEXPECTED_EVENT_NAME: "UNEXPECTED_EVENT_NAME",
    WEBGL_ERROR: "WEBGL_ERROR",
    DRAW_PREPARE_ERROR: "DRAW_PREPARE_ERROR",
    ANOTHER_STAGE_ACTIVE: "ANOTHER_STAGE_ACTIVE",
    UNEXPECTED_TILE_ID: "UNEXPECTED_TILE_ID",
    UNEXPECTED_TOUCH_AREA: "UNEXPECTED TOUCH AREA",
    UNEXPECTED_METHOD_TYPE: "UNEXPECTED METHOD TYPE"
};

export const WARNING_CODES =  {
    MULTIPLE_IMAGE_TILESET: "MULTIPLE_IMAGE_TILESET",
    FILE_LOADING_ISSUE: "FILE_LOADING_ISSUE",
    ASSETS_NOT_READY: "ASSETS_NOT_READY",
    NOT_FOUND: "NOT_FOUND",
    NOT_TESTED: "NOT_TESTED",
    WORLD_DIMENSIONS_NOT_SET: "WORLD_DIMENSIONS_NOT_SET",
    INCORRECT_RENDER_TYPE: "INCORRECT_RENDER_TYPE",
    UNHANDLED_DRAW_ISSUE: "UNHANDLED_DRAW_ISSUE",
    UNEXPECTED_WORLD_SIZE: "UNEXPECTED_WORLD_SIZE",
    AUDIO_ALREADY_REGISTERED: "AUDIO_ALREADY_REGISTERED",
    AUDIO_NOT_REGISTERED: "AUDIO_NOT_REGISTERED",
    AUDIO_NOT_LOADED: "AUDIO_NOT_LOADED",
    UNKNOWN_DRAW_OBJECT: "UNKNOWN_DRAW_OBJECT",
    METHOD_NOT_IMPLEMENTED: "METHOD_NOT_IMPLEMENTED",
    POLYGON_VERTICES_NOT_CORRECT: "POLYGON_VERTICES_NOT_CORRECT",
    MODULE_ALREADY_INSTALLED: "MODULE_ALREADY_INSTALLED",
    DEPRECATED_PARAMETER: "DEPRECATED_PARAMETER",
    NEW_BEHAVIOR_INTRODUCED: "NEW_BEHAVIOR_INTRODUCED",
    TEXTURE_IMAGE_TEMP_OVERFLOW: "TEXTURE_IMAGE_TEMP_OVERFLOW",
    TRIANGULATE_ISSUE: "TRIANGULATE_ISSUE"
};