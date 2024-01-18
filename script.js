import {Wall, Ramp}from "./structure.js"
import {Entity} from "./entity.js"
import {Player} from "./player.js"
import {Bullet} from "./bullet.js"
import {Enemy} from "./Enemy.js"
//import {enemyGrid} from "./EnemyGrid.js"


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
            console.log("power up");
            this.powerPlayer(player);
            this.pickedUp = true;
            this.pickupTime = new Date().getTime();
            return true;
        }

        return false;
    }

    powerPlayer(player){
        player.shotInterval = player.shotInterval/2;
        setTimeout(() => {
            player.shotInterval = player.shotInterval*2;
            this.toBeDeleted = true;
        }, this.validityTime);
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

        this.gridGap = 20;
    }

    create(rows, numberOfEnemies, x, y){
        for(let j = 0; j < rows; j++){
            let currentX = x;
            for(let i = 0; i < numberOfEnemies; i++){
                let enemy = new Enemy(currentX, y, 1, rows);
                enemy.position.y = enemy.height* j + this.gridGap + y;
                currentX += enemy.width + this.gridGap;
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

    allWithinBounds(){
        for(let enemy of this.enemies){
            if(!enemy.isWithinBounds()){
                return false;
            }
        }

        return true;
    }

    update(){
        let direction = 1;
        let jumpDistance = 0;

        if(!this.allWithinBounds()){
            //console.log("jump");
            direction = -1;
            jumpDistance = this.enemies[0].height + this.gridGap;
        }

        for(let enemy of this.enemies){
            enemy.velocity.x *= direction;
            enemy.position.y += jumpDistance;
            enemy.update();
        }
    }
}

export class Game{
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

        this.visiblePowerUps = [];

        //this.visiblePowerUps.push(new PowerUp({x: 300, y: this.player.position.y + 50}));

        this.score = 0;
        this.lifes = 3;

        this.wave = 1;
        this.isRunning = true;
        this.powerUpInThePipeline = false;

        this.leftWall = new Wall({x: 100, y: -140}, 3, 3, "#71DFFF");
        this.rightWall = new Wall({x: -100, y: -140}, 3, 3, "#71DFFF");
        this.middlepartR = new Ramp({x: canvas.width/2, y: -140}, 4, 4, 1, "#9DFF57");
        this.middlepartL = new Ramp({x: canvas.width/2-40, y: -140}, 4, 4, -1,"#9DFF57");
    }

    spawnPowerUp(){
        if(!(this.visiblePowerUps.length === 0) || this.powerUpInThePipeline){
            return;
        }
        let y = this.player.position.y + 50;
        let x = Math.floor(Math.random() * canvas.width);

        // spawn a power up with a set intervall function in the next 20 to 40 seconds
        let nextPowerUp = Math.floor(Math.random() * 2000) + 2000;
        this.powerUpInThePipeline = true;

        console.log("next power up in: " + nextPowerUp);
        setTimeout(() => {
            this.visiblePowerUps.push(new PowerUp({x: x, y: y}));
            this.powerUpInThePipeline = false;
        }, nextPowerUp);
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
        ctx.fillText(`Your Score: ${this.score}`, canvas.width/2, canvas.height/2 + 50);
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

        if(this.wave % 2 === 0){
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
                let hit = this.bullets.splice(i, 1);
                if(hit[0].shooter instanceof Enemy && entity instanceof Enemy){
                    continue;
                }
                //console.log("collision");
                return true;
            }
        }

        return false;
    }

    checkEntityArrayForCollision(entityArray){
        let gridLength = entityArray.length;
        for(let i = 0; i < gridLength; i++){ 
            if(typeof entityArray[i] === "undefined"){
                continue;
            }
            
            if(this.checkForCollision(entityArray[i])){
                let hitObj = entityArray.splice(i, 1);
                if(hitObj[0] instanceof Enemy ){
                    this.score++;
                }
                gridLength--;
            }    
        }
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
        
        this.checkEntityArrayForCollision(this.enemyGrid.enemies);
        this.checkEntityArrayForCollision(this.leftWall.bricks);
        this.checkEntityArrayForCollision(this.rightWall.bricks);
        this.checkEntityArrayForCollision(this.middlepartL.bricks);
        this.checkEntityArrayForCollision(this.middlepartR.bricks);

        if(this.checkForCollision(this.player)){
            this.lifes--;
            this.player.isHit();
        }

        this.bullets.forEach(element => {   
            element.update(); 
        });


        this.rightWall.update();
        this.leftWall.update();
        this.middlepartL.update();
        this.middlepartR.update();

        this.enemyGrid.update();
        this.enemyGrid.manageShooting(now);
        this.respawnEnemies();

        if(this.player.shooting){
            let bullet = this.player.shoot(now);
            if(!(bullet === null)){
                this.bullets.push(bullet);
            }
        }

        this.spawnPowerUp();
        this.player.update();

        let numberOfPowerUps = this.visiblePowerUps.length;
        for(let i = 0; i < numberOfPowerUps; i++){
            this.visiblePowerUps[i].update(this.player);
            this.visiblePowerUps[i].checkPickUp(this.player);
            if(this.visiblePowerUps[i].toBeDeleted){
                this.visiblePowerUps.splice(i, 1);
                numberOfPowerUps--;
            }
        }

        this.updateLifes();
        this.updateScore();
    
        this.checkGameOver();
    }
}

const game = new Game();
//const bullet = new Bullet({x: 100, y: 100});
game.update();



function animate(g){
    if(!game.isRunning){
        return;
    }

    game.update();
    requestAnimationFrame(animate);
}

animate(game);

//let spaceIsDown = false;

addEventListener('keydown', ({key}) => {
    switch(key){
        case 'a':
            game.player.moveLeft = true;
            break;
        case 'd':
            game.player.moveRight = true;
            break;
        case ' ':
            //console.log('space');
            game.player.shooting = true;
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
        case ' ':
            game.player.shooting = false;
            break;
    }
});


