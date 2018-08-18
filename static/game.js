var socket = io();
var id;

socket.on('message', function(data) {
  console.log(data);
});

socket.on('id', function(data) {
  id = data;
  console.log(id);
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
  socket.emit('movement', movement);
}, 1000 / 60);

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var ctx = canvas.getContext('2d');

socket.on('state', function(players) {
  if(id==null) {
    return;
  }

  var player = players[id];

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 800, 600);

  ctx.strokeStyle = 'white';
  var i;
  for(i = -player.x%50; i<800; i+=50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 600);
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  var j;
  for(j = -player.y%50; j<600; j+=50) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(800, j);
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  ctx.fillStyle = 'white';
  var xdif = player.camX-player.x;
  var ydif = player.camY-player.y;
  for (var i in players) {
    var p = players[i];
    ctx.beginPath();
    ctx.arc(p.x+xdif, p.y+ydif, 10, 0, 2 * Math.PI);
    ctx.fill();
  }
});
