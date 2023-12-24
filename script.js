const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

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

class Entity{
    calcCulision(bullet){
        let yCollision = bullet.position.y >= this.position.y 
            && bullet.position.y <= (this.position.y + this.height);

        let xCollision = bullet.position.x >= this.position.x
            && bullet.position.x <= (this.position.x + this.width);

        return yCollision && xCollision;
    }
}

class Player extends Entity{
    constructor(){
        super();
        this.width = 50;
        this.height = 50;
        this.color = '#FF0000';

        this.position = {
            x: canvas.width/2 - this.width/2,
            y: canvas.height - this.height
        }

        this.velocity = {
            x: 0.01,
            y: 0
        }

        this.shotInterval = 250;
        this.lastShot = 0;
    }

    draw(){
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x + this.width/2, this.position.y-this.height);
        ctx.lineTo(this.position.x + this.width, this.position.y);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        if(this.position.x <= 0 && this.velocity.x > 0){
            this.velocity.x = 0;
        }

        if(this.position.x >= canvas.width - this.width && this.velocity.x < 0){
            this.velocity.x = 0;
        }
        
        this.position.x -= this.velocity.x;
        this.draw();
        // this.position.y += this.velocity.y;
    }

    shoot(time){
        if((time - this.lastShot) < this.shotInterval){
            console.log('too fast');
            return null;
        }

        const bullet = new Bullet({x: this.position.x + this.width/2, y: this.position.y + 2 + this.height}, 1);
        bullet.draw(); 
        this.lastShot = time;
        console.log('shoot');
        return bullet;
    }
}

class Enemy extends Entity{
    constructor(x, y){
        super();
        this.width = 50;
        this.height = 50;
        this.color = '#00FF00';

        this.position = {
            x: x,
            y: y
        }

        this.velocity = {
            x: 0,
            y: 0
        }

        this.lastShot = new Date();
        this.nextShot = Math.floor(Math.random() * 10000);
    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    shoot(time){
        if((time - this.lastShot) < this.nextShot){
            return null;
        }
        const bullet = new Bullet({x: this.position.x + this.width/2, y: this.position.y + this.height +3}, -1);
        bullet.draw();
        this.lastShot = time;
        this.nextShot = Math.floor(Math.random() * 10000);
        return bullet;
    }

    update(){
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
        this.draw();
    }
}

class enemyGrid{
    constructor(){
        this.enemies = [];
        this.width = 50;
        this.height = 50;
        this.color = '#00FF00';
        this.velocity = {
            x: 0,
            y: 0
        }
    }

    create(numberOfEnemies, x, y){
        for(let i = 0; i < numberOfEnemies; i++){
            this.enemies.push(new Enemy(x, y));
            x += this.width + 20;
        }
    }
}

class Game{
    constructor(){
        this.player = new Player();
        this.bullets = [];
        this.gameTime  = new Date(); 
        this.enemyGrid = new enemyGrid();
        this.enemyGrid.create(10, 50, 400); 

        this.entity = [];
        this.entity.push(this.player);
        this.enemyGrid.enemies.forEach(element => {
            this.entity.push(element);
        });

        this.score = 0;
    }

    updateScore(){
        ctx.font = "30px Arial";
        ctx.fillStyle = "#FF0000";
        ctx.fillText(this.score, 10, 50); 
    }

    update(){
        let now = new Date().getTime();

        for(let i = 0; i < this.bullets.length; i++){
            if(this.bullets[i].position.y <= 0 || this.bullets[i].position.y >= canvas.height){
                this.bullets.splice(i, 1);
            }
        }

        let entityLength = this.entity.length;
        let bulletsLength = this.bullets.length;
        for(let i = 0; i < entityLength; i++){
            for(let j = 0; j < bulletsLength; j++){  
                if(this.entity[i].calcCulision(this.bullets[j])){
                    let delEnemy = this.entity.splice(i, 1);
                    if(delEnemy[0] instanceof Enemy){
                        this.score += 1;
                    }
                    this.bullets.splice(j, 1);
                    entityLength--;
                    bulletsLength--;
                }
            }
        }

        this.bullets.forEach(element => {   
            element.update(); 
        });

        this.entity.forEach(element => {
            element.update();
            if(element instanceof Enemy){
                let bullet = element.shoot(now);
                if(!(bullet === null)){
                    this.bullets.push(bullet);
                }
            }
        });
 
        this.player.update();
        this.updateScore();
    }
}

const game = new Game();
const bullet = new Bullet({x: 100, y: 100});
game.update();

function animate(g){
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fill();
    game.update();
    requestAnimationFrame(animate);
}

animate(game);

addEventListener('keydown', ({key}) => {
    switch(key){
        case 'a':
            game.player.velocity.x = 5;
            break;
        case 'd':
            game.player.velocity.x = -5;
            break;
        case ' ':
            console.log('space'); 
            let bullet = game.player.shoot(new Date());
            if(bullet === null){
                break;
            }
            game.bullets.push(bullet);
            break;
    }
});

addEventListener('keyup', ({key}) => {
    switch(key){
        case 'a':
            game.player.velocity.x = 0;
            break;
        case 'd':
            game.player.velocity.x = 0;
            break;
    }
});


