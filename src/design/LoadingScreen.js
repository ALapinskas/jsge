import { ScreenPage } from "../base/ScreenPage.js";
import { CONST } from "../index.js";

const logoKey = "logoKey";
export class LoadingScreen extends ScreenPage {
    #total = 0;
    #loaded = 0;
    #barWidth = 0;
    register() {
        //this.loader.addImage(logoKey, "./images/icon.png");
    }

    init() {
        const [w, h] = this.screenPageData.canvasDimensions,
            barWidth = w/3,
            barHeight = 20;
        //this.logo = this.draw.image(w/2, h/2, 300, 200, logoKey);
        this.background = this.draw.rect(0, 0, w, h, this.systemSettings.gameOptions.loadingScreen.backgroundColor);  
        this.loadingBarBg = this.draw.rect(w/2 - (barWidth/2), h/2 - (barHeight/2), barWidth, barHeight, this.systemSettings.gameOptions.loadingScreen.loadingBarBg);
        this.loadingBarProgress = this.draw.rect(w/2 - (barWidth/2), h/2 - (barHeight/2), barWidth, barHeight, this.systemSettings.gameOptions.loadingScreen.loadingBarProgress);
        this.text = this.draw.text(w/2 - 20, h/2 - 2 * barHeight, "JsGE", "24px sans-serif", "black");
        this.#barWidth = barWidth;
    }

    _progress = (loaded, left) => {
        const [w, h] = this.screenPageData.canvasDimensions,
            widthPart = this.#barWidth / this.#total;

        this.#loaded = loaded;
        
        this.loadingBarProgress.width = widthPart * this.#loaded;
    };

    start(options) {
        this.#total = options.total;
    }

    // a workaround for checking upload progress before render
    get loader() {
        return ({filesWaitingForUpload:0});
    }
} 