import {Entity} from "./entity.js"

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');


class Brick extends Entity{
    constructor(width, height, position, color){
        super(width, height, position);
        this.color = color;
    }

    //draw brick
    draw(){
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.draw();
    }
}

class Structure{
    constructor(position, width, height, color = "#71DFFF"){
        this.bricks = [];
        this.position = position;
        this.width = width;
        this.height = height;
        this.widthBricks = 40;
        this.heightBricks = 40;

        this.color = color;

        if(position.x < 0){
            this.position.x = canvas.width + position.x - this.width * this.widthBricks;
        }

        if(position.y < 0){
            this.position.y = canvas.height + position.y - this.height * this.heightBricks;
        }
    }

    update(){
        for(let brick of this.bricks){
            brick.update();
        }
    }
}

export class Wall extends Structure{
    constructor(position, width, height, color = "#F7FF00"){
        super(position, width, height, color);
        this.create();
    }

    create(){
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                let brick = new Brick(this.widthBricks, this.heightBricks, {
                    x: this.position.x + i * this.widthBricks,
                    y: this.position.y + j * this.heightBricks
                }, this.color);
                this.bricks.push(brick);
            }
        }
    }
}

export class Ramp extends Structure{
    constructor(position, width, height, orientation = 1, color = "#71DFFF"){
        super(position, width, height, color);

        this.orientation = orientation;

        this.position.x -= this.widthBricks/2;
        this.create();
    }

    create(){
        for(let i = 0; i < this.height; i++){
            for(let j = 0; j < this.width && j <= i; j++){
                let brick = new Brick(this.widthBricks, this.heightBricks, {
                    x: this.position.x + j * this.widthBricks * this.orientation,
                    y: this.position.y + i * this.heightBricks
                }, this.color);
                this.bricks.push(brick);
            }
        }
    }
}