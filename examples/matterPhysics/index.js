import MatterJsModuleInitialization from "../../modules/matter/dist/bundle.js";
import { GameStage, CONST } from "../../src/index.js";
import { DRAW_TYPE } from "../../src/constants.js";
import { utils } from "../../src/index.js";


export class MatterPhysicsStage extends GameStage {
	#randomTexts = [];

    #dragItem;
	register() {
        
		this.timer = null;
		document.body.style.margin = 0;
	}
    init() {
		const [w, h] = this.stageData.canvasDimensions;

        this.matterJsModule = this.iSystem.installModule("matterJsModule", MatterJsModuleInitialization, { isDebug: true });

		this.navItemBack = this.draw.text(w - 200, 30, "Main menu", "18px sans-serif", "black");
        this.navItemBack.turnOffOffset();

		this.registerListeners();
    }
    start() {
        const [w, h] = this.stageData.canvasDimensions;
        console.log("state matter physics stage");
        setTimeout(() => {
            this.rect1 = this.draw.rect(200, 200, 100, 100, "rgba(20, 20, 100, 1)");
            this.rect1.rotation = 0.5;
            this.rect2 = this.draw.rect(280, 200, 100, 100, "rgba(50, 80, 100, 1)");
            this.rect2.rotation = 0.1;

            this.triangle = this.draw.polygon([{x:300, y:100}, {x:500, y:100}, {x:500, y:200}, {x:300, y:200}], "rgba(130,30,130,1)");

            this.circle = this.draw.circle(150, 150, 20, "rgba(20, 20, 100, 1)");
            this.ground = this.draw.rect(w/2, 580, w, 100, "rgba(0, 0, 0, 1)", { isStatic: true });

            console.log("matter physics page started");
            //this.stageData.centerCameraPosition(1200, 0);
        }, 1000);
		this.#registerMouseListeners();
    }

	stop() {
		this.#unregisterMouseListeners();
	}

	#render = () => {
		//console.log("render");
	}
	
	registerListeners() {
		this.#registerSystemEventsListeners();
	}

	unregisterListeners() {
		this.#unregisterSystemEventsListeners();
	}

	#registerSystemEventsListeners() {
		this.iSystem.addEventListener(CONST.EVENTS.SYSTEM.RENDER.START, this.#render);
	}

	#unregisterSystemEventsListeners() {
		this.iSystem.removeEventListener(CONST.EVENTS.SYSTEM.RENDER.START, this.#render);
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

        if (this.#dragItem) {
            this.#dragItem.x = e.offsetX;
            this.#dragItem.y = e.offsetY;
        }
    };

    #mouseClickAction = (e) => {
		const isNav1Click = utils.isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.boundariesBox),
            isStageDataClicked = this.stageData.renderObjects.find(item => {
                switch(item.type) {
                    case DRAW_TYPE.RECTANGLE:
                        return utils.isPointRectIntersect(e.offsetX, e.offsetY, item);
                    case DRAW_TYPE.POLYGON:
                        //console.log("polygon test: ", item.vertices);
                        const verticesWithPos = item.vertices.map((vertex) => [vertex[0] + item.x, vertex[1] + item.y]);
                        const isPointInsidePolygon = utils.isPointInsidePolygon(e.offsetX, e.offsetY, verticesWithPos);
                        //console.log("x: ", e.offsetX, ", y: ", e.offsetY);
                        //console.log("isInside: ", isPointInsidePolygon);
                        return isPointInsidePolygon; 
                    case DRAW_TYPE.CIRCLE:
                        return utils.isPointCircleIntersect(e.offsetX, e.offsetY, { x:item.x, y:item.y, r: item.radius });
                }
                
            });
    
        if (isNav1Click) {
            this.iSystem.stopGameStage("texts");
            this.iSystem.startGameStage("start");
        }

        if (this.#dragItem) {
            this.#dragItem = null;
            console.log("undrug");
        } else if (isStageDataClicked) {
            console.log("drug item: ", isStageDataClicked);
            this.#dragItem = isStageDataClicked;
        }
    }
}
