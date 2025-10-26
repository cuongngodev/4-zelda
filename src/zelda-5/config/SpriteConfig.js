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
    ],
    shateringMedium: [
        { x: 8*5, y: 8*5 , width: 8*3, height: 8*3 }, 
        { x: 8*8, y: 8*5 , width: 8*4, height: 8*3 }, 
        { x: 8*12, y: 8*5 , width: 8*4, height: 8*3 },
    ],
    large: [
        { x: 16*1, y: 16*9 , width: 16, height: 24 }, 
    ],
}

export const playerLiftConfig = {
    down: [
        { x: 8*0, y: 0, width: 8*2, height: 8*4 },
        { x: 8*2, y: 0, width: 8*2, height: 8*4 },
        { x: 8*4, y: 0, width: 8*2, height: 8*4 },
    ],
    right: [
        { x: 8*0, y: 8*4, width: 8*2, height: 8*4 },
        { x: 8*2, y: 8*4, width: 8*2, height: 8*4 },
        { x: 8*4, y: 8*4, width: 8*2, height: 8*4 },
    ],
    up: [
        { x: 8*0, y: 8*8, width: 8*2, height: 8*4 },
        { x: 8*2, y: 8*8, width: 8*2, height: 8*4 },
        { x: 8*4, y: 8*8, width: 8*2, height: 8*4 },
    ],
    left: [
        { x: 8*0, y: 8*12, width: 8*2, height: 8*4 },
        { x: 8*2, y: 8*12, width: 8*2, height: 8*4 },
        { x: 8*4, y: 8*12, width: 8*2, height: 8*4 },
    ]
}

export const playerCarryConfig = {
    down: [
        { x: 8*0, y: 0, width: 8*2, height: 8*4 },
        { x: 8*2, y: 0, width: 8*2, height: 8*4 },
        { x: 8*4, y: 0, width: 8*2, height: 8*4 },
        { x: 8*6, y: 0, width: 8*2, height: 8*4 },
    ],
    right: [
        { x: 8*0, y: 8*4, width: 8*2, height: 8*4 },
        { x: 8*2, y: 8*4, width: 8*2, height: 8*4 },
        { x: 8*4, y: 8*4, width: 8*2, height: 8*4 },
        { x: 8*6, y: 8*4, width: 8*2, height: 8*4 },
    ],
    up: [
        { x: 8*0, y: 8*8, width: 8*2, height: 8*4 },
        { x: 8*2, y: 8*8, width: 8*2, height: 8*4 },
        { x: 8*4, y: 8*8, width: 8*2, height: 8*4 },
        { x: 8*6, y: 8*8, width: 8*2, height: 8*4 },
    ],
    left: [
        { x: 8*0, y: 8*12, width: 8*2, height: 8*4 },
        { x: 8*2, y: 8*12, width: 8*2, height: 8*4 },
        { x: 8*4, y: 8*12, width: 8*2, height: 8*4 },
        { x: 8*6, y: 8*12, width: 8*2, height: 8*4 },
    ]
}
export function loadSprites(spriteSheet, spriteConfig){
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