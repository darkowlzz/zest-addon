define(['signalConst', 'labels', 'treeView', 'helper'],
       function(signal, label, tree, helper) {

  return {
    start: function(addon) {

      /* Other constants */
      const LETTERS_LIMIT = 52;

      /* Globals */
      var ZestRecorderStatus = false;
      var ZestGUIView = true;
      var RunView = false;
      var logView = true;
      var currentZest = '';

      /**** Sidebar first row buttons ****/

      // Zest card view switch button handler
      var treeButton = document.getElementById('treeButton');
      treeButton.onclick = function() {
        helper.showCard('tree');
      }

      var textButton = document.getElementById('textButton');
      textButton.onclick = function() {
        helper.showCard('text');
      }

      var runViewButton = document.getElementById('runViewButton');
      runViewButton.onclick = function() {
        helper.showCard('run');
      }

      var runButton = document.getElementById('runButton');
      runButton.onclick = function() {
        addon.port.emit('RUNTHIS', currentZest);
        helper.clearResults();
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
          zestON.title = label.RECORD_OFF;
          zestON.src = 'images/cassette-red.png';
          recCircle.classList.toggle('blink');
        }
        else {
          addon.port.emit(signal.SIG_RECORD_OFF);
          zestON.title = label.RECORD_ON;
          zestON.src = 'images/cassette.png';
          recCircle.classList.toggle('blink');
        }
      }

      // Handle clear logs button click
      var clearRec = document.getElementById('clearRecords');
      clearRec.onclick = function() {
        addon.port.emit(signal.SIG_CLEAR_LOGS);

        // Clear text-view
        helper.clearTextView();

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
          if (ZestRecorderStatus) {
            alert('Please STOP the recorder first.');
          }
          else {
            addon.port.emit(signal.SIG_GET_JSON, zst.id);
          }
        }

        ele.appendChild(title);
        ele.appendChild(close);
        list.appendChild(ele);
      });

      // Receive view content and display in treeView and textView cards
      addon.port.on(signal.SIG_RCV_JSON, function(z) {
        currentZest = z.zest;
        helper.renderZestTextAs(currentZest);
        tree.createTree(z);
      });

      // Receive updated zest text
      addon.port.on('UPDATE_TEXT_VIEW', function(z) {
        helper.renderZestTextAs(z);
      });

      // Receive monitor status of tabs and update the indicator
      addon.port.on(signal.SIG_MONITOR_SIGNAL, function(monitor) {
        var monitorTab = document.getElementById('monitorTab');
        var lockBtn = document.getElementById('lockTab');
        if (monitor) {
          monitorTab.classList.remove('monitorOFFcolor');
          monitorTab.classList.add('monitorONcolor');
          lockBtn.title = label.LOCK_OFF;
          lockBtn.src = 'images/lock.png';
        }
        else {
          monitorTab.classList.add('monitorOFFcolor');
          monitorTab.classList.remove('monitorONcolor');
          lockBtn.title = label.LOCK_ON;
          lockBtn.src = 'images/unlock.png';
        }
      });

      // Receive imported zest and show in tree/text-views & import logs
      addon.port.on(signal.SIG_SHOW_IMPORT, function(importedZest) {
        currentZest = importedZest.zest;
        var main  = document.getElementById('zestText');
        main.value = currentZest;
        tree.createTree(importedZest);
      });

      addon.port.on('RESULT_RCV', function(result) {
        var runTableBody = document.getElementById('runTableBody');

        var row = document.createElement('tr');
        var id = document.createElement('td');
        var method = document.createElement('td');
        var url = document.createElement('td');
        var respCode = document.createElement('td');
        var respLength = document.createElement('td');
        var respTime = document.createElement('td');
        var rslt = document.createElement('td');

        id.textContent = result.id;
        method.textContent = result.method;
        if (result.url.length > 20) {
          url.textContent = result.url.slice(0, 20) + '...';
        }
        else {
          url.textContent = result.url;
        }
        url.title = result.url;
        respCode.textContent = result.respCode;
        respLength.textContent = result.length;
        respTime.textContent = result.time;
        if (result.result == true) {
          rslt.textContent = 'PASS';
          rslt.classList.add('tableCellPass');
        }
        else {
          rslt.textContent = 'FAIL';
          rslt.title = result.resultDesc;
          rslt.classList.add('tableCellFail');
        }

        row.classList.add('tableRow');
        row.appendChild(id);
        row.appendChild(method);
        row.appendChild(url);
        row.appendChild(respCode);
        row.appendChild(respLength);
        row.appendChild(respTime);
        row.appendChild(rslt);

        runTableBody.appendChild(row);

      });

      addon.port.on('CLEAR_CARDS', function() {
        tree.clear();
        helper.clearResults();
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
      var searchBar = document.getElementById('searchBar');
      searchBar.onkeypress = function(event) {
        if (event.keyCode == 13) {
          var searchText = searchBar.value;
          var zestText = document.getElementById('zestText');
          zestText.focus();
          var l = zestText.value.indexOf(searchText);
          if (l != -1) {
            zestText.selectionStart = l;
            zestText.selectionEnd = l + searchText.length;
          }
        }
      }

      // Change Title
      var changeTitle = document.getElementById('changeTitle');
      changeTitle.onclick = function() {
        var title = prompt(label.GET_TITLE);
        helper.changeZestProperty('title', title);
      }

      // Change Author
      var changeAuthor = document.getElementById('changeAuthor');
      changeAuthor.onclick = function() {
        var author = prompt(label.GET_AUTHOR);
        helper.changeZestProperty('author', author);
      }

      // Change Description
      var changeDesc = document.getElementById('changeDesc');
      changeDesc.onclick = function() {
        var desc = prompt(label.GET_DESC);
        helper.changeZestProperty('description', desc);
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

      document.addEventListener('treeChange', function(data) {
        addon.port.emit('TREE_CHANGED', {src: data.detail.src,
                                         dst: data.detail.trg,
                                         id: data.detail.id
                                        });
      }, false);

      document.addEventListener('deleteNode', function(data) {
        addon.port.emit('DELETE_NODE', data.detail);
      });
    }
  }

});
