var express = require('express');
var sockets = require('socket.io');
var formidable = require('formidable');
var form = require('connect-form');


var app = express.createServer(form({ keepExtensions: true }));
var socket = sockets.listen(app);
require('jade');
app.set('view engine', 'html');
app.set('view options', {layout: false});
app.get('/*.(js|css)', function(req, res){
  res.sendfile("./public"+req.url);
});

app.get('/*.(gif|jpg|png)', function(req, res){
	//console.log("/tmp"+req.url);
	if(req.url.indexOf("/css/")!=-1)
		res.sendfile("./public"+req.url);
	else
		res.sendfile("/tmp"+req.url);
});


app.get('/*.(jhtm|html)', function(req, res){
  res.sendfile("./views"+req.url);
});

app.get('/', function(req, res){
    res.sendfile('index.html');    
});

app.post('/', function(req, res, next){

  // connect-form adds the req.form object
  // we can (optionally) define onComplete, passing
  // the exception (if any) fields parsed, and files parsed
  req.form.complete(function(err, fields, files){
    if (err) {
      next(err);
    } else {
        console.log(files.image.path);
      console.log('\nuploaded %s to %s'
        ,  files.image.filename
        , files.image.path);
      res.redirect('back');
    }
  });

  // We can add listeners for several form
  // events such as "progress"
  req.form.on('progress', function(bytesReceived, bytesExpected){
    var percent = (bytesReceived / bytesExpected * 100) | 0;
    process.stdout.write('Uploading: %' + percent + '\r');
  });
});



var activeClients = 1;

socket.on('connection', function(client){ 
  //activeClients +=1;
  //socket.broadcast({clients:activeClients});
  client.on('disconnect', function(){clientDisconnect(client)});
  client.on('message',function(data,e){socket.broadcast({output:data});});

function clientDisconnect(client){
  //activeClients -=1;
  //client.broadcast({clients:activeClients})
}
});
app.listen(3000);

