import { GameStage, CONST } from "../src/index.js";
import { utils } from "../src/index.js";
import SpineModuleInitialization from "../modules/spine/dist/bundle.js";

const isPointRectIntersect = utils.isPointRectIntersect;
const LEFT_SHIFT = -70;
const MENU_CLICK_AUDIO_NAME = "menu_click";

const START_PAGE_NAME = "start",
    DUNGEON_GAME = "dungeon",
    PIRATES_GAME = "pirates",
    RACING_GAME = "racing",
    SPINE_PAGE = "spine";

const SPINE = {
    SpineTexture: "spineTexture",
    SpineText: "spineText",
    SpineBinary: "spineBinary",
    SpineAtlas: "spineAtlas",
    SpineGoblinsAtlas: "GoblinsAtlas",
    SpineGoblinsBinary: "GoblinsBinary"
};

export class StartPage extends GameStage {
    #menuClickMediaElement;

    register() {
        this.iLoader.addAudio(MENU_CLICK_AUDIO_NAME, "./select_001.ogg");
        this.spineModule = this.system.installModule("spineModule", SpineModuleInitialization, "./spine/spine-assets");
        // spine methods will be available after spine module installation
        this.iLoader.addSpineJson(SPINE.SpineText, "./spine/spine-assets/spineboy-pro.json");
        this.iLoader.addSpineBinary(SPINE.SpineBinary, "./spine/spine-assets/spineboy-pro.skel");
        this.iLoader.addSpineAtlas(SPINE.SpineAtlas, "./spine/spine-assets/spineboy-pma.atlas");
        this.iLoader.addSpineAtlas(SPINE.SpineGoblinsAtlas, "./spine/spine-assets/goblins-pma.atlas");
        this.iLoader.addSpineBinary(SPINE.SpineGoblinsBinary, "./spine/spine-assets/goblins-pro.skel");

        this.iLoader.addImage(SPINE.SpineTexture, "./spine/spine-assets/spineboy-pma.png");
    }

    init() {
        const [w, h] = this.stageData.canvasDimensions;
        
        this.background = this.draw.rect(0, 0, w, h, "rgba(120, 120, 120, 0.6)");
        
        this.navItemDun = this.draw.text(w/2 + LEFT_SHIFT, h/2 - 60, "Dungeon game", "24px sans-serif", "black"),
        this.navItemPir = this.draw.text(w/2 + LEFT_SHIFT, h/2 - 20, "Pirates game", "24px sans-serif", "black");
        this.navItemRac = this.draw.text(w/2 + LEFT_SHIFT, h/2 + 20, "Racing game", "24px sans-serif", "black");
        this.navItemSpine = this.draw.text(w/2 + LEFT_SHIFT, h/2 + 60, "Spine module", "24px sans-serif", "black");
        
        this.audio.registerAudio(MENU_CLICK_AUDIO_NAME);
        this.#menuClickMediaElement = this.audio.getAudio(MENU_CLICK_AUDIO_NAME);
    }

    start() {
        this.registerEventListeners();
    }

    stop() {
        this.unregisterEventListeners();
    }

    registerEventListeners() {
        const canvas = this.canvasHtmlElement; 
        canvas.addEventListener("mousemove", this.#mouseHoverEvent);            
        canvas.addEventListener("click", this.#mouseClickEvent);
        document.addEventListener("keydown", this.pressKeyAction);
    }

    #mouseHoverEvent = (event) => {
        const canvas = this.canvasHtmlElement,
            isNav1Traversed = isPointRectIntersect(event.offsetX, event.offsetY, this.navItemDun.boundariesBox),
            isNavP2PTraversed = isPointRectIntersect(event.offsetX, event.offsetY, this.navItemPir.boundariesBox),
            isNav3Traversed = isPointRectIntersect(event.offsetX, event.offsetY, this.navItemRac.boundariesBox),
            isNav4Traversed = isPointRectIntersect(event.offsetX, event.offsetY, this.navItemSpine.boundariesBox);

        if (isNav1Traversed) {
            this.navItemDun.strokeStyle = "rgba(0, 0, 0, 0.3)";
        } else if (this.navItemDun.strokeStyle) {
            this.navItemDun.strokeStyle = undefined;
        }

        if (isNavP2PTraversed) {
            this.navItemPir.strokeStyle = "rgba(0, 0, 0, 0.3)";
        } else if (this.navItemPir.strokeStyle) {
            this.navItemPir.strokeStyle = undefined;
        }

        if (isNav3Traversed) {
            this.navItemRac.strokeStyle = "rgba(0, 0, 0, 0.3)";
        } else if (this.navItemRac.strokeStyle) {
            this.navItemRac.strokeStyle = undefined;
        }

        if (isNav4Traversed) {
            this.navItemSpine.strokeStyle = "rgba(0, 0, 0, 0.3)";
        } else if (this.navItemSpine.strokeStyle) {
            this.navItemSpine.strokeStyle = undefined;
        }

        if (isNav1Traversed || isNavP2PTraversed || isNav3Traversed || isNav4Traversed) {
            canvas.style.cursor = "pointer";
        } else {
            canvas.style.cursor = "default";
        }

        
    };

    #mouseClickEvent = (event) => {

        if (isPointRectIntersect(event.offsetX, event.offsetY, this.navItemDun.boundariesBox)) {
            this.#menuClickMediaElement.play();
            this.system.stopGameStage(START_PAGE_NAME);
            this.system.startGameStage(DUNGEON_GAME);
        }

        if (isPointRectIntersect(event.offsetX, event.offsetY, this.navItemPir.boundariesBox)) {
            this.#menuClickMediaElement.play();
            this.system.stopGameStage(START_PAGE_NAME);
            this.system.startGameStage(PIRATES_GAME);
        }

        if (isPointRectIntersect(event.offsetX, event.offsetY, this.navItemRac.boundariesBox)) {
            this.#menuClickMediaElement.play();
            this.system.stopGameStage(START_PAGE_NAME);
            this.system.startGameStage(RACING_GAME);
        }

        if (isPointRectIntersect(event.offsetX, event.offsetY, this.navItemSpine.boundariesBox)) {
            this.#menuClickMediaElement.play();
            this.system.stopGameStage(START_PAGE_NAME);
            this.system.startGameStage(SPINE_PAGE);
        }
    };

    unregisterEventListeners() {
        const canvas = this.canvasHtmlElement;
        canvas.removeEventListener("mousemove", this.#mouseHoverEvent); 
        canvas.removeEventListener("click", this.#mouseClickEvent);
        document.removeEventListener("keydown", this.#pressKeyAction);
        canvas.style.cursor = "default";
    }

    #pressKeyAction = (event) => {
        console.log("press key, " + event.code);
    };
}