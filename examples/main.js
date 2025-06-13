import { System, SystemSettings, CONST } from "../src/index.js";
import { StartPage } from "./startPage.js";
import { MapPage as Dungeon } from "./dungeon/mapPage.js";
import { MapPage as Pirates } from "./pirates/mapPage.js";
import { MapPage as Racing } from "./racing/mapPage.js";
import { SpinePage } from "./spine/spinePage.js";
import { BigMap } from "./big_map/bigMap.js";
import { Tanks } from "./tanks/tanks.js";
import { Strategy } from "./strategy/strategy.js";
import { Primitives } from "./primitives/primitives.js";

import { CustomWebGlTestPage } from "./testCustomWebGl/index.js";
import { CustomDrawObject, createCustomDrawObjectInstance, drawCustomObject } from "./testCustomWebGl/TestDrawObject.js";
import { testVertexShader, testFragmentShader, testUniforms, testAttributes } from "./testCustomWebGl/TestDrawProgram.js";

const START_PAGE_NAME = "start",
    DUNGEON_GAME = "dungeon",
    PIRATES_GAME = "pirates",
    RACING_GAME = "racing",
    SPINE_GAME = "spine",
    BIG_MAP = "big_map",
    STRATEGY_GAME = "strategy_game",
    CUSTOM_WEBGL_PAGE = "custom_webgl",
    TANKS_PAGE = "tanks",
    PRIMITIVES_PAGE = "primitives";
    
const TEST_WEBGL_PROGRAM_KEY = "test",
    TEST_CUSTOM_DRAW_OBJECT_KEY = "customDrawObject";
    
