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

wsServer.on('connection', function (conn) {
    console.log('EVENT: Connection');

    if (player1_conn == undefined) {
        
        player1_conn = conn;

        player1_conn.send('{"player_num": 1}');

        player1_conn.on('message', function(data) {
            if (player2_conn == undefined) {
                return;
            }

            player2_conn.send(data.toString());

            console.log(data.toString());
        });
    }
    else if (player2_conn == undefined) {
        
        player2_conn = conn;
        
        player2_conn.send('{"player_num": 2}');
       
        player2_conn.on('message', function(data) {
            if (player1_conn == undefined) {
                return;
            }

            player1_conn.send(data.toString());
            
            console.log(data.toString());
        });
    }

    // conn.on('message', function(data) {
    //     console.log(data.toString());
    // });
});