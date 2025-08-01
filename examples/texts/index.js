import { GameStage, CONST, System, SystemSettings } from "../../src/index.js";
import { utils } from "../../src/index.js";
import { randomFromArray } from "../../src/utils.js";


const randTexts = [
    "This",
    "Item",
    "LongLongLong Text",
    "this item is simple",
    "no more worries", 
    "try this",
    "asdasdasdasd", 
    "wt4wertvcxc",
    "sdfsdrewrew",
    "scxvfdgfgn",
    "sdfwrewethdg",
    "wersdfxvxcv",
    "qwrwerwesdf"
]

export class TextsPage extends GameStage {
	#randomTexts = [];
	register() {
		this.timer = null;
		document.body.style.margin= 0;
	}
    init() {
		const [w, h] = this.stageData.canvasDimensions;
        
        this.background = this.draw.rect(0, 0, w, h, "rgba(120, 120, 120, 0.6)");

		let textsWidth = 0;
        for (let i = 0; i < 5; i++) {
            const text = this.draw.text(w/4 + textsWidth, h/2 - 200, utils.randomFromArray(randTexts), "16px sans-serif", "black");
            this.#randomTexts[i] = text;
            if (i !== 4) {
                textsWidth += text.boundariesBox.width + 20;
            }
        }
        let rTextsLen = 5;
        let textsHeight = h/2 - 160;
        for (let i = 0; i < 10; i++) {
            const text = this.draw.text(w/4 + textsWidth, textsHeight, utils.randomFromArray(randTexts), "16px sans-serif", "black");
            this.#randomTexts[i + rTextsLen] = text;
            textsHeight += (text.boundariesBox.height + 20);
            //if (i === 9) {
                //textsWidth -= text.boundariesBox.width - 20;
            //}
        }
        rTextsLen = 15;
        for (let i = 0; i < 5; i++) {
            const text = this.draw.text(w/4 + textsWidth, textsHeight, utils.randomFromArray(randTexts), "16px sans-serif", "black");
            this.#randomTexts[i + rTextsLen] = text;
            const prevText = this.#randomTexts[i + rTextsLen - 1];
            textsWidth -= (prevText.boundariesBox.width + 20);
        }
        rTextsLen = 20;
        for (let i = 0; i < 10; i++) {
            const text = this.draw.text(w/4 + textsWidth, textsHeight, utils.randomFromArray(randTexts), "16px sans-serif", "black");
            this.#randomTexts[i + rTextsLen] = text;
            textsHeight -= (text.boundariesBox.height + 20);
        }

        rTextsLen = 30;
        for (let i = 0; i < 8; i++) {
            const text = this.draw.text(w/4 + textsWidth, textsHeight, utils.randomFromArray(randTexts), "16px sans-serif", "black");
            this.#randomTexts[i + rTextsLen] = text;
            textsWidth += text.boundariesBox.width + 20;
        }

        rTextsLen = 38;
        for (let i = 0; i < 12; i++) {
            const text = this.draw.text(w/4 + textsWidth, textsHeight, utils.randomFromArray(randTexts), "16px sans-serif", "black");
            this.#randomTexts[i + rTextsLen] = text;
            textsHeight += (text.boundariesBox.height + 20);
        }

        rTextsLen = 50;
        for (let i = 0; i < 8; i++) {
            const text = this.draw.text(w/4 + textsWidth, textsHeight, utils.randomFromArray(randTexts), "16px sans-serif", "black");
            this.#randomTexts[i + rTextsLen] = text;
            const prevText = this.#randomTexts[i + rTextsLen - 1];
            textsWidth -= (prevText.boundariesBox.width + 20);
        }

        rTextsLen = 58;
        for (let i = 0; i < 10; i++) {
            const text = this.draw.text(w/4 + textsWidth, textsHeight, utils.randomFromArray(randTexts), "16px sans-serif", "black");
            this.#randomTexts[i + rTextsLen] = text;
            textsHeight -= (text.boundariesBox.height + 20);
        }

		this.navItemBack = this.draw.text(w - 200, 30, "Main menu", "18px sans-serif", "black");
        this.navItemBack.turnOffOffset();
		this.registerListeners();
    }
    start() {
		console.log("texts page started");
		this.#registerMouseListeners();
    }

	stop() {
		this.#unregisterMouseListeners();
	}

	#render = () => {
		//console.log("render");
		this.#randomTexts.forEach((text, idx) => {
			text.rotation += 0.05;
            if (idx === 6 || idx === 20 || idx === 28 || idx === 48) {
                //console.log("change text");
                text.text = randomFromArray(randTexts);
            }
		});
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
    };

    #mouseClickAction = (e) => {
		const isNav1Click = utils.isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.boundariesBox);
    
        if (isNav1Click) {
            this.iSystem.stopGameStage("texts");
            this.iSystem.startGameStage("start");
        }
    }
}
