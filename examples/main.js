import { System, SystemSettings } from "../src/index.js";
import { StartPage } from "./startPage.js";
import { MapPage as Dungeon } from "./dungeon/mapPage.js";
import { MapPage as Pirates } from "./pirates/mapPage.js";
import { MapPage as Racing } from "./racing/mapPage.js";
import { SpinePage } from "./spine/spinePage.js";

const START_PAGE_NAME = "start",
    DUNGEON_GAME = "dungeon",
    PIRATES_GAME = "pirates",
    RACING_GAME = "racing",
    SPINE_GAME = "spine";

SystemSettings.worldSize = {
    width: 640,
    height: 480
};

const app = new System(SystemSettings, document.getElementById("game_map"));
app.registerPage(START_PAGE_NAME, StartPage);
app.registerPage(DUNGEON_GAME, Dungeon);
app.registerPage(PIRATES_GAME, Pirates);
app.registerPage(RACING_GAME, Racing);
app.registerPage(SPINE_GAME, SpinePage);
app.preloadAllData().then(() => {
    app.system.startScreenPage(START_PAGE_NAME);
});