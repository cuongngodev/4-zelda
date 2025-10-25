import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { context, DEBUG } from "../../../globals.js";

export default class PlayerLiftingState extends State {
    /**
     * In this state, the player is lifting an object (like a pot).
     */
    constructor(player, object) {
        super();
        this.player = player;
        this.object = object;
        
      
        this.animation = {
			[Direction.Up]: new Animation([6], 1),
			[Direction.Down]: new Animation([0], 1),
			[Direction.Left]: new Animation([9], 1),
			[Direction.Right]: new Animation([3], 1),
		};
    }

    enter() {
        this.player.sprites = this.player.liftingSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
        
      
    }

    update(dt) {

    }

}