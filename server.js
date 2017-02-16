var express=require("express");
var app=express();
var server=require("http").createServer(app);
var io=require('socket.io')(server);
const hostname = '127.0.0.1';
// const hostname = "192.168.1.112";
const port=process.env.Port||3000;
var words=["西瓜","苹果","梨","葡萄","菠萝"];
server.listen(port,hostname,function(){
  console.log(`Server is running at http://${hostname}:${port}/`);
});

// Routing
app.use(express.static(__dirname + '/public'));

var numUsers=0;
var usernames=[];
var startuser=[];
var wordsNow=0;
var userNow=0;

function onConnection(socket){
  var addedUser=false;
  console.log('new connection');

  socket.on('new message',data=>{
    console.log('new message '+data);
    console.log(words[wordsNow]);
    // we tell the client to execute 'new message'
    if(data===words[wordsNow]){
      io.emit('guess right', {
        username: socket.username
      });
      dispatch();
    }
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
    usernames.push(username);
    ++numUsers;
    addedUser=true;
    socket.emit('login',{
      username:username,
      numUsers: numUsers,
      usernames:usernames,
      startuser:startuser
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined',{
      username:socket.username,
      usernames:usernames,
      numUsers:numUsers
    });

  });

  socket.on('start game',(data)=>{
    console.log('start game '+data.username);
    console.log(usernames);
    console.log(startuser);
    startuser.push(data.username);
    socket.broadcast.emit('one start',{
      username:data.username
    });
    if(startuser.length===usernames.length){
      io.emit("started");
      dispatch();
    }
  });

  function dispatch(){
    wordsNow++;
    wordsNow%=words.length;
    userNow++;
    userNow%=usernames.length;
    io.emit('guess',{
      words:words[wordsNow],
      username:usernames[userNow]
    });
  }

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

  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

  socket.on('disconnect',()=>{
    console.log('disconnect');
    if(addedUser){
      numUsers--;
      socket.broadcast.emit("user left",{
        username:socket.username,
        numUsers:numUsers
      });
      usernames=usernames.filter(item=> item!==socket.username);
      startuser=startuser.filter(item=>item!=socket.username);
    }
  });
}
io.on('connection',onConnection);