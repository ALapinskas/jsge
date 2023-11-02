import {
	AnimationState,
	AnimationStateData,
	Bone,
	MathUtils,
	Skeleton,
	Skin,
	TimeKeeper,
	Vector2,
} from "@esotericsoftware/spine-core";
import { AtlasAttachmentLoader, GLTexture, SceneRenderer, SkeletonBinary, SkeletonData, ResizeMode, SkeletonJson, TextureAtlas, ManagedWebGLRenderingContext } from "@esotericsoftware/spine-webgl";
import { ERROR_MESSAGES } from "./const.js";
import { ScreenPage } from "../../../src/index.js";
import { SystemInterface } from "../../../src/base/SystemInterface.js";
import { CanvasView } from "../../../src/base/CanvasView.js";

const SPINE_ERROR = "SPINE_MODULE_ERROR: ";
class DrawSpineObject {
    /**
     * @type {Skeleton}
     */
    #skeleton;
    /**
     * @type {boolean}
     */
    #isRemoved = false;
    constructor(mapX, mapY, key, imageIndex = 0, boundaries, skeleton) {
        this.#skeleton = skeleton;
        this.#skeleton.x = mapX;
        this.#skeleton.y = mapY;
        this.animationStateData = new AnimationStateData(this.#skeleton.data);
        this.animationState = new AnimationState(this.animationStateData);
    }

    /**
     * @returns {Skeleton}
     */
    get skeleton() {
        return this.#skeleton;
    }

    set x(value) {
        this.#skeleton.x = value;
    }

    set y(value) {
        this.#skeleton.y = value;
    }

    scale(size) {
        this.#skeleton.scaleX = size;
        this.#skeleton.scaleY = size;
    }

    updatePos() {
        this.#skeleton.updateWorldTransform();
    }

    update(delta) {
        this.animationState.update(delta);
        this.animationState.apply(this.#skeleton);
        this.#skeleton.updateWorldTransform();
    }

    setSkin(skinKey) {
        const skin = this.#skeleton.data.findSkin(skinKey)
        if (skin) {
            this.#skeleton.setSkin(skin);
            this.#skeleton.setToSetupPose();
            this.#skeleton.updateWorldTransform();
        } else {
            console.error(SPINE_ERROR + "no skin with key ", skinKey, " was found");
        }

        // Calculate the bounds so we can center and zoom
        // the camera such that the skeleton is in full view.
        //let offset = new spine.Vector2(), size = new spine.Vector2();
        //this.skeleton.getBounds(offset, size);
    }

    /**
     * @returns {boolean}
     */
    get isRemoved() {
        return this.#isRemoved;
    }

    remove() {
        this.#isRemoved = true;
    }
}

class DrawSpineTexture {
    /**
     * @type {number}
     */
    #x;
    /**
     * @type {number}
     */
    #y;
    /**
     * @type {number}
     */
    #width;
    /**
     * @type {number}
     */
    #height;
    /**
     * @type {GLTexture}
     */
    #image;
    constructor(x,y, width, height, image) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.#image = image;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get image() {
        return this.#image;
    }
}
//console.log(new Skeleton());
export default class SpineModuleInitialization {
    /**
     * @type {Map<string, CanvasView>}
     */
    #registeredViews = new Map();
    /**
     * @type {string | null}
     */
    #activeView = null;
    /**
     * @type {SystemInterface}
     */
    #systemInterface;
    constructor(systemInterface, spineFolder) {
        this.#systemInterface = systemInterface;
        this.#registerSpineLoaders(this.#systemInterface.loader, spineFolder);
        this.#extendDrawFactory();
        this.time = new TimeKeeper();
    }

    #registerSpineLoaders(loader, spineFolder = "") {
        const spineJsonLoader = (key, url) => fetch(url).then(result => result.text()),
            spineBinaryLoader = (key, url) => fetch(url).then(result => result.arrayBuffer()),
            spineAtlasLoader = (key, url) => fetch(url).then(result => result.text()).then(atlasText => {
                return new Promise((resolve, reject) => {
                    const textureAtlas = new TextureAtlas(atlasText);

                    for (let page of textureAtlas.pages) {
                        const url = spineFolder + "/" + page.name;
                        loader.addImage(page.name, url);
                    }
                    resolve(textureAtlas);
                });
                
            });
    
        loader.registerLoader("SpineJson", spineJsonLoader);
        loader.registerLoader("SpineBinary", spineBinaryLoader);
        loader.registerLoader("SpineAtlas", spineAtlasLoader);
    }
    #extendDrawFactory() {
        const drawFactory = this.#systemInterface.drawObjectFactory;

        /**
         * 
         * @param {number} x 
         * @param {number} y 
         * @param {string} dataKey 
         * @param {string} atlasKey 
         * @param {number} imageIndex 
         * @param {Array<number>} boundaries 
         * @returns {DrawSpineObject}
         */
        drawFactory.spine = (x, y, dataKey, atlasKey, imageIndex, boundaries) => {
            const skeleton = this.#createSkeleton(dataKey, atlasKey);
            if (!skeleton || !(skeleton instanceof Skeleton)) {
                throw new Error(SPINE_ERROR + ERROR_MESSAGES.SKELETON_ERROR);
            } else {
                return new DrawSpineObject(x, y, dataKey, imageIndex, boundaries, skeleton);
            }
        }

