import Animation from "../../../../lib/Animation.js";
import Input from "../../../../lib/Input.js";
import State from "../../../../lib/State.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { input } from "../../../globals.js";

export default class PlayerCarryingIdleState extends State {
    /**
     * In this state, the player is stationary while carrying an object (like a pot).
     * Player can transition to CarryingWalking or Throwing states.
     * 
     * @param {Player} player
     * @param {GameObject} object
     */
    constructor(player, object) {
        super();
        this.player = player;
        this.object = object;

        // Static animation for idle carrying (holding pose)
        this.animation = {
            [Direction.Up]: new Animation([8], 1),
            [Direction.Down]: new Animation([0], 1),
            [Direction.Left]: new Animation([12], 1),
            [Direction.Right]: new Animation([4], 1),
        };
    }

    enter(pot) {
        this.pot = pot;
        this.player.sprites = this.player.carryingSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
        
        // Position the pot above the player's head when entering carrying idle state
        if (this.pot) {
            this.updatePotPosition();
        }
    }

    update(dt) {
        // Check for movement input to transition to walking
        if (input.isKeyPressed(Input.KEYS.S)) {
            this.player.direction = Direction.Down;
            this.player.changeState(PlayerStateName.CarryingWalking, this.pot);
        } else if (input.isKeyPressed(Input.KEYS.D)) {
            this.player.direction = Direction.Right;
            this.player.changeState(PlayerStateName.CarryingWalking, this.pot);
        } else if (input.isKeyPressed(Input.KEYS.W)) {
            this.player.direction = Direction.Up;
            this.player.changeState(PlayerStateName.CarryingWalking, this.pot);
        } else if (input.isKeyPressed(Input.KEYS.A)) {
            this.player.direction = Direction.Left;
            this.player.changeState(PlayerStateName.CarryingWalking, this.pot);
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
}