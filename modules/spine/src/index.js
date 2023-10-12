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

class DrawSpineObject {
    /**
     * @type {Skeleton}
     */
    #skeleton;
    #isRemoved = false;
    constructor(mapX, mapY, key, imageIndex = 0, boundaries, skeleton) {
        this.#skeleton = skeleton;
        this.#skeleton.x = mapX;
        this.#skeleton.y = mapY;
        this.animationStateData = new AnimationStateData(this.#skeleton.data);
        this.animationState = new AnimationState(this.animationStateData);
    }

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
            console.error("no skin with key ", skinKey, " was found");
        }

        // Calculate the bounds so we can center and zoom
        // the camera such that the skeleton is in full view.
        //let offset = new spine.Vector2(), size = new spine.Vector2();
        //this.skeleton.getBounds(offset, size);
    }

    get isRemoved() {
        return this.#isRemoved;
    }

    remove() {
        this.#isRemoved = true;
    }
}

class DrawSpineTexture {
    #x;
    #y;
    #width;
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
    #registeredView;
    #systemInterface;
    #context;
    #sceneRenderer;
    constructor(systemInterface, spineFolder, spineView) {
        this.#systemInterface = systemInterface;
        this.#registerSpineLoaders(this.#systemInterface.loader, spineFolder);
        this.#extendDrawFactory();
        if (spineView) {
            this.registerView(spineView);
        }
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

        drawFactory.spine = (x, y, dataKey, atlasKey, imageIndex, boundaries) => {
            const skeleton = this.#createSkeleton(dataKey, atlasKey);
            if (!skeleton || !(skeleton instanceof Skeleton)) {
                console.error("couldn't create spine skeleton!");
            } else {
                return new DrawSpineObject(x, y, dataKey, imageIndex, boundaries, skeleton);
            }
        }

        drawFactory.spineTexture = (x, y, width, height, imageKey) => {
            const image = this.#systemInterface.loader.getImage(imageKey);
            if (image) {
                return new DrawSpineTexture(x, y, width, height, new GLTexture(this.#context, image));
            } else {
                console.warn("can't draw an spine image, " + imageKey + ", probably it was not loaded");
            }
        }
    }

    #createSkeleton(dataKey, atlasKey) {
        const atlas = this.#systemInterface.loader.getSpineAtlas(atlasKey), 
            spineBinaryFile = this.#systemInterface.loader.getSpineBinary(dataKey),
            spineJsonFile = this.#systemInterface.loader.getSpineJson(dataKey);

        this.#attachAtlasGraphicsData(atlas);
        
        let skeletonData;
        if (spineBinaryFile) {
            let binary = new SkeletonBinary(new AtlasAttachmentLoader(atlas));
            skeletonData = binary.readSkeletonData(new Uint8Array(spineBinaryFile));
        } else if (spineJsonFile) {
            let json = new SkeletonJson(new AtlasAttachmentLoader(atlas));
            skeletonData = json.readSkeletonData(spineJsonFile);
        }

        return new Skeleton(skeletonData);
    }

    #attachAtlasGraphicsData(textureAtlas) {
        for (let page of textureAtlas.pages) {
            const img = this.#systemInterface.loader.getImage(page.name);
            for (let region of page.regions) {
                if (!this.#context) {
                    console.error("no view is registered on the module!");
                    return;
                }
                region.texture = new GLTexture(this.#context, img);
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
        const canvas = view.canvas;
        this.#registeredView = view;
        
        this.#setCanvasSize(view);
        this.#context = new ManagedWebGLRenderingContext(canvas, { preserveDrawingBuffer: false });
        this.#sceneRenderer = new SceneRenderer(canvas, this.#context, true);

        this.#registeredView.initiateContext = () => Promise.resolve();

        const gl = this.#context.gl;
        this.#registeredView.render = () => {
            gl.clearColor(0, 0, 0, 0);
            // Clear the color buffer with specified clear color
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            const renderObjects = this.#registeredView.renderObjects;
            this.#registeredView._bindRenderObjectPromises = [];
            // Begin rendering.
            this.#sceneRenderer.begin();
            for (let i = 0; i < renderObjects.length; i++) {
                this.time.update();
                const object = renderObjects[i];
                if (object.isRemoved) {
                    renderObjects.splice(i, 1);
                    i--;
                }
                let promise;
                if (object instanceof DrawSpineObject) {
                    promise = new Promise((resolve, reject) => {
                        object.update(this.time.delta);
                        this.#sceneRenderer.drawSkeleton(object.skeleton, false);
                        resolve();
                    });
                } else if (object instanceof DrawSpineTexture) {
                    promise = new Promise((resolve, reject) => {
                        this.#sceneRenderer.drawTexture(object.image, object.x, object.y, object.width, object.height);
                        resolve();
                    });
                } else {
                    console.warn("view doesn't support this draw object!", object);
                }
                this.#registeredView._bindRenderObjectPromises.push(promise);
            }

            return Promise.allSettled(this.#registeredView._bindRenderObjectPromises)
                .then((bindResults) => {
                    this.#sceneRenderer.end();
                    bindResults.forEach((result) => {
                        if (result.status === "rejected") {
                            console.error(result.reason);
                        }
                    });
                    return Promise.resolve();
                });
        }
    }
}