import { Entity } from "./entity.js";
import { Bullet } from "./bullet.js";


const canvas = document.querySelector('canvas');

export class Enemy extends Entity{
    constructor(x, y, velocity, jumpDist){
        super( 50, 50, {
            x: x,
            y: y
        }, "#enemy");

        this.velocity = {
            x: velocity,
            y: 0
        }

        this.lastShot = new Date();
        this.nextShot = Math.floor(Math.random() * 10000);
        this.jumpDistance = jumpDist * this.height + 10;
    }

    shoot(time){
        if((time - this.lastShot) < this.nextShot){
            // console.log("time issue");
            return null;
        }

        // console.log("Allahu Akbar");
        const bullet = new Bullet({x: this.position.x + this.width/2, y: this.position.y + this.height +3}, -1, this);
        bullet.draw();
        this.lastShot = time;
        this.nextShot = Math.floor(Math.random() * 10000);
        return bullet;
    }

    isWithinBounds() {
        return !(((this.position.x + this.width) >= canvas.width) || this.position.x <= 0);
    }

    update(){
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
/*
if((this.position.x + this.width) >= canvas.width || this.position.x <= 0){
    this.velocity.x *= -1;
    this.position.y += this.jumpDistance;
}
*/

        this.draw();
        return 0;
    }
}