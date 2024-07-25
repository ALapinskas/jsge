import { DrawImageObject } from "../../src/base/2d/DrawImageObject.js";
import { DrawRectObject } from "../../src/base/2d/DrawRectObject.js";
import { DrawObjectFactory } from "../../src/base/DrawObjectFactory.js";
import { countDistance, angle_2points } from "../../src/utils.js";

import { PEASANT_ACTIONS, ANIMATION, GAME_EVENTS, GAME_UNITS, BUILDING_STATE } from "./const.js";

class UnitBase extends DrawImageObject {
	#health;

	/**
	 * @type {undefined | DrawObjectFactory} 
	 */
	#draw;
	/**
	 * @type {undefined | null | DrawRectObject}
	 */

	#frame;

	/**
	 * @type {boolean}
	 */
	#isSelected = false;
	constructor(mapX, mapY, width, height, key, imageIndex = 0, drawImageFactory, health) {
		super(mapX, mapY, width, height, key, imageIndex);
		this.#draw = drawImageFactory;
	}

	get health() {
		return this.#health;
	}

	set health(value) {
		this.#health = value;
	}
	get isSelected() {
		return this.#isSelected;
	}

	set isSelected(value) {
		this.#isSelected = value;
		if(value === true) {
			this.#frame = this.#draw.rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, "rgba(255,255,255,0.2)");
		} else if (this.#frame) {
			console.log("remove frame");
			this.#frame.destroy();
		}
	}

	get frame() {
		return this.#frame;
	}
}

class UnitBuilding extends UnitBase {
	#PROGRESS_STEP = 50;
	#unitBuildProgress = 0;
	#unitBuildDuration = 0;
	#selfBuildingDuration = 0;
	/**
	 * 0 - 1
	 */
	#selfBuildingProgress;
	#eventsAggregator;
	#unitProgressTimer;
	#selfProgressTimer;

	#progressLine;

    #state = BUILDING_STATE.BUILDING_SELF;
	constructor(mapX, mapY, width, height, key, imageIndex, drawFactory, eventsAggregator, buildingProgress = 0) {
		super(mapX, mapY, width, height, key, imageIndex, drawFactory);
		this.#eventsAggregator = eventsAggregator;
		this.#selfBuildingDuration = GAME_UNITS[key].duration;
		this.#selfBuildingProgress = buildingProgress;
		if (buildingProgress === 0) {
			this.#startSelfBuilding();
		}
	}

	get isBuildingUnit() {
		return !!this.#unitProgressTimer;
	}

    get state() {
        return this.#state;
    }

	buildUnit = (unitType) => {
		console.log("build unit: ", unitType);
        this.#state = BUILDING_STATE.BUILDING_UNIT;
		switch (unitType) {
			case GAME_UNITS.PEASANT.name:
					this.#unitBuildDuration = GAME_UNITS.PEASANT.duration;
					this.#createProgressLine();
					this.#startBuildUnitProgress();
				break;
		}
	}

	#createProgressLine = () => {
		
		this.#progressLine = document.createElement("div"),
		console.log("create progress line");
		this.#progressLine.style.width = 0 + "px";
		this.#progressLine.style.height = "2px";
		this.#progressLine.style.backgroundColor = "#666";
		this.#progressLine.style.position = "fixed";
		this.#progressLine.style.top = 28 + "px";
		this.#progressLine.style.left = 0 + "px";
		document.body.appendChild(this.#progressLine);
	}

	#startBuildUnitProgress = () => {
		console.log("start build progress")
		if (this.#unitProgressTimer) {
			console.log("already building");
			return;
		}

		const duration = this.#unitBuildDuration,
			windowWidth = document.body.offsetWidth,
			step = this.#PROGRESS_STEP,
			stepWidth = windowWidth / duration * 100;

		let currentWidth = stepWidth;

