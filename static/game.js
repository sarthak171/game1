function game(){
  document.body.style.cursor = "crosshair";

  var socket = io();
  var id;
  var room_num;

  var toRadians = Math.PI/180;
  var gameSize;

  var zoom_val;
  var xdif;
  var ydif;

  var mouse = {
    x:0,
    y:0,
    mouseDown:false
  }

  var size = {
    width: window.innerWidth || document.body.clientWidth,
    height: window.innerHeight || document.body.clientHeight
  }

  var movement = {
    up: false,
    down: false,
    left: false,
    right: false,
    dash: false
  }

  var side = 40;
  var height = (Math.sqrt(3)*side)/2;
  var reserve = initiateReserve();
  var zoom_val;

  function initiateReserve() {
    var i, j, k;
    var arr1 = {};
    var arr2 = {};
    var arr3 = {};
    for(i = 0; i<10; i++) {
      arr2 = {};
      for(j = 0; j<6; j++) {
        var xref = Math.sin((j*60-30)*toRadians)*(side/2+side*(i));
        var yref = Math.cos((j*60-30)*toRadians)*(side/2+side*(i));
        var x = xref + Math.sin((j*60+60)*toRadians)*(height/3);
        var y = yref + Math.cos((j*60+60)*toRadians)*(height/3);
        for(k = 0 ; k<i*2; k++) {
          arr3 = {
            x:x,
            y:y,
            dir:180+180*((j*(i*2+1)+k)%2),
            height:height
          };
          arr2[j*(i*2+1)+k]=arr3;
          x += Math.sin((j*60+120-60*(k%2))*toRadians)*(2*height/3);
          y += Math.cos((j*60+120-60*(k%2))*toRadians)*(2*height/3);
        }
        arr3 = {
          x:x,
          y:y,
          dir:180+180*((j*(i*2+1)+k)%2),
          height:height
        };
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
    room_num = data[1];
    reserve = data[2];
    id = data[3];
  });
  socket.on('room_num',function(data){
    room_num= data;
  });

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
      case 70: //F
        movement.dash = true;
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
      case 70: //F
        movement.dash = false;
        break;
    }
  });


  document.onmousedown = function(event){
    mouse.mouseDown = true;

    mouse.x = (event.clientX-size.width/2)/zoom_val;
    mouse.y = (event.clientY-size.height/2)/zoom_val;
  }

  document.onmouseup = function(event) {
    mouse.mouseDown = false;

    mouse.x = (event.clientX-size.width/2)/zoom_val;
    mouse.y = (event.clientY-size.height/2)/zoom_val;
  }

  document.onmousemove = function (event) {
    mouse.x = (event.clientX-size.width/2)/zoom_val;
    mouse.y = (event.clientY-size.height/2)/zoom_val;
  }

  socket.emit('new player');

  var updatesId = setInterval(function() {

    console.log('interval');

    updateSize();
    socket.emit('movement', movement);
    socket.emit('mouse', mouse);
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

    console.log('state');

    if(id==null) {
      return;
    }

    var player = players[id];

    zoom_val=1.5/player.zoom;
    canvas.width = size.width;
    canvas.height = size.height;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, size.width, size.height);

    xdif = (size.width/zoom_val)/2-player.x;
    ydif = (size.height/zoom_val)/2-player.y;

    ctx.save();
    ctx.scale(zoom_val,zoom_val);
    drawGraph(50, zoom_val);
    drawPlayers(players);
    drawBullets(players);
    checkDeath(players);

    ctx.restore();
  });

  function drawGraph(dist, zoom_val) {
    ctx.strokeStyle = "#323232";

    var i;
    for(i = xdif%50; i<size.width/zoom_val; i+=dist) {
      var loc = i-xdif;
      if(loc>=0 && loc<=gameSize.x) {
        var y1 = Math.max(0, ydif);
        var y2 = Math.min(size.height/zoom_val, gameSize.y+ydif);
        drawLine(i, y1, i, y2, 5, "#323232");
      }
    }

    var j;
    for(j = ydif%50; j<size.height/zoom_val; j+=dist) {
      var loc = j-ydif;
      if(loc>=0 && loc<=gameSize.y) {
        var x1 = Math.max(0, xdif);
        var x2 = Math.min(size.width/zoom_val, gameSize.x+xdif);
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

  function drawPlayers(players) {
    for (var i in players) {
      drawBody(players[i]);
    }
  }

  function drawBody(player) {
    var c = "#f1c232";
    if(player.id == id) {
      c = "#ab3c3c";
    }

    for(i in player.body) {
      for(j in player.body[i]) {
        if(player.body[i][j] == true) {
          var triangle = reserve[i][j];
          var color = c;
          if(i<1) {
            color = "#323232";
          }
          drawTriangle(triangle.x+player.x, triangle.y+player.y, triangle.dir, triangle.height, color);
        }
      }
    }
  }

  function drawBullets(players) {
    for(i in players) {
      var c = "#f1c232";
      if(players[i].id == id) {
        c = "#ab3c3c";
      }
      for (j in players[i].bullets) {
        var triangle = players[i].bullets[j];
        drawTriangle(triangle.x, triangle.y, triangle.dir, triangle.height, c);
      }
    }
  }


  function drawTriangle(x, y, dir, height, color) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = color;

    var xcord = {};
    var ycord = {};

    for(var i = 0 ; i<3; i++) {
      xcord[i] = xdif+x+2.0/3*height*Math.sin((dir+i*120)*toRadians);
      ycord[i] = ydif+y+2.0/3*height*Math.cos((dir+i*120)*toRadians);
    }

    ctx.beginPath();
    ctx.moveTo(xcord[0], ycord[0]);
    ctx.lineTo(xcord[1], ycord[1]);
    ctx.lineTo(xcord[2], ycord[2]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function checkDeath(players) {
    for (i in players[id].body[0]) {
      if(players[id].body[0][i] == true) {
        return;
      }
    }

    stop();
  }

  function stop() {
    clearInterval(updatesId);
    socket.emit('disconnect');
    //mainShowCss();
  }
}
