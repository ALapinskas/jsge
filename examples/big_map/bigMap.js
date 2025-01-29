import { GameStage, CONST, System, SystemSettings } from "../../src/index.js";
import { utils } from "../../src/index.js";

export class BigMap extends GameStage {
	register() {
    	this.iLoader.addImage("person", "https://cdn.glitch.global/4d482ac3-ab8e-414f-8d6e-75c6c198a844/SpritesheetGuns.png?v=1702793251346");
    	this.iLoader.addTileMap("big_map", "./big_map/map_big.tmj");
		this.timer = null;
		document.body.style.margin = 0;
	}
    init() {
		const [w, h] = this.stageData.canvasDimensions;
    	// x, y, width, height, imageKey
       	const background = this.draw.tiledLayer("ground", "big_map");
       	const walls = this.draw.tiledLayer("walls", "big_map");
		
		this.shadowRect = this.draw.rect(0, 0, w, h, "rgba(0, 0, 0, 0.5)");  
     	this.shadowRect.blendFunc = [WebGLRenderingContext.ONE, WebGLRenderingContext.DST_COLOR];
		this.shadowRect.turnOffOffset();
       	
		this.personSightView = this.draw.conus(55, 250, 200, "rgba(0,0,0,1)", Math.PI/3);
		this.personSightView.rotation = -Math.PI/6;
		this.personSightView._isMask = true;
		
		this.draw.tiledLayer("ground", "big_map", false, this.personSightView);
        this.draw.tiledLayer("walls", "big_map", true, this.personSightView);
		
		this.person = this.draw.image(55, 250, 48, 48, "person", 2, {r: 8});
		// fire animation switch frames 2-3-2, not repeat, animation speed 100 ms each frame
		this.person.addAnimation("fire", [{duration:100, id:2},{duration:100,id:3},{duration:100,id:2}], false);
		
		this.navItemBack = this.draw.text(w - 200, 30, "Main menu", "18px sans-serif", "black");
		this.navItemBack.turnOffOffset();

		this.createButtons();
		this.registerListeners();
		this.#registerMouseListeners();
    }
    start() {
       	this.stageData.centerCameraPosition(55, 250);
		setTimeout(() => {
			const [w, h] = this.stageData.canvasDimensions;
			this.shadowRect.width = w;
			this.shadowRect.heigth = h;
		},100);
		console.log("big_map started");
    }

	stop() {
		this.#unregisterListeners();
		this.#unregisterMouseListeners();
	}
	createButtons() {
		const [w, h] = this.stageData.canvasDimensions;
		this.buttonsContainer = document.createElement("div");
		this.buttonsContainer.style.position = "absolute";
		this.buttonsContainer.style.bottom = "20px";
		this.buttonsContainer.style.left = "40px";
		this.bLeft = document.createElement("button");
		this.bLeft.innerText = "←";
		this.bLeft.style.padding = "5px 10px";
		this.bTop = document.createElement("button");
		this.bTop.innerText = "↑";
		this.bTop.style.padding = "5px 10px";
		this.bRight = document.createElement("button");
		this.bRight.innerText = "→";
		this.bRight.style.padding = "5px 10px";
		this.bBottom = document.createElement("button");
		this.bBottom.innerText = "↓";
		this.bBottom.style.padding = "5px 10px";
		this.bRotateClockwise = document.createElement("button");
		this.bRotateClockwise.innerText = "↻";
		this.bRotateClockwise.style.padding = "5px 10px";
		this.bRotateAnticlockwise = document.createElement("button");
		this.bRotateAnticlockwise.innerText = "↺";
		this.bRotateAnticlockwise.style.padding = "5px 10px";
		this.bFire = document.createElement("button");
		this.bFire.innerText = "*";
		this.bFire.style.padding = "5px 10px";
		
		document.body.appendChild(this.buttonsContainer);
		this.buttonsContainer.appendChild(this.bLeft);
		this.buttonsContainer.appendChild(this.bRight);
		this.buttonsContainer.appendChild(this.bTop);
		this.buttonsContainer.appendChild(this.bBottom);
		this.buttonsContainer.appendChild(this.bRotateClockwise);
		this.buttonsContainer.appendChild(this.bRotateAnticlockwise);
		this.buttonsContainer.appendChild(this.bFire);
	}
	
