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
        // console.log('draw bullet');
    }
}


class Entity{
    constructor(selector, width, height, position){
        this.imageRepresantation = document.querySelector(selector);
        this.width = width;
        this.height = height;
        this.position = position;
    }

    calcCulision(bullet){
        let yCollision = bullet.position.y >= this.position.y 
            && bullet.position.y <= (this.position.y + this.height);

        let xCollision = bullet.position.x >= this.position.x
            && bullet.position.x <= (this.position.x + this.width);

        //console.log('yCollision: ' + yCollision);
        //console.log('xCollision: ' + xCollision);

        // console.log('Collision: ' + yCollision && xCollision);
    
        return yCollision && xCollision;
    }

    draw(){
        ctx.drawImage(this.imageRepresantation, this.position.x, this.position.y, this.width, this.height);
    }
}

class Player extends Entity{
    constructor(){
        //selector, width, height, position
        let w = 100;
        let h = 100;
        super("#player", w, h, {
            x: canvas.width/2 - w/2,
            y: canvas.height - h
        });

        this.velocity = {
            x: 0.01,
            y: 0
        }

        this.shotInterval = 100;
        this.lastShot = 0;

        this.moveLeft = false;
        this.moveRight = false;
    }

    update(){
        if(this.position.x <= 0 && this.velocity.x > 0){
            this.moveLeft = false;
            this.velocity.x = 0;
        }

        if(this.position.x >= canvas.width - this.width && this.velocity.x < 0){
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
        this.draw();
    }

    shoot(time){
        if((time - this.lastShot) < this.shotInterval){
            console.log('too fast');
            return null;
        }

        const bullet = new Bullet({x: this.position.x + this.width/2, y: this.position.y - (this.height * 0.01) }, 1);
        bullet.draw(); 
        this.lastShot = time;
        console.log('shoot');
        return bullet;
    }
}

class Enemy extends Entity{
    constructor(x, y, velocity, jumpDist){
        super("#enemy", 50, 50, {
            x: x,
            y: y
        });

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
        const bullet = new Bullet({x: this.position.x + this.width/2, y: this.position.y + this.height +3}, -1);
        bullet.draw();
        this.lastShot = time;
        this.nextShot = Math.floor(Math.random() * 10000);
        return bullet;
    }

    update(){
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        if((this.position.x + this.width) >= canvas.width || this.position.x <= 0){
            this.velocity.x *= -1;
            this.position.y += this.jumpDistance;
        }
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

    create(rows, numberOfEnemies, x, y){
        for(let j = 0; j < rows; j++){
            let currentX = x;
            for(let i = 0; i < numberOfEnemies; i++){
                let enemy = new Enemy(currentX, y, 2, rows);
                enemy.position.y = enemy.height* j + 20 + y;
                currentX += enemy.width + 20;
                this.enemies.push(enemy);
            }
        }
    }

    allowedToShoot(comrade){
        for(let e of this.enemies){
            if(e.position.y <= comrade.position.y){
                // console.log("closebye");
                continue;
            }

            if((e.position.x) >= (comrade.position.x) && 
                (e.position.x) < (comrade.position.x + this.width + 100)){
                    //console.log("not allowed to shoot 1");
                    return false;
            }

            if((e.position.x) <= (comrade.position.x) && 
                (e.position.x) > (comrade.position.x - this.width - 100)){
                    //console.log("not allowed to shoot 2");
                    return false;
            }
        }

        return true;
    }

    manageShooting(time){
        for(let e of this.enemies){
            if(this.allowedToShoot(e)){
                let bullet = e.shoot(time);
                // console.log("enemy shot");
                if(!(bullet === null)){
                    // console.log("push enemy bullet");
                    game.bullets.push(bullet);
                }
            }
        }
    }
}

class Game{
    constructor(){
        this.player = new Player();
        this.bullets = [];
        this.gameTime  = new Date(); 
        this.enemyGrid = new enemyGrid();

        this.enemyRows = 3;
        this.enemyColumns = 10;
        this.enemyGridXStartPos = 50;
        this.enemyGridYStartPos = 20;
        this.enemyGrid.create(this.enemyRows, this.enemyColumns, this.enemyGridXStartPos, this.enemyGridYStartPos); 

        this.entity = [];
        this.entity.push(this.player);

        this.score = 0;
        this.lifes = 3;

        this.wave = 1;
        this.isRunning = true;
    }

