import { ScreenPage, CONST } from "/index.es6.js";
import { utils } from "/index.es6.js";

const isPointRectIntersect = utils.isPointRectIntersect;
const LEFT_SHIFT = -70;
const MENU_CLICK_AUDIO_NAME = "menu_click";

const START_PAGE_NAME = "start",
    DUNGEON_GAME = "dungeon",
    PIRATES_GAME = "pirates",
    RACING_GAME = "racing";

export class StartPage extends ScreenPage {
    #menuClickMediaElement;

    register() {
        this.loader.addAudio(MENU_CLICK_AUDIO_NAME, "./select_001.ogg");
    }

    init() {
        const [w, h] = this.screenPageData.canvasDimensions;

        this.createCanvasView(CONST.LAYERS.DEFAULT);
        
        this.background = this.draw.rect(0, 0, w, h, "rgba(120, 120, 120, 0.3)");        
        this.addRenderObject(CONST.LAYERS.DEFAULT, this.background);

        this.navItemDun = this.draw.text(w/2 + LEFT_SHIFT, h/2 - 60, "Dungeon game", "24px sans", "black"),
        this.navItemPir = this.draw.text(w/2 + LEFT_SHIFT, h/2 - 20, "Pirates game", "24px sans", "black");
        this.navItemRac = this.draw.text(w/2 + LEFT_SHIFT, h/2 + 20, "Racing game", "24px sans", "black");
        
        this.addRenderObject(CONST.LAYERS.DEFAULT, this.navItemDun);
        this.addRenderObject(CONST.LAYERS.DEFAULT, this.navItemPir);
        this.addRenderObject(CONST.LAYERS.DEFAULT, this.navItemRac);
        
        this.audio.registerAudio(MENU_CLICK_AUDIO_NAME, this.loader);
        this.#menuClickMediaElement = this.audio.getAudio(MENU_CLICK_AUDIO_NAME);
    }

    start() {
        this.registerEventListeners();
    }

    stop() {
        this.unregisterEventListeners();
    }

    registerEventListeners() {
        const canvas = this.getView(CONST.LAYERS.DEFAULT).canvas; 
        canvas.addEventListener("mousemove", this.#mouseHoverEvent);            
        canvas.addEventListener("click", this.#mouseClickEvent);
        document.addEventListener("keydown", this.pressKeyAction);
    }

    #mouseHoverEvent = (event) => {
        const canvas = this.getView(CONST.LAYERS.DEFAULT).canvas,
            isNav1Traversed = isPointRectIntersect(event.offsetX, event.offsetY, this.navItemDun.boundariesBox),
            isNavP2PTraversed = isPointRectIntersect(event.offsetX, event.offsetY, this.navItemPir.boundariesBox),
            isNav3Traversed = isPointRectIntersect(event.offsetX, event.offsetY, this.navItemRac.boundariesBox);;
        if (isNav1Traversed) {
            this.navItemDun.strokeStyle = "rgba(255, 255, 255, 0.3)";
        } else {
            this.navItemDun.strokeStyle = undefined;
        }

        if (isNavP2PTraversed) {
            this.navItemPir.strokeStyle = "rgba(255, 255, 255, 0.3)";
        } else {
            this.navItemPir.strokeStyle = undefined;
        }

        if (isNav3Traversed) {
            this.navItemRac.strokeStyle = "rgba(255, 255, 255, 0.3)";
        } else {
            this.navItemRac.strokeStyle = undefined;
        }

        if (isNav1Traversed || isNavP2PTraversed || isNav3Traversed) {
            canvas.style.cursor = "pointer";
        } else {
            canvas.style.cursor = "default";
        }

        
    };

    #mouseClickEvent = (event) => {

        if (isPointRectIntersect(event.offsetX, event.offsetY, this.navItemDun.boundariesBox)) {
            this.#menuClickMediaElement.play();
            this.system.stopScreenPage(START_PAGE_NAME);
            this.system.startScreenPage(DUNGEON_GAME);
        }

        if (isPointRectIntersect(event.offsetX, event.offsetY, this.navItemPir.boundariesBox)) {
            this.#menuClickMediaElement.play();
            this.system.stopScreenPage(START_PAGE_NAME);
            this.system.startScreenPage(PIRATES_GAME);
        }

        if (isPointRectIntersect(event.offsetX, event.offsetY, this.navItemRac.boundariesBox)) {
            this.#menuClickMediaElement.play();
            this.system.stopScreenPage(START_PAGE_NAME);
            this.system.startScreenPage(RACING_GAME);
        }
    };

    unregisterEventListeners() {
        const canvas = this.getView(CONST.LAYERS.DEFAULT).canvas;
        canvas.removeEventListener("click", this.#mouseClickEvent);
        document.removeEventListener("keydown", this.#pressKeyAction);
    }

    #pressKeyAction = (event) => {
        console.log("press key, " + event.code);
    };
}