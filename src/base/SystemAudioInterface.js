import AssetsManager from "assetsm";
import { ERROR_CODES, WARNING_CODES } from "../constants.js";
import { Exception, Warning } from "./Exception.js";

/**
 * An audio interface, 
 * to control all application audio,
 * hold and retrieve audio,
 * change volume 
 */
export class SystemAudioInterface {
    #volume = 0.5;
    #audio = new Map();

    /**
     * Original track
     * @param {String} name 
     * @returns {HTMLAudioElement}
     */
    getAudio(name) {
        const audio = this.#audio.get(name);
        if (audio) {
            return audio;
        } else {
            Warning(WARNING_CODES.AUDIO_NOT_REGISTERED);
            return null;
        }
    }

    /**
     * Clone of original track
     * @param {String} name 
     * @returns {HTMLAudioElement}
     */
    getAudioCloned(name) {
        const audio = this.#audio.get(name).cloneNode();
        if (audio) {
            audio.volume = this.#volume;
            return audio;
        } else {
            Warning(WARNING_CODES.AUDIO_NOT_REGISTERED);
            return null;
        }
    }

    /**
     * Used to register audio in system after downloading
     * @param {String} name 
     * @param {AssetsManager} loader 
     */
    registerAudio(name, loader) {
        let mediaElement = this.#audio.get(name);
        if (!mediaElement) {
            const audioEl = loader.getAudio(name);
            if (!audioEl) {
                Exception(ERROR_CODES.FILE_NOT_EXIST, "can't get audio," + name);
            }
            //mediaElement = this.#audioContext.createMediaElementSource(audioEl);
            audioEl.volume = this.#volume;
            mediaElement = audioEl;
            this.#audio.set(name, mediaElement);
        } else {
            Warning(WARNING_CODES.AUDIO_ALREADY_REGISTERED, "");
        }
    }

    set volume(value) {
        this.#volume = value;
        this.#updateTracksVolumes(value);
    }
    /**
     * Used to set or get audio volume, 
     * value should be from 0 to 1
     * @type {Number}
     */
    get volume() {
        return this.#volume;
    }

    #updateTracksVolumes(value) {
        for (const track of this.#audio.values()) {
            track.volume = value;
        }
    }
}