var express=require("express");
var app=express();
var server=require("http").createServer(app);
var io=require('socket.io')(server);
const hostname = '127.0.0.1';
const port=process.env.Port||3000;

server.listen(port,hostname,function(){
  console.log(`Server is running at http://${hostname}:${port}/`);
});

// Routing
app.use(express.static(__dirname + '/public'));

var numUsers=0;

io.on('connection',socket=>{
  var addedUser=false;
  console.log('new connection');
  socket.on('new message',data=>{
    console.log('new message '+data);
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('add user',username=>{
    console.log('add user '+username);
    if(addedUser) return;
    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser=true;
    socket.emit('login',{
      numUsers: numUsers
    })
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined',{
      username:socket.username,
      numUsers:numUsers
    })

  });

  socket.on('typing',()=>{
    console.log('typing');
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  })

  socket.on('stop typing',()=>{
    console.log('stop typing');
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  socket.on('disconnect',()=>{
    console.log('disconnect');
    if(addedUser){
      numUsers--;
      socket.broadcast.emit("user left",{
        username:socket.username,
        numUsers:numUsers
      })
    }
  });

});