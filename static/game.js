var socket = io();
var id;
var room_num;
var gameSize;

var size = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight
}

var movement = {
  up: false,
  down: false,
  left: false,
  right: false
}

var side = 40;
var height = (Math.sqrt(3)*side)/2;
var reserve = initiateReserve();

function initiateReserve() {
  var i, j, k;
  var arr1 = {};
  var arr2 = {};
  var arr3 = {};
  for(i = 0; i<10; i++) {
    arr2 = {};
    for(j = 0; j<6; j++) {
      var xref = Math.sin((j*60-30)*Math.PI/180)*(side/2+side*(i));
      var yref = Math.cos((j*60-30)*Math.PI/180)*(side/2+side*(i));
      var x = xref + Math.sin((j*60+60)*Math.PI/180)*(height/3);
      var y = yref + Math.cos((j*60+60)*Math.PI/180)*(height/3);
      for(k = 0 ; k<i*2; k++) {
        arr3 = {
          x:x,
          y:y
        };
        arr2[j*(i*2+1)+k]=arr3;
        x += Math.sin((j*60+120-60*(k%2))*Math.PI/180)*(2*height/3);
        y += Math.cos((j*60+120-60*(k%2))*Math.PI/180)*(2*height/3);
      }
      arr3 = {x, y};
      arr2[j*(i*2+1)+i*2]=arr3;
    }
    arr1[i] = arr2;
  }
  return arr1;
}

socket.on('message', function(data) {
  console.log(data);
});

socket.on('initial', function(data) {
  gameSize = data[0];
  room_num = data[1]
  id = data[2];
});
socket.on('room_num',function(data){
  room_num= data;
  console.log(room_num);
})

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
    var loc = x+i-size.width/2;
    if(loc>=0 && loc<=gameSize.x) {
      var y1 = Math.max(0, size.height/2-y);
      var y2 = Math.min(size.height, size.height/2+(gameSize.y-y));
      drawLine(i, y1, i, y2, 5, "#323232");
    }
  }
  var j;
  for(j = (size.height/2-y)%50; j<size.height; j+=dist) {
    var loc = y+j-size.height/2;
    if(loc>=0 && loc<=gameSize.y) {
      var x1 = Math.max(0, size.width/2-x);
      var x2 = Math.min(size.width, size.width/2+(gameSize.x-x));
    drawLine(x1, j, x2, j, 5, "#323232");
    }
  }
}

function drawLine(x1, y1, x2, y2, width, color) {
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawPlayers(x, y, players) {
  var xdif = size.width/2-x;
  var ydif = size.height/2-y;
  ctx.fillStyle = "#ab3c3c";
  for (var i in players) {
    drawBody(players[i], xdif, ydif);
  }
}

function drawBody(player, xdif, ydif) {
  for(i in player.body) {
    for(j in player.body[i]) {
      if(player.body[i][j] == true) {
        drawTriangle(player, i, j, xdif, ydif);
      }
    }
  }
}

function drawTriangle(player, i, j, xdif, ydif) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = "#ab3c3c";
  if(i<1) {
    ctx.fillStyle = "#323232";
  }

  var triangle = reserve[i][j];
  var xcord = {};
  var ycord = {};

  for(var i = 0 ; i<3; i++) {
    xcord[i] = player.x+xdif+triangle.x+2.0/3*height*Math.sin((180+(j%2)*180+i*120)*Math.PI/180);
    ycord[i] = player.y+ydif+triangle.y+2.0/3*height*Math.cos((180+(j%2)*180+i*120)*Math.PI/180);
  }

  ctx.beginPath();
  ctx.moveTo(xcord[0], ycord[0]);
  ctx.lineTo(xcord[1], ycord[1]);
  ctx.lineTo(xcord[2], ycord[2]);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}