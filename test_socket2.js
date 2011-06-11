var express = require('express');
var sockets = require('socket.io');
var form = require('connect-form');
var JSON = require('./JSON/json2.js').JSON;

var app = express.createServer(form({ keepExtensions: true }));
var socket = sockets.listen(app);
require('jade');
app.set('view engine', 'html');
app.set('view options', {layout: false});
app.get('/*.(js|css)', function(req, res){
  res.sendfile("./public"+req.url);
});



app.get('/*.(gif|jpg|png|ogg)', function(req, res){
	if(req.url.indexOf("/css/")!=-1){
		res.sendfile("./public"+req.url);
	}
	else{
		res.sendfile("/tmp"+req.url);
	}
});

app.get('/*.(jhtm|html)', function(req, res){
    myFile = req.url;
    if(req.url.indexOf("?")!=-1){
        myFile=myFile.substring(0,req.url.indexOf("?"));
    }
  res.sendfile("./views"+myFile);
});

app.get('/', function(req, res){
    res.sendfile('index.html');    
});

app.post('/*.html', function(req, res, next){
  req.form.complete(function(err, fields, files){
    if (err) {
      next(err);
    } else {
      
      console.log('\nuploaded %s to %s'
        ,  files.image.filename
        , files.image.path);
        type = fields.type;
        if(fields.to=="Main"){
            socket.broadcast(JSON.stringify({msg:files.image.path.toString().substring(5),scope:"public",type:type,from:fields.from}));
        }
        else{
            for(i in socket.clients){
                if(socket.clients[i].name&&socket.clients[i].name===fields.to){
                    socket.clients[i].send(JSON.stringify({msg:files.image.path.toString().substring(5),scope:"private",type:type,from:fields.from}));
                }
            }
        }
      res.redirect('back');
    }
  });

  req.form.on('progress', function(bytesReceived, bytesExpected){
    var percent = (bytesReceived / bytesExpected * 100) | 0;
    process.stdout.write('Uploading: %' + percent + '\r');
  });
});



var activeClients = 1;



socket.on('connection', function(client){ 

  var nick="";
  client.on('disconnect', function(){
    socket.broadcast(JSON.stringify({type:"delUser",msg:"delUser",scope:"public",from:nick}));
  });
  client.on('message',function(data,e){
      console.log(data);
      data = JSON.parse(data);

  	if(data.type==="nickReq"){
  	    taken = false;
  	    for(i in socket.clients){
            if(socket.clients[i].name&&socket.clients[i].name===data.msg){
                taken = true;
            }
        }
        if(!taken){
            nick=data.msg;
            client.name=nick;
            console.log(nick);
            client.send(JSON.stringify({type:"confirmNick",msg:data.msg,scope:"private",from:nick}));
            socket.broadcast(JSON.stringify({type:"addUser",msg:"addUser",scope:"public",from:socket.clients[i].name}));
            for(i in socket.clients){
                console.log(i);
                if(socket.clients[i].name&&socket.clients[i].name!=nick){
                    client.send(JSON.stringify({type:"addUser",msg:"addUser",scope:"private",from:socket.clients[i].name}));
                }
            }
        }
        else{
            client.send(JSON.stringify({type:"nickTaken",msg:data.msg,scope:"private",from:""}));
        }
  	}
  	else if(data.type==="broadcast"){
  	  socket.broadcast(JSON.stringify({msg:data.msg,scope:"public",from:nick,type:"message"}));	
  	}else if(data.type==="private"){
  	    for(i in socket.clients){
  	        if(socket.clients[i].name&&socket.clients[i].name===data.to){
  	            socket.clients[i].send(JSON.stringify({msg:data.msg,scope:"private",from:nick,type:"message"}));
  	        }
  	    }
  	}
  });
});
app.listen(3001);

