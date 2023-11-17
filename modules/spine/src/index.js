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
    #renderInterface;
    #systemInterface;
    constructor(systemInterface, spineFolder, renderInterface) {
        this.#systemInterface = systemInterface;
        this.#registerSpineLoaders(this.#systemInterface.loader, spineFolder);
        this.#registerDrawObjects(this.#systemInterface);
        if (renderInterface) {
            this.extendRenderInterface(renderInterface);
        }
        //if (spineView) {
        //    this.registerView(spineView);
        //}
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

    #registerDrawObjects(systemInterface) {
        const spine = (x, y, dataKey, atlasKey, imageIndex, boundaries) => {
            const skeleton = this.#createSkeleton(dataKey, atlasKey);
            if (!skeleton || !(skeleton instanceof Skeleton)) {
                throw new Error(SPINE_ERROR + ERROR_MESSAGES.SKELETON_ERROR);
            } else {
                return new DrawSpineObject(x, y, dataKey, imageIndex, boundaries, skeleton);
            }
        },
        spineTexture = (x, y, width, height, imageKey) => {
            const image = this.#systemInterface.loader.getImage(imageKey);
            if (image) {
                return new DrawSpineTexture(x, y, width, height, new GLTexture(this.#renderInterface.drawContext, image));
            } else {
                console.warn("can't draw an spine image, " + imageKey + ", probably it was not loaded");
                return;
            }
        };
        systemInterface.registerDrawObject("spine", spine);
        systemInterface.registerDrawObject("spineTexture", spineTexture);
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
        if (this.#renderInterface) {
            return this.#renderInterface.drawContext;
        } else {
            throw new Error(SPINE_ERROR + ERROR_MESSAGES.NO_ACTIVATED_VIEW);
        }
    }

    get sceneRenderer() {
        if (this.#renderInterface) {
            return this.#renderInterface.sceneRenderer;
        } else {
            throw new Error(SPINE_ERROR + ERROR_MESSAGES.NO_ACTIVATED_VIEW);
        }
    }

    #attachAtlasGraphicsData(textureAtlas) {
        const context = this.context;
        for (let page of textureAtlas.pages) {
            const img = this.#systemInterface.loader.getImage(page.name);
            for (let region of page.regions) {
                if (!this.#renderInterface.drawContext) {
                    console.error("no view is registered on the module!");
                    return;
                }
                region.texture = new GLTexture(this.#renderInterface.drawContext, img);
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
     * @param {RenderInterface} renderInterface
     */
    extendRenderInterface(renderInterface) {
        this.#renderInterface = renderInterface;
        
        this.#setCanvasSize(renderInterface);
        //this.#sceneRenderer = new SceneRenderer(renderInterface.canvas, renderInterface.drawContext, true);

        // rewrite default render init
        const currentInit = this.#renderInterface.initiateContext;
        this.#renderInterface.initiateContext = () => currentInit().then(() => {
            // introduce a custom renderer
            this.#renderInterface.sceneRenderer = new SceneRenderer(renderInterface.canvas, renderInterface.drawContext, true);
        });

        const gl = renderInterface.drawContext;
        this.#renderInterface.render = async() => {
            //gl.clearColor(0, 0, 0, 0);
            // Clear the color buffer with specified clear color
            //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            const sceneRenderer = this.#renderInterface.sceneRenderer;
            this.#renderInterface.clearContext();
            const renderObjects = this.#renderInterface.screenPageData.renderObjects;
            this.#renderInterface._bindRenderObjectPromises = [];
            
            for (let i = 0; i < renderObjects.length; i++) {
                const object = renderObjects[i];
                if (object.isRemoved) {
                    renderObjects.splice(i, 1);
                    i--;
                    continue;
                }
                let promise;
                if (object instanceof DrawSpineObject) {
                    promise = new Promise((resolve, reject) => {
                        this.time.update();
                        // a workaround for drawing different objects(switch draw programs)
                        sceneRenderer.end();
                        //
                        object.update(this.time.delta);
                        sceneRenderer.drawSkeleton(object.skeleton, false);
                        resolve();
                    });
                } else if (object instanceof DrawSpineTexture) {
                    promise = new Promise((resolve, reject) => {
                        // a workaround for drawing different objects(switch draw programs)
                        sceneRenderer.end();
                        //
                        //console.log("draw texture");
                        //gl.disable(gl.BLEND);
                        //gl.disable(gl.STENCIL_TEST);
                        sceneRenderer.drawTexture(object.image, object.x, object.y, object.width, object.height);
                        resolve();
                    });
                } else {
                    promise = await this.#renderInterface._bindRenderObject(object).then(()=> {
                        return Promise.resolve();
                    }).catch((err) => Promise.reject(err));
                }
                this.#renderInterface._bindRenderObjectPromises.push(promise);
            }

            return Promise.allSettled(this.#renderInterface._bindRenderObjectPromises)
                .then((bindResults) => {
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
        //const canvasView = this.#renderInterface;
        //if (canvasView) {
        //    this.#renderInterface = viewName;
        //    this.#updateViewRender(canvasView);
        //} else {
        //    throw new Error(SPINE_ERROR + "no view " + viewName + " is registered");
        //}
    }

    /**
     * Deactivate spine render
     * @param {string} viewName
     */
    //deactivateSpineRender(viewName) {
    //    this.#activeView = null;
    //}
}