// Test different optimizations
//SystemSettings.gameOptions.render.minCycleTime = 0;
//SystemSettings.gameOptions.optimization = CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT;
//SystemSettings.gameOptions.optimization = CONST.OPTIMIZATION.NATIVE_JS.NOT_OPTIMIZED;
//SystemSettings.gameOptions.debug.collisionShapes.drawLayerCollisionShapes = true;
//SystemSettings.gameOptions.debug.collisionShapes.drawObjectCollisionShapes = true;
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
    webGLErrorsLabel.innerText = "Output WebGl Errors";
    const webGLErrorsCheckbox = document.createElement("input");
    webGLErrorsCheckbox.setAttribute('type', 'checkbox');
    webGLErrorsCheckbox.name = "webGLErrors";
    webGLErrorsCheckbox.id = "webGLErrors";

    webGLErrorsWrap.appendChild(webGLErrorsCheckbox);
    webGLErrorsWrap.appendChild(webGLErrorsLabel);
    optionsForm.appendChild(webGLErrorsWrap);

    const preserveDrawingBufferWrap = document.createElement("div");
    const preserveDrawingBufferLabel = document.createElement("label");
    preserveDrawingBufferLabel.innerText = "Preserve Drawing Buffer";
    const preserveDrawingBufferCheckbox = document.createElement("input");
    preserveDrawingBufferCheckbox.setAttribute('type', 'checkbox');
    preserveDrawingBufferCheckbox.name = "preserveDrawingBuffer";
    preserveDrawingBufferCheckbox.id = "preserveDrawingBuffer";
    preserveDrawingBufferLabel.setAttribute("for", "preserveDrawingBuffer");

    preserveDrawingBufferWrap.appendChild(preserveDrawingBufferCheckbox);
    preserveDrawingBufferWrap.appendChild(preserveDrawingBufferLabel);
    optionsForm.appendChild(preserveDrawingBufferWrap);
    
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

    const collisionShapesDrawLabel = document.createElement("p");
    collisionShapesDrawLabel.innerText = "Collision shapes draw helper:";
    optionsForm.appendChild(collisionShapesDrawLabel);

    const drawLayerCollisionShapesWrap = document.createElement("div");
    const drawLayerCollisionShapesLabel = document.createElement("label");
    drawLayerCollisionShapesLabel.innerText = "Draw layer collision shapes";
    const drawLayerCollisionShapesCheckbox = document.createElement("input");
    drawLayerCollisionShapesCheckbox.setAttribute('type', 'checkbox');
    drawLayerCollisionShapesCheckbox.name = "drawLayerB";
    drawLayerCollisionShapesCheckbox.id = "drawLayerB";
    drawLayerCollisionShapesLabel.setAttribute("for", "drawLayerB");

    drawLayerCollisionShapesWrap.appendChild( drawLayerCollisionShapesCheckbox);
    drawLayerCollisionShapesWrap.appendChild(drawLayerCollisionShapesLabel);
    optionsForm.appendChild(drawLayerCollisionShapesWrap);

    const drawObjectCollisionShapesWrap = document.createElement("div");
    const drawObjectsCollisionShapesLabel = document.createElement("label");
    drawObjectsCollisionShapesLabel.innerText = "Draw objects collision shapes";
    const drawObjectsCollisionShapesCheckbox = document.createElement("input");
    drawObjectsCollisionShapesCheckbox.setAttribute('type', 'checkbox');
    drawObjectsCollisionShapesCheckbox.name = "drawObjectB";
    drawObjectsCollisionShapesCheckbox.id = "drawObjectB";
    drawObjectsCollisionShapesLabel.setAttribute("for", "drawObjectB");

    drawObjectCollisionShapesWrap.appendChild(drawObjectsCollisionShapesCheckbox);
    drawObjectCollisionShapesWrap.appendChild(drawObjectsCollisionShapesLabel);
    optionsForm.appendChild(drawObjectCollisionShapesWrap);

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
        showWebGlErrors = formData.get("webGLErrors"),
        preserveDrawingBuffer = formData.get("preserveDrawingBuffer");
    
    let settings = SystemSettings;

    if (showWebGlErrors) {
        SystemSettings.gameOptions.debug.checkWebGlErrors = true;
    } else {
        SystemSettings.gameOptions.debug.checkWebGlErrors = false;
    }

    if (preserveDrawingBuffer) {
        SystemSettings.gameOptions.debug.preserveDrawingBuffer = true;
    } else {
        SystemSettings.gameOptions.debug.preserveDrawingBuffer = false;
    }
    
    if (minCycleTime) {
        SystemSettings.gameOptions.render.minCycleTime = parseFloat(minCycleTime);
    }

    if (optimization !== CONST.OPTIMIZATION.NATIVE_JS.OPTIMIZED) {
        SystemSettings.gameOptions.optimization = optimization;
    }

    if (formData.get("drawLayerB")) {
        settings.gameOptions.debug.collisionShapes.drawLayerCollisionShapes = true;
    } else {
        settings.gameOptions.debug.collisionShapes.drawLayerCollisionShapes = false;
    }

    if (formData.get("drawObjectB")) {
        settings.gameOptions.debug.collisionShapes.drawObjectCollisionShapes = true;
    } else {
        settings.gameOptions.debug.collisionShapes.drawObjectCollisionShapes = false;
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
    app.registerStage(STRATEGY_GAME, Strategy);
    app.registerStage(CUSTOM_WEBGL_PAGE, CustomWebGlTestPage);
    app.registerStage(TANKS_PAGE, Tanks);
    app.registerStage(PRIMITIVES_PAGE, Primitives)
    
    // пробуем пользовательскую webgl программу
    app.iSystem.iExtension.registerAndCompileWebGlProgram(TEST_WEBGL_PROGRAM_KEY, testVertexShader, testFragmentShader, testUniforms, testAttributes);
    app.iSystem.iExtension.registerDrawObject(TEST_CUSTOM_DRAW_OBJECT_KEY, createCustomDrawObjectInstance);
    app.iSystem.iExtension.registerObjectRender(CustomDrawObject.name, drawCustomObject, TEST_WEBGL_PROGRAM_KEY);
    
    app.preloadAllData().then(() => {
        app.iSystem.startGameStage(START_PAGE_NAME);
    });
}