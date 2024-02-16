import { System, SystemSettings, CONST } from "../src/index.js";
import { StartPage } from "./startPage.js";
import { MapPage as Dungeon } from "./dungeon/mapPage.js";
import { MapPage as Pirates } from "./pirates/mapPage.js";
import { MapPage as Racing } from "./racing/mapPage.js";
import { SpinePage } from "./spine/spinePage.js";
import { BigMap } from "./big_map/bigMap.js";

import { CustomWebGlTestPage } from "./testCustomWebGl/index.js";
import { CustomDrawObject, createCustomDrawObjectInstance, drawCustomObject } from "./testCustomWebGl/TestDrawObject.js";
import { testVertexShader, testFragmentShader, testUniforms, testAttributes } from "./testCustomWebGl/TestDrawProgram.js";

const START_PAGE_NAME = "start",
    DUNGEON_GAME = "dungeon",
    PIRATES_GAME = "pirates",
    RACING_GAME = "racing",
    SPINE_GAME = "spine",
    BIG_MAP = "big_map",
    CUSTOM_WEBGL_PAGE = "custom_webgl";
    
const TEST_WEBGL_PROGRAM_KEY = "test",
    TEST_CUSTOM_DRAW_OBJECT_KEY = "customDrawObject";

// Test different optimizations
SystemSettings.gameOptions.render.minCycleTime = 0;
//SystemSettings.gameOptions.optimization = CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT;
//SystemSettings.gameOptions.optimization = CONST.OPTIMIZATION.NATIVE_JS.NOT_OPTIMIZED;

const app = new System(SystemSettings, document.getElementById("game_map"));
app.registerStage(START_PAGE_NAME, StartPage);
app.registerStage(DUNGEON_GAME, Dungeon);
app.registerStage(PIRATES_GAME, Pirates);
app.registerStage(RACING_GAME, Racing);
app.registerStage(SPINE_GAME, SpinePage);
app.registerStage(BIG_MAP, BigMap);
app.registerStage(CUSTOM_WEBGL_PAGE, CustomWebGlTestPage);

// пробуем пользовательскую webgl программу
app.iSystem.iExtension.registerAndCompileWebGlProgram(TEST_WEBGL_PROGRAM_KEY, testVertexShader, testFragmentShader, testUniforms, testAttributes);
app.iSystem.iExtension.registerDrawObject(TEST_CUSTOM_DRAW_OBJECT_KEY, createCustomDrawObjectInstance);
app.iSystem.iExtension.registerObjectRender(CustomDrawObject.name, drawCustomObject, TEST_WEBGL_PROGRAM_KEY);

app.preloadAllData().then(() => {
    app.iSystem.startGameStage(START_PAGE_NAME);
});