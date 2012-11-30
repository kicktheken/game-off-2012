// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
//"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'wirlds';

var http = require('http');
var httpProxy = require('http-proxy');

var proxy = new httpProxy.HttpProxy({
    target: {
        host: 'localhost',
        port: 8000
    }
});
var server = http.createServer(function(req,res){
    console.log(req);

    proxy.proxyRequest(req, res);
});

server.on('upgrade', function(req, socket, head) {
    console.log('forward');
    proxy.proxyWebSocketRequest(req, socket, head);
});

server.listen(8080);

console.log('we are running yo...');
