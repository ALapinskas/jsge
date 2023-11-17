import { ScreenPage, CONST } from "../../src/index.js";
import { utils } from "../../src/index.js";
import SpineModuleInitialization from "../../modules/spine/dist/bundle.js";

const isPointRectIntersect = utils.isPointRectIntersect;
const LEFT_SHIFT = -70;
const MENU_CLICK_AUDIO_NAME = "menu_click";
const SPINE_VIEW_KEY = "spine-module-layer";

const SPINE = {
    SpineTexture: "spineTexture",
    SpineText: "spineText",
    SpineBinary: "spineBinary",
    SpineAtlas: "spineAtlas",
    SpineGoblinsAtlas: "GoblinsAtlas",
    SpineGoblinsBinary: "GoblinsBinary"
};

export class SpinePage extends ScreenPage {

    register() {
        this.system.installModule("spineModule", SpineModuleInitialization, "./spine/spine-assets", this.canvasInterface);
        // spine methods will be available after spine module installation
        this.loader.addSpineJson(SPINE.SpineText, "./spine/spine-assets/spineboy-pro.json");
        this.loader.addSpineBinary(SPINE.SpineBinary, "./spine/spine-assets/spineboy-pro.skel");
        this.loader.addSpineAtlas(SPINE.SpineAtlas, "./spine/spine-assets/spineboy-pma.atlas");
        this.loader.addSpineAtlas(SPINE.SpineGoblinsAtlas, "./spine/spine-assets/goblins-pma.atlas");
        this.loader.addSpineBinary(SPINE.SpineGoblinsBinary, "./spine/spine-assets/goblins-pro.skel");

        this.loader.addImage(SPINE.SpineTexture, "./spine/spine-assets/spineboy-pma.png");
    }

    init() {
        const [w, h] = this.screenPageData.canvasDimensions;

        this.background = this.draw.rect(0, 0, w, h, "rgba(120, 120, 120, 0.6)");        
        this.addRenderObject(CONST.LAYERS.DEFAULT, this.background);

        const spineDrawObject = this.draw.spine(-300, -300, SPINE.SpineText, SPINE.SpineAtlas);
        spineDrawObject.scale(0.5);

        this.spineGoblinObject = this.draw.spine(0, -300, SPINE.SpineGoblinsBinary, SPINE.SpineGoblinsAtlas);
        
        this.addRenderObject(SPINE_VIEW_KEY, spineDrawObject);
        spineDrawObject.animationState.setAnimation(0, "run", true);
        this.addRenderObject(SPINE_VIEW_KEY, this.spineGoblinObject);
        this.spineGoblinObject.setSkin("goblin");

        this.changeGoblinSkinButton = document.createElement("button");
        document.body.appendChild(this.changeGoblinSkinButton);
        this.changeGoblinSkinButton.style.position = "absolute";
        this.changeGoblinSkinButton.style.left = "50%";
        this.changeGoblinSkinButton.style.top = "50%";
        this.changeGoblinSkinButton.innerText = "Switch goblin skin";

        const spineTexture = this.draw.spineTexture(100, 100, 200, 100, SPINE.SpineTexture);
        this.addRenderObject(SPINE_VIEW_KEY, spineTexture);
    }

    start() {
        this.registerEventListeners();
    }

    stop() {
        this.unregisterEventListeners();
    }

    registerEventListeners() {
        document.addEventListener("mousemove", this.#mouseHoverEvent);            
        document.addEventListener("click", this.#mouseClickEvent);
        document.addEventListener("keydown", this.pressKeyAction);
        this.changeGoblinSkinButton.addEventListener("click", this.#changeGoblinSkin);
    }

    #mouseHoverEvent = (event) => {
       
        
    };

    #mouseClickEvent = (event) => {

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
        document.removeEventListener("keydown", this.pressKeyAction);
        this.changeGoblinSkinButton.removeEventListener("click", this.#changeGoblinSkin);
    }

    #pressKeyAction = (event) => {
        console.log("press key, " + event.code);
    };
}