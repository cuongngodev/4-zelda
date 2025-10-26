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
import { isAABBCollision } from "../../lib/CollisionHelpers.js";
import Enemy from "../entities/enemies/Enemy.js";
import Player from "../entities/Player.js";
import Room from "./Room.js";

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
        this.isBeingThrown = false;

        this.sprites = loadSprites(
            images.get(ImageName.Pots),
            potConfig
        );
        
        this.currentFrame = this.sprites.medium[0]; // get the pot sprite
        this.room = room;
        // Create frame indices array for shattering animation
        const shatterFrameIndices = this.sprites.shateringMedium.map((_, index) => index);
        this.shateringAnimation = new Animation(shatterFrameIndices, 0.2, 1); // Play once
        this.hitboxOffsets.set(2, 16, -4, -25);
        
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
        if (this.isBroken) {
            // Update shattering animation
            this.shateringAnimation.update(dt);
            if (this.shateringAnimation.isDone()) {
                this.isDead = true; 
            }
        } else {
            // Update hitbox position
            this.hitbox.set(
                this.position.x + this.hitboxOffsets.position.x,
                this.position.y + this.hitboxOffsets.position.y,
                this.dimensions.x + this.hitboxOffsets.dimensions.x,
                this.dimensions.y + this.hitboxOffsets.dimensions.y,
            );
            
            // Check for collisions during throwing
            if (this.isBeingThrown) {
                this.checkThrowCollisions();
            }
        }
    }
    
    /**
     * Check for collisions during throwing
     */
    checkThrowCollisions() {
        if (!this.room) return;
         // First check wall/boundary collisions
        if (this.checkWallCollisions()) {
            return; // Exit early if hit a wall
        }
        // Check collision with entities (enemies, hearts, etc.)
        this.room.entities.forEach((entity) => {
            if (entity.isDead || !entity.hitbox) return;
             // Skip collision with player during throwing
            if (entity instanceof Player) return;
            // Check if pot collides with entity
            if (this.didCollideWithEntity(entity.hitbox)) {
                this.onHitEntity(entity);
                return;
            }
        });
        
        // Check collision with other objects
        this.room.objects.forEach((object) => {
            if (object === this || object.isDead || !object.hitbox || !object.isSolid) return;
            
            // Check if pot collides with object
            if (this.didCollideWithEntity(object.hitbox)) {
                this.onHitObject(object);
                return;
            }
        });
    }
    
     /**
     * Check if pot is colliding with room walls/boundaries
     * @returns {boolean} True if collision detected
     */
    checkWallCollisions() {
        const potLeft = this.position.x;
        const potRight = this.position.x + this.dimensions.x;
        const potTop = this.position.y;
        const potBottom = this.position.y + this.dimensions.y;
        
        // Check if pot hits any room boundary
        if (potLeft <= Room.LEFT_EDGE || 
            potRight >= Room.RIGHT_EDGE || 
            potTop <= Room.TOP_EDGE- this.dimensions.y ||  // to avoid shattering early
            potBottom >= Room.BOTTOM_EDGE + this.dimensions.y) {
            
           
            this.onHitWall();
            return true;
        }
        
        return false;
    }
    
    /**
     * Called when pot hits a wall
     */
    onHitWall() {
        this.onHitSomething();
    }
    
    /**
     * Called when thrown pot hits an entity
     * @param {GameEntity} entity The entity that was hit
     */
    onHitEntity(entity) {
        // If it's an enemy, kill it
        if (entity instanceof Enemy) {
            entity.isDead = true;
        }
        
        // Pot shatters on impact
        this.onHitSomething();
    }
    
    /**
     * Called when thrown pot hits an object
     * @param {GameObject} object The object that was hit
     */
    onHitObject(object) {        
        // Pot shatters on impact with solid objects
        this.onHitSomething();
    }
    
    /**
     * Called when pot hits anything during throw
     */
    onHitSomething() {
        
        // Stop throwing
        this.isBeingThrown = false;
        
        // Cancel any ongoing tween animation
        timer.clear();
        
        // Start shattering immediately
        this.isCollidable = false;
        this.isSolid = false;
        this.isBroken = true;
        this.shateringAnimation.refresh();
    }
    
    /**
     * Check if this pot's hitbox collides with another hitbox
     * @param {Hitbox} hitbox 
     * @returns {boolean}
     */
    didCollideWithEntity(hitbox) {
        return this.hitbox.didCollide(hitbox);
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
        const targetY = player.position.y - this.dimensions.y+21;
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
        // Enable collision checking during throw
        this.isBeingThrown = true;
        this.isCollidable = true;
        this.isSolid = false; // Allow pot to pass through during throw
        
        const startX = this.position.x;
        const startY = this.position.y;
        
        // Calculate throw duration based on distance
        const distance = Math.sqrt((targetX - startX) ** 2 + (targetY - startY) ** 2);
        const throwDuration = Math.min(distance / 200, 1.0); // Max 1 second
        
       
            await timer.tweenAsync(
                this.position,
                {
                    x: targetX,
                    y: targetY
                },
                throwDuration,
                Easing.easeInQuad
            );
            
            // If we reach here, pot completed throw without hitting anything
            this.onLand();
    
            this.isBeingThrown = false;
        
    }
    /**
     * Called when the pot lands after being thrown (without hitting anything)
     */
    onLand() {        
        // Stop throwing state
        this.isBeingThrown = false;
        
        // Disable collision and solid properties since pot is breaking
        this.isCollidable = false;
        this.isSolid = false;
        this.isBroken = true;
        
        // Reset and start the shattering animation
        this.shateringAnimation.refresh();
    }
}