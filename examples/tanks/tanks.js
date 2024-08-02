import { GameStage, CONST, System, SystemSettings } from "../../src/index.js";
import { angle_2points } from "../../src/utils.js";
import { utils } from "../../src/index.js";

export class Tanks extends GameStage {
	#GUN_CENTER_OFFSET = 12;
	#keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false };
	#bullets = [];
	register() {
    	this.iLoader.addTileMap("map", "./tanks/tanks_map.tmj");
		this.iLoader.addAtlasXML("objects", "./tanks/images/onlyObjects_default.xml");
		this.timer = null;
		document.body.style.margin = 0;
	}
    init() {
		const [w, h] = this.stageData.canvasDimensions;
    	// x, y, width, height, imageKey
       	const ground = this.draw.tiledLayer("ground", "map");
       	const objects = this.draw.tiledLayer("items", "map", true);
		
		this.tank = this.draw.image(100, 300, 38, 38, "tankBody_blue");
		this.gun = this.draw.image(100, 300 + this.#GUN_CENTER_OFFSET, 8, 26, "tankBlue_barrel2");
		// gun.rotation = Math.PI;
		// this.shadowRect = this.draw.rect(0, 0, w, h, "rgba(0, 0, 0, 0.5)");  
     	// this.shadowRect.blendFunc = [WebGLRenderingContext.ONE, WebGLRenderingContext.DST_COLOR];
		// this.shadowRect.turnOffOffset();
       	
		// this.personSightView = this.draw.conus(55, 250, 200, "rgba(0,0,0,1)", Math.PI/3);
		// this.personSightView.rotation = -Math.PI/6;
		// this.personSightView._isMask = true;
		this.navItemBack = this.draw.text(w - 200, 30, "Main menu", "18px sans-serif", "black");
        this.navItemBack.turnOffOffset();
		this.registerListeners();
    }
    start() {
       	this.stageData.centerCameraPosition(100, 300);
		this.registerListeners();
		setTimeout(() => {
			const [w, h] = this.stageData.canvasDimensions;
		},100);
		console.log("tanks started");
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

    stepMove(direction, force) {
        const tank = this.tank,
			tankDirection = this.tank.rotation + Math.PI/2,
			forceToUse = !force || force > 1 ? 1 : force,
			movementForce = forceToUse * 1;
		let newCoordX, newCoordY;

		switch (direction) {
			case "forward":
				newCoordX = tank.x + movementForce * Math.cos(tankDirection);
				newCoordY = tank.y + movementForce * Math.sin(tankDirection);
				
				if (!this.isBoundariesCollision(newCoordX, newCoordY, tank)
					&& !this.isBoundariesCollision(newCoordX, newCoordY, this.gun)) {
					tank.x = newCoordX;
					tank.y = newCoordY;
					this.#calculateGunCenterAndPos();
					this.stageData.centerCameraPosition(newCoordX, newCoordY);
				}
				break;
			case "backward":
				newCoordX = tank.x + movementForce * Math.cos(tankDirection + Math.PI);
				newCoordY = tank.y + movementForce * Math.sin(tankDirection + Math.PI);
				
				if (!this.isBoundariesCollision(newCoordX, newCoordY, tank)) {
					tank.x = newCoordX;
					tank.y = newCoordY;
					this.#calculateGunCenterAndPos();
					this.stageData.centerCameraPosition(newCoordX, newCoordY);
				}
				break;
			case "turn_left":
				this.tank.rotation -= Math.PI/98;
				this.#calculateGunCenterAndPos();
				break;
			case "turn_right":
				this.tank.rotation += Math.PI/98;
				this.#calculateGunCenterAndPos();
				break;
			default:
				console.error("unrecognized move");
		}
        
    }

    #removeKeyAction = (event) => {
        const code = event.code;
        this.#keyPressed[code] = false;
    };

    #mouseMoveAction = (e) => {
        const [xOffset, yOffset] = this.stageData.worldOffset,
            x = e.offsetX,
            y = e.offsetY,
            cursorPosX = x + xOffset,
            cursorPosY = y + yOffset,
			currentTankCenterX = this.tank.x,
			currentTankCenterY = this.tank.y,
            tankCursorAngle = angle_2points(currentTankCenterX, currentTankCenterY, cursorPosX, cursorPosY),
			newGunCenterCoordX = currentTankCenterX + this.#GUN_CENTER_OFFSET * Math.cos(tankCursorAngle),
			newGunCenterCoordY = currentTankCenterY + this.#GUN_CENTER_OFFSET * Math.sin(tankCursorAngle),
			gunCenterAngle = angle_2points(newGunCenterCoordX, newGunCenterCoordY, cursorPosX, cursorPosY);

        this.gun.rotation = gunCenterAngle - Math.PI / 2;

		this.gun.x = newGunCenterCoordX;
		this.gun.y = newGunCenterCoordY;

		const isNav1Traversed = utils.isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.boundariesBox);
    
