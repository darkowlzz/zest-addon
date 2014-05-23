// Control buttons
var lockTab = document.getElementById('lockTab');
lockTab.onclick = function() {
  console.log('lock clicked');
  addon.port.emit('LOCKTAB');
}

var zestON = document.getElementById('zestButtonON');
zestON.onclick = function() {
  addon.port.emit('RECORDON');
}

var zestOFF = document.getElementById('zestButtonOFF');
zestOFF.onclick = function() {
  addon.port.emit('RECORDOFF');
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
