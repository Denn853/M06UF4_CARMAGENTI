let player_num = 0;

// CAR CONSTS
const CAR_SPEED = 5;
const CAR_ROTATION = 5;

// BULLET CONSTS
const BULLET_SPEED = 4;

// PLAYER VARIABLES
let player1;
let player2;

let player1_angle = 0;
let player2_angle = 0;

// BULLET VARIABLES
let bullet1;
let bullet2;

let canShot = true;

// INPUTS
let cursors
let keys

const socket = new WebSocket("ws://10.40.2.23:8080");

socket.addEventListener("open", function(event) {

});

socket.addEventListener("message", function(event) {
    //console.log("Server: ", event.data);

    let data = JSON.parse(event.data);

    if (data.player_num != undefined) {
        player_num = data.player_num;
        console.log("Player number: ", player_num)
    }
    else if (data.x != undefined) {
        if (player_num == 2 && player1 != undefined) {
            player1.x = data.x,
            player1.y = data.y,
            player1.rotation = data.r
        }
        else if (player_num == 1 && player2 != undefined) {
            player2.x = data.x,
            player2.y = data.y,
            player2.rotation = data.r
        }
    }
    else if (data.bx != undefined) {
        if (player_num == 2) {
            
            if (bullet1 == undefined) {
                
                bullet1 = canvas.add.image(player1.x + (2 * player1.width / 3) * Math.sin(player1_angle * Math.PI / 180), player1.y + (2 * player1.width / 3) * Math.sin(player1_angle * Math.PI / 180), 'duck_white');

                bullet1.setScale(0.25);

                canvas.physics.add.collider(player2, bullet1, () => {
                    console.log("Hit with Player 2");

                    let bullet1_collision_data = {
                        collided: 2
                    }
                
                    socket.send(JSON.stringify(bullet1_collision_data));
                });
                canvas.physics.add.existing(bullet1, false);
            }

            bullet1.x = data.bx,
            bullet1.y = data.by,
            bullet1.rotation = data.br
        }
        else if (player_num == 1) {
            if (bullet2 == undefined) {
                
                bullet2 = canvas.add.image(player2.x + (2 * player2.width / 3) * Math.sin(player2_angle * Math.PI / 180), player2.y + (2 * player2.width / 3) * Math.sin(player2_angle * Math.PI / 180), 'duck_yellow');

                bullet2.setScale(0.25);

                canvas.physics.add.collider(player1, bullet2, () => {
                    console.log("Hit with Player 1");

                    let bullet2_collision_data = {
                        collided: 1
                    }
                
                    socket.send(JSON.stringify(bullet2_collision_data));
                });
                canvas.physics.add.existing(bullet2, false);
            }

            bullet2.x = data.bx,
            bullet2.y = data.by,
            bullet2.rotation = data.br
        }
    }
    if (data.game_over != undefined) {
        bg_text = canvas.add.rectangle(0, 0, config.width*2, config.height*2, 0x000000).setVisible(true);

        if (data.game_over == player_num) {
            lose_text = canvas.add.text(config.width / 3.5, config.height / 2, 'YOU LOSE', {fontFamily: 'Arial', fontSize: 64, color: '#ff0000'}).setVisible(true);
        }
        else {
            won_text = canvas.add.text(config.width / 3.5, config.height / 2, 'YOU WON', {fontFamily: 'Arial', fontSize: 64, color: '#00ff00'}).setVisible(true);
        }
    }
});

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: {
        preload,
        create,
        update
    }
}

const game = new Phaser.Game(config);

let canvas;
let bg_text;
let won_text;
let lose_text;

function preload ()
{
    canvas = this;

    this.load.image('green_car', 'assets/PNG/Cars/car_green_small_1.png');
    this.load.image('blue_car', 'assets/PNG/Cars/car_blue_small_1.png');
    this.load.image('circuit', 'assets/PNG/circuit.png');
    this.load.image('duck_white', 'assets/PNG/Objects/duck_outline_white.png');
    this.load.image('duck_yellow', 'assets/PNG/Objects/duck_outline_yellow.png');
}

function create ()
{    
    // CIRCUIT
    this.add.image(400, 300, 'circuit').setDisplaySize(808, 610).setDepth(-1);

    /// PLAYER
    player1 = this.physics.add.image(31, 300, 'green_car');
    player2 = this.physics.add.image(84, 320, 'blue_car');
    
    player1.setScale(0.5);
    player2.setScale(0.5);

    player1.setCollideWorldBounds(true);
    player2.setCollideWorldBounds(true);

    this.physics.add.collider(player1, player2)

    /// INPUTS
        // WASD
    keys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

        // ARROWS
    cursors = this.input.keyboard.createCursorKeys();
}

