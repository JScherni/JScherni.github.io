import {Enemy} from "./Enemy.js";
import {Game} from "./script.js";


export class enemyGrid{
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