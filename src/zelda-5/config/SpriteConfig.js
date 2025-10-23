import Sprite from "../lib/Sprite.js";

export const potConfig = {
    small: [
        { x: 8*1, y: 8*2 , width: 8*2, height: 8*2 }, 
        { x: 8*5, y: 8*1.5 , width: 8*3, height: 8*3 }, 
        { x: 8*8, y: 8*1.5 , width: 8*3, height: 8*3 }, 
        { x: 8*11, y: 8*2 , width: 8*3, height: 8*3 }, 
        { x: 8*15, y: 8*2 , width: 8*3, height: 8*3 }, 
    ],
    medium: [
        { x: 8*1, y: 8*5 , width: 8*2, height: 8*3 }, 
        { x: 8*5, y: 8*5 , width: 8*3, height: 8*3 }, 
        { x: 8*8, y: 8*5 , width: 8*4, height: 8*3 }, 
        { x: 8*12, y: 8*5 , width: 8*4, height: 8*3 }, 
    ],
    large: [
        { x: 16*1, y: 16*9 , width: 16, height: 24 }, 
    ],
}

export function loadPotSprites(spriteSheet, spriteConfig){
    const sprites = {};
    
    for (const [key, frames] of Object.entries(spriteConfig)) {
        sprites[key] = frames.map(
            (frame) => {
                return new Sprite(
                    spriteSheet,
                    frame.x,
                    frame.y,
                    frame.width,
                    frame.height
                );
            }
        );
    }

    return sprites;
}