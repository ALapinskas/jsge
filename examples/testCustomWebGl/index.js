import { GameStage, CONST, System, SystemSettings } from "../../src/index.js";
import { utils } from "../../src/index.js";

export class CustomWebGlTestPage extends GameStage {
	register() {
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
		this.navItemBack = this.draw.text(w - 200, 30, "Main menu", "18px sans-serif", "black");
        this.navItemBack.turnOffOffset();
		this.registerListeners();
    }
    start() {
		this.customDrawObject.renderStartTime = Date.now();
		console.log("custom_webgl started");
		this.#registerMouseListeners();
    }

	stop() {
		this.customDrawObject.renderStartTime = 0;
		this.#unregisterMouseListeners();
	}
	
	registerListeners() {
		
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

        const isNav1Traversed = utils.isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.collisionShapes);

        if (isNav1Traversed) {
            this.navItemBack.strokeStyle = "rgba(0, 0, 0, 0.3)";
            document.getElementsByTagName("canvas")[0].style.cursor = "pointer";
        } else if (this.navItemBack.strokeStyle) {
            this.navItemBack.strokeStyle = undefined;
            document.getElementsByTagName("canvas")[0].style.cursor = "default";
        }
    };

    #mouseClickAction = (e) => {
		const isNav1Click = utils.isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.collisionShapes);
    
        if (isNav1Click) {
            this.iSystem.stopGameStage("custom_webgl");
            this.iSystem.startGameStage("start");
        }
    }
}
