import { CONST, ERROR_CODES } from "../../constants.js";
import { Exception } from "../Exception.js";

export class SystemEvent extends Event {
    #data;
    constructor(eventValue, data){
        super(eventValue);
        if (!this.#isEventExist(eventValue)) {
            Exception(ERROR_CODES.UNEXPECTED_EVENT_NAME, ", Please check if event is exist");
        }
        this.#data = data;
    }

    #isEventExist(eventValue) {
        return Object.values(CONST.EVENTS.WEBSOCKET.SERVER_CLIENT).find(eventVal => eventVal === eventValue);
    }

    get data () {
        return this.#data;
    }
}