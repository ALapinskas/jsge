import { GameStage, CONST, System, SystemSettings } from "../../src/index.js";

export class Primitives extends GameStage {
	#keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false };
	register() {
	}
    init() {
    }
    start() {
		this.registerListeners();
    }

	stop() {
        this.unregisterListeners();
    }
	
	registerListeners() {
		this.#registerMouseListeners();
        this.#registerKeyboardListeners();
		this.#registerSystemEventsListeners();
	}

	unregisterListeners() {
		this.#unregisterMouseListeners();
        this.#unregisterKeyboardListeners();
		this.#unregisterSystemEventsListeners();
	}

	#registerKeyboardListeners() {
        document.addEventListener("keydown", this.#pressKeyAction);
        document.addEventListener("keyup", this.#removeKeyAction);
    }

    #unregisterKeyboardListeners() {
        document.removeEventListener("keydown", this.#pressKeyAction);
        document.removeEventListener("keyup", this.#removeKeyAction);
    }

    #registerMouseListeners() {
        document.addEventListener("mousemove", this.#mouseMoveAction);
        document.addEventListener("click", this.#mouseClickAction);
    }

    #unregisterMouseListeners() {
        document.removeEventListener("mousemove", this.#mouseMoveAction);
        document.removeEventListener("click", this.#mouseClickAction);
    }
	
	#pressKeyAction = (event) => {
        const code = event.code;
        let keyPressed = this.#keyPressed;

        keyPressed[code] = true;
    };
    #removeKeyAction = (event) => {
        const code = event.code;
        this.#keyPressed[code] = false;
    };

    #mouseMoveAction = (e) => {
        const [xOffset, yOffset] = this.stageData.worldOffset,
            x = e.offsetX,
            y = e.offsetY,
            cursorPosX = x + xOffset,
            cursorPosY = y + yOffset;
    };


    #mouseClickAction = (e) => {
		
    }


	#render = () => {
		const keyPressed = this.#keyPressed;

		if (keyPressed["ArrowUp"] || keyPressed["KeyW"]){
            //this.stepMove("forward");
        }
        if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]) {
            //this.stepMove("turn_left");
        }
        if (keyPressed["ArrowRight"] || keyPressed["KeyD"]) {
            //this.stepMove("turn_right");
        }
        if (keyPressed["ArrowDown"] || keyPressed["KeyS"]){
            //this.stepMove("backward");
        }

	}
	#registerSystemEventsListeners() {
		this.iSystem.addEventListener(CONST.EVENTS.SYSTEM.RENDER.START, this.#render);
	}

	#unregisterSystemEventsListeners() {
		this.iSystem.removeEventListener(CONST.EVENTS.SYSTEM.RENDER.START, this.#render);
	}
}