		this.#unitProgressTimer = setInterval(() => {
			if (this.#unitBuildProgress < duration) {
				this.#unitBuildProgress += step;
				currentWidth += stepWidth;
				this.#progressLine.style.width = currentWidth + "px";
				console.log("progress build");
			} else {
				console.log("progress done");
				clearInterval(this.#unitProgressTimer);
				this.#unitProgressTimer = null;
				this.#unitBuildProgress = 0;
				this.#progressLine.style.width = 0 + "px";
				this.#eventsAggregator.dispatchEvent(new CustomEvent(GAME_EVENTS.PEASANT_BUILT, {detail: this}));
                this.#state = BUILDING_STATE.READY;
			}
		}, this.#PROGRESS_STEP);
	}

	#startSelfBuilding = () => {
		console.log("start self building");
		const duration = this.#selfBuildingDuration;
		this.#selfProgressTimer = setInterval(() => {
			if (this.#unitBuildProgress < duration) {
				this.#unitBuildProgress += step;
				currentWidth += stepWidth;
				this.#progressLine.style.width = currentWidth + "px";
				console.log("progress build");
			} else {
				console.log("progress done");
				clearInterval(this.#unitProgressTimer);
				this.#unitProgressTimer = null;
				this.#unitBuildProgress = 0;
				this.#progressLine.style.width = 0 + "px";
				this.#eventsAggregator.dispatchEvent(new CustomEvent(GAME_EVENTS.PEASANT_BUILT, {detail: this}));
                this.#state = BUILDING_STATE.READY;
			}
		}, this.#PROGRESS_STEP);
	}
}

class UnitPeasant extends UnitBase {
	/**
	 * @type {string}
	 */
	#activeAction;
	#targetTree;
	#grabGoldmine;
	#closestTownCenter;
	#hasGold;
	#hasWood;
	#woodAmount = 0;
	#targetPoint;
	#buildingType;
	#eventsAggregator;
	constructor(mapX, mapY, width, height, closestTownCenter, drawFactory, eventsAggregator) {
		super(mapX, mapY, width, height, GAME_UNITS.PEASANT.name, 0, drawFactory, 50);
		this.addAnimation(ANIMATION.MOVE_DOWN, [1, 2, 3, 4], true);
		this.addAnimation(ANIMATION.MOVE_UP, [6, 7, 8, 9], true);
		this.addAnimation(ANIMATION.MOVE_RIGHT, [11, 12, 13, 14], true);
		this.addAnimation(ANIMATION.MOVE_LEFT, [16, 17, 18, 19], true);

		this.addAnimation(ANIMATION.CARRY_DOWN, [21, 22, 23, 24], true);
		this.addAnimation(ANIMATION.CARRY_UP, [26, 27, 28, 29], true);
		this.addAnimation(ANIMATION.CARRY_RIGHT, [31, 32, 33, 34], true);
		this.addAnimation(ANIMATION.CARRY_LEFT, [36, 37, 38, 39], true);

		this.addAnimation(ANIMATION.FIGHT_DOWN, [40, 41, 42], true);
		this.addAnimation(ANIMATION.FIGHT_UP, [45, 46, 47], true);
		this.addAnimation(ANIMATION.FIGHT_RIGHT, [50, 51, 52], true);
		this.addAnimation(ANIMATION.FIGHT_LEFT, [55, 56, 57], true);

		this.#closestTownCenter = closestTownCenter;
		this.#eventsAggregator = eventsAggregator;
	}

	get activeAction() {
		return this.#activeAction;
	}

	get targetTree() {
		return this.#targetTree;
	}

	get targetPoint() {
		return this.#targetPoint;
	}

	get buildingType() {
		return this.#buildingType;
	}

	activateGrabGold = (mine) => {
		console.log("start collecting gold");
		this.#grabGoldmine = mine;
		this.#activeAction = PEASANT_ACTIONS.DRAG_GOLD;
	}

	activateIdle = () => {
		this.#activeAction = PEASANT_ACTIONS.IDLE;
		this.imageIndex = 0;
	}

	activateDragTree = (tree) => {
		this.#activeAction = PEASANT_ACTIONS.DRAG_WOOD;
		if (tree) {
			this.#targetTree = tree;
		}
	}

	activateChopTree = () => {
		this.#activeAction = PEASANT_ACTIONS.CHOP_WOOD;
	}

