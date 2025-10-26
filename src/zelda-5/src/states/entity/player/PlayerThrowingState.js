import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
/**
 * Player is throwing a carried object (like a pot).
 * After throwing, the player returns to Idle state.
 */
export default class PlayerThrowingState extends State {
    /** */
    static THROW_SPEED = 200;
    
    constructor(player, object) {
        super();
        this.player = player;
        this.object = object; // pot

        this.animation = {
			[Direction.Up]: new Animation([6,7,8], 0.1, 1),
			[Direction.Down]: new Animation([0,1,2], 0.1, 1),
			[Direction.Left]: new Animation([9,10,11], 0.1, 1),
			[Direction.Right]: new Animation([3,4,5], 0.1, 1),
		}; 
    }

    enter(pot) {
        this.pot = pot;
        this.player.sprites = this.player.liftingSprites; // Use lifting sprites for throwing animation
        this.player.currentAnimation = this.animation[this.player.direction];
        
        // Start the throwing animation and throw the pot
        this.onThrow();
    }

    update(dt) {
        this.player.currentAnimation.update(dt);
        
        // Check if throwing animation and the pot's throw action are complete
        if (this.player.currentAnimation.isDone()&& this.pot.isBroken) {
            // Return to idle state after throwing
            this.player.changeState(PlayerStateName.Idle);
        }
    }
    
    onThrow(){
        if (!this.pot) return;
        
        // Calculate throw direction and distance based on player direction
        let throwDistance = 100; // pixels to throw
        let targetX = this.pot.position.x;
        let targetY = this.pot.position.y;
        
        // Set target position based on player direction
        switch(this.player.direction){
            case Direction.Up:
                targetY -= throwDistance;
                break;
            case Direction.Down:
                targetY += throwDistance;
                break;
            case Direction.Left:
                targetX -= throwDistance;
                break;
            case Direction.Right:
                targetX += throwDistance;
                break;
        }
        // Throw at target coordinates
        if (this.pot.onThrow) {
            this.pot.onThrow(targetX, targetY);
        }
    }

}