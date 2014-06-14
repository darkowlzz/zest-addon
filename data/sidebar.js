/* Emit signal constants */
const SIG_LOCKTAB = 'LOCKTAB';
const SIG_RECORD_ON = 'RECORDON';
const SIG_RECORD_OFF = 'RECORDOFF';
const SIG_CLEAR_LOGS = 'CLEAR';
const SIG_WITH_RESPONSE_BODY = 'WITHRESPBODY';
const SIG_GET_JSON = 'SHOWJSON';
const SIG_SAVE_ZEST = 'SAVEZEST';
const SIG_IMPORT = 'IMPORTZEST';

/* Receive signal constants */
const SIG_LOG_REQUEST = 'LOGREQUEST';
const SIG_RCV_JSON = 'VIEWJSON';
const SIG_MONITOR_SIGNAL = 'MONITORSIG';
const SIG_LOG_IMPORT = 'LOGIMPORT';

/* Label constants */
const RECORD_ON = 'Start Recording';
const RECORD_OFF = 'Stop Recording';
const DELETE_LOG_ITEM = 'Delete this item';
const LOCK_ON = 'Lock Tab';
const LOCK_OFF = 'Unlock Tab';

const TEXT_WRAP = 'Enable Text Wrap';
const TEXT_UNWRAP = 'Disable Text Wrap';

const GET_TITLE = 'Enter new title: ';
const GET_AUTHOR = 'Enter author: ';
const GET_DESC = 'Enter description: ';

/* Other constants */
const LETTERS_LIMIT = 52;

/* Globals */
var ZestRecorderStatus = false;
var ZestGUIView = true;
var currentZest = '';
var importCount = 0;


/**** Sidebar first row buttons ****/

// Zest card view switch button handler
var switchBut = document.getElementById('switch');
switchBut.onclick = function() {
  ZestGUIView = !ZestGUIView;
  var gui = document.getElementById('treeview');
  if (ZestGUIView) {
    gui.style.zIndex = "2";
  }
  else {
    gui.style.zIndex = "0";
  }
}


/**** Sidebar third row buttons ****/

// Control buttons
var lockTab = document.getElementById('lockTab');
lockTab.onclick = function() {
  addon.port.emit(SIG_LOCKTAB);
}

// Handle zest recorder button clicks
var zestON = document.getElementById('zestButtonON');
var recCircle = document.getElementById('recCircle');
zestON.onclick = function() {
  ZestRecorderStatus = !ZestRecorderStatus;
  if (ZestRecorderStatus) {
    addon.port.emit(SIG_RECORD_ON);
    zestON.textContent = RECORD_OFF;
    recCircle.classList.toggle('blink');
  }
  else {
    addon.port.emit(SIG_RECORD_OFF);
    zestON.textContent = RECORD_ON;
    recCircle.classList.toggle('blink');
  }
}

// Handle clear logs button click
var clearRec = document.getElementById('clearRecords');
clearRec.onclick = function() {
  addon.port.emit(SIG_CLEAR_LOGS);

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
  addon.port.emit(SIG_WITH_RESPONSE_BODY, respPref.checked);
}


/**** Addon signal receivers ****/

// Receive the request logs and list in recordList
addon.port.on(SIG_LOG_REQUEST, function(zst) {
  var list = document.getElementById('recordList');
  var ele = document.createElement('div');
  ele.classList.add('logElement');
  var url = zst.url;
  ele.title = url;

  // close button
  var close = document.createElement('span');
  close.setAttribute('class', 'button float-right');
  close.textContent = 'x';
  close.title = DELETE_LOG_ITEM;
  close.onclick = function() {
    list.removeChild(ele);
  }

  var title = document.createElement('span');
  // slice the url if they are too long
  if (url.length > LETTERS_LIMIT) {
    var url = url.slice(0, LETTERS_LIMIT) + '...';
  }
  title.textContent = url;

  ele.onclick = function() {
    addon.port.emit(SIG_GET_JSON, zst.id);
  }

  ele.appendChild(title);
  ele.appendChild(close);
  list.appendChild(ele);
});

// Receive view content and display in main content
addon.port.on(SIG_RCV_JSON, function(body) {
  currentZest = body;
  var main = document.getElementById('zestText');
  main.value = body;
  createGUI();
});

// Receive monitor status of tabs and update the indicator
addon.port.on(SIG_MONITOR_SIGNAL, function(monitor) {
  var monitorTab = document.getElementById('monitorTab');
  var lockBtn = document.getElementById('lockTab');
  if (monitor) {
    monitorTab.classList.remove('monitorOFFcolor');
    monitorTab.classList.add('monitorONcolor');
    lockBtn.textContent = LOCK_OFF;
  }
  else {
    monitorTab.classList.add('monitorOFFcolor');
    monitorTab.classList.remove('monitorONcolor');
    lockBtn.textContent = LOCK_ON;
  }
});

// Receive imported zest items and log them
addon.port.on(SIG_LOG_IMPORT, function(importedZest) {
  console.log('TITLE: ' + importedZest.title);
  console.log('ID: ' + importedZest.id);
});

/**** Textview context menu item handler ****/

// Text wrap
var textWrapCM = document.getElementById('textWrapCM');
textWrapCM.onclick = function() {
  var textWrap = getTextWrapState();
  var zestText = document.getElementById('zestText');
  if (!textWrap) {
    zestText.wrap = 'on';
    textWrapCM.label = TEXT_UNWRAP;
  }
  else {
    zestText.wrap = 'off';
    textWrapCM.label = TEXT_WRAP;
  }
}

// Save Zest File
var saveAsCM = document.getElementById('saveAsCM');
saveAsCM.onclick = function() {
  var zestText = document.getElementById('zestText');
  addon.port.emit(SIG_SAVE_ZEST, zestText.value);
}

// Change Title
var changeTitle = document.getElementById('changeTitle');
changeTitle.onclick = function() {
  var title = prompt(GET_TITLE);
  changeZest('title', title);
}

// Change Author
var changeAuthor = document.getElementById('changeAuthor');
changeAuthor.onclick = function() {
  var author = prompt(GET_AUTHOR);
  changeZest('author', author);
}

// Change Description
var changeDesc = document.getElementById('changeDesc');
changeDesc.onclick = function() {
  var desc = prompt(GET_DESC);
  changeZest('description', desc);
}

/**** Treeview context menu item handler ****/

// Save Zest File
var saveAsTv = document.getElementById('saveAsTvCM');
saveAsTv.onclick = function() {
  var zestText = document.getElementById('zestText');
  addon.port.emit(SIG_SAVE_ZEST, zestText.value);
}

// Import Zest File
var importZest = document.getElementById('importZest');
importZest.onclick = function() {
  addon.port.emit(SIG_IMPORT);
}

/**** Helper functions ****/

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

function createZestImport(zst) {
  importCount++;
  return {
           zest: zst, 
           id: importCount
         }
}


/**
 * Using JQuery below for dynatree 
 * NOTE: Update the above code to use jquery
 */

// Initialize the treeview
$(function(){
  $('#tree').dynatree({});
});

// Redraw the treeview
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
