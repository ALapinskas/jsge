import { GameStage, CONST } from "../../dist/index.es6.min.js";
import SpineModuleInitialization from "../../modules/spine/dist/bundle.js";
import { utils } from "../../src/index.js";

const SPINE_VIEW_KEY = "spine-module-layer";

const SPINE = {
    SpineTexture: "spineTexture",
    SpineText: "spineText",
    SpineBinary: "spineBinary",
    SpineAtlas: "spineAtlas",
    SpineGoblinsAtlas: "GoblinsAtlas",
    SpineGoblinsBinary: "GoblinsBinary"
};

export class SpinePage extends GameStage {

    register() {
        //spine module already installed
    }

    init() {
        const [w, h] = this.stageData.canvasDimensions;

        this.background = this.draw.rect(0, 0, w, h, "rgba(120, 120, 120, 0.6)"); 
        this.navItemBack = this.draw.text(w - 200, 30, "Main menu", "18px sans-serif", "black");
        
        const spineDrawObject = this.draw.spine(-300, -300, SPINE.SpineText, SPINE.SpineAtlas);
        spineDrawObject.scale(0.5);

        this.spineGoblinObject = this.draw.spine(0, -300, SPINE.SpineGoblinsBinary, SPINE.SpineGoblinsAtlas);
        
        spineDrawObject.animationState.setAnimation(0, "run", true);
        this.spineGoblinObject.setSkin("goblin");

        this.draw.spineTexture(100, 100, 200, 100, SPINE.SpineTexture);

        
    }

    start() {
        this.changeGoblinSkinButton = document.createElement("button");
        document.body.appendChild(this.changeGoblinSkinButton);
        this.changeGoblinSkinButton.style.position = "absolute";
        this.changeGoblinSkinButton.style.left = "50%";
        this.changeGoblinSkinButton.style.top = "50%";
        this.changeGoblinSkinButton.innerText = "Switch goblin skin";
        this.registerEventListeners();
    }

    stop() {
        this.changeGoblinSkinButton.remove();
        this.unregisterEventListeners();
    }

    registerEventListeners() {
        document.addEventListener("mousemove", this.#mouseHoverEvent);            
        document.addEventListener("click", this.#mouseClickEvent);
        document.addEventListener("keydown", this.#pressKeyAction);
        this.changeGoblinSkinButton.addEventListener("click", this.#changeGoblinSkin);
    }

    #mouseHoverEvent = (e) => {
        const isNav1Traversed = utils.isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.boundariesBox);
    
        if (isNav1Traversed) {
            this.navItemBack.strokeStyle = "rgba(0, 0, 0, 0.3)";
            this.canvasHtmlElement.style.cursor = "pointer";
        } else if (this.navItemBack.strokeStyle) {
            this.navItemBack.strokeStyle = undefined;
            this.canvasHtmlElement.style.cursor = "default";
        } else {
            this.canvasHtmlElement.style.cursor = "default";
        }
    };

    #mouseClickEvent = (e) => {
        const isNav1Click = utils.isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.boundariesBox);
    
        if (isNav1Click) {
            this.system.stopGameStage("spine");
            this.canvasHtmlElement.style.cursor = "default";
            this.system.startGameStage("start");
        }
    };

    #changeGoblinSkin = () => {
        const currentSkin = this.spineGoblinObject.skeleton.skin,
            availableSkins = this.spineGoblinObject.skeleton.data.skins,
            index = this.spineGoblinObject.skeleton.data.skins.indexOf(currentSkin),
            firstSkin = this.spineGoblinObject.skeleton.data.skins[0];
            
        const nextSkin = availableSkins[index + 1];
        if (nextSkin) {
            this.spineGoblinObject.setSkin(nextSkin.name);
        } else {
            this.spineGoblinObject.setSkin(firstSkin.name);
        }
    }

    unregisterEventListeners() {
        document.removeEventListener("mousemove", this.#mouseHoverEvent);            
        document.removeEventListener("click", this.#mouseClickEvent);
        document.removeEventListener("keydown", this.#pressKeyAction);
        this.changeGoblinSkinButton.removeEventListener("click", this.#changeGoblinSkin);
    }

    #pressKeyAction = (event) => {
        console.log("press key, " + event.code);
    };
}