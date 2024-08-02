import { GameStage, CONST } from "../../src/index.js";
import { isPointInsidePolygon, countDistance, randomFromArray, isPointRectIntersect } from "../../src/utils.js";
import { GAME_UNITS, GAME_EVENTS, GOLD_MINE_GOLD_AMOUNT, TREE_STUB_INDEX, TREE_FULL_HEALTH, PEASANT_ACTIONS } from "./const.js";
import { UnitPeasant, UnitBuilding } from "./units.js";

export class Strategy extends GameStage {

	#SLOW_SCROLL_POINT = 200;
	#QUICK_SCROLL_POINT = 50;

	#imageConverter = document.createElement("canvas");
	#playerGold = 0;
	#playerGoldCounter;
	#playerWood = 0;
	#playerWoodCounter;
	#playerPeopleLimit = 5; // lets say town center increase limit to 5
	#playerPeopleLimitCounter;
	#playerUnits = [];
	#playerBuildings = [];
	#neutralBuildings = [];
	#enemyUnits = [];
	#enemyBuildings = [];

	#treesLayer;
	#treesCutHealth = new Map();
	
	#selectedItemText;
	#buildItems;

	#buildTemplate;
	#isBuildPlaceClear;
	#buildTemplateOverlap;

	#mouseX;
	#mouseY;

	register() {
    	this.iLoader.addTileMap("s_map", "./strategy/strategy_map.tmj");
		this.iLoader.addImage(GAME_UNITS.GOLD_MINE.name, "./strategy/images/MiniWorldSprites/Buildings/Wood/Resources.png");
		this.iLoader.addImage(GAME_UNITS.TOWN_CENTER.name, "./strategy/images/MiniWorldSprites/Buildings/Red/RedKeep.png");
		this.iLoader.addImage(GAME_UNITS.HOUSE.name, "./strategy/images/MiniWorldSprites/Buildings/Red/RedHouses.png");
		this.iLoader.addImage(GAME_UNITS.BARRACKS.name, "./strategy/images/MiniWorldSprites/Buildings/Red/RedBarracks.png");

		this.iLoader.addImage(GAME_UNITS.PEASANT.name, "./strategy/images/MiniWorldSprites/Characters/Workers/RedWorker/FarmerRed.png");

		this.iLoader.addAudio("peasantWhat1", "./strategy/audio/peasantwhat1.mp3");
		this.iLoader.addAudio("peasantWhat2", "./strategy/audio/peasantwhat2.mp3");
		this.iLoader.addAudio("peasantWhat3", "./strategy/audio/peasantwhat3.mp3");
		this.iLoader.addAudio("needMoreGold", "./strategy/audio/gruntnogold1.mp3");
		this.iLoader.addAudio("needFood", "./strategy/audio/upkeepring.mp3")
		this.iLoader.addAudio("chopTree", "./strategy/audio/axemediumchopwood2.mp3");
		this.iLoader.addAudio("cantBuildHere" , "./strategy/audio//peasantcannotbuildthere1.mp3");
		this.timer = null;
		this.eventsAggregator = new EventTarget();
		document.body.style.margin = 0;
	}
    init() {
		const [w, h] = this.stageData.canvasDimensions;
    	// x, y, width, height, imageKey
       	const ground = this.draw.tiledLayer("ground", "s_map"),
			water = this.draw.tiledLayer("water", "s_map", true),
			cliff = this.draw.tiledLayer("cliff", "s_map", true),
			bridge = this.draw.tiledLayer("bridge", "s_map");

		this.#treesLayer = this.draw.tiledLayer("trees", "s_map", true);

		this.goldMine1 = this.draw.image(180, 76, 16, 16, GAME_UNITS.GOLD_MINE.name, 13);
		this.goldMine1.goldAmount = GOLD_MINE_GOLD_AMOUNT;

		this.#neutralBuildings.push(this.goldMine1);

		// this.shadowRect = this.draw.rect(0, 0, w, h, "rgba(0, 0, 0, 0.5)");  
     	// this.shadowRect.blendFunc = [WebGLRenderingContext.ONE, WebGLRenderingContext.DST_COLOR];
		// this.shadowRect.turnOffOffset();

		// units

		const townCenter = new UnitBuilding(100, 120, 32, 32, GAME_UNITS.TOWN_CENTER.name, 0, this.draw, this.eventsAggregator, 1);
		
		this.#playerBuildings.push(townCenter);

		const peasant1 = new UnitPeasant(132, 105, 16, 16, townCenter, this.draw, this.eventsAggregator),
			peasant2 = new UnitPeasant(132, 121, 16, 16, townCenter, this.draw, this.eventsAggregator),
			peasant3 = new UnitPeasant(132, 137, 16, 16, townCenter, this.draw, this.eventsAggregator);

		this.addRenderObject(townCenter);
		this.addRenderObject(peasant1);
		this.addRenderObject(peasant2);
		this.addRenderObject(peasant3);

		this.#playerUnits.push(peasant1);
		this.#playerUnits.push(peasant2);
		this.#playerUnits.push(peasant3);

		this.chopTreeSound = this.iLoader.getAudio("chopTree");
		this.peasantWhatAudioArr = [this.iLoader.getAudio("peasantWhat1"), this.iLoader.getAudio("peasantWhat2"), this.iLoader.getAudio("peasantWhat3") ];
       	
		// this.personSightView = this.draw.conus(55, 250, 200, "rgba(0,0,0,1)", Math.PI/3);
		// this.personSightView.rotation = -Math.PI/6;
		// this.personSightView._isMask = true;
		this.navItemBack = this.draw.text(w - 200, 60, "Main menu", "18px sans-serif", "black");
		this.navItemBack.turnOffOffset();
		this.registerListeners();
    }
    start() {
       	this.stageData.centerCameraPosition(100, 300);
		this.registerListeners();
		this.#createUserInterface();
		setTimeout(() => {
			const [w, h] = this.stageData.canvasDimensions;
		},100);
		console.log("strategy started");
    }

