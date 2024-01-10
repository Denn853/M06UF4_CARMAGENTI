let player_num = 0;

const socket = new WebSocket("ws://10.40.2.23:8080");

socket.addEventListener("open", function(event) {
});

socket.addEventListener("message", function(event) {
    console.log("Server: ", event.data);

    let data = JSON.parse(event.data);

    if (data.player_num != undefined) {
        player_num = data.player_num;
        console.log("Player number: ", player_num)
    }

});

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload,
        create,
        update
    }
}

const game = new Phaser.Game(config);

// CAR CONSTS
const CAR_SPEED = 5;
const CAR_ROTATION = 5;

// PLAYER VARIABLES
let player1;
let player2;

let player1_angle = 0;
let player2_angle = 0;

// INPUTS
let cursors
let keys


function preload ()
{
    this.load.image('green_car', 'assets/PNG/Cars/car_green_small_1.png');
    this.load.image('blue_car', 'assets/PNG/Cars/car_blue_small_1.png');
}

function create ()
{
    /// PLAYER
    player1 = this.add.image(200, 500, 'green_car');
    player2 = this.add.image(600, 500, 'blue_car');

    /// INPUTS
        // WASD
    keys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
    });

        // ARROWS
    cursors = this.input.keyboard.createCursorKeys();
}

function update ()
{
    /// MOVEMENT
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
    
    player1.rotation = player1_angle*Math.PI/180;

    var player_data = {
        x: player1.x,
        y: player1.y,
        r: player1.rotation
    };

    socket.send(JSON.stringify(player_data));
}