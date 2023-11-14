import { ScreenPage, CONST, DrawImageObject, SystemAudioInterface } from "../../src/index.js";
import { utils } from "../../src/index.js";

const angle_2points = utils.angle_2points;

const OVERLAY_LAYER_KEY = "overlay";

const ANIMATION_FIREMOVE = "firemove",
    ANIMATION_REACHWALL = "reachwall";

const ENEMY_DETECT_DISTANCE = 150;
export class MapPage extends ScreenPage {
    #keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false };
    #enemies = [];
    #skippedRender = 0;
    tilemapKey = "dungeonGameMapTileset";
    fireImagesKey = "fireImages";
    defaultAudioKey = "default_audio_key";
    fireballCastKey = "fireball_cast_key";

    #fireballDestroyAudioKey = "fireball_d";

    #detectedByGhostAudioKey = "ghost_audio";

    register() {
        this.loader.addTileMap(this.tilemapKey, "./dungeon/map.tmj");
        this.loader.addImage(this.fireImagesKey, "./dungeon/images/All_Fire_Bullet_Pixel_16x16_00.png");
        this.loader.addAudio(this.fireballCastKey, "./dungeon/audio/zvuk-poleta-ognennogo-shara.mp3");
        this.loader.addAudio(this.#fireballDestroyAudioKey, "./dungeon/audio/ognennyiy-shar-vspyihnul.mp3");
        this.loader.addAudio(this.#detectedByGhostAudioKey, "./dungeon/audio/zvuk-prizraka-prividenie-24332.mp3");
        this.loader.addAudio(this.defaultAudioKey, "./dungeon/audio/ustrashayuschiy-nagnetayuschiy-zvuk-kapaniya-kapel-v-pustom-zabroshennom-pomeschenii.mp3");
        this.backgroundSounds = new SystemAudioInterface(this.loader);
        this.speed = 0;
        this.movingInterval = null;
    }

    init() {
        const [w, h] = this.screenPageData.canvasDimensions;

        this.createCanvasView(OVERLAY_LAYER_KEY);
        this.createCanvasView(CONST.LAYERS.DEFAULT);

        if (this.systemSettings.gameOptions.boundaries.drawLayerBoundaries) {
            this.createCanvasView(CONST.LAYERS.BOUNDARIES);
        }

        this.shadowRect = this.draw.rect(0, 0, w, h, "rgba(0, 0, 0, 0.5)");        
        this.shadowRect.sortIndex = 2;
        this.shadowRect.blendFunc = [WebGLRenderingContext.ONE, WebGLRenderingContext.DST_COLOR];

        this.addRenderObject(OVERLAY_LAYER_KEY, this.shadowRect);
        this.addRenderLayer(OVERLAY_LAYER_KEY, "background", this.tilemapKey);
        this.addRenderLayer(OVERLAY_LAYER_KEY, "walls", this.tilemapKey);

        this.sightView = this.draw.circle(55, 250, 150, "rgba(0, 0, 0, 1)"); //shapeMask
        this.sightView.sortIndex = 1;
        this.addRenderObject(OVERLAY_LAYER_KEY, this.sightView);

        this.player = this.draw.image(55, 250, 16, 16, "tilemap_packed", 84);
        this.fireRange = this.draw.conus(55, 250, 120, "rgba(255, 0,0, 0.2", Math.PI/8, false, 60);

        this.addRenderLayer(CONST.LAYERS.DEFAULT, "background", this.tilemapKey, false, this.sightView);
        this.addRenderLayer(CONST.LAYERS.DEFAULT, "walls", this.tilemapKey, true, this.sightView);
        this.addRenderLayer(CONST.LAYERS.DEFAULT, "decs", this.tilemapKey, false, this.sightView);
        
        this.greenLight = this.draw.conus(315,369,100,"rgba(0,128,0,0.5", Math.PI, false, 20);
        this.greenLight.setMask(this.sightView);

        this.addRenderObject(CONST.LAYERS.DEFAULT, this.player);
        this.addRenderObject(CONST.LAYERS.DEFAULT, this.fireRange);
        this.addRenderObject(CONST.LAYERS.DEFAULT, this.greenLight);
        //const sightViewVertices = this.calculateCircleVertices({x:55, y:250}, [0, 0], 2*Math.PI, 100, Math.PI/12);
        

        const monster1 = new Ghost(255,250, 16, 16, "tilemap_packed", 108);
        const monster2 = new Ghost(255,420, 16, 16, "tilemap_packed", 108);
        const monster3 = new Ghost(285,420, 16, 16, "tilemap_packed", 108);
        monster1.setMask(this.sightView);
        monster2.setMask(this.sightView);
        monster3.setMask(this.sightView);

        this.addRenderObject(CONST.LAYERS.DEFAULT, monster1);
        this.addRenderObject(CONST.LAYERS.DEFAULT, monster2);
        this.addRenderObject(CONST.LAYERS.DEFAULT, monster3);
        this.#enemies.push(monster1);
        this.#enemies.push(monster2);
        this.#enemies.push(monster3);

        this.audio.registerAudio(this.fireballCastKey);
        this.audio.registerAudio(this.#fireballDestroyAudioKey);
        this.audio.registerAudio(this.#detectedByGhostAudioKey);
        this.backgroundSounds.registerAudio(this.defaultAudioKey);
        this.backgroundSounds.volume = .5;
        const defaultAudio = this.backgroundSounds.getAudio(this.defaultAudioKey);
        defaultAudio.loop = true;
        defaultAudio.play();
    }

    start() {
        this.registerEventListeners();
        setTimeout(() => {
            // fix width height after render started, and sizes corrected
            const [w, h] = this.screenPageData.worldDimensions;
            this.shadowRect.width = w;
            this.shadowRect.height = h;
        },1000);
    }

    stop() {
        this.unregisterEventListeners();
    }

    registerEventListeners() {
        this.#registerMouseListeners();
        this.#registerKeyboardListeners();
        this.#registerSystemEvents();
    }

    unregisterEventListeners() {
        this.#unregisterMouseListeners();
        this.#unregisterKeyboardListeners();
        this.#unregisterSystemEvents();
    }

    #registerSystemEvents() {
        this.addEventListener(CONST.EVENTS.SYSTEM.RENDER.START, this.#renderAction);
    }

    #unregisterSystemEvents() {
        this.removeEventListener(CONST.EVENTS.SYSTEM.RENDER.START, this.#renderAction);
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

    #renderAction = (event) => {
        if (this.#skippedRender > 8) {
            const new_value = Math.random() * (40 - 20) + 20;
            this.greenLight.fade_min = new_value;
            this.#skippedRender = 0;
        } else {
            this.#skippedRender += 1;
        }
        const enemiesLen = this.#enemies.length;
        for (let i = 0; i < enemiesLen; i++) {
            const enemy = this.#enemies[i];
            if (utils.countDistance(enemy, this.player) < ENEMY_DETECT_DISTANCE) {
                this.audio.getAudio(this.#detectedByGhostAudioKey).play();
                enemy.moveTo(this.player.x, this.player.y);
            } else {
                enemy.idle();
            } 
        }
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

    #mouseClickAction = () => {
        const fireball = this.#createFireball();
        this.#fireballFly(fireball);
    }

    #createFireball = () => {
        const f = this.draw.image(this.player.x, this.player.y, 16, 16, this.fireImagesKey, 36, [[-8,0], [0, -4], [8, 0], [0,4]]);
        f.addAnimation(ANIMATION_FIREMOVE, [36, 37, 38, 39], true);
        f.addAnimation(ANIMATION_REACHWALL, [116, 117, 118]);

        this.addRenderObject(CONST.LAYERS.DEFAULT, f);
        f.emit(ANIMATION_FIREMOVE);

        this.audio.getAudioCloned(this.fireballCastKey).play();
        return f;
    }

    #fireballFly = (fireball) => {
        //let distance = 0;
        const speed = 1,
            direction = this.fireRange.rotation + Math.PI/28,
            interval = setInterval(() => {
                const newCoordX = fireball.x + speed * Math.cos(direction),
                    newCoordY = fireball.y + speed * Math.sin(direction);
                fireball.x = newCoordX;
                fireball.y = newCoordY;
                //console.log(newCoordX);
                if (this.isBoundariesCollision(newCoordX, newCoordY, fireball) 
                || this.isObjectsCollision(newCoordX, newCoordY, fireball, this.#enemies)) {
                    //stop itself
                    clearInterval(interval);
                    //console.log("boundaries collision happen");
                    fireball.stopRepeatedAnimation(ANIMATION_FIREMOVE);
                    fireball.emit(ANIMATION_REACHWALL);
                    setTimeout(() => {
                        //remove fireball
                        fireball.destroy();
                        this.audio.getAudioCloned(this.#fireballDestroyAudioKey).play();
                    }, 36);
                }
            }, 10);
    }

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

class Ghost extends DrawImageObject {
    #idle = true;
    #moveSpeed = 0.5;

    constructor(mapX, mapY, width, height, key, imageIndex) {
        super(mapX, mapY, width, height, key, imageIndex);
    }

    moveTo = (x, y) => {
        this.#idle = false;
        const forceToUse = this.#moveSpeed,
            direction = angle_2points(this.x, this.y, x, y),
            newCoordX = this.x + forceToUse * Math.cos(direction),
            newCoordY = this.y + forceToUse * Math.sin(direction);
            
        this.x = newCoordX;
        this.y = newCoordY;
    }

    idle = () => {
        this.#idle = true;
    }
}