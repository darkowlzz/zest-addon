define(['signalConst',
        'labels',
        'treeView',
        'helper',
        ],
        function(signal, label, tree, helper) {

  return {
    start: function(addon) {

      /* Other constants */
      const LETTERS_LIMIT = 52;

      /* Globals */
      var ZestRecorderStatus = false;
      var ZestGUIView = true;
      var logView = true;
      var currentZest = '';

      /**
       * Recording modes:
       * 0 => Record per page load. This includes all the html, css, js and
       *      media files in the page.
       * 1 => Record continuously everything until the recorder is stopped.
       */
      var recordMode = 0;

      // Listener to change in mode and notify the recorder.
      var recMode = document.getElementById('recMode');
      recMode.onchange = function() {
        recordMode = parseInt(recMode.value);
        addon.port.emit('MODECHANGE', recordMode);
      }

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
        addon.port.emit(signal.SIG_LOCKTAB);
      }

      // Handle zest recorder button clicks
      var zestON = document.getElementById('zestButtonON');
      var recCircle = document.getElementById('recCircle');
      zestON.onclick = function() {
        ZestRecorderStatus = !ZestRecorderStatus;
        if (ZestRecorderStatus) {
          addon.port.emit(signal.SIG_RECORD_ON);
          zestON.textContent = label.RECORD_OFF;
          recCircle.classList.toggle('blink');
        }
        else {
          addon.port.emit(signal.SIG_RECORD_OFF);
          zestON.textContent = label.RECORD_ON;
          recCircle.classList.toggle('blink');
        }
      }

      // Handle clear logs button click
      var clearRec = document.getElementById('clearRecords');
      clearRec.onclick = function() {
        addon.port.emit(signal.SIG_CLEAR_LOGS);

        // Clear main content area
        var main = document.getElementById('zestText');
        main.value = '';

        // Clear tree-view
        tree.clear();

        // Clear the request log list
        var list = document.getElementById('recordList');
        while(list.hasChildNodes()) {
          list.removeChild(list.lastChild);
        }
      }

      // Handle response body checkbox
      var respPref = document.getElementById('withRespBody');
      respPref.onchange = function() {
        addon.port.emit(signal.SIG_WITH_RESPONSE_BODY, respPref.checked);
      }


      /**** Addon signal receivers ****/

      // Receive the request logs and list in recordList
      addon.port.on(signal.SIG_LOG_REQUEST, function(zst) {
        var list = document.getElementById('recordList');
        var ele = document.createElement('div');
        ele.classList.add('logElement');
        var url = zst.url;
        ele.title = url;

        // close button
        var close = document.createElement('span');
        close.setAttribute('class', 'button float-right');
        close.textContent = 'x';
        close.title = label.DELETE_LOG_ITEM;
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
          addon.port.emit(signal.SIG_GET_JSON, zst.id);
        }

        ele.appendChild(title);
        ele.appendChild(close);
        list.appendChild(ele);
      });

      // Receive view content and display in main content
      addon.port.on(signal.SIG_RCV_JSON, function(body) {
        currentZest = body;
        var main = document.getElementById('zestText');
        main.value = body;
        tree.createTree(currentZest);
      });

      // Receive monitor status of tabs and update the indicator
      addon.port.on(signal.SIG_MONITOR_SIGNAL, function(monitor) {
        var monitorTab = document.getElementById('monitorTab');
        var lockBtn = document.getElementById('lockTab');
        if (monitor) {
          monitorTab.classList.remove('monitorOFFcolor');
          monitorTab.classList.add('monitorONcolor');
          lockBtn.textContent = label.LOCK_OFF;
        }
        else {
          monitorTab.classList.add('monitorOFFcolor');
          monitorTab.classList.remove('monitorONcolor');
          lockBtn.textContent = label.LOCK_ON;
        }
      });

      // Receive imported zest and show in tree/text-views & import logs
      addon.port.on(signal.SIG_SHOW_IMPORT, function(importedZest) {
        currentZest = importedZest.zest;
        var main  = document.getElementById('zestText');
        main.value = currentZest;
        tree.createTree(currentZest);
      });

      /**** Textview context menu item handler ****/

      // Text wrap
      var textWrapCM = document.getElementById('textWrapCM');
      textWrapCM.onclick = function() {
        var textWrap = helper.getTextWrapState();
        var zestText = document.getElementById('zestText');
        if (!textWrap) {
          zestText.wrap = 'on';
          textWrapCM.label = label.TEXT_UNWRAP;
        }
        else {
          zestText.wrap = 'off';
          textWrapCM.label = label.TEXT_WRAP;
        }
      }

      // Save Zest File
      var saveAsCM = document.getElementById('saveAsCM');
      saveAsCM.onclick = function() {
        var zestText = document.getElementById('zestText');
        addon.port.emit(signal.SIG_SAVE_ZEST, zestText.value);
      }

      // Change Title
      var changeTitle = document.getElementById('changeTitle');
      changeTitle.onclick = function() {
        var title = prompt(label.GET_TITLE);
        helper.changeZest('title', title);
      }

      // Change Author
      var changeAuthor = document.getElementById('changeAuthor');
      changeAuthor.onclick = function() {
        var author = prompt(label.GET_AUTHOR);
        helper.changeZest('author', author);
      }

      // Change Description
      var changeDesc = document.getElementById('changeDesc');
      changeDesc.onclick = function() {
        var desc = prompt(label.GET_DESC);
        helper.changeZest('description', desc);
      }

      /**** Treeview context menu item handler ****/

      // Save Zest File
      var saveAsTv = document.getElementById('saveAsTvCM');
      saveAsTv.onclick = function() {
        var zestText = document.getElementById('zestText');
        addon.port.emit(signal.SIG_SAVE_ZEST, zestText.value);
      }

      // Import Zest File
      var importZest = document.getElementById('importZest');
      importZest.onclick = function() {
        addon.port.emit(signal.SIG_IMPORT);
      }

    }
  }

});
