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
    
const app = new System(SystemSettings, document.getElementById("game_map"));
app.registerStage(START_PAGE_NAME, StartPage);
app.registerStage(DUNGEON_GAME, Dungeon);
app.registerStage(PIRATES_GAME, Pirates);
app.registerStage(RACING_GAME, Racing);
app.registerStage(SPINE_GAME, SpinePage);
app.preloadAllData().then(() => {
    app.iSystem.startGameStage(START_PAGE_NAME);
});