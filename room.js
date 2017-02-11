var app = require('express')();

var http = require('http').createServer(app);

var io = require('socket.io')(http);

app.get('/', function(req, res){
  // res.send('<h1>Hello world</h1>');
   res.sendFile(__dirname + '/index.html');
});

// io.emit('some event', { for: 'everyone' });
// var io = require('socket.io')(3000);
var chat = io
  .of('/chat')
  .on('connection', function (socket) {
  	console.log("chat connection");
    socket.emit('a message', {
        that: 'only'
      , '/chat': 'will get'
    });
    chat.emit('a message', {
        everyone: 'in'
      , '/chat': 'will get'
    });
  });

var news = io
  .of('/news')
  .on('connection', function (socket) {
  	console.log("news connection");
    socket.emit('item', { news: 'item' });
  });
