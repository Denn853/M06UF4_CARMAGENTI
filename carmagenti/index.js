let static = require('node-static');
let http = require('http');
let ws = require('ws');

let file = new static.Server('./public');
 
let httpServer = http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
});

let wsServer = new ws.WebSocketServer({server: httpServer});

httpServer.listen(8080);

let player1_conn;
let player2_conn;

let viewers = [];
let users_conn = 3;

wsServer.on('connection', function (conn) {
    console.log('EVENT: Connection');

    if (player1_conn == undefined) {
        
        player1_conn = conn;

        player1_conn.send('{"player_num": 1}');

        player1_conn.on('message', function(data) {
            if (player2_conn == undefined) {
                return;
            }

            viewers.forEach(viewer => {
                viewer.send(data.toString());
            });
            
            //console.log(data.toString());

            let message_data = JSON.parse(data);
            if (message_data.collided != undefined) {

                let game_over_data = { game_over: message_data.collided }
                let game_over = JSON.stringify(game_over_data);
                
                console.log("colision 1", game_over );
                player1_conn.send(game_over);
                player2_conn.send(game_over);

                viewers.forEach(viewer => {
                    viewer.send(game_over);
                });
            }
            else {
                player2_conn.send(data.toString());
            }
        });
    }
    else if (player2_conn == undefined) {
        
        player2_conn = conn;
        
        player2_conn.send('{"player_num": 2}');
       
        player2_conn.on('message', function(data) {
            if (player1_conn == undefined) {
                return;
            }  
            
            viewers.forEach(viewer => {
                viewer.send(data.toString());
            });
            //console.log(data.toString());

            let message_data = JSON.parse(data);
            if (message_data.collided != undefined) {

                let game_over_data = { game_over: message_data.collided };
                let game_over = JSON.stringify(game_over_data);

                console.log("colision 2", game_over );
                player1_conn.send(game_over);
                player2_conn.send(game_over);

                viewers.forEach(viewer => {
                    viewer.send(game_over);
                });
            }
            else {
                player1_conn.send(data.toString());
            }
        });
    }
    else {
        let data = `{"player_num": ${users_conn}}`;
        conn.send(data);
        
        console.log(`Viewers Num: ${users_conn - 2}`);
        
        users_conn++;
        viewers.push(conn);
    }
});