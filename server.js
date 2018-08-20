
// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

var players = {};
var room_nums = {};

var maxVel = 5;
var acceleration = 0.15;
var resistance = 0.02;

var Body = function() {
  var arr1 = [];
  var arr2 = [];

  for(var i = 0; i<6; i++) {
    arr2[i] = true;
  }
  arr1[0] = arr2;

  arr2 = [];
  for(var i = 0; i<18; i++) {
    arr2[i] = true;
  }
  arr1[1] = arr2;

  for(var i = 2; i<10; i++) {
    arr2 = [];
    for(var j = 0; j<6+12*i; j++) {
      arr2[j] = false;
    }
    arr1[i] = arr2;
  }

  return arr1;
}

var Player = function(id,room) {
  var p = {
    x:400,
	  y:300,
    xVel:0,
    yVel:0,
    body:Body(),
    aimX:0,
	  aimY:0,
    room:room,
	  id:id
  }
  return p;
}

io.on('connection', function(socket) {
  socket.on('new player', function() {
    var room = Math.ceil(Math.random()*2);
    room_nums[room] = room;
    players[socket.id] = Player(socket.id,room);
    socket.join(room);
    io.sockets.in(room).emit('room_num',room);
    io.sockets.connected[socket.id].emit('id', socket.id);
  });

  socket.on('movement', function(data) {
    var player = players[socket.id] || {};

    if(data.left) {
      player.xVel-=acceleration;
    }
    if(data.right) {
      player.xVel+=acceleration;
    }
    if(data.down) {
      player.yVel+=acceleration;
    }
    if(data.up) {
      player.yVel-=acceleration;
    }

    checkVel(player);
    addResistance(player);
    updateLocation(player);
  });

  socket.on('disconnect', function() {
    delete(players[socket.id]);
  });
});

function checkVel(player) {
  if(player.xVel>maxVel) {
    player.xVel = maxVel;
  }
  else if(player.xVel<-maxVel) {
    player.xVel = -maxVel;
  }
  if(player.yVel>maxVel) {
    player.yVel = maxVel;
  }
  else if(player.yVel<-maxVel) {
    player.yVel = -maxVel;
  }
}

function addResistance(player) {
  player.xVel*=(1-resistance);
  player.yVel*=(1-resistance);
}

function updateLocation(player) {
  player.x+=player.xVel;
  player.y+=player.yVel;
}

function checkPlayers(room){
  var arr = {};
  for(var i in players){
    if(players[i].room == room){
      arr[i]=players[i];
    }
  }
  return arr;
}

setInterval(function() {
  for(var i in room_nums){
    io.sockets.in(room_nums[i]).emit('state', checkPlayers(room_nums[i]));
  }
}, 1000 / 60);
