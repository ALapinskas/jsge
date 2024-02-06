import { GameStage, CONST, System, SystemSettings } from "../../src/index.js";

export class CustomWebGlTestPage extends GameStage {
	register() {
    	this.iLoader.addImage("person", "https://cdn.glitch.global/4d482ac3-ab8e-414f-8d6e-75c6c198a844/SpritesheetGuns.png?v=1702793251346");
    	this.iLoader.addTileMap("big_map", "./big_map/map_200.tmj");
		this.timer = null;
		document.body.style.margin= 0;

		// testing custom shader program
		this.iLoader.addImage("noise", "./testCustomWebGl/noise_s.png");
		this.iLoader.addImage("pic", "./testCustomWebGl/Rocks512.jpg");
		this.iLoader.addImage("rocks", "./testCustomWebGl/rocks_grey_s.png");
	}
    init() {
		const [w, h] = this.stageData.canvasDimensions;
    	// x, y, width, height, imageKey
       	//const background = this.draw.tiledLayer("ground", "big_map");
       	//const walls = this.draw.tiledLayer("walls", "big_map");
       	
		const noiseImg = this.iLoader.getImage("noise"),
			picImg = this.iLoader.getImage("pic"),
			rocksImg = this.iLoader.getImage("rocks");
		// should be registered
		this.customDrawObject = this.draw.customDrawObject(0, 0, w, h, noiseImg, picImg, rocksImg);

		//this.shadowRect = this.draw.rect(w/2, h/2, 100, 200, "rgba(0, 0, 0, 1)");  
		//this.image = this.draw.image(w/2 - 100, h/2 - 100, 128, 128, "rocks");  
		//this.shadowRect.turnOffOffset();
		this.registerListeners();
    }
    start() {
		this.customDrawObject.renderStartTime = Date.now();
    }

	stop() {
		this.customDrawObject.renderStartTime = 0;
	}
	
	registerListeners() {
		
	}
}
