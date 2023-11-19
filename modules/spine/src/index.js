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
export default class SpineModuleInitialization {
    constructor(systemInterface, spineFolder, renderInterface) {
        this.#registerSpineLoaders(systemInterface.loader, spineFolder);
        this.#registerDrawObjects(systemInterface, renderInterface.drawContext);
        this.#extendRenderInterface(renderInterface);
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

    #registerDrawObjects(systemInterface, context) {
        const loader = systemInterface.loader;
        const spine = (x, y, dataKey, atlasKey, imageIndex, boundaries) => {
            const skeleton = this.#createSkeleton(dataKey, atlasKey, loader, context);
            if (!skeleton || !(skeleton instanceof Skeleton)) {
                throw new Error(SPINE_ERROR + ERROR_MESSAGES.SKELETON_ERROR);
            } else {
                return new DrawSpineObject(x, y, dataKey, imageIndex, boundaries, skeleton);
            }
        },
        spineTexture = (x, y, width, height, imageKey) => {
            const image = systemInterface.loader.getImage(imageKey);
            if (image) {
                return new DrawSpineTexture(x, y, width, height, new GLTexture(context, image));
            } else {
                console.warn("can't draw an spine image, " + imageKey + ", probably it was not loaded");
                return;
            }
        };
        systemInterface.registerDrawObject("spine", spine);
        systemInterface.registerDrawObject("spineTexture", spineTexture);
    }

    #createSkeleton(dataKey, atlasKey, loader, context) {
        const atlas = loader.getSpineAtlas(atlasKey), 
            spineBinaryFile = loader.getSpineBinary(dataKey),
            spineJsonFile = loader.getSpineJson(dataKey);

        if (!atlas || !(atlas instanceof TextureAtlas)) {
            throw new Error(SPINE_ERROR + ERROR_MESSAGES.NO_ATLAS);
        }
        this.#attachAtlasGraphicsData(atlas, loader, context);
        
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
    #attachAtlasGraphicsData(textureAtlas, loader, context) {
        for (let page of textureAtlas.pages) {
            const img = loader.getImage(page.name);
            for (let region of page.regions) {
                region.texture = new GLTexture(context, img);
            }
        }
    }

    /**
     * 
     * @param {RenderInterface} renderInterface
     */
    #extendRenderInterface(renderInterface) {
        const renderInitMethod = () => {
            renderInterface.time = new TimeKeeper();
            renderInterface.sceneRenderer = new SceneRenderer(renderInterface.canvas, renderInterface.drawContext, true);
            return Promise.resolve();
        };
        const drawSpineObjectMethod = (object) => {
            renderInterface.time.update();
            // a workaround for drawing different objects(switch draw programs)
            renderInterface.sceneRenderer.end();
            object.update(renderInterface.time.delta);
            renderInterface.sceneRenderer.drawSkeleton(object.skeleton, false);
            return Promise.resolve();
        }; 
        const drawSpineTextureMethod = (object) => {
            renderInterface.sceneRenderer.end();
            renderInterface.sceneRenderer.drawTexture(object.image, object.x, object.y, object.width, object.height);
            // sceneRenderer.drawTexture() skips first draw call, for some reasons, 
            // and only prepare the vertices
            // and if next call will be with different draw program, 
            // it will break the drawing of the texture,
            // thats why flush() call required here
            // 1. prepare texture
            // 2. draw call
            renderInterface.sceneRenderer.batcher.flush();
            return Promise.resolve();
        };

        renderInterface.registerRenderInit(renderInitMethod);
        renderInterface.registerObjectRender(drawSpineObjectMethod);
        renderInterface.registerObjectRender(drawSpineTextureMethod);
    }
}