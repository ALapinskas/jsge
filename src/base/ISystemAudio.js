import AssetsManager from  "../../modules/assetsm/src/AssetsManager.js";
import { WARNING_CODES } from "../constants.js";
import { Warning } from "./Exception.js";

/**
 * An audio interface, <br>
 * controls all application audio,<br>
 * holds and retrieves audio, changes volume<br> 
 * accessible via GameStage.audio
 * @see {@link GameStage} a part of GameStage
 * @hideconstructor
 */
export class ISystemAudio {
    #volume = 0.5;
    #audio = new Map();
    /**
     * @type {AssetsManager}
     */
    #loaderReference;

    constructor(iLoader) {
        this.#loaderReference = iLoader;
    }

    /**
     * Original track
     * @param {string} name 
     * @returns {HTMLAudioElement | null}
     */
    getAudio = (name) => {
        const audio = this.#audio.get(name);
        if (audio === null) {
            Warning(WARNING_CODES.AUDIO_NOT_LOADED, "Audio with key " + name + " exists, but not actually loaded");
            return audio;
        }
        if (audio) {
            return audio;
        } else {
            Warning(WARNING_CODES.AUDIO_NOT_REGISTERED, "");
            return null;
        }
    };

    /**
     * Clone of original track
     * @param {string} name 
     * @returns {HTMLAudioElement | null}
     */
    getAudioCloned = (name) => {
        const audio = this.#audio.get(name);
        if (audio === null) {
            Warning(WARNING_CODES.AUDIO_NOT_LOADED, "Audio with key " + name + " exists, but not actually loaded");
            return audio;
        }
        if (audio) {
            const audioCloned = audio.cloneNode();
            audioCloned.volume = this.#volume;
            return audioCloned;
        } else {
            Warning(WARNING_CODES.AUDIO_NOT_REGISTERED);
            return null;
        }
    };

    set volume(value) {
        this.#volume = value;
        this.#updateTracksVolumes(value);
    }
    /**
     * Used to set or get audio volume, 
     * value should be from 0 to 1
     * @type {number}
     */
    get volume() {
        return this.#volume;
    }

    #updateTracksVolumes(value) {
        for (const track of this.#audio.values()) {
            if (track) {
                track.volume = value;
            }
        }
    }

    /**
     * Register audio in the iSystem
     * @param {string} name
     */
    registerAudio(name) {
        let mediaElement = this.#loaderReference.getAudio(name);
        this.#audio.set(name, mediaElement);
    }
}