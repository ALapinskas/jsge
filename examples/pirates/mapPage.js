import { ScreenPage, CONST } from "/index.es6.js";
import { utils } from "/index.es6.js";

const SHIPS_KEY = "ships";
const angle_2points = utils.angle_2points,
    isPointLineIntersect = utils.isPointLineIntersect;

export class MapPage extends ScreenPage {
    #keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false };

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

        this.player = this.draw.image(50, 200, 33, 57, SHIPS_KEY, 0);
        this.addRenderObject(CONST.LAYERS.DEFAULT, this.player);
    }

    start() {
        this.registerEventListeners();
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
        if (!this.isCollision(newCoordX, newCoordY)) {
            person.x = newCoordX; 
            person.y = newCoordY;
            //this.screenPageData.centerCameraPosition(newCoordX, newCoordY);
        }
    }
    
    isCollision = (x, y) => {
        const mapObjects = this.screenPageData.getBoundaries(),
            [mapOffsetX, mapOffsetY] = this.screenPageData.worldOffset,
            len = mapObjects.length;
        for (let i = 0; i < len; i+=1) {
            const item = mapObjects[i],
                object = {
                    x1: item[0],
                    y1: item[1],
                    x2: item[2],
                    y2: item[3]
                };
            if (isPointLineIntersect({x: x - mapOffsetX, y: y - mapOffsetY}, object)) {
                return true;
            }
        }
        return false;
    };

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