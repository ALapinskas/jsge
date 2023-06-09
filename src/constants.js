export const CONST = {
    MODE: {
        DEBUG: "DEBUG",
        PRODUCTION: "PRODUCTION"
    },
    SCREENS: {},
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
        GAME: {
            BOUNDARIES_COLLISION: "BOUNDARIES_COLLISION",
            OBJECTS_COLLISION: "OBJECTS_COLLISION"
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
            IMAGES: "drawImages"
        }
    },
    DRAW_TYPE: {
        RECTANGLE: "rect",
        CIRCLE: "circle",
        POLYGON: "polygon",
        LINE: "line",
        TEXT: "text",
        IMAGE: "image"
    },
    LAYERS: {
        DEFAULT: "default-view-layer",
        BOUNDARIES: "boundaries-view-layer"
    },
    GAME_OPTIONS: {},
    LIBRARY: {
        WEBGL: "webgl"
    },
    OPTIMIZATION: {
        WEB_ASSEMBLY: {
            ASSEMBLY_SCRIPT: "ASSEMBLY_SCRIPT",
            NATIVE_C: "NATIVE_C"
        }
    }
};

export const ERROR_CODES = {
    CREATE_INSTANCE_ERROR: "CREATE_INSTANCE_ERROR",
    VIEW_NOT_EXIST: "VIEW_NOT_EXIST", 
    ELEMENT_NOT_EXIST: "ELEMENT_NOT_EXIST",
    FILE_NOT_EXIST: "FILE_NOT_EXIST",
    UNEXPECTED_INPUT_PARAMS: "UNEXPECTED_INPUT_PARAMS",
    UNHANDLED_EXCEPTION: "UNHANDLED_EXCEPTION",
    UNHANDLED_PREPARE_EXCEPTION: "UNHANDLED_PREPARE_EXCEPTION",
    CANVAS_KEY_NOT_SPECIFIED: "CANVAS_KEY_NOT_SPECIFIED",
    CANVAS_WITH_KEY_NOT_EXIST: "CANVAS_WITH_KEY_NOT_EXIST",
    WRONG_TYPE_ERROR: "WRONG_TYPE_ERROR",
    UNEXPECTED_WS_MESSAGE: "UNEXPECTED_WS_MESSAGE",
    UNEXPECTED_PLAYER_ID: "UNEXPECTED_PLAYER_ID",
    UNEXPECTED_BULLET_ID: "UNEXPECTED_BULLET_ID",
    UNEXPECTED_EVENT_NAME: "UNEXPECTED_EVENT_NAME",
    WEBGL_ERROR: "WEBGL_ERROR",
    UNEXPECTED_TOUCH_AREA: "UNEXPECTED_TOUCH_AREA",
};

export const WARNING_CODES =  {
    FILE_LOADING_ISSUE: "FILE_LOADING_ISSUE",
    ASSETS_NOT_READY: "ASSETS_NOT_READY",
    NOT_FOUND: "NOT_FOUND",
    NOT_TESTED: "NOT_TESTED",
    WORLD_DIMENSIONS_NOT_SET: "WORLD_DIMENSIONS_NOT_SET",
    UNHANDLED_DRAW_ISSUE: "UNHANDLED_DRAW_ISSUE",
    UNEXPECTED_WORLD_SIZE: "UNEXPECTED_WORLD_SIZE",
    AUDIO_ALREADY_REGISTERED: "AUDIO_ALREADY_REGISTERED",
    AUDIO_NOT_REGISTERED: "AUDIO_NOT_REGISTERED",
    POLYGON_VERTICES_NOT_CORRECT: "POLYGON_VERTICES_NOT_CORRECT"
};