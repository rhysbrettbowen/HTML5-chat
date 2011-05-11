function msgReceived(msg){
  //$clientCounter.html(msg.clients);
  $('#Chat ul').append('<li>' + msg.output + '</li>');
}
var socket;
$(document).ready(function () {
  //$clientCounter = $("#client_count")

  socket = new io.Socket(null, {port: 3000});
  socket.connect();
  socket.on('message', function(msg){msgReceived(msg)});
});
//alert("this");

$('#send').click(function(event){
    alert($('#entry').attr('value'));
    socket.send($('#entry').attr('value'));
});

$('#entry').keypress(function(event) {
          alert(event.keyCode);
          if (event.keyCode != 13) return;
          var msg = $('#entry').attr('value');
          if (msg) {
            socket.send(msg);
            $('#entry').attr('value', '');
          }
        });
        
function sendMe(val){
    if(val==".help"){
        msgReceived({output:".help<br>.users<br>.private [username]"});
    }
    else
        socket.send(val);
    document.getElementById("entry").value="";
}
