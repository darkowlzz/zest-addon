var ZestRecorderStatus = false;
var ZestGUIView = true;
var currentZest = '';

var switchBut = document.getElementById('switch');
switchBut.onclick = function() {
  ZestGUIView = !ZestGUIView;
  var gui = document.getElementById('GUI');
  if (ZestGUIView) {
    gui.style.zIndex = "2";
  }
  else {
    gui.style.zIndex = "0";
  }
}

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

  // Clear tree-view
  $('#tree').dynatree('getRoot').removeChildren();

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
  close.title = 'Delete this item.';
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
  currentZest = body;
  var main = document.getElementById('zestText');
  main.value = body;
  createGUI();
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

/* Textview context menu item handler */

// Save Zest File
var saveAsCM = document.getElementById('saveAsCM');
saveAsCM.onclick = function() {
  var zestText = document.getElementById('zestText');
  addon.port.emit('SAVEZEST', zestText.value);
}

// Change Title
var changeTitle = document.getElementById('changeTitle');
changeTitle.onclick = function() {
  var title = prompt('Enter title: ');
  changeZest('title', title);
}

// Change Author
var changeAuthor = document.getElementById('changeAuthor');
changeAuthor.onclick = function() {
  var author = prompt('Enter author: ');
  changeZest('author', author);
}

// Change Description
var changeDesc = document.getElementById('changeDesc');
changeDesc.onclick = function() {
  var desc = prompt('Enter description: ');
  changeZest('description', desc);
}

/* Treeview context menu item handler */

// Save Zest File
var saveAsTv = document.getElementById('saveAsTvCM');
saveAsTv.onclick = function() {
  var zestText = document.getElementById('zestText');
  addon.port.emit('SAVEZEST', zestText.value);
}


// Change zest text property
function changeZest(property, value) {
  var zestText = document.getElementById('zestText');
  var z = JSON.parse(zestText.value);
  z[property] = value;
  var z = JSON.stringify(z, undefined, 2);
  zestText.value = z;
}

function updateView() {
  var zestText = document.getElementById('zestText');

  zestText.value = JSON.stringify(currentZest, undefined, 2);
}


/**
 * Using JQuery below for dynatree 
 * NOTE: Update the above code to use jquery
 */

$(function(){
  $('#tree').dynatree({});
});

function createGUI() {
  $('#tree').dynatree('getRoot').removeChildren();

  var z = JSON.parse(currentZest);

  var numOfReq = z.statements.length;
  var kids = [];
  var temp = null;
  var temp2 = null;
  for (var i of z.statements) {
    temp2 = []
    if (i.assertions[0].rootExpression.elementType == 'ZestExpressionStatusCode') {
      temp2.push({title: 'Assert - Status Code (' + i.assertions[0].rootExpression.code + ')' })
    }
    if (i.assertions[1].rootExpression.elementType == 'ZestExpressionLength') {
      temp2.push({title: 'Assert - Length (response.body = ' + i.assertions[1].rootExpression.length + ')'});
    }

    temp = {
      title: (i.method + ' : ' + i.url), isFolder: true,
        children: temp2
    }
    kids.push(temp);
  }

  $('#tree').dynatree('getRoot').addChild(
      {title: z.statements[0].url, isFolder: true, key: 'folder1', expand: true,
        children: kids
      }
  );
}
