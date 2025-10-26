import Animation from "../../../../lib/Animation.js";
import Input from "../../../../lib/Input.js";
import State from "../../../../lib/State.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { input } from "../../../globals.js";
import Room from "../../../objects/Room.js";

export default class PlayerCarryingWalkingState extends State {
    /**
     * In this state, the player is moving while carrying an object (like a pot).
     * Player can transition back to CarryingIdle or to Throwing states.
     * 
     * @param {Player} player
     * @param {GameObject} object
     */
    constructor(player, object) {
        super();
        this.player = player;
        this.object = object;

        // Slower speed when carrying (about 40% of normal speed)
        this.carryingSpeedMultiplier = 0.4;

        // Walking animation for carrying
        this.animation = {
            [Direction.Up]: new Animation([8, 9, 10, 11], 0.2),
            [Direction.Down]: new Animation([0, 1, 2, 3], 0.2),
            [Direction.Right]: new Animation([4, 5, 6, 7], 0.2),
            [Direction.Left]: new Animation([12, 13, 14, 15], 0.2),
        };
    }

    enter(pot) {
        this.pot = pot;
        this.player.sprites = this.player.carryingSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
        
        // Position the pot above the player's head when entering carrying walking state
        if (this.pot) {
            this.updatePotPosition();
        }
    }

    update(dt) {
        this.player.currentAnimation.update(dt);

        this.isMoving = false;
        this.handleMovement(dt);
       
    }
    handleMovement(dt) {
         // Handle movement and update pot position
        if (input.isKeyPressed(Input.KEYS.S)) {
            this.player.direction = Direction.Down;
            this.player.position.y += this.player.speed * this.carryingSpeedMultiplier * dt;
            this.isMoving = true;

            if (
                this.player.position.y + this.player.dimensions.y >=
                Room.BOTTOM_EDGE
            ) {
                this.player.position.y =
                    Room.BOTTOM_EDGE - this.player.dimensions.y;
            }
        } else if (input.isKeyPressed(Input.KEYS.D)) {
            this.player.direction = Direction.Right;
            this.player.position.x += this.player.speed * this.carryingSpeedMultiplier * dt;
            this.isMoving = true;

            if (
                this.player.position.x + this.player.dimensions.x >=
                Room.RIGHT_EDGE
            ) {
                this.player.position.x =
                    Room.RIGHT_EDGE - this.player.dimensions.x;
            }
        } else if (input.isKeyPressed(Input.KEYS.W)) {
            this.player.direction = Direction.Up;
            this.player.position.y -= this.player.speed * this.carryingSpeedMultiplier * dt;
            this.isMoving = true;

            if (
                this.player.position.y <=
                Room.TOP_EDGE - this.player.dimensions.y
            ) {
                this.player.position.y =
                    Room.TOP_EDGE - this.player.dimensions.y;
            }
        } else if (input.isKeyPressed(Input.KEYS.A)) {
            this.player.direction = Direction.Left;
            this.player.position.x -= this.player.speed * this.carryingSpeedMultiplier * dt;
            this.isMoving = true;

            if (this.player.position.x <= Room.LEFT_EDGE) {
                this.player.position.x = Room.LEFT_EDGE;
            }
        }
        
        // Update pot position whenever player moves
        if (this.isMoving) {
            this.updatePotPosition();
            this.player.currentAnimation = this.animation[this.player.direction];
        } else {
            // No movement input, transition back to carrying idle
            this.player.changeState(PlayerStateName.CarryingIdle, this.pot);
            return;
        }
        
        // Check for throwing the pot with Enter key
        if (input.isKeyPressed(Input.KEYS.ENTER)) {
            this.player.changeState(PlayerStateName.Throwing, this.pot);
        }
    }
    updatePotPosition() {
        if (this.pot) {
            // Position the pot above the player's head
            let offsetX = 0;
            let offsetY = -this.pot.dimensions.y + 15; 
            
            // Update pot position relative to player
            this.pot.position.x = this.player.position.x + offsetX;
            this.pot.position.y = this.player.position.y + offsetY;
        }
    }

    exit() {
        // Clean up when leaving carrying walking state
        // The pot will be handled by the next state
    }
}