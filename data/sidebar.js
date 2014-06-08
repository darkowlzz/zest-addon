var ZestRecorderStatus = false;

// Control buttons
var lockTab = document.getElementById('lockTab');
lockTab.onclick = function() {
  addon.port.emit('LOCKTAB');
}

// Handle zest recorder button clicks
var zestON = document.getElementById('zestButtonON');
var recCircle = document.getElementById('recCircle');
zestON.onclick = function() {
  ZestRecorderStatus = !ZestRecorderStatus;
  if (ZestRecorderStatus) {
    addon.port.emit('RECORDON');
    zestON.textContent = 'Stop Recording';
    recCircle.classList.toggle('blink');
  }
  else {
    addon.port.emit('RECORDOFF');
    zestON.textContent = 'Start Recording';
    recCircle.classList.toggle('blink');
  }
}

// Handle clear logs button click
var clearRec = document.getElementById('clearRecords');
clearRec.onclick = function() {
  addon.port.emit('CLEAR');

  // Clear main content area
  var main = document.getElementById('zestText');
  main.value = '';

  // Clear the request log list
  var list = document.getElementById('recordList');
  while(list.hasChildNodes()) {
    list.removeChild(list.lastChild);
  }
}

// Handle response body checkbox
var respPref = document.getElementById('withRespBody');
respPref.onchange = function() {
  addon.port.emit('WITHRESPBODY', respPref.checked);
}

// Receive the request logs and list in recordList
addon.port.on('LOGREQUEST', function(zst) {
  var list = document.getElementById('recordList');
  var ele = document.createElement('div');
  ele.classList.add('logElement');
  var url = zst.url;
  ele.title = url;

  // close button
  var close = document.createElement('span');
  close.setAttribute('class', 'button float-right');
  close.textContent = 'x';
  close.onclick = function() {
    list.removeChild(ele);
  }

  var title = document.createElement('span');
  // slice the url if they are too long
  if (url.length > 52) {
    var url = url.slice(0, 52) + '...';
  }
  title.textContent = url;

  ele.onclick = function() {
    addon.port.emit('SHOWJSON', zst.id);
  }

  ele.appendChild(title);
  ele.appendChild(close);
  list.appendChild(ele);
});

// Receive view content and display in main content
addon.port.on('VIEWJSON', function(body) {
  var main = document.getElementById('zestText');
  main.value = body;
});

// Receive monitor status of tabs and update the indicator
addon.port.on('MONITORSIG', function(monitor) {
  var monitorTab = document.getElementById('monitorTab');
  var lockBtn = document.getElementById('lockTab');
  if (monitor) {
    monitorTab.classList.remove('monitorOFFcolor');
    monitorTab.classList.add('monitorONcolor');
    lockBtn.textContent = 'Unlock Tab';
  }
  else {
    monitorTab.classList.add('monitorOFFcolor');
    monitorTab.classList.remove('monitorONcolor');
    lockBtn.textContent = 'Lock Tab';
  }
});

// Get zest content textbox text wrap state
function getTextWrapState() {
  var zestText = document.getElementById('zestText');
  if (zestText.wrap == 'off') {
    return false;
  }
  else if (zestText.wrap == 'on') {
    return true;
  }
  return null;
}

// Handle text wrap context menu item 
var textWrapCM = document.getElementById('textWrapCM');
textWrapCM.onclick = function() {
  var textWrap = getTextWrapState();
  var zestText = document.getElementById('zestText');
  if (!textWrap) {
    zestText.wrap = 'on';
    textWrapCM.label = 'Disable Text Wrap';
  }
  else {
    zestText.wrap = 'off';
    textWrapCM.label = 'Enable Text Wrap';
  }
}

// Handle Save Zest File context menu item
var saveAsCM = document.getElementById('saveAsCM');
saveAsCM.onclick = function() {
  var zestText = document.getElementById('zestText');
  addon.port.emit('SAVEZEST', zestText.value);
}