        /**
         * 
         * @param {number} x 
         * @param {number} y 
         * @param {number} width 
         * @param {number} height 
         * @param {string} imageKey 
         * @returns {DrawSpineTexture | undefined}
         */
        drawFactory.spineTexture = (x, y, width, height, imageKey) => {
            const image = this.#systemInterface.loader.getImage(imageKey),
                context = this.context;
            if (image) {
                return new DrawSpineTexture(x, y, width, height, new GLTexture(context, image));
            } else {
                console.warn("can't draw an spine image, " + imageKey + ", probably it was not loaded");
                return;
            }
        }
    }

    #createSkeleton(dataKey, atlasKey) {
        const atlas = this.#systemInterface.loader.getSpineAtlas(atlasKey), 
            spineBinaryFile = this.#systemInterface.loader.getSpineBinary(dataKey),
            spineJsonFile = this.#systemInterface.loader.getSpineJson(dataKey);

        if (!atlas || !(atlas instanceof TextureAtlas)) {
            throw new Error(SPINE_ERROR + ERROR_MESSAGES.NO_ATLAS);
        }
        this.#attachAtlasGraphicsData(atlas);
        
        let skeletonData;
        if (spineBinaryFile) {
            let binary = new SkeletonBinary(new AtlasAttachmentLoader(atlas));
            skeletonData = binary.readSkeletonData(new Uint8Array(spineBinaryFile));
        } else if (spineJsonFile) {
            let json = new SkeletonJson(new AtlasAttachmentLoader(atlas));
            skeletonData = json.readSkeletonData(spineJsonFile);
        } else {
            throw new Error(SPINE_ERROR + ERROR_MESSAGES.NO_DATA);
        }

        return new Skeleton(skeletonData);
    }

    get context() {
        if (this.#activeView) {
            return this.#registeredViews.get(this.#activeView).context;
        } else {
            throw new Error(SPINE_ERROR + ERROR_MESSAGES.NO_ACTIVATED_VIEW);
        }
    }

    #attachAtlasGraphicsData(textureAtlas) {
        const context = this.context;
        for (let page of textureAtlas.pages) {
            const img = this.#systemInterface.loader.getImage(page.name);
            for (let region of page.regions) {
                region.texture = new GLTexture(context, img);
            }
        }
    }

    #setCanvasSize(view) {
        const settings = this.#systemInterface.systemSettings;
        const canvasWidth = settings.canvasMaxSize.width && (settings.canvasMaxSize.width < window.innerWidth) ? settings.canvasMaxSize.width : window.innerWidth,
            canvasHeight = settings.canvasMaxSize.height && (settings.canvasMaxSize.height < window.innerHeight) ? settings.canvasMaxSize.height : window.innerHeight;
            
        view._setCanvasSize(canvasWidth, canvasHeight);
    }

    /**
     * 
     * @param {CanvasView} view 
     */
    registerView(view) {
        const viewName = view.canvas.id;
        if (this.#registeredViews.has(viewName)) {
            throw new Error(SPINE_ERROR + "canvas view " + viewName + " is already registered");
        } else {
            //set first registered active view as active
            if (!this.#activeView) {
                this.#activeView = viewName;
            }

            this.#setViewRender(view);
            this.#registeredViews.set(viewName, view);
        }
        
    }

    /**
     * @param {CanvasView} view 
     */
    #setViewRender(view) {
        this.#setCanvasSize(view);

        const canvas = view.canvas;
        view.context = new ManagedWebGLRenderingContext(canvas, { preserveDrawingBuffer: false });
        view.sceneRenderer = new SceneRenderer(canvas, view.context, true);
    
        view.initiateContext = () => Promise.resolve();
        view.render = () => {
            throw new Error(SPINE_ERROR + "Canvas view " + view.canvas.id + " is registered, but not activated");
        }
    }

    /**
     * @param {CanvasView} view 
     */
    #updateViewRender(view) {
        //this.#registeredView = view;
        this.#setCanvasSize(view);

        const gl = view.context.gl;
        view.render = () => {
            gl.clearColor(0, 0, 0, 0);
            // Clear the color buffer with specified clear color
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            const renderObjects = view.renderObjects;
            view._bindRenderObjectPromises = [];
            // Begin rendering.
            view.sceneRenderer.begin();
            for (let i = 0; i < renderObjects.length; i++) {
                this.time.update();
                const object = renderObjects[i];
                if (object.isRemoved) {
                    renderObjects.splice(i, 1);
                    i--;
                    continue;
                }
                let promise;
                if (object instanceof DrawSpineObject) {
                    promise = new Promise((resolve, reject) => {
                        object.update(this.time.delta);
                        view.sceneRenderer.drawSkeleton(object.skeleton, false);
                        resolve();
                    });
                } else if (object instanceof DrawSpineTexture) {
                    promise = new Promise((resolve, reject) => {
                        view.sceneRenderer.drawTexture(object.image, object.x, object.y, object.width, object.height);
                        resolve();
                    });
                } else {
                    console.warn("view doesn't support this draw object!", object);
                }
                view._bindRenderObjectPromises.push(promise);
            }

            return Promise.allSettled(view._bindRenderObjectPromises)
                .then((bindResults) => {
                    view.sceneRenderer.end();
                    bindResults.forEach((result) => {
                        if (result.status === "rejected") {
                            return Promise.reject(result);
                        }
                    });
                    return Promise.resolve();
                });
        }
    }

    /**
     * Activate spine render 
     * @param {string} viewName 
     */
    activateSpineRender(viewName) {
        const canvasView = this.#registeredViews.get(viewName);
        if (canvasView) {
            this.#activeView = viewName;
            this.#updateViewRender(canvasView);
        } else {
            throw new Error(SPINE_ERROR + "no view " + viewName + " is registered");
        }
    }

    /**
     * Deactivate spine render
     * @param {string} viewName
     */
    deactivateSpineRender(viewName) {
        this.#activeView = null;
    }
}