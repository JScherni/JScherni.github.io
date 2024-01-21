import {Player} from "./player.js";
import {EnemyGrid} from "./enemyGrid.js";
import {Ramp, Wall} from "./structure.js";
import {MachineGunPowerUp, PiercingPowerUp} from "./powerUp.js";
import {Enemy} from "./enemy.js";

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');


export class Game{

    constructor(){
        this.player = new Player();
        this.bullets = [];
        this.gameTime  = new Date();
        this.enemyGrid = new EnemyGrid();

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

        // 50/50 random
        let nextDecisionPowerUp = Math.floor(Math.random() * 2);
        // console.log("next power up in: " + nextPowerUp);
        setTimeout(() => {
            if(nextDecisionPowerUp){
                this.visiblePowerUps.push(new PiercingPowerUp({x: x, y: y}));
            } else {
                this.visiblePowerUps.push(new MachineGunPowerUp({x: x, y: y}));
            }

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
        for(let enemy of this.enemyGrid.enemies){
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
                this.bullets[i].bulletPot--;
                let hit = this.bullets[i];
                if(this.bullets[i].bulletPot <= 0) {
                    this.bullets.splice(i, 1);
                }

                if(hit.shooter instanceof Enemy && entity instanceof Enemy){
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
        this.enemyGrid.manageShooting(now, this);
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