	registerListeners() {
		this.bLeft.addEventListener("mousedown", this.buttonMoveClickLeft);
		this.bLeft.addEventListener("touchstart", this.buttonMoveClickLeft);
		this.bLeft.addEventListener("mouseup", this.stopAction);
		this.bLeft.addEventListener("touchend", this.stopAction);
		this.bTop.addEventListener("mousedown", this.buttonMoveClickTop);
		this.bTop.addEventListener("touchstart", this.buttonMoveClickTop);
		this.bTop.addEventListener("mouseup", this.stopAction);
		this.bTop.addEventListener("touchend", this.stopAction);
		this.bRight.addEventListener("mousedown", this.buttonMoveClickRight);
		this.bRight.addEventListener("touchstart", this.buttonMoveClickRight);
		this.bRight.addEventListener("mouseup", this.stopAction);
		this.bRight.addEventListener("touchend", this.stopAction);
		this.bBottom.addEventListener("mousedown", this.buttonMoveClickBottom);
		this.bBottom.addEventListener("touchstart", this.buttonMoveClickBottom);
		this.bBottom.addEventListener("mouseup", this.stopAction);
		this.bBottom.addEventListener("touchend", this.stopAction);
		this.bRotateClockwise.addEventListener("mousedown", this.buttonRotateClickClockwise);
		this.bRotateClockwise.addEventListener("touchstart", this.buttonRotateClickClockwise);
		this.bRotateClockwise.addEventListener("mouseup", this.stopAction);
		this.bRotateClockwise.addEventListener("touchend", this.stopAction);
		this.bRotateAnticlockwise.addEventListener("mousedown", this.buttonRotateClickAnticlockwise);
		this.bRotateAnticlockwise.addEventListener("touchstart", this.buttonRotateClickAnticlockwise);
		this.bRotateAnticlockwise.addEventListener("mouseup", this.stopAction);
		this.bRotateAnticlockwise.addEventListener("touchend", this.stopAction);
		this.bFire.addEventListener("mouseup", this.fireAction);
		this.bFire.addEventListener("touchend", this.fireAction);
	}

	#unregisterListeners() {
		this.bLeft.removeEventListener("mousedown", this.buttonMoveClickLeft);
		this.bLeft.removeEventListener("touchstart", this.buttonMoveClickLeft);
		this.bLeft.removeEventListener("mouseup", this.stopAction);
		this.bLeft.removeEventListener("touchend", this.stopAction);
		this.bTop.removeEventListener("mousedown", this.buttonMoveClickTop);
		this.bTop.removeEventListener("touchstart", this.buttonMoveClickTop);
		this.bTop.removeEventListener("mouseup", this.stopAction);
		this.bTop.removeEventListener("touchend", this.stopAction);
		this.bRight.removeEventListener("mousedown", this.buttonMoveClickRight);
		this.bRight.removeEventListener("touchstart", this.buttonMoveClickRight);
		this.bRight.removeEventListener("mouseup", this.stopAction);
		this.bRight.removeEventListener("touchend", this.stopAction);
		this.bBottom.removeEventListener("mousedown", this.buttonMoveClickBottom);
		this.bBottom.removeEventListener("touchstart", this.buttonMoveClickBottom);
		this.bBottom.removeEventListener("mouseup", this.stopAction);
		this.bBottom.removeEventListener("touchend", this.stopAction);
		this.bRotateClockwise.removeEventListener("mousedown", this.buttonRotateClickClockwise);
		this.bRotateClockwise.removeEventListener("touchstart", this.buttonRotateClickClockwise);
		this.bRotateClockwise.removeEventListener("mouseup", this.stopAction);
		this.bRotateClockwise.removeEventListener("touchend", this.stopAction);
		this.bRotateAnticlockwise.removeEventListener("mousedown", this.buttonRotateClickAnticlockwise);
		this.bRotateAnticlockwise.removeEventListener("touchstart", this.buttonRotateClickAnticlockwise);
		this.bRotateAnticlockwise.removeEventListener("mouseup", this.stopAction);
		this.bRotateAnticlockwise.removeEventListener("touchend", this.stopAction);
		this.bFire.removeEventListener("mouseup", this.fireAction);
		this.bFire.removeEventListener("touchend", this.fireAction);

