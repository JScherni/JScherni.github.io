const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');


export class Entity{
    constructor(width, height, position, selector = ""){
        this.selector = selector;
        if(selector !== ""){
            this.imageRepresantation = document.querySelector(selector);
        }
        this.width = width;
        this.height = height;
        this.position = position;
    }

    calcCulision(bullet){
        let yCollision = bullet.position.y >= this.position.y
            && bullet.position.y <= (this.position.y + this.height);

        let xCollision = bullet.position.x >= this.position.x
            && bullet.position.x <= (this.position.x + this.width);

        let xCollision2 = (bullet.position.x + bullet.width) >= this.position.x
            && (bullet.position.x + bullet.width) <= (this.position.x + this.width);

        return yCollision && (xCollision || xCollision2);
    }

    draw(){
        if(this.selector !== ""){
            ctx.drawImage(this.imageRepresantation, this.position.x, this.position.y, this.width, this.height);
        }
    }
}
