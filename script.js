import {Wall, Ramp}from "./structure.js"
import {Entity} from "./entity.js"


const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');


class Bullet{
    constructor(position, direction = 1, shooter){
        this.width = 10;
        this.height = 10;
        this.color = "#FFFF00";
        this.position = position;
        this.velocity = {
            x: 0,
            y: 3 * direction
        }
        this.shooter = shooter;
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

/*

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
    
        return yCollision && xCollision;
    }

    draw(){
        if(this.selector !== ""){
            ctx.drawImage(this.imageRepresantation, this.position.x, this.position.y, this.width, this.height);
        }
    }
}
*/

/*
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

class Wall extends Structure{
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

class Ramp extends Structure{
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


 */
class Player extends Entity{
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

        if(this.isHit){
            
        }

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

class Enemy extends Entity{
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
            console.log("jump");
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

        this.leftWall = new Wall({x: 100, y: -140}, 3, 3, "#71DFFF");
        this.rightWall = new Wall({x: -100, y: -140}, 3, 3, "#71DFFF");
        this.middlepartR = new Ramp({x: canvas.width/2, y: -140}, 4, 4, 1, "#9DFF57");
        this.middlepartL = new Ramp({x: canvas.width/2-40, y: -140}, 4, 4, -1,"#9DFF57");
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
                let hit = this.bullets.splice(i, 1);
                if(hit[0].shooter instanceof Enemy && entity instanceof Enemy){
                    continue;
                }
                console.log("collision");
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

        this.leftWall.update();
        this.rightWall.update();
        this.middlepartL.update();
        this.middlepartR.update();

        this.enemyGrid.update();
        this.enemyGrid.manageShooting(now);
        this.respawnEnemies();

        this.player.update();

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


