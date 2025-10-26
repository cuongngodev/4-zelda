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
        
      
        this.animation = {
			[Direction.Up]: new Animation([6,7,8], 0.1),
			[Direction.Down]: new Animation([0,1,2], 0.1),
			[Direction.Left]: new Animation([9,10,11], 0.1),
			[Direction.Right]: new Animation([3,4,5], 0.1),
		};
        
    }

    enter() {
        this.player.sprites = this.player.liftingSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
    }

    update(dt) {
        // this.player.sprites = this.player.liftingSprites[0];
        this.checkForCarryingMovement();
        
    }
    checkForCarryingMovement(){
        if (input.isKeyPressed(Input.KEYS.S)) {
			this.player.direction = Direction.Down;
			this.player.changeState(PlayerStateName.Carrying);
		} else if (input.isKeyPressed(Input.KEYS.D)) {
			this.player.direction = Direction.Right;
			this.player.changeState(PlayerStateName.Carrying);
		} else if (input.isKeyPressed(Input.KEYS.W)) {
			this.player.direction = Direction.Up;
			this.player.changeState(PlayerStateName.Carrying);
		} else if (input.isKeyPressed(Input.KEYS.A)) {
			this.player.direction = Direction.Left;
			this.player.changeState(PlayerStateName.Carrying);
		}
    }

}