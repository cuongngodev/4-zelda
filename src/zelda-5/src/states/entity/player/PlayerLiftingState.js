import Animation from "../../../../lib/Animation.js";
import Input from "../../../../lib/Input.js";
import State from "../../../../lib/State.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { context, DEBUG, input } from "../../../globals.js";

export default class PlayerLiftingState extends State {
    /**
     * In this state, the player is lifting an object (like a pot).
     */
    constructor(player, object) {
        super();
        this.player = player;
        this.object = object;
        this.isLiftingComplete = false;
      
        this.animation = {
			[Direction.Up]: new Animation([6,7,8], 0.1, 1),
			[Direction.Down]: new Animation([0,1,2], 0.1, 1),
			[Direction.Left]: new Animation([9,10,11], 0.1, 1),
			[Direction.Right]: new Animation([3,4,5], 0.1, 1),
		};
        this.finishedLiftingAnimation= {
            [Direction.Up]: new Animation([8], 1),
            [Direction.Down]: new Animation([2], 1),
            [Direction.Left]: new Animation([11], 1),
            [Direction.Right]: new Animation([5], 1),
        }
        
    }

    enter(pot) {
        this.pot = pot;
        this.isLiftingComplete = false;
        this.player.sprites = this.player.liftingSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
        
        // Start the lifting animation on the pot
        if (this.pot && this.pot.onLift) {
            this.pot.onLift(this.player);
        }
    }

    update(dt) {        
        // Check if lifting animation is complete
        if (this.player.currentAnimation.isDone() && !this.isLiftingComplete) {
            this.player.currentAnimation.refresh();
            this.isLiftingComplete = true;
            this.player.changeState(PlayerStateName.Carrying, this.pot);

        }
        
    }

    exit() {
      
    }

}