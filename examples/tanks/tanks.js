import { GameStage, CONST, System, SystemSettings } from "../../src/index.js";

export class Tanks extends GameStage {
	register() {
    	//this.iLoader.addImage("person", "https://cdn.glitch.global/4d482ac3-ab8e-414f-8d6e-75c6c198a844/SpritesheetGuns.png?v=1702793251346");
    	this.iLoader.addTileMap("map", "./tanks/tanks_map.tmj");
		this.iLoader.addAtlasXML("objects", "./tanks/images/onlyObjects_default.xml");
		this.timer = null;
		document.body.style.margin = 0;
	}
    init() {
		const [w, h] = this.stageData.canvasDimensions;
    	// x, y, width, height, imageKey
       	const ground = this.draw.tiledLayer("ground", "map");
       	//const walls = this.draw.tiledLayer("walls", "big_map");
		const tank = this.draw.image(100, 300, 38, 38, "tankBody_blue");
		//this.shadowRect = this.draw.rect(0, 0, w, h, "rgba(0, 0, 0, 0.5)");  
     	//this.shadowRect.blendFunc = [WebGLRenderingContext.ONE, WebGLRenderingContext.DST_COLOR];
		//this.shadowRect.turnOffOffset();
       	
		//this.personSightView = this.draw.conus(55, 250, 200, "rgba(0,0,0,1)", Math.PI/3);
		//this.personSightView.rotation = -Math.PI/6;
		//this.personSightView._isMask = true;
		
	
		this.registerListeners();
    }
    start() {
       	this.stageData.centerCameraPosition(55, 250);
		setTimeout(() => {
			const [w, h] = this.stageData.canvasDimensions;
		},100)
    }
	
	registerListeners() {
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
