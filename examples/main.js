import { System, SystemSettings, CONST } from "../src/index.js";
import { StartPage } from "./startPage.js";
import { MapPage as Dungeon } from "./dungeon/mapPage.js";
import { MapPage as Pirates } from "./pirates/mapPage.js";
import { MapPage as Racing } from "./racing/mapPage.js";
import { SpinePage } from "./spine/spinePage.js";
import { BigMap } from "./big_map/bigMap.js";
import { Tanks } from "./tanks/tanks.js";

import { CustomWebGlTestPage } from "./testCustomWebGl/index.js";
import { CustomDrawObject, createCustomDrawObjectInstance, drawCustomObject } from "./testCustomWebGl/TestDrawObject.js";
import { testVertexShader, testFragmentShader, testUniforms, testAttributes } from "./testCustomWebGl/TestDrawProgram.js";

const START_PAGE_NAME = "start",
    DUNGEON_GAME = "dungeon",
    PIRATES_GAME = "pirates",
    RACING_GAME = "racing",
    SPINE_GAME = "spine",
    BIG_MAP = "big_map",
    CUSTOM_WEBGL_PAGE = "custom_webgl",
    TANKS_PAGE = "tanks";
    
const TEST_WEBGL_PROGRAM_KEY = "test",
    TEST_CUSTOM_DRAW_OBJECT_KEY = "customDrawObject";

// Test different optimizations
//SystemSettings.gameOptions.render.minCycleTime = 0;
//SystemSettings.gameOptions.optimization = CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT;
//SystemSettings.gameOptions.optimization = CONST.OPTIMIZATION.NATIVE_JS.NOT_OPTIMIZED;
//SystemSettings.gameOptions.debug.boundaries.drawLayerBoundaries = true;
//SystemSettings.gameOptions.debug.boundaries.drawObjectBoundaries = true;
let optionsForm = document.createElement("form");
optionsForm.name = "options";
optionsForm.style.display = "flex";
optionsForm.style.flexDirection = "column";

createOptionsBlock();

function createOptionsBlock() {
    const optionsContainer = document.createElement("div");
    optionsContainer.style.position = "absolute";

    const webGLErrorsWrap = document.createElement("div");
    webGLErrorsWrap.style.marginBottom = "20px";
    const webGLErrorsLabel = document.createElement("label");
    webGLErrorsLabel.innerText = "Show WebGl Errors";
    const webGLErrorsCheckbox = document.createElement("input");
    webGLErrorsCheckbox.setAttribute('type', 'checkbox');
    webGLErrorsCheckbox.name = "webGLErrors";
    webGLErrorsCheckbox.id = "webGLErrors";

    webGLErrorsWrap.appendChild(webGLErrorsCheckbox);
    webGLErrorsWrap.appendChild(webGLErrorsLabel);
    optionsForm.appendChild(webGLErrorsWrap);

    const minCycleTimeWrap = document.createElement("div");
    const minCycleTimeLabel = document.createElement("label");
    minCycleTimeLabel.innerText = "Min render cycle time(ms)";
    const minCycleTimeInput = document.createElement("input");
    minCycleTimeInput.style.marginRight = "10px";
    minCycleTimeInput.name = "minCycleTime";
    minCycleTimeLabel.setAttribute("for", "minCycleTime");
    minCycleTimeInput.value = SystemSettings.gameOptions.render.minCycleTime.toString();

    minCycleTimeWrap.appendChild(minCycleTimeInput);
    minCycleTimeWrap.appendChild(minCycleTimeLabel);
    optionsForm.appendChild(minCycleTimeWrap);
    
    const optimizationLabel = document.createElement("p");
    optimizationLabel.innerText = "Render optimizations:";
    optionsForm.appendChild(optimizationLabel);

    const optimizationDefaultWrap = document.createElement("div");
    const optimizationDefaultLabel = document.createElement("label");
    optimizationDefaultLabel.innerText = "Native js, optimized(default)";
    const optimizationDefaultRadio = document.createElement("input");
    optimizationDefaultRadio.setAttribute('type', 'radio');
    optimizationDefaultRadio.id = "optimizationDefault";
    optimizationDefaultRadio.value = CONST.OPTIMIZATION.NATIVE_JS.OPTIMIZED;
    optimizationDefaultRadio.name = "optimizations";
    optimizationDefaultLabel.setAttribute("for", "optimizationDefault");
    optimizationDefaultRadio.checked = true;
    
    optimizationDefaultWrap.appendChild(optimizationDefaultRadio);
    optimizationDefaultWrap.appendChild(optimizationDefaultLabel);
    optionsForm.appendChild(optimizationDefaultWrap);

    const optimizationOffWrap = document.createElement("div");
    const optimizationOffLabel = document.createElement("label");
    optimizationOffLabel.innerText = "Native js, not optimized";
    const optimizationOffRadio = document.createElement("input");
    optimizationOffRadio.setAttribute('type', 'radio');
    optimizationOffRadio.id = "optimizationOff";
    optimizationOffRadio.value = CONST.OPTIMIZATION.NATIVE_JS.NOT_OPTIMIZED;
    optimizationOffRadio.name = "optimizations";
    optimizationOffLabel.setAttribute("for", "optimizationOff");

    optimizationOffWrap.appendChild(optimizationOffRadio);
    optimizationOffWrap.appendChild(optimizationOffLabel);
    optionsForm.appendChild(optimizationOffWrap);

    const optimizationWasmWrap = document.createElement("div");
    const optimizationWasmLabel = document.createElement("label");
    optimizationWasmLabel.innerText = "Wasm, not optimized";
    const optimizationWasmRadio = document.createElement("input");
    optimizationWasmRadio.setAttribute('type', 'radio');
    optimizationWasmRadio.id = "optimizationWasm";
    optimizationWasmRadio.value = CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT;
    optimizationWasmRadio.name = "optimizations";
    optimizationWasmLabel.setAttribute("for", "optimizationWasm");

    optimizationWasmWrap.appendChild(optimizationWasmRadio);
    optimizationWasmWrap.appendChild(optimizationWasmLabel);
    optionsForm.appendChild(optimizationWasmWrap);

    const boundariesDrawLabel = document.createElement("p");
    boundariesDrawLabel.innerText = "Boundaries draw helper:";
    optionsForm.appendChild(boundariesDrawLabel);

    const drawLayerBoundariesWrap = document.createElement("div");
    const drawLayerBoundariesLabel = document.createElement("label");
    drawLayerBoundariesLabel.innerText = "Draw layer boundaries";
    const drawLayerBoundariesCheckbox = document.createElement("input");
    drawLayerBoundariesCheckbox.setAttribute('type', 'checkbox');
    drawLayerBoundariesCheckbox.name = "drawLayerB";
    drawLayerBoundariesCheckbox.id = "drawLayerB";
    drawLayerBoundariesLabel.setAttribute("for", "drawLayerB");

    drawLayerBoundariesWrap.appendChild( drawLayerBoundariesCheckbox);
    drawLayerBoundariesWrap.appendChild(drawLayerBoundariesLabel);
    optionsForm.appendChild(drawLayerBoundariesWrap);

    const drawObjectBoundariesWrap = document.createElement("div");
    const drawObjectsBoundariesLabel = document.createElement("label");
    drawObjectsBoundariesLabel.innerText = "Draw objects boundaries";
    const drawObjectsBoundariesCheckbox = document.createElement("input");
    drawObjectsBoundariesCheckbox.setAttribute('type', 'checkbox');
    drawObjectsBoundariesCheckbox.name = "drawObjectB";
    drawObjectsBoundariesCheckbox.id = "drawObjectB";
    drawObjectsBoundariesLabel.setAttribute("for", "drawObjectB");

    drawObjectBoundariesWrap.appendChild(drawObjectsBoundariesCheckbox);
    drawObjectBoundariesWrap.appendChild(drawObjectsBoundariesLabel);
    optionsForm.appendChild(drawObjectBoundariesWrap);

    const applyOptionsBtn = document.createElement("button");
    applyOptionsBtn.innerText = "Start JsGE examples";
    applyOptionsBtn.type = "submit";
    applyOptionsBtn.style.margin = "20px 0";
    optionsForm.appendChild(applyOptionsBtn);

    optionsContainer.appendChild(optionsForm);
    document.body.appendChild(optionsContainer);

    const optionsContainerWidth = optionsContainer.offsetWidth,
        optionsContainerHeight = optionsContainer.offsetHeight,
        screenWidth = window.innerWidth,
        screenHeight = window.innerHeight;

    
    optionsContainer.style.top = screenHeight/2 - optionsContainerHeight/2 + "px";
    optionsContainer.style.right = screenWidth/2 - optionsContainerWidth/2 + "px";
}