	stop() {
        this.unregisterListeners();
		document.getElementById("sidebar").remove();
    }
	
	registerListeners() {
		this.#registerMouseListeners();
        this.#registerKeyboardListeners();
		this.#registerSystemEventsListeners();
	}

	unregisterListeners() {
		this.#unregisterMouseListeners();
        this.#unregisterKeyboardListeners();
		this.#unregisterSystemEventsListeners();
	}

	#registerKeyboardListeners() {
        document.addEventListener("keydown", this.#pressKeyAction);
        document.addEventListener("keyup", this.#removeKeyAction);
    }

    #unregisterKeyboardListeners() {
        document.removeEventListener("keydown", this.#pressKeyAction);
        document.removeEventListener("keyup", this.#removeKeyAction);
    }

    #registerMouseListeners() {
        document.addEventListener("mousemove", this.#mouseMoveAction);
        document.addEventListener("click", this.#mouseClickAction);
    }

    #unregisterMouseListeners() {
        document.removeEventListener("mousemove", this.#mouseMoveAction);
        document.removeEventListener("click", this.#mouseClickAction);
    }

	#createUserInterface = () => {
		const windowWidth = document.body.offsetWidth,
			sidebar = document.createElement("div");
		sidebar.id = "sidebar";
		sidebar.style.width = windowWidth + "px";
		sidebar.style.height = "16px";
		sidebar.style.padding = "6px";
		sidebar.style.backgroundColor = "#ccc";
		sidebar.style.position = "fixed";
		sidebar.style.top = 0 + "px";
		sidebar.style.left = 0 + "px";
		sidebar.style.display = "flex";
		document.body.appendChild(sidebar);

		const resourcesInfo = document.createElement("div");
		resourcesInfo.style.display = "flex";
		sidebar.appendChild(resourcesInfo);

		const playerGoldCounterText = document.createElement("div");
		playerGoldCounterText.innerText = "Gold: ";
		resourcesInfo.appendChild(playerGoldCounterText);

		this.#playerGoldCounter = document.createElement("div");
		this.#playerGoldCounter.innerText = this.#playerGold.toString();
		this.#playerGoldCounter.style.marginRight = "6px";
		resourcesInfo.appendChild(this.#playerGoldCounter);

		const playerWoodCounterText = document.createElement("div");
		playerWoodCounterText.innerText = "Wood: ";
		resourcesInfo.appendChild(playerWoodCounterText);

		this.#playerWoodCounter = document.createElement("div");
		this.#playerWoodCounter.innerText = this.#playerWood.toString();
		this.#playerWoodCounter.style.marginRight = "6px";
		resourcesInfo.appendChild(this.#playerWoodCounter);

		const playerPeopleCounterText = document.createElement("div");
		playerPeopleCounterText.innerText = "People limits: ";
		resourcesInfo.appendChild(playerPeopleCounterText);
		

		this.#playerPeopleLimitCounter = document.createElement("div");
		this.#playerPeopleLimitCounter.innerText = this.#playerUnits.length + "/" + this.#playerPeopleLimit.toString();
		resourcesInfo.appendChild(this.#playerPeopleLimitCounter);
		
		const buildMenuContainer = document.createElement("div");
		buildMenuContainer.style.display = "flex";
		buildMenuContainer.style.marginLeft = "30px";
		sidebar.appendChild(buildMenuContainer);

		this.#selectedItemText = document.createElement("div");
		this.#selectedItemText.innerText = "Nothing is selected";
		buildMenuContainer.appendChild(this.#selectedItemText);

		this.#buildItems = document.createElement("div");
		buildMenuContainer.appendChild(this.#buildItems);

	}
	
	#pressKeyAction = (event) => {
        const code = event.code;
    };

    #removeKeyAction = (event) => {
        const code = event.code;
    };

    #mouseMoveAction = (e) => {
        const [xOffset, yOffset] = this.stageData.worldOffset,
            x = e.offsetX,
            y = e.offsetY,
            cursorPosX = x + xOffset,
            cursorPosY = y + yOffset,
			[ viewWidth, viewHeight ] = this.stageData.canvasDimensions,
			xShiftRight = viewWidth - x,
			yShiftBottom = viewHeight - y,
			xShift = viewWidth/2 + xOffset,
			yShift = viewHeight/2 + yOffset;
			
		let newPosX = xShift,
			newPosY = yShift;
		if (x < this.#QUICK_SCROLL_POINT) {
			//console.log("quick scroll left");
			newPosX = xShift-20;
		} else if (x < this.#SLOW_SCROLL_POINT) {
			//console.log("slow scroll left");
			newPosX = xShift-5;
		}
		if (xShiftRight < this.#QUICK_SCROLL_POINT) {
			//console.log("quick scroll right");
			newPosX = xShift+20;
		} else if (xShiftRight < this.#SLOW_SCROLL_POINT) {
			//console.log("slow scroll right");
			newPosX = xShift+20;
		}

		if (y < this.#QUICK_SCROLL_POINT) {
			//console.log("quick scroll up");
			newPosY = yShift-20;
		} else if (y < this.#SLOW_SCROLL_POINT) {
			//console.log("slow scroll up");
			newPosY = yShift-5;
		}
		if (yShiftBottom < this.#QUICK_SCROLL_POINT) {
			//console.log("quick scroll down");
			newPosY = yShift+20;
		} else if (yShiftBottom < this.#SLOW_SCROLL_POINT) {
			//console.log("slow scroll down");
			newPosY = yShift+5;
		}
		this.stageData.centerCameraPosition(newPosX, newPosY);
		this.#mouseX = cursorPosX;
		this.#mouseY = cursorPosY;
		if (this.#buildTemplate) {
			this.#buildTemplate.x = cursorPosX;
			this.#buildTemplate.y = cursorPosY;
			this.#buildTemplateOverlap.x = cursorPosX - this.#buildTemplateOverlap.width/2;
			this.#buildTemplateOverlap.y = cursorPosY - this.#buildTemplateOverlap.height/2;
			if (this.isBoundariesCollision(cursorPosX, cursorPosY, this.#buildTemplateOverlap) 
				|| this.isObjectsCollision(cursorPosX, cursorPosY, this.#buildTemplateOverlap, this.#playerBuildings)
				|| this.isObjectsCollision(cursorPosX, cursorPosY, this.#buildTemplateOverlap, this.#neutralBuildings)) {
				this.#buildTemplateOverlap.bgColor = "rgba(224, 12, 21, 0.6)";
				this.#isBuildPlaceClear = false;
			} else {
				this.#buildTemplateOverlap.bgColor = "rgba(0, 0, 0, 0.3";
				this.#isBuildPlaceClear = true;
			}
		}

		const isNav1Traversed = isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.boundariesBox);

		if (isNav1Traversed) {
            this.navItemBack.strokeStyle = "rgba(0, 0, 0, 0.3)";
            this.canvasHtmlElement.style.cursor = "pointer";
        } else if (this.navItemBack.strokeStyle) {
            this.navItemBack.strokeStyle = undefined;
            this.canvasHtmlElement.style.cursor = "default";
        } else {
            this.canvasHtmlElement.style.cursor = "default";
        }
    };

    #mouseClickAction = (e) => {
		const target = e.target;
		
		if (target instanceof Image) {
			this.#processImageClick(e);
		} else if (this.#buildTemplate) {
			this.#processNewBuild(this.#buildTemplate.key);
		} else {
			this.#processMapClick(e);
		}

		const isNav1Click = isPointRectIntersect(e.offsetX, e.offsetY, this.navItemBack.boundariesBox);
		
        if (isNav1Click) {
            this.iSystem.stopGameStage("strategy_game");
            this.canvasHtmlElement.style.cursor = "default";
            this.iSystem.startGameStage("start");
        }
    }

	#processNewBuild = (key) => {
		const cantBuildAudio = this.iLoader.getAudio("cantBuildHere");

		if (this.#isBuildPlaceClear) {
			this.#playerUnits.forEach((unit) => {
				if (unit.isSelected) {
					unit.activateStartBuilding(this.#buildTemplateOverlap.x, this.#buildTemplateOverlap.y, key);
					if (unit.isSelected) {
						unit.isSelected = false;
					}
					// cleanup build menu
					this.#selectedItemText.innerText = "";
					while (this.#buildItems.lastChild) {
						this.#buildItems.removeChild(this.#buildItems.lastChild);
					}
					// remove build helpers
					this.#buildTemplate.destroy();
					this.#buildTemplateOverlap.destroy();
					this.#buildTemplate = null;
					this.#buildTemplateOverlap = null;
				}
			});
		} else {
			cantBuildAudio.play();
		}

	}

	#processImageClick = (e) => {
		const target = e.target,
			type = target.id;
			
		
		switch (type) {
			case GAME_UNITS.PEASANT.name:
				this.#orderToBuildUnit(GAME_UNITS.PEASANT.name);
				break;
			case GAME_UNITS.HOUSE.name:
				this.#orderToBuildBuilding(GAME_UNITS.HOUSE.name);
				break;
			case GAME_UNITS.BARRACKS.name:
				this.#orderToBuildBuilding(GAME_UNITS.BARRACKS.name);
				break;
		}
	}

	#orderToBuildUnit = (type) => {
		console.log("order build ", type);
		const costWood = GAME_UNITS[type].cost.w,
			costGold = GAME_UNITS[type].cost.g;
		if (!this.#isEnoughGold(costGold)) {
			console.log("not enough gold");
			this.iLoader.getAudio("needMoreGold").play();
		} else if (!this.#isEnoughWood(costWood)) {
			console.log("not enough wood");
		} else if (!this.#isEnoughHouses()) {
			this.iLoader.getAudio("needFood").play();
			console.log("not enough houses");
			
		} else {
			this.#playerGold -= costGold;
			this.#playerWood -= costWood;
			const townCenter = this.#playerBuildings.find((building) => building.key === GAME_UNITS.TOWN_CENTER.name);
			if (!townCenter.isBuildingUnit) {
				townCenter.buildUnit(type);
			} else {
				console.log("already building");
			}
			
		}
	}

	#orderToBuildBuilding = (type) => {
		console.log("order build ", type);
		const costWood = GAME_UNITS[type].cost.w,
			costGold = GAME_UNITS[type].cost.g;
		if (!this.#isEnoughGold(costGold)) {
			console.log("not enough gold");
			this.iLoader.getAudio("needMoreGold").play();
		} else if (!this.#isEnoughWood(costWood)) {
			console.log("not enough wood");
		} else {
			this.#buildTemplate = this.draw.image(this.#mouseX, this.#mouseY, 16, 16, type, 9);
			this.#buildTemplateOverlap = this.draw.rect(this.#mouseX - 8, this.#mouseY - 8, 16, 16, "rgba(0, 0, 0, 0.3");
			this.#isBuildPlaceClear = false;
		}
	}
	#isEnoughGold(costGold) {
		const gold = this.#playerGold;
		return costGold <= gold;
	}