    updateScore(){
        ctx.font = "30px Arial";
        ctx.fillStyle = "#FF0000";
        ctx.fillText(this.score, 10, 50); 
    }

    updateLifes(){
        ctx.font = "30px Arial";
        ctx.fillStyle = "#FF0000";
        ctx.fillText(this.lifes, canvas.width - 50, 50);
    }

    gameover(){
        ctx.font = "100px Arial";
        ctx.fillStyle = "#FF0000";
        ctx.textAlign = 'center';
        ctx.fillText("Game Over", canvas.width/2, canvas.height/2-50);
        ctx.fillText(`Your Score ${this.score}`, canvas.width/2, canvas.height/2 + 50);
    }

    checkEnemyWinningPos(){
        for(enemy of this.enemyGrid.enemies){
            if((enemy.position.y + enemy.height) >= (this.player.position.y)){
                return true;
            }
        }

        return false;
    }

    checkGameOver(){
        let legalPos = this.checkEnemyWinningPos();
        if(this.lifes <= 0 || legalPos){
            this.isRunning = false;
            this.gameover();
        }
    }

    overdrawScreen(){
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        ctx.fill();
    }

    respawnEnemies(){
        if(this.enemyGrid.enemies.length > 0){
            return;
        }

        if(this.wave % 2 == 0){
            this.enemyRows++;
            this.enemyColumns = 10;
        } else{
            this.enemyColumns++;
        }

        this.wave++;
        this.enemyGrid.create(this.enemyRows, this.enemyColumns, this.enemyGridXStartPos, this.enemyGridYStartPos);
    }

    checkForCollision(entity){
       // console.log("checking");
        for(let i = 0; i < this.bullets.length; i++){
            if(entity.calcCulision(this.bullets[i])){
                this.bullets.splice(i, 1);
                console.log("collision");
                return true;
            }
        }

        return false;
    }

    update(){
        this.overdrawScreen();
        
        let now = new Date().getTime();
        for(let i = 0; i < this.bullets.length; i++){
            if(this.bullets[i].position.y <= 0 || this.bullets[i].position.y >= canvas.height){
                this.bullets.splice(i, 1);
                // console.log("splicing bullet");
            }
        }
        

        let gridLength = this.enemyGrid.enemies.length;
        //console.log(gridLength);
        for(let i = 0; i < gridLength; i++){ 
                if(typeof this.enemyGrid.enemies[i] === "undefined"){
                    continue;
                }
                
                if(this.checkForCollision(this.enemyGrid.enemies[i])){
                    this.enemyGrid.enemies.splice(i, 1);
                    this.score++;
                    gridLength--;
                }    
        }

        if(this.checkForCollision(this.player)){
            this.lifes--;
        }

        this.bullets.forEach(element => {   
            element.update(); 
        });

        
        this.enemyGrid.enemies.forEach(element => {
            element.update();
        });
 
        this.enemyGrid.manageShooting(now);
        this.player.update();
        this.updateLifes();
        this.updateScore();
        this.respawnEnemies();
        this.checkGameOver();
    }
}

const game = new Game();
const bullet = new Bullet({x: 100, y: 100});
game.update();



function animate(g){
    if(!game.isRunning){
        return;
    }

    game.update();
    requestAnimationFrame(animate);
}

animate(game);

addEventListener('keydown', ({key}) => {
    switch(key){
        case 'a':
            game.player.moveLeft = true;
            break;
        case 'd':
            game.player.moveRight = true;
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
            game.player.moveLeft = false;
            break;
        case 'd':
            game.player.moveRight = false;
            break;
    }
});


