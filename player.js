import { Entity } from './entity.js';
import { Bullet } from './bullet.js';


const canvas = document.querySelector('canvas');
export class Player extends Entity{
    constructor(){
        //selector, width, height, position
        let w = 100;
        let h = 100;
        super(w, h, {
            x: canvas.width/2 - w/2,
            y: canvas.height - h - 10
        }, "#player");

        this.velocity = {
            x: 0.01,
            y: 0
        }

        this.shotInterval = 100;
        this.lastShot = 0;

        this.moveLeft = false;
        this.moveRight = false;
        this.visiblity = true;
    }

    isHit(){
        let int = setInterval(() => {
            this.visiblity = !this.visiblity;
        }, 200);

        setTimeout(() => {
            this.visiblity = true;
            clearInterval(int);
        }, 1200);
    }

    update(){
        if(this.position.x <= 0){
            this.moveLeft = false;
            this.velocity.x = 0;
        }

        if(this.position.x >= canvas.width - this.width){
            this.moveRight = false;
            this.velocity.x = 0;
        }

        if(this.moveLeft){
            this.velocity.x = 5;
        }else if(this.moveRight){
            this.velocity.x = -5;
        } else{
            this.velocity.x = 0;
        }

        this.position.x -= this.velocity.x;

        if(this.visiblity){
            this.draw();
        }
    }

    shoot(time){
        if((time - this.lastShot) < this.shotInterval){
            console.log('too fast');
            return null;
        }

        const bullet = new Bullet({x: this.position.x + this.width/2, y: this.position.y - (this.height * 0.01) }, 1, this);
        bullet.draw();
        this.lastShot = time;
        console.log('shoot');
        return bullet;
    }
}