const processOptionsFormData = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target),
        minCycleTime = formData.get("minCycleTime"),
        optimization = formData.get("optimizations"),
        showWebGlErrors = formData.get("webGLErrors");
    
    let settings = SystemSettings;

    if (showWebGlErrors) {
        SystemSettings.gameOptions.debug.checkWebGlErrors = true;
    } else {
        SystemSettings.gameOptions.debug.checkWebGlErrors = false;
    }

    if (minCycleTime) {
        SystemSettings.gameOptions.render.minCycleTime = parseFloat(minCycleTime);
    }

    if (optimization !== CONST.OPTIMIZATION.NATIVE_JS.OPTIMIZED) {
        SystemSettings.gameOptions.optimization = optimization;
    }

    if (formData.get("drawLayerB")) {
        settings.gameOptions.debug.boundaries.drawLayerBoundaries = true;
    } else {
        settings.gameOptions.debug.boundaries.drawLayerBoundaries = false;
    }

    if (formData.get("drawObjectB")) {
        settings.gameOptions.debug.boundaries.drawObjectBoundaries = true;
    } else {
        settings.gameOptions.debug.boundaries.drawObjectBoundaries = false;
    }

    runApp(settings);

    optionsForm.removeEventListener("submit", processOptionsFormData);
    optionsForm.remove();
}

optionsForm.addEventListener("submit", processOptionsFormData);

function runApp(settings) {
    const app = new System(settings, document.getElementById("game_map"));
    app.registerStage(START_PAGE_NAME, StartPage);
    app.registerStage(DUNGEON_GAME, Dungeon);
    app.registerStage(PIRATES_GAME, Pirates);
    app.registerStage(RACING_GAME, Racing);
    app.registerStage(SPINE_GAME, SpinePage);
    app.registerStage(BIG_MAP, BigMap);
    app.registerStage(CUSTOM_WEBGL_PAGE, CustomWebGlTestPage);
    app.registerStage(TANKS_PAGE, Tanks);
    
    // пробуем пользовательскую webgl программу
    app.iSystem.iExtension.registerAndCompileWebGlProgram(TEST_WEBGL_PROGRAM_KEY, testVertexShader, testFragmentShader, testUniforms, testAttributes);
    app.iSystem.iExtension.registerDrawObject(TEST_CUSTOM_DRAW_OBJECT_KEY, createCustomDrawObjectInstance);
    app.iSystem.iExtension.registerObjectRender(CustomDrawObject.name, drawCustomObject, TEST_WEBGL_PROGRAM_KEY);
    
    app.preloadAllData().then(() => {
        app.iSystem.startGameStage(START_PAGE_NAME);
    });
}