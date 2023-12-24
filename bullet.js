class Bullet{
    constructor(position, direction = 1){
        this.width = 10;
        this.height = 10;
        this.color = "#FFFF00";
        this.position = position;
        this.velocity = {
            x: 0,
            y: 2 * direction
        }
    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.position.y -= this.velocity.y;
        this.draw();
    }
}