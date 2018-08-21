//Dependencies
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

var toRadians = Math.PI/180;

var gameSize = {
  x:5001,
  y:5001
}

var players = {};
var room_nums = {};
var rooms = 2;

var maxVel = 5;
var acceleration = 0.15;
var resistance = 0.02;

var bulletVel = 10;

var Body = function() {
  var arr1 = {};
  var arr2 = {};

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
    bullets:new Array(),
    aimX:0,
    aimY:0,
    click:true,
    zoom:1.5,
    room:room,
    id:id
  }
  return p;
}

io.on('connection', function(socket) {
  socket.on('new player', function() {
    var room = Math.ceil(Math.random()*rooms);
    room_nums[room] = room;

    players[socket.id] = Player(socket.id,room);
    socket.join(room);

    var data = {};
    data[0] = gameSize;
    data[1] = room;
    data[2] = socket.id;
    io.sockets.connected[socket.id].emit('initial', data);
  });

  socket.on('movement', function(data) {
    var player = players[socket.id] || {};

    move(player, data);
    moveBullets(player);
    checkBorders(player);
    checkVel(player);
    addResistance(player);
    updateLocation(player);
  });

  socket.on('mouse', function(data) {
    var player = players[socket.id] || {};
    player.aimX = data.x+player.x;
    player.aimY = data.y+player.y;
    if(data.mouseDown == true) {
      addBullet(player);
    }
  });

  socket.on('disconnect', function() {
    delete(players[socket.id]);
  });
});

function move(player, data) {
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
}

function moveBullets(player) {
  for(var i in player.bullets) {
    var bullet = player.bullets[i];
    bullet.x+=Math.sin(bullet.dir*toRadians)*bulletVel;
    bullet.y+=Math.cos(bullet.dir*toRadians)*bulletVel;
  }
}

function checkBorders(player) {
  if(player.x<0) {
    player.x = 0;
    player.xVel = 0;
  }
  if(player.x>gameSize.x) {
    player.x = gameSize.x;
    player.xVel = 0;
  }
  if(player.y<0) {
    player.y = 0;
    player.yVel = 0;
  }
  if(player.y>gameSize.y) {
    player.y = gameSize.y;
    player.yVel = 0;
  }

  for(i in player.bullets) {
    if(player.bullets[i].x<0||player.bullets[i].x>gameSize.x) {
      player.bullets.splice(i, 1);
    }
    else if(player.bullets[i].y<0||player.bullets[i].y>gameSize.y) {
      player.bullets.splice(i, 1);
    }
  }
}

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

function addShield(player) {
  var arr = player.body;
  for(i in arr) {
    for (j in arr[i]) {
      if(arr[i][j] == false) {
        arr[i][j] = true;
        player.zoom+=.0015;
        return;
      }
    }
  }
}

function addBullet(player) {
  var arr = player.bullets;
  var dir = getAngle(player.x, player.y, player.aimX, player.aimY);
  var bullet = {
    x:player.x,
    y:player.y,
    height:20,
    dir:dir,
    birth:new Date().getTime()
  }
  arr.push(bullet);

}

function getAngle(x1, y1, x2, y2) {
  var dir = 360-Math.atan2(y2-y1, x2-x1)/toRadians+90;
  console.log(dir);
  return dir;
}

setInterval(function() {
  for(var i in room_nums){
    io.sockets.in(room_nums[i]).emit('state', checkPlayers(room_nums[i]));
  }
}, 1000 / 60);
