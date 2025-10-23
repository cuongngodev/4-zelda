import {
	generateRandomBoolean,
	getRandomPositiveInteger,
	pickRandomElement,
} from '../../lib/Random.js';
import Sprite from '../../lib/Sprite.js';
import Vector from '../../lib/Vector.js';
import EnemyFactory from '../services/EnemyFactory.js';
import Player from '../entities/Player.js';
import Direction from '../enums/Direction.js';
import EnemyType from '../enums/EnemyType.js';
import ImageName from '../enums/ImageName.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH, HEART_SPAWN_CHANCE, images } from '../globals.js';
import Doorway from './Doorway.js';
import Switch from './Switch.js';
import Tile from './Tile.js';
import Heart from '../entities/Heart.js';
import Skeleton from '../entities/enemies/Skeleton.js';
import Enemy from '../entities/enemies/Enemy.js';
import Pot from './Pot.js';

export default class Room {
	static WIDTH = CANVAS_WIDTH / Tile.TILE_SIZE - 2;
	static HEIGHT = Math.floor(CANVAS_HEIGHT / Tile.TILE_SIZE) - 2;
	static RENDER_OFFSET_X = (CANVAS_WIDTH - Room.WIDTH * Tile.TILE_SIZE) / 2;
	static RENDER_OFFSET_Y = (CANVAS_HEIGHT - Room.HEIGHT * Tile.TILE_SIZE) / 2;

	static TOP_EDGE = Room.RENDER_OFFSET_Y + Tile.TILE_SIZE;
	static BOTTOM_EDGE =
		CANVAS_HEIGHT - Room.RENDER_OFFSET_Y - Tile.TILE_SIZE - 5;
	static LEFT_EDGE = Room.RENDER_OFFSET_X + Tile.TILE_SIZE - 5;
	static RIGHT_EDGE = CANVAS_WIDTH - Tile.TILE_SIZE * 2 + 5;
	static CENTER_X = Math.floor(
		Room.LEFT_EDGE + (Room.RIGHT_EDGE - Room.LEFT_EDGE) / 2
	);
	static CENTER_Y = Math.floor(
		Room.TOP_EDGE + (Room.BOTTOM_EDGE - Room.TOP_EDGE) / 2
	);

	static TILE_TOP_LEFT_CORNER = 3;
	static TILE_TOP_RIGHT_CORNER = 4;
	static TILE_BOTTOM_LEFT_CORNER = 22;
	static TILE_BOTTOM_RIGHT_CORNER = 23;
	static TILE_EMPTY = 18;
	static TILE_TOP_WALLS = [57, 58, 59];
	static TILE_BOTTOM_WALLS = [78, 79, 80];
	static TILE_LEFT_WALLS = [76, 95, 114];
	static TILE_RIGHT_WALLS = [77, 96, 115];
	static TILE_FLOORS = [
		6, 7, 8, 9, 10, 11, 12, 25, 26, 27, 28, 29, 30, 31, 44, 45, 46, 47, 48,
		49, 50, 63, 64, 65, 66, 67, 68, 69, 87, 88, 106, 107,
	];

