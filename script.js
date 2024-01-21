import {Game} from "./game.js"

const game = new Game();

function animate(){
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