	#isEnoughWood(costWood) {
		const wood = this.#playerWood;

		return costWood <= wood;
	}

	#isEnoughHouses() {
		const units = this.#playerUnits.length,
			maxUnits = this.#playerPeopleLimit;
		console.log("u: ", units);
		console.log("l: ", maxUnits);
		return maxUnits > units;
	}
	#processMapClick = (e) => {
		let selectPlayerUnit = null,
			isTreeSelected = false,
			selectedNeutralBuilding = null,
			[ offsetX, offsetY ] = this.stageData.worldOffset,
			clickXWithOffset = e.offsetX + offsetX,
			clickYWithOffset = e.offsetY + offsetY;

		this.#playerUnits.forEach((unit) => {
			if (isPointInsidePolygon(clickXWithOffset - unit.x, clickYWithOffset - unit.y, unit.boundaries)) {
				this.#playerUnits.forEach((unit) => {
					console.log(unit.isSelected);
					if (unit.isSelected) {
						console.log("deselect");
						unit.isSelected = false;
					}
				});
				this.#playerBuildings.forEach((unit) => {
					if (unit.isSelected) {
						unit.isSelected = false;
					}
				});

				selectPlayerUnit = unit;
				selectPlayerUnit.isSelected = true;

				this.#selectedItemText.innerText = "Peasant: ";
				while (this.#buildItems.lastChild) {
					this.#buildItems.removeChild(this.#buildItems.lastChild);
				}
					
				const peasantFrameHouse = this.iLoader.getImage(GAME_UNITS.HOUSE.name);//this.draw.image(startX, startY, 16, 16, "houses", randomFromArray([9, 10, 11]));
				const helper = this.#imageConverter.getContext("2d");	
				this.#imageConverter.width = 16;
				this.#imageConverter.height = 16;
				helper.clearRect(0, 0, window.innerWidth, window.innerHeight);
				helper.drawImage(peasantFrameHouse, 16, 48, 16, 16, 0, 0, 16, 16);
				const imageDataHouse = this.#imageConverter.toDataURL();
				const houseImage = new Image(16, 16);
				houseImage.src = imageDataHouse;
				houseImage.id = GAME_UNITS.HOUSE.name;

				const peasantFrameBarracks = this.iLoader.getImage(GAME_UNITS.BARRACKS.name);//this.draw.image(startX + 18, startY, 16, 16, "barracks", 1);
				helper.clearRect(0, 0, window.innerWidth, window.innerHeight);
				helper.drawImage(peasantFrameBarracks, 16, 0, 16, 16, 0, 0, 16, 16);
				const imageDataBarracks = this.#imageConverter.toDataURL();
				const barracksImage = new Image(16, 16);
				barracksImage.src = imageDataBarracks;
				barracksImage.id = GAME_UNITS.BARRACKS.name;

				this.#buildItems.appendChild(houseImage);
				this.#buildItems.appendChild(barracksImage);
				//remove current orders
				const activeAnimation = unit.activeAnimation;
				if (activeAnimation) {
					unit.stopRepeatedAnimation(activeAnimation);
				}
				unit.activateIdle();

				randomFromArray(this.peasantWhatAudioArr).play();
			}
		});
		this.#playerBuildings.forEach((building) => {
			if (isPointInsidePolygon(clickXWithOffset - building.x, clickYWithOffset - building.y, building.boundaries)) {
				this.#playerUnits.forEach((unit) => {
					if (unit.isSelected) {
						unit.isSelected = false;
					}
				});
				this.#playerBuildings.forEach((unit) => {
					if (unit.isSelected) {
						unit.isSelected = false;
					}
				});
				selectPlayerUnit = building;
				selectPlayerUnit.isSelected = true;

				if (building.key === GAME_UNITS.TOWN_CENTER.name) {
					this.#selectedItemText.innerText = "TownCenter: ";
					while (this.#buildItems.lastChild) {
						this.#buildItems.removeChild(this.#buildItems.lastChild);
					}
					const peasantImage = this.iLoader.getImage(GAME_UNITS.PEASANT.name);
					const helper = this.#imageConverter.getContext("2d");	
					this.#imageConverter.width = 16;
					this.#imageConverter.height = 16;
					helper.clearRect(0, 0, window.innerWidth, window.innerHeight);
					helper.drawImage(peasantImage, 0, 0, 16, 16, 0, 0, 16, 16);
					const peasantData = this.#imageConverter.toDataURL();
					const peasantImageHTML = new Image(16, 16);
					peasantImageHTML.src = peasantData;
					peasantImageHTML.id = GAME_UNITS.PEASANT.name;
						
					this.#buildItems.appendChild(peasantImageHTML);
				}
			}
		});

		this.#neutralBuildings.forEach((unit) => {
			if (isPointInsidePolygon(clickXWithOffset - unit.x, clickYWithOffset - unit.y, unit.boundaries)) {
				console.log("clicked gold mine: ", unit);
				console.log("gold amount: ", unit.goldAmount)
				selectedNeutralBuilding = unit;
			}
		});

		const xCell = Math.floor(clickXWithOffset / this.#treesLayer.tilemap.tilewidth),
			yCell = Math.floor(clickYWithOffset / this.#treesLayer.tilemap.tileheight),
			clickedCellIndex = this.#treesLayer.layerData.height * yCell + xCell,
			clickedCellTile = this.#treesLayer.layerData.data[clickedCellIndex];
		
		if (clickedCellTile !== 0 && clickedCellTile !== TREE_STUB_INDEX) {
			console.log(clickedCellIndex);
			console.log("tree cell clicked");
			isTreeSelected = true;
		}

		// if no new units selected, move selected units to click point
		if (selectPlayerUnit) {
			console.log("selected unit");
			
		} else {
			this.#playerUnits.forEach((unit) => {
				if (unit.isSelected) {
					if (selectedNeutralBuilding) {
						console.log("do something with building: ", selectedNeutralBuilding);
						if (selectedNeutralBuilding.key === GAME_UNITS.GOLD_MINE.name && unit instanceof UnitPeasant) {
							unit.activateGrabGold(selectedNeutralBuilding);
						}
					} else if (isTreeSelected) {
						console.log("go, and cut tree");
						let tree = this.#treesCutHealth.get(clickedCellIndex);
						if (!tree) {
							tree = new Tree(clickXWithOffset, clickYWithOffset, TREE_FULL_HEALTH, clickedCellIndex);
							this.#treesCutHealth.set(clickedCellIndex, tree);
						}
						unit.activateDragTree(tree);
					} else {
						unit.activateMoveToTargetPoint(clickXWithOffset, clickYWithOffset);
					}
					
				}
			});
		}
	}

	#clickedBuildPeasant = (e) => {
		console.log("clicked build peasant");
		console.log(e);
	}

	#render = () => {
		this.#playerUnits.forEach((unit, index) => {
			if (unit instanceof UnitPeasant) {
				const action = unit.activeAction;
				switch (action) {
					case PEASANT_ACTIONS.MOVE:
						unit.stepMove();
						break;
					case PEASANT_ACTIONS.DRAG_GOLD:
						unit.grabGold();
						break;
					case PEASANT_ACTIONS.DRAG_WOOD:
						unit.dragWood();
						break;	
					case PEASANT_ACTIONS.CHOP_WOOD:
						this.chopTreeSound.play();
						unit.chopTree();
						break;
					case PEASANT_ACTIONS.BUILD:
						if (countDistance(unit, {x:unit.targetPoint[0], y: unit.targetPoint[1]}) < 5) {
							console.log('start building here');
							// to avoid duplicate call, check isSelected prop
							// remove peasant
							unit.stopRepeatedAnimation(unit.activeAnimation);
							unit.destroy();
							// remove from array
							this.#playerUnits.splice(index, 1);

							const type = unit.buildingType;
							// remove resources
							const costWood = GAME_UNITS[type].cost.w,
								costGold = GAME_UNITS[type].cost.g;

							this.#playerGold -= costGold;
							this.#playerWood -= costWood;
							
							const [x, y] = unit.targetPoint;
							const newBuilding = new UnitBuilding(x, y, 16, 16, type, 0, this.draw, this.eventsAggregator);
							
							this.#playerBuildings.push(newBuilding);
							this.addRenderObject(newBuilding);
						} else {
							unit.stepMove();
						}
						break;
					case PEASANT_ACTIONS.IDLE:
						break;
				}
			}
		});
	}
	#registerSystemEventsListeners() {
		this.iSystem.addEventListener(CONST.EVENTS.SYSTEM.RENDER.START, this.#render);
		this.eventsAggregator.addEventListener(GAME_EVENTS.GOLD_MINED, this.#goldMined);
		this.eventsAggregator.addEventListener(GAME_EVENTS.WOOD_MINED, this.#woodMined);
		this.eventsAggregator.addEventListener(GAME_EVENTS.GOLD_MINE_EMPTY, this.#goldMineEmpty);
		this.eventsAggregator.addEventListener(GAME_EVENTS.TREE_EMPTY, this.#treeEmpty);
		this.eventsAggregator.addEventListener(GAME_EVENTS.REQUEST_FOR_CLOSEST_TREE, this.#requestForClosestTree);
		this.eventsAggregator.addEventListener(GAME_EVENTS.PEASANT_BUILT, this.#peasantBuilt);
	}

	#unregisterSystemEventsListeners() {
		this.iSystem.removeEventListener(CONST.EVENTS.SYSTEM.RENDER.START, this.#render);
		this.eventsAggregator.removeEventListener(GAME_EVENTS.GOLD_MINED, this.#goldMined);
		this.eventsAggregator.removeEventListener(GAME_EVENTS.WOOD_MINED, this.#woodMined);
		this.eventsAggregator.removeEventListener(GAME_EVENTS.GOLD_MINE_EMPTY, this.#goldMineEmpty);
		this.eventsAggregator.removeEventListener(GAME_EVENTS.TREE_EMPTY, this.#treeEmpty);
		this.eventsAggregator.removeEventListener(GAME_EVENTS.REQUEST_FOR_CLOSEST_TREE, this.#requestForClosestTree);
		this.eventsAggregator.removeEventListener(GAME_EVENTS.PEASANT_BUILT, this.#peasantBuilt);
	}

	#goldMined = (e) => {
		const amount = e.detail;
		this.#playerGold += amount;

		this.#playerGoldCounter.innerText = this.#playerGold;
	}

	#woodMined = (e) => {
		const amount = e.detail;
		this.#playerWood += amount;

		this.#playerWoodCounter.innerText = this.#playerWood;
	}

	#goldMineEmpty = (e) => {
		this.goldMine1.imageIndex = 10;
	}

	#requestForClosestTree = (e) => {
		const peasant = e.detail.peasant,
			oldTreeIndex = e.detail.tree.index,
			tressLayer = this.#treesLayer.layerData.data,
			layerWidth = this.#treesLayer.layerData.width,
			layerHeight = this.#treesLayer.layerData.height,
			layerSize = layerWidth * layerHeight,
			nearestCellsIndexes = [],
			tilewidth = this.#treesLayer.tilemap.tilewidth,
			tileheight = this.#treesLayer.tilemap.tileheight;// -5; +5 on width and height

		for (let i = -5; i <= 5; i++) {
			let startItemIndex = oldTreeIndex + (i * this.#treesLayer.layerData.height); // *100

			const rowIndex = Math.floor(startItemIndex/this.#treesLayer.layerData.height);
			if (startItemIndex >= 0 && startItemIndex <= layerSize) { // remove top and bottom indexes overflow
				for (let k = -5; k <= 5; k++) {
					const itemIndex = startItemIndex + k,
						colIndex = itemIndex - rowIndex * this.#treesLayer.layerData.height;
						
					if (itemIndex >= 0 && colIndex >= 0 && colIndex <= layerWidth) { // remove left and right indexes overflow
						nearestCellsIndexes.push([rowIndex, colIndex, itemIndex]);
					}
				}
			}
		}
		
		let closestTree, closestDistance;

		nearestCellsIndexes.forEach((indexes) => {
				const rowIndex = indexes[0],
					colIndex = indexes[1],
					itemIndex = indexes[2],
					cellItem = tressLayer[itemIndex];
			if (cellItem !== 0 && cellItem !== TREE_STUB_INDEX) {
				const cellItemPosX = colIndex * tilewidth + tilewidth / 2,
					cellItemPosY = rowIndex * tileheight + tileheight / 2,
					distance = countDistance({x: peasant.x, y: peasant.y}, {x: cellItemPosX, y: cellItemPosY});
				
					//console.log("item x: ", cellItemPosX);
					//console.log("item y: ", cellItemPosY);
					//console.log("distance: ", distance);
					//console.log("closest distance: ", closestDistance);
				if (!closestDistance || closestDistance > distance) {
					closestTree = this.#treesCutHealth.get(itemIndex);
					if (!closestTree) {
						closestTree = new Tree(cellItemPosX, cellItemPosY, TREE_FULL_HEALTH, itemIndex);
						this.#treesCutHealth.set(itemIndex, closestTree);
					}
					//console.log("set closest distance: ", distance);
					//console.log("tree: ", closestTree);
					closestDistance = distance;
				}
			}
		});
		//console.log("old tree is ", oldTreeIndex);
		//console.log("closest tree is ", closestTree.index);
		if (closestDistance) {
			this.#treesCutHealth.set(closestTree.index, closestTree);
			const playerUnit = this.#playerUnits.find((unit) => unit.id === peasant.id);
			playerUnit.activateDragTree(closestTree);
		}
	}

	recursiveSearchForClosestTree = () => {

	}
	#treeEmpty = (e) => {
		const treeIndex = e.detail.index;
		this.#treesCutHealth.delete(treeIndex);
		this.#treesLayer.layerData.data[treeIndex] = TREE_STUB_INDEX;
	}

	#peasantBuilt = (e) => {
		const townCenter = e.detail,
			newPeasant = new UnitPeasant(0, 0, 16, 16, townCenter, this.draw, this.eventsAggregator);

		let posX = 20,
			posY = 20;
		while(this.isObjectsCollision(townCenter.x + posX, townCenter.y + posY, newPeasant, this.#playerUnits)) {
			posX -= 18;
			console.log("collision shift left");
		}
		//console.log("no collision adding unit");
		newPeasant.x = townCenter.x + posX;
		newPeasant.y = townCenter.y + posY;
		this.addRenderObject(newPeasant);
		this.#playerUnits.push(newPeasant);

		this.#playerPeopleLimitCounter.innerText = this.#playerUnits.length + "/" + this.#playerPeopleLimit.toString();
		
	}

	move(dir) {
		let newX = this.tank.x, 
			newY = this.tank.y;
		switch(dir) {
			case "left":
				newX = newX - 1;
				break;
			case "right":
				newX = newX + 1;
				break;
			case "top":
				newY = newY - 1;
				break;
			case "bottom":
				newY = newY + 1;
				break;
		}
		if (!this.isBoundariesCollision(newX, newY, this.tank)) {
			this.tank.x = newX;
			this.tank.y = newY;
			this.gun.x = newX;
			this.gun.y = newY;
			this.stageData.centerCameraPosition(newX, newY);
		}
	}
	
	stopAction = () => {
		clearInterval(this.timer);
		this.timer = null;
	}
	
	fireAction = () => {
		this.person.emit("fire");
	}
}

class EvensAggregator extends EventTarget {
}

class Tree {
	#x;
	#y;
	#health;
	#index;
	constructor(x, y, treeHealth, index) {
		this.#x = x;
		this.#y = y;
		this.#index = index;
		this.#health = treeHealth;
	}

	get index() {
		return this.#index;
	}

	get x() {
		return this.#x;
	}

	get y() {
		return this.#y;
	}

	get health() {
		return this.#health;
	}

	set health (value) {
		this.#health = value;
	}
}