        if (isNav1Traversed) {
            this.navItemBack.strokeStyle = "rgba(0, 0, 0, 0.3)";
            document.getElementsByTagName("canvas")[0].style.cursor = "pointer";
        } else if (this.navItemBack.strokeStyle) {
            this.navItemBack.strokeStyle = undefined;
            document.getElementsByTagName("canvas")[0].style.cursor = "default";
        } else {
            document.getElementsByTagName("canvas")[0].style.cursor = "default";
        }
    };

	#calculateGunCenterAndPos() {
		const currentTankCenterX = this.tank.x,
			currentTankCenterY = this.tank.y,
			gunRotation = this.gun.rotation,
			newGunCenterCoordX = currentTankCenterX + this.#GUN_CENTER_OFFSET * Math.cos(gunRotation + Math.PI / 2),
			newGunCenterCoordY = currentTankCenterY + this.#GUN_CENTER_OFFSET * Math.sin(gunRotation + Math.PI / 2);
			
		this.gun.x = newGunCenterCoordX;
		this.gun.y = newGunCenterCoordY;
	}

    #mouseClickAction = (e) => {
		console.log("fire");
		const bullet = this.#createBullet();
        this.#bullets.push(bullet);

	const isNav1Click = utils.isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.boundariesBox);
	if (isNav1Click) {
		this.iSystem.stopGameStage("tanks");
		this.canvasHtmlElement.style.cursor = "default";
		this.iSystem.startGameStage("start");
	}
    }

	
    
        

	#createBullet = () => {
        const b = this.draw.image(this.gun.x, this.gun.y, 8, 26, "shotThin", 0, {r:4}),
			BULLET_SHIFT = 24;
        b.rotation = this.gun.rotation + Math.PI;

		// shit bullet forward
		const direction = b.rotation - Math.PI/2;
		const newCoordX = b.x + BULLET_SHIFT * Math.cos(direction),
            newCoordY = b.y + BULLET_SHIFT * Math.sin(direction);

		b.x = newCoordX;
		b.y = newCoordY;
        //f.addAnimation(ANIMATION_FIREMOVE, [406, 407, 408, 409, 500], true, 5);
        //f.addAnimation(ANIMATION_REACHWALL, [116, 117, 118], false, 5);

        //f.emit(ANIMATION_FIREMOVE);

        //this.audio.getAudioCloned(this.fireballCastKey).play();
        return b;
    }

    #bulletFly = (bullet) => {
        //let distance = 0;
        const speed = 1,
        direction = bullet.rotation - Math.PI/2;

        const newCoordX = bullet.x + speed * Math.cos(direction),
            newCoordY = bullet.y + speed * Math.sin(direction);
		bullet.x = newCoordX;
		bullet.y = newCoordY;
		
        //console.log(newCoordX);
        if (this.isBoundariesCollision(newCoordX, newCoordY, bullet)) {
            //console.log("boundaries collision happen");
            this.#bullets.splice(this.#bullets.indexOf(bullet), 1);
			
            setTimeout(() => {
                //remove bullet
				console.log("reach wall");
                bullet.destroy();
                //this.audio.getAudioCloned(this.#fireballDestroyAudioKey).play();
            }, 200);
        }
    }

	#render = () => {
		const keyPressed = this.#keyPressed;

		if (keyPressed["ArrowUp"] || keyPressed["KeyW"]){
            this.stepMove("forward");
        }
        if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]) {
            this.stepMove("turn_left");
        }
        if (keyPressed["ArrowRight"] || keyPressed["KeyD"]) {
            this.stepMove("turn_right");
        }
        if (keyPressed["ArrowDown"] || keyPressed["KeyS"]){
            this.stepMove("backward");
        }

		if(this.#bullets.length > 0) {
            for (const bullet of this.#bullets) {
                this.#bulletFly(bullet);
            }
        }
	}
	#registerSystemEventsListeners() {
		this.iSystem.addEventListener(CONST.EVENTS.SYSTEM.RENDER.START, this.#render);
	}

	#unregisterSystemEventsListeners() {
		this.iSystem.removeEventListener(CONST.EVENTS.SYSTEM.RENDER.START, this.#render);
	}
	move(dir) {
		let newX = this.tank.x, 
			newY = this.tank.y;
		switch(dir) {
			case "left":
				newX = newX - 1;
				break;
			case "right":
				newX = newX + 1;
				break;
			case "top":
				newY = newY - 1;
				break;
			case "bottom":
				newY = newY + 1;
				break;
		}
		if (!this.isBoundariesCollision(newX, newY, this.tank)) {
			this.tank.x = newX;
			this.tank.y = newY;
			this.gun.x = newX;
			this.gun.y = newY;
			this.stageData.centerCameraPosition(newX, newY);
		}
	}
	
	stopAction = () => {
		clearInterval(this.timer);
		this.timer = null;
	}
	
	fireAction = () => {
		this.person.emit("fire");
	}
}