function update ()
{
    if (player_num == 0) {
        return;
    }

    // PLAYER 1 - MOVEMENT
    if (player_num == 1) {
        // UP - DOWN
        if (keys.up.isDown || cursors.up.isDown)
        {
            player1.y -= CAR_SPEED*Math.cos(player1_angle*Math.PI/180);
            player1.x += CAR_SPEED*Math.sin(player1_angle*Math.PI/180);

            /// ROTATION 
            // LEFT - RIGHT
            if (keys.left.isDown || cursors.left.isDown) 
            {
                player1_angle -= CAR_ROTATION;
            }
            else if (keys.right.isDown || cursors.right.isDown)
            {
                player1_angle += CAR_ROTATION;
            }
        }
        else if (keys.down.isDown || cursors.down.isDown)
        {
            player1.y += CAR_SPEED/2*Math.cos(player1_angle*Math.PI/180);
            player1.x -= CAR_SPEED/2*Math.sin(player1_angle*Math.PI/180);
        
            /// ROTATION 
            // LEFT - RIGHT
            if (keys.left.isDown || cursors.left.isDown) 
            {
                player1_angle -= CAR_ROTATION/2;
            }
            else if (keys.right.isDown || cursors.right.isDown)
            {
                player1_angle += CAR_ROTATION/2;
            }
        }

        if (keys.space.isDown && canShot) 
        {
            bullet1 = this.physics.add.image(player1.x + (2 * player1.width / 3) * Math.sin(player1_angle * Math.PI / 180), player1.y + (2 * player1.width / 3) * Math.sin(player1_angle * Math.PI / 180), 'duck_white');
            bullet1.setScale(0.25);
            bullet1.rotation = player1_angle * Math.PI / 180;
            canShot = false;
            
            // Colisión con los bordes del mundo
            bullet1.setCollideWorldBounds(true);

            // // Agregar manejador de eventos de colisión
            // this.physics.world.on('worldbounds', function (body) {
            //     // Verificar si la colisión involucra la bala
            //     if (body.gameObject === bullet1) {
            //         // Eliminar la bala cuando colisiona con los bordes del mundo
            //         bullet1.destroy();
            //         canShot = true;
            //     }
            // });
        }
        
        player1.rotation = player1_angle*Math.PI/180;

        let player1_data = {
            x: player1.x,
            y: player1.y,
            r: player1.rotation
        };

        socket.send(JSON.stringify(player1_data));

        if (bullet1 == undefined) {
            return;
        }

        bullet1.y -= BULLET_SPEED * Math.cos(bullet1.rotation);
        bullet1.x += BULLET_SPEED * Math.sin(bullet1.rotation);

        let bullet1_data = {
            bx: bullet1.x,
            by: bullet1.y,
            br: bullet1.rotation
        }
    
        socket.send(JSON.stringify(bullet1_data));
    }
    else {
        // UP - DOWN
        if (keys.up.isDown || cursors.up.isDown)
        {
            player2.y -= CAR_SPEED*Math.cos(player2_angle*Math.PI/180);
            player2.x += CAR_SPEED*Math.sin(player2_angle*Math.PI/180);

            /// ROTATION 
            // LEFT - RIGHT
            if (keys.left.isDown || cursors.left.isDown) 
            {
                player2_angle -= CAR_ROTATION;
            }
            else if (keys.right.isDown || cursors.right.isDown)
            {
                player2_angle += CAR_ROTATION;
            }
        }
        else if (keys.down.isDown || cursors.down.isDown)
        {
            player2.y += CAR_SPEED/2*Math.cos(player2_angle*Math.PI/180);
            player2.x -= CAR_SPEED/2*Math.sin(player2_angle*Math.PI/180);
        
            /// ROTATION 
            // LEFT - RIGHT
            if (keys.left.isDown || cursors.left.isDown) 
            {
                player2_angle -= CAR_ROTATION/2;
            }
            else if (keys.right.isDown || cursors.right.isDown)
            {
                player2_angle += CAR_ROTATION/2;
            }
        }
        
        if (keys.space.isDown && canShot) 
        {
            bullet2 = this.physics.add.image(player2.x + (2 * player2.width / 3) * Math.sin(player2_angle * Math.PI / 180), player2.y + (2 * player2.width / 3) * Math.sin(player2_angle * Math.PI / 180), 'duck_yellow');
            bullet2.setScale(0.25);
            bullet2.rotation = player2_angle * Math.PI / 180;
            canShot = false;
            
            // Colisión con los bordes del mundo
            bullet2.setCollideWorldBounds(true);

            // // Agregar manejador de eventos de colisión
            // this.physics.world.on('worldbounds', function (body) {
            //     // Verificar si la colisión involucra la bala
            //     if (body.gameObject === bullet2) {
            //         // Desactivar y ocultar la bala cuando colisiona con los bordes del mundo
            //         bullet2.setActive(false).setVisible(false);
            //     }
            // });
        }

        player2.rotation = player2_angle*Math.PI/180;

        let player2_data = {
            x: player2.x,
            y: player2.y,
            r: player2.rotation
        };

        socket.send(JSON.stringify(player2_data));

        if (bullet2 == undefined) {
            return;
        }
    
        bullet2.y -= BULLET_SPEED * Math.cos(bullet2.rotation);
        bullet2.x += BULLET_SPEED * Math.sin(bullet2.rotation);
    
        let bullet2_data = {
            bx: bullet2.x,
            by: bullet2.y,
            br: bullet2.rotation
        }
    
        socket.send(JSON.stringify(bullet2_data));
    }
}