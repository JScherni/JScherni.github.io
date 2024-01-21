import {Entity} from "./entity.js";

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

class PowerUp extends Entity{
    constructor(position, validityTime = 5000) {
        let wh = 50;
        super(wh, wh, position);

        this.validityTime = validityTime;
        this.color = "#FF0000";
        this.pickedUp = false;
        this.toBeDeleted = false;

        this.pickupTime = 0;
    }

    powerPlayer(player){};

    draw(){
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.width/2, 0, 2 * Math.PI, true)
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    checkPickUp(player){
        if(this.pickedUp){
            return false;
        }

        let leftRand = this.position.x - this.width/2;
        let rightRand = this.position.x + this.width/2;

        let playerLeft = player.position.x;
        let playerRight = player.position.x + player.width;

        if((playerLeft <= rightRand && playerLeft >= leftRand) ||
            (playerRight >= leftRand && playerRight <= rightRand)){
            // console.log("power up");
            this.powerPlayer(player);
            this.pickedUp = true;
            this.pickupTime = new Date().getTime();
            return true;
        }

        return false;
    }

    drawIndicator(player){
        this.position.x = player.position.x + player.width;
        this.position.y = player.position.y+20;

        if((new Date().getTime() - this.pickupTime) > this.validityTime){
            return;
        }

        let circleEnd = 2 * Math.PI/ this.validityTime * (new Date().getTime() - this.pickupTime);

        ctx.beginPath();
        ctx.arc(this.position.x , this.position.y, this.width/4, 0, circleEnd, true);
        ctx.fillStyle = this.color;
        ctx.lineTo(this.position.x, this.position.y);
        ctx.fill();
    }

    update(player){
        if(this.toBeDeleted){
            return;
        }

        if(!this.pickedUp){
            this.draw();
            return;
        }

        this.drawIndicator(player);
    }
}

export class MachineGunPowerUp extends PowerUp{
    constructor(position, validityTime = 5000) {
        super(position, validityTime);
        this.color = "#00FF00";
    }

    powerPlayer(player){
        player.shotInterval = player.shotInterval/2;
        setTimeout(() => {
            player.shotInterval = player.shotInterval*2;
            this.toBeDeleted = true;
        }, this.validityTime);
    }
}

export class PiercingPowerUp extends PowerUp{
    constructor(position, validityTime = 5000) {
        super(position, validityTime);
        this.color = "#0000FF";
    }

    powerPlayer(player){
        player.piercing = 2;
        setTimeout(() => {
            player.piercing = 1;
            this.toBeDeleted = true;
        }, this.validityTime);
    }
}