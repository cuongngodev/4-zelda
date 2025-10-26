import Animation from "../../../../lib/Animation.js";
import Input from "../../../../lib/Input.js";
import State from "../../../../lib/State.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { input } from "../../../globals.js";
import Room from "../../../objects/Room.js";

export default class PlayerCarryingState extends State {
    /**
     * In this state, the player is carrying an object (like a pot)
     * 
     * @param {Player} player
     * @param {GameObject} object
     */
    constructor(player, object) {
        super();
        this.player = player;
        this.object = object;

        this.animation = {
			[Direction.Up]: new Animation([8, 9, 10, 11], 0.2),
			[Direction.Down]: new Animation([0,1,2,3], 0.2),
			[Direction.Right]: new Animation([4,5,6,7], 0.2),
			[Direction.Left]: new Animation([12,13,14,15], 0.2),
		};
        this.idleLiftingAnimation = {
            [Direction.Up]: new Animation([8], 1),
            [Direction.Down]: new Animation([0], 1),
            [Direction.Left]: new Animation([12], 1),
            [Direction.Right]: new Animation([4], 1),
        };
    }

    enter() {
        this.player.sprites = this.player.carryingSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
    }

    update(dt) {
    this.player.currentAnimation = this.animation[this.player.direction];

		if (input.isKeyPressed(Input.KEYS.S)) {
			this.player.direction = Direction.Down;
			this.player.position.y += this.player.speed * dt;

			if (
				this.player.position.y + this.player.dimensions.y >=
				Room.BOTTOM_EDGE
			) {
				this.player.position.y =
					Room.BOTTOM_EDGE - this.player.dimensions.y;
			}
		} else if (input.isKeyPressed(Input.KEYS.D)) {
			this.player.direction = Direction.Right;
			this.player.position.x += this.player.speed * dt;

			if (
				this.player.position.x + this.player.dimensions.x >=
				Room.RIGHT_EDGE
			) {
				this.player.position.x =
					Room.RIGHT_EDGE - this.player.dimensions.x;
			}
		} else if (input.isKeyPressed(Input.KEYS.W)) {
			this.player.direction = Direction.Up;
			this.player.position.y -= this.player.speed * dt;

			if (
				this.player.position.y <=
				Room.TOP_EDGE - this.player.dimensions.y
			) {
				this.player.position.y =
					Room.TOP_EDGE - this.player.dimensions.y;
			}
		} else if (input.isKeyPressed(Input.KEYS.A)) {
			this.player.direction = Direction.Left;
			this.player.position.x -= this.player.speed * dt;

			if (this.player.position.x <= Room.LEFT_EDGE) {
				this.player.position.x = Room.LEFT_EDGE;
			}
		} else {
            this.player.currentAnimation = this.idleLiftingAnimation[this.player.direction];
		}
    }

    handleMovement(dt){

    }

}