	askForClosestTree = () => {
		this.#eventsAggregator.dispatchEvent(new CustomEvent(GAME_EVENTS.REQUEST_FOR_CLOSEST_TREE, {
			detail: {peasant: this, tree: this.#targetTree}}));
	}

	dragWood = () => {
		if (this.#hasWood) {
			// move to the TownCenter
			const tX = this.#closestTownCenter.x,
				tY = this.#closestTownCenter.y;
			if (countDistance(this, {x:tX, y: tY}) < 25) {
				// reached
				this.#hasWood = false;
				this.#woodAmount = 0;
				//console.log("+ 10 tree milord!!");
				this.#eventsAggregator.dispatchEvent(new CustomEvent(GAME_EVENTS.WOOD_MINED, {
					detail: 10 }));
			} else {
				this.#targetPoint = [tX, tY];
				this.stepMoveWith();
			}
		} else {
			// move to the Gold mine
			const tX = this.#targetTree.x,
				tY = this.#targetTree.y;

			if (this.#targetTree.health <= 0) {
				console.log("stop drag tree");
				const activeAnimation = this.activeAnimation;
				if (activeAnimation) {
					this.stopRepeatedAnimation(activeAnimation);
				}
				this.activateIdle();
				this.askForClosestTree();
			} else if (countDistance(this, {x:tX, y: tY}) < 8) {
				// reached
				this.activateChopTree();
			} else {
				this.#targetPoint = [tX, tY];
				this.stepMoveWith();
			}
		}
	}
 
	grabGold = () => {
		if (this.#hasGold) {
			// move to the TownCenter
			const tX = this.#closestTownCenter.x,
				tY = this.#closestTownCenter.y;
			if (countDistance(this, {x:tX, y: tY}) < 25) {
				// reached
				this.#hasGold = false;
				//console.log("+ 10 gold milord!!");
				this.#eventsAggregator.dispatchEvent(new CustomEvent(GAME_EVENTS.GOLD_MINED, {
					detail: 10 }));
			} else {
				this.#targetPoint = [tX, tY];
				this.stepMoveWith();
			}
		} else {
			// move to the Gold mine
			const tX = this.#grabGoldmine.x,
				tY = this.#grabGoldmine.y;
			if (this.#grabGoldmine.goldAmount <= 0) {
				console.log("gold mine is empty");
				const activeAnimation = this.activeAnimation;
				if (activeAnimation) {
					this.stopRepeatedAnimation(activeAnimation);
				}
				this.activateIdle();
			} else if (countDistance(this, {x:tX, y: tY}) < 8) {
				// reached
				this.#hasGold = true;
				this.#grabGoldmine.goldAmount -= 10;
				if (this.#grabGoldmine.goldAmount <= 0) {
					this.#eventsAggregator.dispatchEvent(new CustomEvent(GAME_EVENTS.GOLD_MINE_EMPTY, {
						detail: this.#grabGoldmine}));
				}
			} else {
				this.#targetPoint = [tX, tY];
				this.stepMoveWith();
			}
		}
	}

	chopTree = () => {
		if (this.#woodAmount < 10) {
			this.#woodAmount = Math.round((this.#woodAmount + .05) * 100) / 100;
			this.#targetTree.health = Math.round((this.#targetTree.health - .05) * 100) / 100;

			const direction = angle_2points(this.x, this.y, this.#targetTree.x, this.#targetTree.y);

			if (direction > -Math.PI/4 && direction < Math.PI/4) {
				//console.log("chop right");
				if (this.activeAnimation !== ANIMATION.FIGHT_RIGHT) {
					this.emit(ANIMATION.FIGHT_RIGHT);
				}
			} else if (direction > Math.PI/4 && direction < 3*Math.PI/4) {
				//console.log("chop down");
				if (this.activeAnimation !== ANIMATION.FIGHT_DOWN) {
					this.emit(ANIMATION.FIGHT_DOWN)
				}
			} else if (direction > 3*Math.PI/4 || direction < -3*Math.PI/4) {
				//console.log("chop left");
				if (this.activeAnimation !== ANIMATION.FIGHT_LEFT) {
					this.emit(ANIMATION.FIGHT_LEFT);
				}
			} else if (direction > -3*Math.PI/4 && direction < Math.PI/4) {
				if (this.activeAnimation !== ANIMATION.FIGHT_UP) {
					this.emit(ANIMATION.FIGHT_UP);
				}
			}
		} else {
			console.log(this.#woodAmount);
			this.#hasWood = true;
			this.activateDragTree();
			if (this.#targetTree.health <= 0) {
				this.#eventsAggregator.dispatchEvent(new CustomEvent(GAME_EVENTS.TREE_EMPTY, {
					detail: this.#targetTree }));
			}
		}
	}

	stepMoveWith = () => {
		const x = this.x,
			y = this.y,
			tX = this.#targetPoint[0],
			tY = this.#targetPoint[1],
			hasGold = this.#hasGold || this.#hasWood;

		const forceToUse = 0.4,//this.#moveSpeed,
            direction = angle_2points(x, y, tX, tY),
            newCoordX = x + forceToUse * Math.cos(direction),
            newCoordY = y + forceToUse * Math.sin(direction);
            
		if (direction > -Math.PI/4 && direction < Math.PI/4) {
			//console.log("move right");
			if (hasGold && this.activeAnimation !== ANIMATION.CARRY_RIGHT) {
				this.emit(ANIMATION.CARRY_RIGHT);
			} else if (!hasGold && this.activeAnimation !== ANIMATION.MOVE_RIGHT)
				this.emit(ANIMATION.MOVE_RIGHT);
		} else if (direction > Math.PI/4 && direction < 3*Math.PI/4) {
			//console.log("move down");
			if (hasGold && this.activeAnimation !== ANIMATION.CARRY_DOWN) {
				this.emit(ANIMATION.CARRY_DOWN)
			} else if (!hasGold && this.activeAnimation !== ANIMATION.MOVE_DOWN)
				this.emit(ANIMATION.MOVE_DOWN);
		} else if (direction > 3*Math.PI/4 || direction < -3*Math.PI/4) {
			//console.log("move left");
			if (hasGold && this.activeAnimation !== ANIMATION.CARRY_LEFT) {
				this.emit(ANIMATION.CARRY_LEFT);
			} else if (!hasGold && this.activeAnimation !== ANIMATION.MOVE_LEFT)
				this.emit(ANIMATION.MOVE_LEFT);
		} else if (direction > -3*Math.PI/4 && direction < Math.PI/4) {
			//console.log("move up");
			if (hasGold && this.activeAnimation !== ANIMATION.CARRY_UP) {
				this.emit(ANIMATION.CARRY_UP);
			} else if (!hasGold && this.activeAnimation !== ANIMATION.MOVE_UP)
				this.emit(ANIMATION.MOVE_UP);
		} else {
			console.log("unrecognized move to ", direction);
		}
		this.x = newCoordX;
		this.y = newCoordY;
		if (this.isSelected) {
			this.frame.x = newCoordX - this.width/2;
			this.frame.y = newCoordY - this.height/2;
		}
	}

	stepMove = () => {
		const x = this.x,
			y = this.y,
			tX = this.#targetPoint[0],
			tY = this.#targetPoint[1];
		if (countDistance(this, {x:tX, y: tY}) < 5) {
			console.log("reached");
			const activeAnimation = this.activeAnimation;
			if (activeAnimation) {
				this.stopRepeatedAnimation(activeAnimation);
			}
			this.activateIdle();
		} else {
			const forceToUse = 0.4,//this.#moveSpeed,
            direction = angle_2points(x, y, tX, tY),
            newCoordX = x + forceToUse * Math.cos(direction),
            newCoordY = y + forceToUse * Math.sin(direction);
            
			if (direction > -Math.PI/4 && direction < Math.PI/4) {
				//console.log("move right");
				if (this.activeAnimation !== ANIMATION.MOVE_RIGHT)
					this.emit(ANIMATION.MOVE_RIGHT);
			} else if (direction > Math.PI/4 && direction < 3*Math.PI/4) {
				//console.log("move down");
				if (this.activeAnimation !== ANIMATION.MOVE_DOWN)
					this.emit(ANIMATION.MOVE_DOWN);
			} else if (direction > 3*Math.PI/4 || direction < -3*Math.PI/4) {
				//console.log("move left");
				if (this.activeAnimation !== ANIMATION.MOVE_LEFT)
					this.emit(ANIMATION.MOVE_LEFT);
			} else if (direction > -3*Math.PI/4 && direction < Math.PI/4) {
				//console.log("move up");
				if (this.activeAnimation !== ANIMATION.MOVE_UP)
					this.emit(ANIMATION.MOVE_UP);
			} else {
				console.log("unrecognized move to ", direction);
			}
        	this.x = newCoordX;
        	this.y = newCoordY;
			if (this.isSelected) {
				this.frame.x = newCoordX - this.width/2;
				this.frame.y = newCoordY - this.height/2;
			}
		}
	}

	activateStartBuilding = (targetX, targetY, type) => {
		this.#activeAction = PEASANT_ACTIONS.BUILD;
		this.#targetPoint = [targetX, targetY];
		this.#buildingType = type;
	}

	activateMoveToTargetPoint = (targetX, targetY) => {
		this.#activeAction = PEASANT_ACTIONS.MOVE;
		this.#targetPoint = [targetX, targetY];
	}

}

export { UnitPeasant, UnitBuilding };