import { Primitives } from "/index.es6.js";
import { ScreenPage, CONST } from "/index.es6.js";
import { utils } from "/index.es6.js";

const Vertex = Primitives.Vertex;
const SHIPS_KEY = "ships";
const angle_2points = utils.angle_2points,
    isPointLineIntersect = utils.isPointLineIntersect;

export class MapPage extends ScreenPage {
    #keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false };

    // radians
    #windDirection = 0; // east
    #windStrength = 0.3; //from 0 to 1
    register() {
        this.tilemapKey = "gameMapTileset";
        this.loader.addTileMap(this.tilemapKey, "/pirates/map.tmj");
        this.loader.addImage(SHIPS_KEY, "/pirates/ship.png");
    }

    init() {
        const [w, h] = this.screenPageData.canvasDimensions;

        this.createCanvasView(CONST.LAYERS.DEFAULT);
        
        if (this.systemSettings.gameOptions.boundaries.drawLayerBoundaries) {
            this.createCanvasView(CONST.LAYERS.BOUNDARIES);
        }
        
        this.addRenderLayer(CONST.LAYERS.DEFAULT, "water", this.tilemapKey);
        this.addRenderLayer(CONST.LAYERS.DEFAULT, "ground", this.tilemapKey, true);
        this.addRenderLayer(CONST.LAYERS.DEFAULT, "items", this.tilemapKey);

        this.windDirectionPointer = this.draw.polygon([
            {
             "x":-17,
             "y":-20
            }, 
            {
             "x":17,
             "y":0
            }, 
            {
             "x":-17,
             "y":20
            }, 
            {
             "x":-10,
             "y":0
            }], "rgba(100,120,100,1)");
        this.windDirectionPointer.x = 50;
        this.windDirectionPointer.y = 50;
        this.addRenderObject(CONST.LAYERS.DEFAULT, this.windDirectionPointer);

        this.player = this.draw.image(50, 200, 33, 57, SHIPS_KEY, 0, [{x:0,y:-30}, {x:15,y:-10}, {x:0,y:30}, {x:-15,y:-10}]);
        this.addRenderObject(CONST.LAYERS.DEFAULT, this.player);
    }

    #getRandomIntFromTo = (min, max) => (Math.random() * (max - min) + min);

    #startWindDirectionChanging() {
        // 10 - 120 sec
        const timeToChange = this.#getRandomIntFromTo(10, 50) * 1000; //ms

        setTimeout(() => {
            const direction = this.#getRandomIntFromTo(-Math.PI, Math.PI),
                strength = this.#getRandomIntFromTo(0, 1);
            console.log("wind direction changed: ", direction);
            this.#windDirection = direction;
            this.#windStrength = strength;
            this.windDirectionPointer.rotation = direction;
            this.#startWindDirectionChanging();
        }, timeToChange);
    }

    start() {
        this.registerEventListeners();
        this.#startWindDirectionChanging();
    }

    stop() {
        this.unregisterEventListeners();
    }

    registerEventListeners() {
        this.#registerMouseListeners();
        this.#registerKeyboardListeners();
    }


    unregisterEventListeners() {
        this.#unregisterMouseListeners();
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
            this.stepMove(this.player, this.player.rotation + Math.PI/2);
        }
        if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]) {
            this.fire("left");
        }
        if (keyPressed["ArrowRight"] || keyPressed["KeyD"]) {
            this.fire("right");
        }
        if (keyPressed["ArrowDown"] || keyPressed["KeyS"]){
            this.stepMove(this.player, this.player.rotation - Math.PI/2);
        }
    };

    stepMove(person, direction, force) {
        //if (this.performanceS) {
        //    console.log(`step time: ,  ${performance.now() - this.performanceS}`);
        //}
        const forceToUse = !force || force > 1 ? 1 : force,
            movementForce = forceToUse * 1,
            newCoordX = person.x + movementForce * Math.cos(direction),
            newCoordY = person.y + movementForce * Math.sin(direction);
            
        person.isMoving = true;
        person.isAiming = false;
        if (!this.isBoundariesCollision(newCoordX, newCoordY, person)) {
            person.x = newCoordX; 
            person.y = newCoordY;
            //this.screenPageData.centerCameraPosition(newCoordX, newCoordY);
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
            rad = angle_2points(this.player.x, this.player.y, cursorPosX, cursorPosY);
            
            this.player.rotation = rad - Math.PI/2;
    };

    fire(board) {
        if (board === "left") {
            console.log("fire left");
        } else {
            console.log("fire right");
        }
    }
}