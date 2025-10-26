import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import Hitbox from "../../lib/Hitbox.js";
import Easing from "../../lib/Easing.js";
import ImageName from "../enums/ImageName.js";
import Direction from "../enums/Direction.js";
import { images, DEBUG, context, timer } from "../globals.js";
import GameObject from "./GameObject.js";
import { loadSprites, potConfig } from "../../config/SpriteConfig.js";
import Animation from "../../lib/Animation.js";

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
        // Create frame indices array for shattering animation
        const shatterFrameIndices = this.sprites.shateringMedium.map((_, index) => index);
        this.shateringAnimation = new Animation(shatterFrameIndices, 0.2, 1); // Play once
        this.hitboxOffsets.set(4, 15, -8, -25);
        
        // Update hitbox after setting offsets
        this.hitbox.set(
            this.position.x + this.hitboxOffsets.position.x,
            this.position.y + this.hitboxOffsets.position.y,
            this.dimensions.x + this.hitboxOffsets.dimensions.x,
            this.dimensions.y + this.hitboxOffsets.dimensions.y,
        );
    }

    render(offset = { x: 0, y: 0 }) {
        const x = this.position.x + offset.x;
        const y = this.position.y + offset.y;

        if (this.isBroken) {
            // Render shattering animation when broken
            const frameIndex = this.shateringAnimation.getCurrentFrame();
            const shatterSprite = this.sprites.shateringMedium[frameIndex];
            if (shatterSprite) {
                //render the shattering animation
                shatterSprite.render(Math.floor(x), Math.floor(y));
            }
        } else if (this.currentFrame) {
            // Render normal pot sprite when not broken
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
        }else {
            // Update shatering animation
            this.shateringAnimation.update(dt);
            if (this.shateringAnimation.isDone()) {
                this.isDead = true; // Mark for removal after shatering animation
            }
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
    async onLift(player) {
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
        await timer.tweenAsync(
            this.position,
            {
                x: targetX,
                y: targetY
            },
            0.5,
            Easing.easeOutQuad,
  
        );
    }
    /**
     * Called when the pot is thrown
     * @param {*} targetX Target X coordinate 
     * @param {*} targetY Target Y coordinate
     */
    async onThrow(targetX, targetY) {
       
        this.isCollidable = false;
        this.isSolid = false;
        const startX = this.position.x;
        const startY = this.position.y;
        
        // Calculate throw duration based on distance
        const distance = Math.sqrt((targetX - startX) ** 2 + (targetY - startY) ** 2);
        const throwDuration = Math.min(distance / 200, 1.0); // Max 1 second
        
        // Throwing effect
        await timer.tweenAsync(
            this.position,
            {
                x: targetX,
                y: targetY
            },
            throwDuration,
            Easing.easeInQuad
        )
        this.onLand();
    }
    /**
     * Called when the pot lands after being thrown
     */
    onLand() {
        // Disable collision and solid properties since pot is breaking
        this.isCollidable = false;
        this.isSolid = false;
        this.isBroken = true;
    }
}