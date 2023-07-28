import AssetsManager from  "../../modules/assetsm/dist/assetsm.min.js";
import { ERROR_CODES, WARNING_CODES } from "../constants.js";
import { Exception, Warning } from "./Exception.js";

/**
 * An audio interface, <br>
 * controls all application audio,<br>
 * holds and retrieves audio, changes volume<br> 
 * accessible via ScreenPage.audio
 * @see {@link ScreenPage} a part of ScreenPage
 * @hideconstructor
 */
export class SystemAudioInterface {
    #volume = 0.5;
    #audio = new Map();

    /**
     * Original track
     * @param {string} name 
     * @returns {HTMLAudioElement | null}
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
     * @param {string} name 
     * @returns {HTMLAudioElement | null}
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
     * @param {string} name 
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
     * @type {number}
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