	/**
	 * Represents one individual section of the dungeon complete
	 * with its own set of enemies and a switch that can open the doors.
	 *
	 * @param {Player} player
	 */
	constructor(player, isShifting = false) {
		this.player = player;
		this.dimensions = new Vector(Room.WIDTH, Room.HEIGHT);
		this.sprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.Tiles),
			Tile.TILE_SIZE,
			Tile.TILE_SIZE
		);
		this.tiles = this.generateWallsAndFloors();
		this.entities = this.generateEntities();
		this.doorways = this.generateDoorways();
		this.objects = this.generateObjects();
		this.renderQueue = this.buildRenderQueue();
		
		// Used for drawing when this room is the next room, adjacent to the active.
		this.adjacentOffset = new Vector();

		this.isShifting = isShifting;
	}

	update(dt) {
		this.renderQueue = this.buildRenderQueue();
		this.cleanUpEntities();
		this.updateEntities(dt);
		this.updateObjects(dt);
	}

	render() {
		this.renderTiles();

		this.renderQueue.forEach((elementToRender) => {
			elementToRender.render(this.adjacentOffset);
		});
	}

	/**
	 * Order the entities by their renderPriority fields. If the renderPriority
	 * is the same, then sort the entities by their bottom positions. This will
	 * put them in an order such that entities higher on the screen will appear
	 * behind entities that are lower down.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
	 *
	 * The spread operator (...) returns all the elements of an array separately
	 * so that you can pass them into functions or create new arrays. What we're
	 * doing below is combining both the entities and objects arrays into one.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
	 */
	buildRenderQueue() {
		return [...this.entities, ...this.objects].sort((a, b) => {
			let order = 0;
			const bottomA = a.hitbox.position.y + a.hitbox.dimensions.y;
			const bottomB = b.hitbox.position.y + b.hitbox.dimensions.y;

			if (a.renderPriority < b.renderPriority) {
				order = -1;
			} else if (a.renderPriority > b.renderPriority) {
				order = 1;
			} else if (bottomA < bottomB) {
				order = -1;
			} else {
				order = 1;
			}
			return order;
		});
	}

	cleanUpEntities() {
		this.entities = this.entities.filter((entity) => !entity.isDead);
	}

	/**
	 * Spawns a heart at the specified position and adds it to entities
	 * @param {number} x - X coordinate where to spawn the heart
	 * @param {number} y - Y coordinate where to spawn the heart
	 */
	spawnHeartAt(x, y) {
		const heart = new Heart(new Vector(x, y));
		this.entities.push(heart);
	}

	updateEntities(dt) {
		this.entities.forEach((entity) => {
			// Mark dead entities
			if (entity.health <= 0) {
				entity.isDead = true;
			}

			// Update entity (skip player during room shifting)
			if (!this.isShifting || (this.isShifting && entity !== this.player)) {
				entity.update(dt);
			}

			// Handle object collisions for all entities
			this.handleObjectCollisions(entity);

			// Skip further processing for the player entity
			if (entity === this.player) {
				return;
			}

			// Handle different entity types
			if (entity instanceof Enemy) {
				this.handleEnemyInteractions(entity);
			} else if (entity instanceof Heart) {
				this.handleHeartInteractions(entity);
			}
		});
	}

	/**
	 * Handle collisions between entities and room objects
	 */
	handleObjectCollisions(entity) {
		this.objects.forEach((object) => {
			if (object.didCollideWithEntity(entity.hitbox)) {
				if (object.isCollidable) {
					object.onCollision(entity);
				}
			}
		});
	}

	/**
	 * Handle sword interactions with objects (breaking pots, etc.)
	 */
	handlePotObjectInteractions() {
		this.objects.forEach((object) => {
			if (object instanceof Pot) {
				// do something here
				//1st not allow player pass through pot
				//2nd if hit enter, pot tween up 
				// Handle tween depend on direction
				//3rd if pot is broken, spawn heart
			}
		});
	}

	/**
	 * Handle all enemy-related interactions (combat, damage, etc.)
	 */
	handleEnemyInteractions(enemy) {
		// Enemy hit by player's sword
		if (enemy.didCollideWithEntity(this.player.swordHitbox)) {
			enemy.receiveDamage(this.player.damage);
			
			// Spawn heart when enemy is hit (but not dead yet) 
			// and 35% change of heart spawning
			if (!enemy.isDead && generateRandomBoolean(HEART_SPAWN_CHANCE)) {
				this.spawnHeartAt(enemy.position.x, enemy.position.y);
			}
		}

		// Enemy damages player 
		if (!enemy.isDead && 
			this.player.didCollideWithEntity(enemy.hitbox) && 
			!this.player.isInvulnerable) {
			this.player.receiveDamage(enemy.damage);
			this.player.becomeInvulnerable();
		}
	}

	/**
	 * Handle heart-player consumption
	 */
	handleHeartInteractions(heart) {
		if (!heart.isDead && this.player.didCollideWithEntity(heart.hitbox)) {
			heart.consume(this.player);
		}
	}

	updateObjects(dt) {
		this.objects.forEach((object) => {
			object.update(dt);
		});
	}

	renderTiles() {
		this.tiles.forEach((tileRow) => {
			tileRow.forEach((tile) => {
				tile.render(this.adjacentOffset);
			});
		});
	}

	/**
	 * Uses the constants defined at the top of the class and determines which
	 * sprites to use for the walls and floor. Since there are several potential
	 * tiles to use for a piece of wall or floor, we can have a slightly different
	 * look each time we create a new room.
	 *
	 * @returns An array containing the walls and floors of the room, randomizing the tiles for visual variety.
	 */
	generateWallsAndFloors() {
		const tiles = new Array();

		for (let y = 0; y < this.dimensions.y; y++) {
			tiles.push([]);

			for (let x = 0; x < this.dimensions.x; x++) {
				let tileId = Room.TILE_EMPTY;

				if (x === 0 && y === 0) {
					tileId = Room.TILE_TOP_LEFT_CORNER;
				} else if (x === 0 && y === this.dimensions.y - 1) {
					tileId = Room.TILE_BOTTOM_LEFT_CORNER;
				} else if (x === this.dimensions.x - 1 && y === 0) {
					tileId = Room.TILE_TOP_RIGHT_CORNER;
				} else if (
					x === this.dimensions.x - 1 &&
					y === this.dimensions.y - 1
				) {
					tileId = Room.TILE_BOTTOM_RIGHT_CORNER;
				}
				// Random left-hand walls, right walls, top, bottom, and floors.
				else if (x === 0) {
					if (
						y === Math.floor(this.dimensions.y / 2) ||
						y === Math.floor(this.dimensions.y / 2) + 1
					) {
						tileId = Room.TILE_EMPTY;
					} else {
						tileId =
							Room.TILE_LEFT_WALLS[
								Math.floor(
									Math.random() * Room.TILE_LEFT_WALLS.length
								)
							];
					}
				} else if (x === this.dimensions.x - 1) {
					if (
						y === Math.floor(this.dimensions.y / 2) ||
						y === Math.floor(this.dimensions.y / 2) + 1
					) {
						tileId = Room.TILE_EMPTY;
					} else {
						tileId =
							Room.TILE_RIGHT_WALLS[
								Math.floor(
									Math.random() * Room.TILE_RIGHT_WALLS.length
								)
							];
					}
				} else if (y === 0) {
					if (
						x === this.dimensions.x / 2 ||
						x === this.dimensions.x / 2 - 1
					) {
						tileId = Room.TILE_EMPTY;
					} else {
						tileId =
							Room.TILE_TOP_WALLS[
								Math.floor(
									Math.random() * Room.TILE_TOP_WALLS.length
								)
							];
					}
				} else if (y === this.dimensions.y - 1) {
					if (
						x === this.dimensions.x / 2 ||
						x === this.dimensions.x / 2 - 1
					) {
						tileId = Room.TILE_EMPTY;
					} else {
						tileId =
							Room.TILE_BOTTOM_WALLS[
								Math.floor(
									Math.random() *
										Room.TILE_BOTTOM_WALLS.length
								)
							];
					}
				} else {
					tileId =
						Room.TILE_FLOORS[
							Math.floor(Math.random() * Room.TILE_FLOORS.length)
						];
				}

				tiles[y].push(
					new Tile(
						x,
						y,
						Room.RENDER_OFFSET_X,
						Room.RENDER_OFFSET_Y,
						this.sprites[tileId]
					)
				);
			}
		}

		return tiles;
	}

	/**
	 * @returns An array of enemies for the player to fight.
	 */
	generateEntities() {
		const entities = new Array();
		const sprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.Enemies),
			Tile.TILE_SIZE,
			Tile.TILE_SIZE
		);

		/**
		 * Choose a random enemy type and fill the room with only that type.
		 * This is more to make each room feel like a different room.
		 */
		const enemyType = EnemyType[pickRandomElement(Object.keys(EnemyType))];

		for (let i = 0; i < 10; i++) {
			entities.push(EnemyFactory.createInstance(enemyType, sprites));
		}
		entities.push(this.player);

		return entities;
	}
	generatePots(minPots, maxPots) {
		const pots = [];
		const numPots = getRandomPositiveInteger(minPots, maxPots);

		for (let i = 0; i < numPots; i++) {
			pots.push(
				new Pot(
					new Vector(Pot.WIDTH, Pot.HEIGHT),
					new Vector(
						getRandomPositiveInteger(
							Room.LEFT_EDGE + Pot.WIDTH,
							Room.RIGHT_EDGE - Pot.WIDTH * 2
						),
						getRandomPositiveInteger(
							Room.TOP_EDGE + Pot.HEIGHT,
							Room.BOTTOM_EDGE - Pot.HEIGHT * 2
						)
					),
					this
				)
			);
		}

		return pots;
	}
	/**
	 * @returns An array of objects for the player to interact with.
	 */
	generateObjects() {
		const objects = [];

		// Add switch
		objects.push(
			new Switch(
				new Vector(Switch.WIDTH, Switch.HEIGHT),
				new Vector(
					getRandomPositiveInteger(
						Room.LEFT_EDGE + Switch.WIDTH,
						Room.RIGHT_EDGE - Switch.WIDTH * 2
					),
					getRandomPositiveInteger(
						Room.TOP_EDGE + Switch.HEIGHT,
						Room.BOTTOM_EDGE - Switch.HEIGHT * 2
					)
				),
				this
			)
		);

		// Add doorways
		objects.push(...this.doorways);
		// Add pots
		objects.push(...this.generatePots(1,3))

		return objects;
	}

	/**
	 * @returns An array of the four directional doors.
	 */
	generateDoorways() {
		const doorways = [];

		doorways.push(
			new Doorway(
				Doorway.getDimensionsFromDirection(Direction.Up),
				Doorway.getPositionFromDirection(Direction.Up),
				Direction.Up,
				this
			)
		);
		doorways.push(
			new Doorway(
				Doorway.getDimensionsFromDirection(Direction.Down),
				Doorway.getPositionFromDirection(Direction.Down),
				Direction.Down,
				this
			)
		);
		doorways.push(
			new Doorway(
				Doorway.getDimensionsFromDirection(Direction.Left),
				Doorway.getPositionFromDirection(Direction.Left),
				Direction.Left,
				this
			)
		);
		doorways.push(
			new Doorway(
				Doorway.getDimensionsFromDirection(Direction.Right),
				Doorway.getPositionFromDirection(Direction.Right),
				Direction.Right,
				this
			)
		);

		return doorways;
	}

	openDoors() {
		this.doorways.forEach((doorway) => {
			doorway.open();
		});
	}

	closeDoors() {
		this.doorways.forEach((doorway) => {
			doorway.close();
		});
	}
}
