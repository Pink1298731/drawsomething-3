var app = require('express')();

// 为什么要这样？可以直接app.listen
// app是一个requestListener，处理request请求，但是这没有必要啊，app本来就是
// 可能这个教程也是比较早了吧，现在的express在app.listen的时候传入this创建server，并且返回server的listen方法
var server = require('http').createServer(app);

var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  // res.send('<h1>Hello world</h1>');
   res.sendFile(__dirname + '/index.html');
});

// var io = require('socket.io')(3000);


io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('this', { will: 'be received by everyone'});
  io.emit('connection info','a user connected');
  socket.on('ferret', function (name, fn) {
    fn('woot');
    console.log(name);
  });
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function(){
  	io.emit('connection info','a user disconnected');
    console.log('user disconnected');
  });
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});