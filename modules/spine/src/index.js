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
    /**
     * @type {number}
     */
    #sortIndex = 0;
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
    /**
     * @type {number}
     */
    get sortIndex () {
        return this.#sortIndex;
    }

    set sortIndex(value) {
        this.#sortIndex = value;
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
    /**
     * @type {number}
     */
    #sortIndex = 0;
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
    /**
     * @type {number}
     */
    get sortIndex () {
        return this.#sortIndex;
    }

    set sortIndex(value) {
        this.#sortIndex = value;
    }
}

class GLTextureExtended extends GLTexture {
    constructor(context, image, useMipMaps){
        super(context, image, useMipMaps);
    }

    bind(unit = 0) {
        super.bind(unit);
        this.boundUnit// this should be set to webgl.images_bind somehow
    }
}
export default class SpineModuleInitialization {
    constructor(systemInterface, spineFolder) {
        this.#registerSpineLoaders(systemInterface.iLoader, spineFolder);
        this.#registerDrawObjects(systemInterface);
        this.#extendRenderInterface(systemInterface);
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
        const loader = systemInterface.iLoader,
            context = systemInterface.iRender.drawContext;
        const spine = (x, y, dataKey, atlasKey, imageIndex, boundaries) => {
            const skeleton = this.#createSkeleton(dataKey, atlasKey, loader, context);
            if (!skeleton || !(skeleton instanceof Skeleton)) {
                throw new Error(SPINE_ERROR + ERROR_MESSAGES.SKELETON_ERROR);
            } else {
                const renderObject = new DrawSpineObject(x, y, dataKey, imageIndex, boundaries, skeleton);
                return renderObject;
            }
        },
        spineTexture = (x, y, width, height, imageKey) => {
            const image = systemInterface.iLoader.getImage(imageKey);
            if (image) {
                const renderObject = new DrawSpineTexture(x, y, width, height, new GLTextureExtended(context, image));
                return renderObject;
            } else {
                console.warn("can't draw an spine image, " + imageKey + ", probably it was not loaded");
                return;
            }
        };
        systemInterface.iExtension.registerDrawObject("spine", spine);
        systemInterface.iExtension.registerDrawObject("spineTexture", spineTexture);
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
                region.texture = new GLTextureExtended(context, img);
            }
        }
    }

    /**
     * 
     * @param {SystemInterface} systemInterface
     */
    #extendRenderInterface(systemInterface) {
        const iRender = systemInterface.iRender;
        const renderInitMethod = () => {
            this.time = new TimeKeeper();
            this.sceneRenderer = new SceneRenderer(iRender.canvas, iRender.drawContext, true);
            return Promise.resolve();
        };
        const drawSpineObjectMethod = (object) => {
            this.time.update();
            // a workaround for drawing different objects(switch draw programs)
            this.sceneRenderer.end();
            object.update(this.time.delta);
            this.sceneRenderer.drawSkeleton(object.skeleton, false);
            this.sceneRenderer.batcher.flush();
            return Promise.resolve();
        }; 
        const drawSpineTextureMethod = (object) => {
            this.sceneRenderer.end();
            this.sceneRenderer.drawTexture(object.image, object.x, object.y, object.width, object.height);
            // sceneRenderer.drawTexture() skips first draw call, for some reasons, 
            // and only prepare the vertices
            // and if next call will be with different draw program, 
            // it will break the drawing of the texture,
            // thats why flush() call required here
            // 1. prepare texture
            // 2. draw call
            this.sceneRenderer.batcher.flush();
            return Promise.resolve();
        };

        systemInterface.iExtension.registerRenderInit(renderInitMethod);
        systemInterface.iExtension.registerObjectRender(DrawSpineObject.name, drawSpineObjectMethod);
        systemInterface.iExtension.registerObjectRender(DrawSpineTexture.name, drawSpineTextureMethod);
    }
}