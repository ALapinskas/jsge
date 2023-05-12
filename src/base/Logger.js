import { SystemSettings } from "../configs.js";
import { CONST } from "../constants.js";

export class Logger {
    static debug(...args) {
        if (SystemSettings.mode === CONST.MODE.DEBUG)
            args.forEach(message => console.log(message));
    }
}