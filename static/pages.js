function clear() {
  document.getElementById('box1').style.visibility = 'hidden';
  document.getElementById('main').style.visibility = 'hidden';
  document.getElementById('form').style.visibility = 'hidden';
  document.getElementById('ctrlspage').style.visibility = 'hidden';
  document.getElementById('creditspage').style.visibility = 'hidden';
}

function mainShowCss() {
  document.getElementById('box1').style.visibility = 'visible';
  document.getElementById('main').style.visibility = 'visible';
  document.getElementById('form').style.visibility = 'visible';
}

function startCss() {
  clear();
}

function ctrlsShowCss(){
  document.getElementById('form').style.visibility = 'hidden';
  document.getElementById('ctrlspage').style.visibility = 'visible';
}

function ctrlsBackCss() {
  document.getElementById('ctrlspage').style.visibility = 'hidden';
  document.getElementById('form').style.visibility = 'visible';
}

function creditsShowCss() {
  document.getElementById('form').style.visibility = 'hidden';
  document.getElementById('creditspage').style.visibility = 'visible';
}
function creditsBackCss() {
  document.getElementById('creditspage').style.visibility = 'hidden';
  document.getElementById('form').style.visibility = 'visible';
}
