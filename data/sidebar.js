var ZestRecorderStatus = false;

// Control buttons
var lockTab = document.getElementById('lockTab');
lockTab.onclick = function() {
  addon.port.emit('LOCKTAB');
}

var zestON = document.getElementById('zestButtonON');
zestON.onclick = function() {
  ZestRecorderStatus = !ZestRecorderStatus;
  if (ZestRecorderStatus) {
    addon.port.emit('RECORDON');
    zestON.textContent = 'Stop Recording';
  }
  else {
    addon.port.emit('RECORDOFF');
    zestON.textContent = 'Start Recording';
  }
}

var clearRec = document.getElementById('clearRecords');
clearRec.onclick = function() {
  addon.port.emit('CLEAR');

  // Clear main content area
  var main = document.getElementById('mainContent');
  main.textContent = '';

  // Clear the request log list
  var list = document.getElementById('recordList');
  while(list.hasChildNodes()) {
    list.removeChild(list.lastChild);
  }
}

// Receive the request logs and list in recordList
addon.port.on('LOGREQUEST', function(req) {
  var list = document.getElementById('recordList');
  var ele = document.createElement('div');
  var title = document.createElement('span');
  title.textContent = req.url;
  var open = document.createElement('button');
  open.onclick = function() {
    addon.port.emit('SHOWJSON', req.id);
  }
  open.textContent = 'open'
  ele.appendChild(title);
  ele.appendChild(open);
  list.appendChild(ele);
});

// Receive view content and display in main content
addon.port.on('VIEWJSON', function(body) {
  var main = document.getElementById('mainContent');
  main.textContent = body;
});

// Receive monitor status of tabs and update the indicator
addon.port.on('MONITORSIG', function(monitor) {
  var monitorSig = document.getElementById('monitorSig');
  if (monitor) {
    monitorSig.textContent = 'Tab monitor ON';
  }
  else {
    monitorSig.textContent = 'Tab monitor OFF';
  }
});