		this.buttonsContainer.remove();
	}

	buttonMoveClickLeft = () => {
		this.buttonMoveClick("left");
	}
	buttonMoveClickRight = () => {
		this.buttonMoveClick("right");
	}
	buttonMoveClickTop = () => {
		this.buttonMoveClick("top");
	}
	buttonMoveClickBottom = () => {
		this.buttonMoveClick("bottom");
	}

	buttonRotateClickClockwise = () => {
		this.buttonRotateClick("clockwise");
	}

	buttonRotateClickAnticlockwise = () => {
		this.buttonRotateClick("anticlockwise");
	}
	
	buttonMoveClick = (dir) => {
		clearInterval(this.timer);
		this.timer = setInterval(() => {
			this.move(dir);
    	}, 16);
	}
	
	move = (dir) => {
		let newX = this.person.x, 
			newY = this.person.y;
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
		if (!this.isBoundariesCollision(newX, newY, this.person)) {
			this.person.x = newX;
			this.person.y = newY;
			this.personSightView.x = newX;
			this.personSightView.y = newY;
			this.stageData.centerCameraPosition(newX, newY);
		}
	}
	
	buttonRotateClick(dir) {
		clearInterval(this.timer);
		this.timer = setInterval(() => {
			console.log("rotate");
			if (dir === "clockwise") {
				this.person.rotation += Math.PI/16;
				this.personSightView.rotation += Math.PI/16;
			} else if (dir === "anticlockwise") {
				this.person.rotation -= Math.PI/16;
				this.personSightView.rotation -= Math.PI/16;
			}
    	}, 50);
	}
	
	stopAction = () => {
		clearInterval(this.timer);
		this.timer = null;
	}
	
	fireAction = () => {
		this.person.emit("fire");
	}

	
	#registerMouseListeners() {
        document.addEventListener("mousemove", this.#mouseMoveAction);
        document.addEventListener("click", this.#mouseClickAction);
    }

    #unregisterMouseListeners() {
        document.removeEventListener("mousemove", this.#mouseMoveAction);
        document.removeEventListener("click", this.#mouseClickAction);
    }

	#mouseMoveAction = (e) => {
        const [xOffset, yOffset] = this.stageData.worldOffset,
            x = e.offsetX,
            y = e.offsetY,
            cursorPosX = x + xOffset,
            cursorPosY = y + yOffset;

        const isNav1Traversed = utils.isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.boundariesBox);

        if (isNav1Traversed) {
            this.navItemBack.strokeStyle = "rgba(0, 0, 0, 0.3)";
            document.getElementsByTagName("canvas")[0].style.cursor = "pointer";
        } else if (this.navItemBack.strokeStyle) {
            this.navItemBack.strokeStyle = undefined;
            document.getElementsByTagName("canvas")[0].style.cursor = "default";
        }
    };

    #mouseClickAction = (e) => {
		const isNav1Click = utils.isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.boundariesBox);
    
        if (isNav1Click) {
            this.iSystem.stopGameStage("big_map");
            this.iSystem.startGameStage("start");
        }
    }
}
