import Animation from '../../../../lib/Animation.js';
import State from '../../../../lib/State.js';
import Player from '../../../entities/Player.js';
import Direction from '../../../enums/Direction.js';
import PlayerStateName from '../../../enums/PlayerStateName.js';
import { input } from '../../../globals.js';
import Input from '../../../../lib/Input.js';
import Pot from '../../../objects/Pot.js';

export default class PlayerIdlingState extends State {
	/**
	 * In this state, the player is stationary unless
	 * a directional key or the spacebar is pressed.
	 *
	 * @param {Player} player
	 */
	constructor(player) {
		super();

		this.player = player;
		this.animation = {
			[Direction.Up]: new Animation([8], 1),
			[Direction.Down]: new Animation([0], 1),
			[Direction.Left]: new Animation([12], 1),
			[Direction.Right]: new Animation([4], 1),
		};
	}

	enter() {
		this.player.sprites = this.player.walkingSprites;
		this.player.currentAnimation = this.animation[this.player.direction];
	}

	update() {
		this.checkForMovement();
		this.checkForSwordSwing();
		this.checkForLiftingObject();
	}

	checkForMovement() {
		if (input.isKeyPressed(Input.KEYS.S)) {
			this.player.direction = Direction.Down;
			this.player.changeState(PlayerStateName.Walking);
		} else if (input.isKeyPressed(Input.KEYS.D)) {
			this.player.direction = Direction.Right;
			this.player.changeState(PlayerStateName.Walking);
		} else if (input.isKeyPressed(Input.KEYS.W)) {
			this.player.direction = Direction.Up;
			this.player.changeState(PlayerStateName.Walking);
		} else if (input.isKeyPressed(Input.KEYS.A)) {
			this.player.direction = Direction.Left;
			this.player.changeState(PlayerStateName.Walking);
		}
	}

	checkForSwordSwing() {
		if (input.isKeyPressed(Input.KEYS.SPACE)) {
			this.player.changeState(PlayerStateName.SwordSwinging);
		}
	}
	checkForLiftingObject() {
		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			const nearbyPot = this.findNearbyLiftableObject();
			if (nearbyPot) {
				this.player.changeState(PlayerStateName.Lifting, nearbyPot);
			} else {
				// No liftable object found nearby
			}
		}
	}

	/**
	 * Find a liftable object (like a pot) near the player
	 * @returns {GameObject|null} The object to lift, or null if none found
	 */
	findNearbyLiftableObject() {
		if (!this.player.currentRoom) {
			return null;
		}

		const LIFT_RANGE = 20; // How close the player needs to be to lift an object
		const DIRECTION_OFFSET = 16; // How far in front of the player to check

		// Calculate the search position based on player's direction
		let searchX = this.player.position.x;
		let searchY = this.player.position.y;

		switch (this.player.direction) {
			case Direction.Up:
				searchY -= DIRECTION_OFFSET;
				break;
			case Direction.Down:
				searchY += DIRECTION_OFFSET;
				break;
			case Direction.Left:
				searchX -= DIRECTION_OFFSET;
				break;
			case Direction.Right:
				searchX += DIRECTION_OFFSET;
				break;
		}

		// Search through all objects in the room
		for (const object of this.player.currentRoom.objects) {
			// Check if object is a pot and not broken
			if (object instanceof Pot && !object.isBroken) {
				// Calculate distances
				const deltaX = Math.abs(searchX - object.position.x);
				const deltaY = Math.abs(searchY - object.position.y);

				// Directional check: ensure pot is actually in front of player
				let isInFront = false;
				const playerToPotX = object.position.x - this.player.position.x;
				const playerToPotY = object.position.y - this.player.position.y;

				switch (this.player.direction) {
					case Direction.Up:
						isInFront = playerToPotY < 0 && Math.abs(playerToPotX) <= LIFT_RANGE;
						break;
					case Direction.Down:
						isInFront = playerToPotY > 0 && Math.abs(playerToPotX) <= LIFT_RANGE;
						break;
					case Direction.Left:
						isInFront = playerToPotX < 0 && Math.abs(playerToPotY) <= LIFT_RANGE;
						break;
					case Direction.Right:
						isInFront = playerToPotX > 0 && Math.abs(playerToPotY) <= LIFT_RANGE;
						break;
				}

				// Check if pot is in front and within range
				if (isInFront && deltaX <= LIFT_RANGE && deltaY <= LIFT_RANGE) {
					console.log("Found Pot");
					return object;
				}
			}
		}

		// No liftable objects found nearby
		return null;
	}
}
