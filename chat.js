var socket = io();
 $('form').submit(function(){
    socket.emit('chat message', $('#m').val());

    $('#m').val('');
    return false;
});
socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
  socket.emit('ferret', 'tobi', function (data) {
    console.log(data); // data will be 'woot'
  });
});
socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
});
socket.on('connection info', function(msg){
  $('#messages').append($('<li>').text(msg));
});
socket.on('this', function(msg){
  alert(msg.will);
});