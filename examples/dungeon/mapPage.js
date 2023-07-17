import { ScreenPage, CONST } from "/index.es6.js";
import { utils } from "/index.es6.js";

const angle_2points = utils.angle_2points;

const OVERLAY_LAYER_KEY = "overlay";

export class MapPage extends ScreenPage {
    #keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false };

    register() {
        this.tilemapKey = "gameMapTileset";
        this.loader.addTileMap(this.tilemapKey, "/dungeon/map.tmj");

        this.speed = 0;
        this.movingInterval = null;
    }

    init() {
        const [w, h] = this.screenPageData.canvasDimensions;

        this.createCanvasView(CONST.LAYERS.DEFAULT);
        this.createCanvasView(OVERLAY_LAYER_KEY);

        if (this.systemSettings.gameOptions.boundaries.drawLayerBoundaries) {
            this.createCanvasView(CONST.LAYERS.BOUNDARIES);
        }

        this.shadowRect = this.draw.rect(0, 0, w, h, "rgba(0, 0, 0, 0.5)");        
        this.shadowRect.zIndex = 2;
        this.shadowRect.blendFunc = [WebGLRenderingContext.ONE, WebGLRenderingContext.DST_COLOR];

        this.addRenderObject(OVERLAY_LAYER_KEY, this.shadowRect);
        this.addRenderLayer(OVERLAY_LAYER_KEY, "background", this.tilemapKey);
        this.addRenderLayer(OVERLAY_LAYER_KEY, "walls", this.tilemapKey);

        this.addRenderLayer(CONST.LAYERS.DEFAULT, "background", this.tilemapKey);
        this.addRenderLayer(CONST.LAYERS.DEFAULT, "walls", this.tilemapKey, true);
        this.addRenderLayer(CONST.LAYERS.DEFAULT, "decs", this.tilemapKey);
        
        //const sightViewVertices = this.calculateCircleVertices({x:55, y:250}, [0, 0], 2*Math.PI, 100, Math.PI/12);
        this.player = this.draw.image(55, 250, 16, 16, "tilemap_packed", 84);
        this.sightView = this.draw.circle(55, 250, 150, "rgba(0, 0, 0, 1)", true);
        this.sightView.zIndex = 1;
        this.fireRange = this.draw.conus(55, 250, 120, "rgba(255, 0,0, 0.2", Math.PI/8);
        this.addRenderObject(OVERLAY_LAYER_KEY, this.player);
        this.addRenderObject(OVERLAY_LAYER_KEY, this.sightView);
        this.addRenderObject(OVERLAY_LAYER_KEY, this.fireRange);
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
            this.stepMove(-(Math.PI/2));
        }
        if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]) {
            this.stepMove(Math.PI);
        }
        if (keyPressed["ArrowRight"] || keyPressed["KeyD"]) {
            this.stepMove(0);
        }
        if (keyPressed["ArrowDown"] || keyPressed["KeyS"]){
            this.stepMove(Math.PI/2);
        }
    };

    stepMove(direction, force) {
        const person = this.player;
        const forceToUse = !force || force > 1 ? 1 : force,
            movementForce = forceToUse * 1,
            newCoordX = person.x + movementForce * Math.cos(direction),
            newCoordY = person.y + movementForce * Math.sin(direction);
            
        if (!this.isBoundariesCollision(newCoordX, newCoordY, person)) {
            person.x = newCoordX; 
            person.y = newCoordY;
            this.sightView.x = newCoordX;
            this.sightView.y = newCoordY;
            this.fireRange.x = newCoordX;
            this.fireRange.y = newCoordY;
            this.screenPageData.centerCameraPosition(newCoordX, newCoordY);
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
            
        //this.player.rotation = rad;
        this.fireRange.rotation = rad - (Math.PI/20);
    };

    calculateCircleVertices(renderObject, offset, angle, width, step) {
        const [ xOffset, yOffset ] = offset,
            renderObjectX = renderObject.x - xOffset,
            renderObjectY = renderObject.y - yOffset,
            deg = renderObject.direction || 0,
            len = angle + deg;

        let conusPolygonCoords = [renderObjectX, renderObjectY];
        for (let r = 0; r <= len; r += step) {
            let dx = Math.cos(r) * width,
                dy = Math.sin(r) * width;

            let x2 = renderObjectX + dx,
                y2 = renderObjectY + dy,
                sightCords = {
                    x1: renderObjectX, 
                    y1: renderObjectY,
                    x2: x2,
                    y2: y2
                },
                traversalToUse = {x: sightCords.x2, y: sightCords.y2, p:1};

            conusPolygonCoords.push(traversalToUse.x, traversalToUse.y);
            //const verticesLen = conusPolygonCoords.length;
            //if (verticesLen % 6 === 0)
            //conusPolygonCoords.push(renderObjectX, renderObjectY);
        }

        //const excess = conusPolygonCoords.length % 6;
        // fix vertices number to be a multiple of 6
        //const coordsFixed = conusPolygonCoords.slice(0, conusPolygonCoords.length - excess);
            
        return conusPolygonCoords;
    }
}