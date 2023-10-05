import { System } from "./base/System.js";
import { ScreenPage } from "./base/ScreenPage.js";
import { DrawImageObject } from "./base/DrawImageObject.js";
import { DrawObjectFactory } from "./base/DrawObjectFactory.js";
import { SystemAudioInterface } from "./base/SystemAudioInterface.js";
import * as Primitives from "./base/Primitives.js";
import { SystemSettings } from "./configs.js";
import { CONST } from "./constants.js";
import * as utils from "./utils.js";

export { System, SystemSettings, CONST, ScreenPage, DrawImageObject, SystemAudioInterface, Primitives, utils };

// for modules some classes should be available globally
window.DrawImageObject = DrawImageObject;
window.DrawObjectFactory = DrawObjectFactory;