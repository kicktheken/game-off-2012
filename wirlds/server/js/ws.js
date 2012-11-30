// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'wirlds';

// taken out of http://martinsikora.com/nodejs-and-websocket-simple-chat-tutorial
// deployment

var WebSocketServer = require('websocket').server
var http = require('http');

var server = http.createServer(function(request,response){});
server.listen(8000, function(){});

var wss = new WebSocketServer({
    httpServer: server
});

wss.on('request', function(req) {
    var con = req.accept(null, req.origin);
    con.on('message', function(message) {
        if (message.type === 'utf8') {
            con.sendUTF('client says '+message.utf8Data+' server says hi!');
        }
        console.log(message);
    });
    con.on('close', function(conn) {
        console.log('connection closed');
    });
});

console.log('we are running yo...');

