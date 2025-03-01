import { CONST, ERROR_CODES } from "../constants.js";
import { Exception } from "./Exception.js";
import { Logger } from "./Logger.js";
import { SystemEvent } from "./Events/SystemEvent.js";
//import { Socket } from "socket.io-client";

/**
 * Represents Socket connection
 * 
 * From 1.4.4 disabled by default,
 * to enable, set settings.network.enabled to true
 */
export class INetwork extends EventTarget {
    /**
     * @type {Object}
     */
    #systemSettings;
    /**
     * @type {Socket}
     */
    #socket;

    /**
     * @hideconstructor
     */
    constructor(systemSettings) {
        super();
        if (!systemSettings) {
            Exception(ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#systemSettings = systemSettings;
    }

    init() {
        import("socket.io-client").then((module) => {
            this.#socket = module.io(this.#systemSettings.network.address, {withCredentials: true});
            
            this.#registerSocketListeners();
        });
    }

    /**
     * @returns {boolean}
     */
    get isServerConnected () {
        if (this.#socket && this.#socket.connected) {
            return true;
        } else {
            return false;
        }
    }
    
    get playerId() {
        return this.#socket.id;
    }

    sendGatherRoomsInfo() {
        this.#socket.emit(CONST.EVENTS.WEBSOCKET.CLIENT_SERVER.ROOMS_INFO_REQUEST);
    }

    sendCreateOrJoinRoom(roomName, map) {
        this.#socket.emit(CONST.EVENTS.WEBSOCKET.CLIENT_SERVER.CREATE_OR_JOIN, roomName , map);
    }

    sendMessage(message) {
        this.#socket.emit(CONST.EVENTS.WEBSOCKET.CLIENT_SERVER.CLIENT_MESSAGE, message);
    }

    #onConnect = () => {
        Logger.debug("connected, socket id: " + this.#socket.id);
        this.dispatchEvent(new Event(CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.CONNECTION_STATUS_CHANGED));
    };

    #onDisconnect = (reason) => {
        Logger.debug("server disconnected, reason: " + reason);
        this.dispatchEvent(new Event(CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.CONNECTION_STATUS_CHANGED));
    };

    #onData = (event) => {
        console.warn("server data: ", event);
    };

    #onMessage = (message) => {
        Logger.debug("received new message from server: " + message);
        this.dispatchEvent(new SystemEvent(CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.SERVER_MESSAGE, message));
    };

    #onRoomsInfo = (rooms) => {
        Logger.debug("received roomsInfo " + rooms);
        this.dispatchEvent(new SystemEvent(CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.ROOMS_INFO, rooms));
    };

    #onCreateNewRoom = (room, map) => {
        Logger.debug("CLIENT SOCKET: Created room  " + room);
        this.dispatchEvent(new SystemEvent(CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.CREATED, {room, map}));
    };

    #onRoomIsFull = (room) => {
        Logger.debug("CLIENT SOCKET: Room is full, can't join: " + room);
        this.dispatchEvent(new SystemEvent(CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.FULL, {room}));
    };

    #onJoinedToRoom = (room, map) => {
        Logger.debug("CLIENT SOCKET: Joined to room: " + room, ", map: ", map);
        this.dispatchEvent(new SystemEvent(CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.JOINED, {room, map}));
    };

    #onUnjoinedFromRoom = (playerId) => {
        this.dispatchEvent(new SystemEvent(CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.DISCONNECTED, {playerId}));
    };

    #registerSocketListeners() {
        this.#socket.on("connect", this.#onConnect);
        this.#socket.on("disconnect", this.#onDisconnect);
        this.#socket.on("data", this.#onData);

        this.#socket.on("roomsInfo", this.#onRoomsInfo);
    
        this.#socket.on("created", this.#onCreateNewRoom);
    
        this.#socket.on("full", this.#onRoomIsFull);
    
        this.#socket.on("joined", this.#onJoinedToRoom);
    
        this.#socket.on("log", function(array) {
            console.log.apply(console, array);
        });
    
        this.#socket.on("message", this.#onMessage);
    
        this.#socket.on("removed", function(message) {
            console.log("removed message");
            console.log(message);
        });

        this.#socket.on("disconnected", this.#onUnjoinedFromRoom);

        addEventListener("beforeunload", this.#disconnect);
    }

    #disconnect = () => {
        this.#socket.disconnect();
    };
}