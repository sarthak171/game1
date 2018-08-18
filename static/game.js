var socket = io();
var id;
var size = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight
};

socket.on('message', function(data) {
  console.log(data);
});

socket.on('id', function(data) {
  id = data;
});

var movement = {
  up: false,
  down: false,
  left: false,
  right: false
}

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});

socket.emit('new player');
setInterval(function() {
  updateSize();
  socket.emit('movement', movement);
}, 1000 / 60);

function updateSize() {
  size = {
    width: window.innerWidth || document.body.clientWidth,
    height: window.innerHeight || document.body.clientHeight
  }
}

var canvas = document.getElementById('canvas');
canvas.width = size.width;
canvas.height = size.height;
var ctx = canvas.getContext('2d');

socket.on('state', function(players) {
  if(id==null) {
    return;
  }

  canvas.width = size.width;
  canvas.height = size.height;

  var player = players[id];

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, size.width, size.height);

  drawGraph(player.x, player.y, 50);
  drawPlayers(player.x, player.y, players);

});

function drawGraph(x, y, dist) {
  ctx.strokeStyle = "#323232";
  var i;
  for(i = (size.width/2-x)%50; i<size.width; i+=dist) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size.height);
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  var j;
  for(j = (size.height/2-y)%50; j<size.height; j+=dist) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(size.width, j);
    ctx.lineWidth = 5;
    ctx.stroke();
  }
}

function drawPlayers(x, y, players) {
  var xdif = size.width/2-x;
  var ydif = size.height/2-y;
  ctx.fillStyle = "#ab3c3c";
  for (var i in players) {
    var p = players[i];
    ctx.beginPath();
    ctx.arc(p.x+xdif, p.y+ydif, 10, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function drawCore(core) {
  for(i in core) {

  }
}
