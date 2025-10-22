import Hitbox from "../../lib/Hitbox.js";
import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import ImageName from "../enums/ImageName.js";
import { images, DEBUG, context } from "../globals.js";
import Room from "../objects/Room.js";
import GameEntity from "./GameEntity.js";

export default class Heart extends GameEntity{
    static WIDTH = 16;
	static HEIGHT = 16;

    constructor(){
        super({
            position: new Vector(Room.CENTER_X - Heart.WIDTH / 2, Room.CENTER_Y - Heart.HEIGHT / 2),
            dimensions: new Vector(Heart.WIDTH, Heart.HEIGHT),
            health: 2 // restores 2 health points
        });
        
        this.sprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Hearts),
            Heart.WIDTH,
            Heart.HEIGHT
        );
        
        // Set hitbox offsets
        this.hitboxOffsets.set(4, 2, 4, -4);
        
        this.currentSprite = this.sprites[4];
    }

    /**
     * Called when player collides with heart
     * @param {Player} player - The player who consumed the heart
     */
    consume(player) {
        // Heal the player (but don't exceed max health)
        player.health = Math.min(player.health + this.health, player.constructor.MAX_HEALTH || 6);
        
        // Mark for removal using the standard pattern
        this.isDead = true;
        
        // Optional: Play sound effect (if sounds are available)
        // sounds.play(SoundName.Heal);
    }

    render(offset = { x: 0, y: 0 }) {
        // Don't render anything if the heart is consumed/dead
        if (this.isDead) {
            return;
        }

        const x = this.position.x + offset.x;
        const y = this.position.y + offset.y;
        if(!this.isDead){
            this.currentSprite.render(Math.floor(x), Math.floor(y));
        }
        
        
        // Debug hitbox rendering
        if (DEBUG) {
            this.hitbox.render(context);
        }
    }

}