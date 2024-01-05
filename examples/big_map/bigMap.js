import { GameStage, CONST, System, SystemSettings } from "../../src/index.js";

export class BigMap extends GameStage {
	register() {
    	this.iLoader.addImage("person", "https://cdn.glitch.global/4d482ac3-ab8e-414f-8d6e-75c6c198a844/SpritesheetGuns.png?v=1702793251346");
    	this.iLoader.addTileMap("big_map", "./big_map/map_200.tmj");
		this.timer = null;
		document.body.style.margin= 0;
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
		// fire animation switch frames 2-3-2, not repeat, animation speed 5 render circles per frame
		this.person.addAnimation("fire", [2,3,2], false, 5);
		
		this.createButtons();
		this.registerListeners();
    }
    start() {
       	this.stageData.centerCameraPosition(55, 250);
		setTimeout(() => {
			const [w, h] = this.stageData.canvasDimensions;
			this.shadowRect.width = w;
			this.shadowRect.heigth = h;
		},100)
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
		this.bLeft.addEventListener("mousedown", () => this.buttonMoveClick("left"));
		this.bLeft.addEventListener("touchstart", () => this.buttonMoveClick("left"));
		this.bLeft.addEventListener("mouseup", this.stopAction);
		this.bLeft.addEventListener("touchend", this.stopAction);
		this.bTop.addEventListener("mousedown", () => this.buttonMoveClick("top"));
		this.bTop.addEventListener("touchstart", () => this.buttonMoveClick("top"));
		this.bTop.addEventListener("mouseup", this.stopAction);
		this.bTop.addEventListener("touchend", this.stopAction);
		this.bRight.addEventListener("mousedown", () => this.buttonMoveClick("right"));
		this.bRight.addEventListener("touchstart", () => this.buttonMoveClick("right"));
		this.bRight.addEventListener("mouseup", this.stopAction);
		this.bRight.addEventListener("touchend", this.stopAction);
		this.bBottom.addEventListener("mousedown", () => this.buttonMoveClick("bottom"));
		this.bBottom.addEventListener("touchstart", () => this.buttonMoveClick("bottom"));
		this.bBottom.addEventListener("mouseup", this.stopAction);
		this.bBottom.addEventListener("touchend", this.stopAction);
		this.bRotateClockwise.addEventListener("mousedown", () => this.buttonRotateClick("clockwise"));
		this.bRotateClockwise.addEventListener("touchstart", () => this.buttonRotateClick("clockwise"));
		this.bRotateClockwise.addEventListener("mouseup", this.stopAction);
		this.bRotateClockwise.addEventListener("touchend", this.stopAction);
		this.bRotateAnticlockwise.addEventListener("mousedown", () => this.buttonRotateClick("anticlockwise"));
		this.bRotateAnticlockwise.addEventListener("touchstart", () => this.buttonRotateClick("anticlockwise"));
		this.bRotateAnticlockwise.addEventListener("mouseup", this.stopAction);
		this.bRotateAnticlockwise.addEventListener("touchend", this.stopAction);
		this.bFire.addEventListener("mouseup", this.fireAction);
		this.bFire.addEventListener("touchend", this.fireAction);
	}
	
	buttonMoveClick(dir) {
		clearInterval(this.timer);
		this.timer = setInterval(() => {
			this.move(dir);
    	}, 16);
	}
	
	move(dir) {
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
}
