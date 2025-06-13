import { GameStage, CONST, System, SystemSettings, utils } from "../../src/index.js";

export class Primitives extends GameStage {
	#keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false };
	register() {
	}
    init() {
        const [w, h] = this.stageData.canvasDimensions;
        this.navItemBack = this.draw.text(w - 200, 30, "Main menu", "18px sans-serif", "black"),
        this.navItemBack.turnOffOffset();

        this.triangle = this.draw.polygon([{x:0, y:0}, {x:100, y:0}, {x:60, y:60}], "rgba(130,30,130,1)");
        this.rect = this.draw.rect(100, 400, 400, 200, "rgba(200,200, 200, 1");
        this.conus = this.draw.conus(315, 369, 100, "rgba(0,128,0,0.5)", 1.3 * Math.PI);
        this.triangle.x = 100;
        this.triangle.y = 100;

        this.polygon = this.draw.polygon([{x:0, y:0}, {x:20, y:20}, {x:40, y:20}, {x: 40, y: 40}, {x:60, y:40}, {x:60, y:80}, {x:40,y:100}, {x:20, y:80}, {x:0, y: 100}, {x: -20, y: 60}], "rgba(90,90,90,1)");

        this.polygon.x = 400;
        this.polygon.y = 200;
    }
    start() {
		this.registerListeners();
        console.log("primitives started");
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

        const isNav1Traversed = utils.isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.collisionShapes);

        if (isNav1Traversed) {
            this.navItemBack.strokeStyle = "rgba(0, 0, 0, 0.3)";
            document.getElementsByTagName("canvas")[0].style.cursor = "pointer";
        } else if (this.navItemBack.strokeStyle) {
            this.navItemBack.strokeStyle = undefined;
            document.getElementsByTagName("canvas")[0].style.cursor = "default";
        }
    };

    #mouseClickAction = (e) => {
		const isNav1Click = utils.isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.collisionShapes);
    
        if (isNav1Click) {
            this.iSystem.stopGameStage("primitives");
            this.iSystem.startGameStage("start");
        }
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
