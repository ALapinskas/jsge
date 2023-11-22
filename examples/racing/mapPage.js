import { ScreenPage, CONST } from "../../src/index.js";
import { utils } from "../../src/index.js";

const BLACK_CAR_KEY = "bkc",
    MAX_SPEED = 2,
    MIN_SPEED = -0.5;

const AUDIO_GEAR_UP = "gear_up",
    AUDIO_GEAR_DOWN = "gear_down",
    AUDIO_CAR_CRUSH = "car_crush";

export class MapPage extends ScreenPage {
    #keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false };

    register() {
        this.tilemapKey = "racingGameMapTileset";
        this.loader.addTileMap(this.tilemapKey, "./racing/map.tmj");
        this.loader.addImage(BLACK_CAR_KEY, "./racing/car_black_small_12.png");
        this.loader.addAudio(AUDIO_GEAR_UP, "./racing/audio/engine_up.mp3");
        this.loader.addAudio(AUDIO_CAR_CRUSH, "./racing/audio/car_crash.mp3");
        this.loader.addAudio(AUDIO_GEAR_DOWN, "./racing/audio/car_rearmove.mp3");

        this.speed = 0;
        this.movingInterval = null;
    }

    init() {
        const [w, h] = this.screenPageData.canvasDimensions;
        
        this.addRenderLayer(CONST.LAYERS.DEFAULT, "ground", this.tilemapKey, true);
        this.addRenderLayer(CONST.LAYERS.DEFAULT, "ground_b", this.tilemapKey);
        this.addRenderLayer(CONST.LAYERS.DEFAULT, "road", this.tilemapKey);
        this.addRenderLayer(CONST.LAYERS.DEFAULT, "objects", this.tilemapKey);
        
        this.player = this.draw.image(100, 200, 16, 28, BLACK_CAR_KEY, 0, [{x:-8,y:-14}, {x:0,y:-15}, {x:8,y:-14}, {x:8,y:14}, {x:-8,y:14}]);
        this.addRenderObject(CONST.LAYERS.DEFAULT, this.player);

        this.audioGearUp = this.loader.getAudio(AUDIO_GEAR_UP);
        this.audioCarCrush = this.loader.getAudio(AUDIO_CAR_CRUSH);
        this.audioCarMoveBackward = this.loader.getAudio(AUDIO_GEAR_DOWN);
    }

    start() {
        this.registerEventListeners();
    }

    stop() {
        this.unregisterEventListeners();
    }

    registerEventListeners() {
        //this.#registerMouseListeners();
        this.#registerKeyboardListeners();
    }

    unregisterEventListeners() {
        //this.#unregisterMouseListeners();
        this.#unregisterKeyboardListeners();
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
    }

    #unregisterMouseListeners() {
        document.removeEventListener("mousemove", this.#mouseMoveAction);
    }

    #pressKeyAction = (event) => {
        const code = event.code;
        let keyPressed = this.#keyPressed;

        keyPressed[code] = true;
        if (keyPressed["ArrowUp"] || keyPressed["KeyW"]){
            this.gear(true, this.player)
        }
        if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]) {
            this.turn("left")
        }
        if (keyPressed["ArrowRight"] || keyPressed["KeyD"]) {
            this.turn("right");
        }
        if (keyPressed["ArrowDown"] || keyPressed["KeyS"]){
            this.gear(false, this.player)
        }
    };

    gear(isForward, person) {
        if (isForward) {
            const newSpeed = this.speed + 0.3;
            if (newSpeed !== MAX_SPEED) {
                this.speed = newSpeed;
            }
        } else {
            const newSpeed = this.speed - 0.2;
            if (newSpeed !== MIN_SPEED) {
                this.speed = newSpeed;
            }
        }
        if (!this.movingInterval) {
            this.movingInterval = setInterval(() => {
                this.stepMove(person)
            }, 10);
        }
    }

    stepMove(person, direction, force) {
        //if (this.performanceS) {
        //    console.log(`step time: ,  ${performance.now() - this.performanceS}`);
        //}
        const movementForce = this.speed,
            newCoordX = person.x + movementForce * Math.cos(person.rotation - Math.PI/2),
            newCoordY = person.y + movementForce * Math.sin(person.rotation - Math.PI/2);
          
        if (!this.isBoundariesCollision(newCoordX, newCoordY, person)) {
            person.x = newCoordX; 
            person.y = newCoordY;
            if (this.speed > 0) {
                this.audioGearUp.play();
                this.audioCarMoveBackward.pause();
            } else if (this.speed < 0) {
                this.audioGearUp.pause();
                this.audioCarMoveBackward.play();
            }
        } else {
            this.speed = 0;
            this.audioGearUp.pause();
            this.audioCarMoveBackward.pause();
            clearInterval(this.movingInterval);
            this.movingInterval = null;
            this.audioCarCrush.play();
        }
    }

    turn(direction) {
        if (this.speed === 0) {
            return;
        }
        if (direction === "left") {
            this.player.rotation -= Math.PI / 16;
        } else {
            this.player.rotation += Math.PI / 16;
        }
    }

    #removeKeyAction = (event) => {
        const code = event.code;
        this.#keyPressed[code] = false;
    };

    #mouseMoveAction = (e) => {
        const [xOffset, yOffset] = this.screenPageData.worldOffset,
            x = e.offsetX,
            y = e.offsetY,
            cursorPosX = x + xOffset,
            cursorPosY = y + yOffset,
            rad = utils.angle_2points(this.player.x, this.player.y, cursorPosX, cursorPosY);
            
            this.player.rotation = rad - Math.PI/2;
    };
}