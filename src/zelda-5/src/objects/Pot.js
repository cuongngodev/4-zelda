import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import Hitbox from "../../lib/Hitbox.js";
import Easing from "../../lib/Easing.js";
import ImageName from "../enums/ImageName.js";
import Direction from "../enums/Direction.js";
import { images, DEBUG, context, timer } from "../globals.js";
import GameObject from "./GameObject.js";
import { loadSprites, potConfig } from "../../config/SpriteConfig.js";

export default class Pot extends GameObject {
    static WIDTH = 16;
    static HEIGHT = 32;
    static LIFT = 0;
    static CARRYING = 1;
    static THROWN = 2;

    constructor(dimensions, position, room) {
        super(dimensions, position);

        this.isCollidable = true;
        this.isSolid = true;
        this.isBroken = false;

        this.sprites = loadSprites(
            images.get(ImageName.Pots),
            potConfig
        );
        
        this.currentFrame = this.sprites.medium[0]; // get the pot sprite
        this.room = room;

        this.hitboxOffsets.set(2, 16, -4, -24);
        
        // Update hitbox after setting offsets
        this.hitbox.set(
            this.position.x + this.hitboxOffsets.position.x,
            this.position.y + this.hitboxOffsets.position.y,
            this.dimensions.x + this.hitboxOffsets.dimensions.x,
            this.dimensions.y + this.hitboxOffsets.dimensions.y,
        );
        this.player;
    }

    render(offset = { x: 0, y: 0 }) {
        const x = this.position.x + offset.x;
        const y = this.position.y + offset.y;

        if (this.currentFrame) {
            this.currentFrame.render(Math.floor(x), Math.floor(y));
        }

        if (DEBUG && !this.isBroken) {
            this.hitbox.render(context);
        }
    }

    update(dt) {
        if (!this.isBroken) {
            this.hitbox.set(
                this.position.x + this.hitboxOffsets.position.x,
                this.position.y + this.hitboxOffsets.position.y,
                this.dimensions.x + this.hitboxOffsets.dimensions.x,
                this.dimensions.y + this.hitboxOffsets.dimensions.y,
            );
        }
    }
    /**
     * Handle collision with other entities
     * @param {*} entity 
     */
    onCollision(entity) {
        if (!this.isBroken) {
            super.onCollision(entity);
        }
    }
    
 /**
     * Called when the pot is lifted by the player, a tween is started to lift the pot,
     * it is going upwards to the player head.
     * 
     */
    onLift(player) {
        // Disable collision while being lifted
        this.isCollidable = false;
        this.isSolid = false;
        
        // Calculate target position (above player's head)
        const targetX = player.position.x;
        const targetY = player.position.y - this.dimensions.y+15;
        // Store the original position
        const startX = this.position.x;
        const startY = this.position.y;
        
        // Create a smooth lifting animation using easeOutQuad for natural movement
        timer.tweenAsync(
            this.position,
            {
                x: targetX,
                y: targetY
            },
            0.5,
            Easing.easeOutQuad,
  
        );
    }
    onDrop(player) {
        // Re-enable collision when dropped
     
        
        // Position the pot at the player's current position

    }
    onThrow(targetX, targetY) {
        // Logic for throwing the pot towards targetX, targetY
        // This could involve setting a velocity and updating position over time
    }
}