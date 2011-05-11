var http = require('http'),  
    io = require('socket.io'), // for npm, otherwise use require('./path/to/socket.io') 

server = http.createServer(function(req, res){ 
 // your normal server code 
 res.writeHead(200, {'Content-Type': 'text/html'}); 
 res.end('<h1>Hello world</h1>'); 
});
server.listen(4000);
  
// socket.io 
var socket = io.listen(server); 
socket.on('connection', function(client){ 
  // new client is here! 
  client.on('message', function(ms){console.log(ms);}) 
  client.on('disconnect', function(){}) 
}); 