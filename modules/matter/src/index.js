import * as Matter from "matter-js";
//import { ISystem } from "../../../src/base/ISystem.js";
import { CONST } from "../../../src/constants.js";

// module aliases
var Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

export default class MatterJsModuleInitialization {
    #iSystem;
    #stageData;
    #matterEngineInstance;

    #debugRender;

    #debugCanvas;
    constructor(systemInterface, options = {}) {
        this.#iSystem = systemInterface;
        this.#extendRenderInterface(systemInterface, options);
        console.log("matterjs init");
    }

    #integrateStageData = (stageData) => {
        console.log("integrate stage data: ", stageData);
        this.#stageData = stageData;
    }

    #render = () => {
        // console.log("render");
        // console.log(this.#stageData);
        // console.log(this.#matterEngineInstance.world);
        Engine.update(this.#matterEngineInstance);
    }

    #registerSystemEvents() {
        this.#iSystem.addEventListener(CONST.EVENTS.SYSTEM.RENDER.START, this.#render);
    }

    #unregisterSystemEvents() {
        this.#iSystem.removeEventListener(CONST.EVENTS.SYSTEM.RENDER.END, this.#render);
    }
    /** 
     * @param {ISystem} systemInterface
     */
    #extendRenderInterface(systemInterface, options) {
        const iRender = systemInterface.iRender;
        const renderInitMethod = (stageData) => {
            console.log("===>>>> render init method");
            // create an engine
            this.#matterEngineInstance = Engine.create(options.engine ? options.engine : {});
            this.#integrateStageData(stageData);

            this.#extendDrawFactory(systemInterface);
            this.#registerSystemEvents();
            if (options.isDebug) {
                this.#debugRender = Matter.Render.create({
                    element: document.body,
                    engine: this.#matterEngineInstance,
                    options: {
                        width: 892,
                        height: 640,
                        wireframes: true, // Enable wireframe view for debugging
                        showAngleIndicator: true, // Show angle of bodies
                        showCollisions: true, // Highlight collisions
                        showVelocity: true // Show velocity vectors
                    }
                });
                Matter.Render.run(this.#debugRender);

                const debug = document.getElementsByTagName("canvas")[1];
                debug.style.position = "absolute";
                debug.style.left = "0";
                debug.style.top = "0";
                debug.style.opacity = "0.5";
            }
            return Promise.resolve();
        };

        systemInterface.iExtension.registerRenderInit(renderInitMethod);
    }

    #extendDrawFactory(systemInterface) {
        const originalRect = systemInterface.drawObjectFactory.rect.bind(systemInterface.drawObjectFactory);
        console.log("extend draw factory");
        systemInterface.drawObjectFactory.rect = (x, y, w, h, bg, options) => {
            console.log("----->>>>>>extended method called");
            
            const rectOriginal = originalRect(x, y, w, h, bg);
            options = {...options, id: rectOriginal.id};

            const matterRect = Bodies.rectangle(x, y, w, h, options);
            //matterRect.position.x = matterRect.bounds.max.x;
            //matterRect.position.y = matterRect.bounds.max.y;
            //matterRect.positionPrev.x = matterRect.bounds.max.x;
            //matterRect.positionPrev.y = matterRect.bounds.max.y;
            Matter.Body.setCentre(matterRect, {x: matterRect.bounds.min.x, y: matterRect.bounds.min.y} );
            //Matter.Body.translate(matterRect, {x: matterRect.bounds.max.x - matterRect.position.x, y:  matterRect.bounds.max.y - matterRect.position.y});
            //Matter.Body.setPosition(matterRect, {x: matterRect.bounds.max.x -matterRect.position.x, y: matterRect.bounds.max.y - matterRect.position.y})
            console.log(rectOriginal);
            console.log(matterRect);
            // bind x, y to matter.xy
            Object.defineProperty(rectOriginal, 'x', {
                get() {
                    return matterRect.position.x;
                },
                set(val) {
                    //rectOriginal.rotation = val;
                    //matterRect.angle = val;
                    Matter.Body.setPosition(matterRect, {x:val, y: matterRect.position.y});
                }
            });
            Object.defineProperty(rectOriginal, 'y', {
                get() {
                    return matterRect.position.y;
                },
                set(val) {
                    Matter.Body.setPosition(matterRect, {x:matterRect.position.x, y: val});
                }
            });
            Object.defineProperty(rectOriginal, 'rotation', {
                get() {
                    return matterRect.angle;
                },
                set(val) {
                    //rectOriginal.rotation = val;
                    //matterRect.angle = val;
                    Matter.Body.rotate(matterRect, val)
                }
            });
            // add to matter engine 
            Composite.add(this.#matterEngineInstance.world, matterRect);

            //console.log(this.#matterEngineInstance.world);
            // 
            return rectOriginal;
        };

        const originalPolygon = systemInterface.drawObjectFactory.polygon.bind(systemInterface.drawObjectFactory);
        systemInterface.drawObjectFactory.polygon = (vertices, bg, options) => {
            console.log("----->>>>>>extended polygon called");
            
            const polyOriginal = originalPolygon(vertices, bg);
            options = {...options, id: polyOriginal.id};
            
            const matterPoly = Bodies.fromVertices(polyOriginal.x, polyOriginal.y, vertices, options);
            
            Matter.Body.setCentre(matterPoly, {x: matterPoly.bounds.min.x, y: matterPoly.bounds.min.y});
            console.log(polyOriginal);
            console.log(matterPoly);
            // bind x, y to matter.xy
            Object.defineProperty(polyOriginal, 'x', {
                get() {
                    return matterPoly.position.x;
                },
                set(val) {
                    //rectOriginal.rotation = val;
                    //matterRect.angle = val;
                    Matter.Body.setPosition(matterPoly, {x:val, y: matterPoly.position.y});
                }
            });
            Object.defineProperty(polyOriginal, 'y', {
                get() {
                    return matterPoly.position.y;
                },
                set(val) {
                    Matter.Body.setPosition(matterPoly, {x:matterPoly.position.x, y: val});
                }
            });
            Object.defineProperty(polyOriginal, 'rotation', {
                get() {
                    return matterPoly.angle;
                },
                set(val) {
                    //rectOriginal.rotation = val;
                    //matterRect.angle = val;
                    Matter.Body.rotate(matterPoly, val)
                }
            });
            // add to matter engine 
            Composite.add(this.#matterEngineInstance.world, matterPoly);

            //console.log(this.#matterEngineInstance.world);
            //
            return polyOriginal;
        }

        const originalCircle = systemInterface.drawObjectFactory.circle.bind(systemInterface.drawObjectFactory);
        systemInterface.drawObjectFactory.circle = (x, y, radius, bg, options) => {
            const circleOriginal = originalCircle(x, y, radius, bg);

            options = {...options, id: circleOriginal.id};
            
            const matterCircle = Bodies.circle(circleOriginal.x, circleOriginal.y, radius, options);
            
            //console.log(polyOriginal);
            //console.log(matterPoly);
            // bind x, y to matter.xy
            Object.defineProperty(circleOriginal, 'x', {
                get() {
                    return matterCircle.position.x;
                },
                set(val) {
                    //rectOriginal.rotation = val;
                    //matterRect.angle = val;
                    Matter.Body.setPosition(matterCircle, {x:val, y: matterCircle.position.y});
                }
            });
            Object.defineProperty(circleOriginal, 'y', {
                get() {
                    return matterCircle.position.y;
                },
                set(val) {
                    Matter.Body.setPosition(matterCircle, {x:matterCircle.position.x, y: val});
                }
            });
            
            // add to matter engine 
            Composite.add(this.#matterEngineInstance.world, matterCircle);

            //console.log(this.#matterEngineInstance.world);
            //
            return circleOriginal;
        }
    }
}