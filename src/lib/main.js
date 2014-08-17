'use strict';

/* Library imports */
const { data } = require('sdk/self');
const { Sidebar } = require('sdk/ui/sidebar');
const { Hotkey } = require('sdk/hotkeys');

let { ZestRecorder } = require('zestRecorder');
let { runThis, treeChange, importFile, saveZest,
      disableCache, setUserCachePref } = require('zestHelper');

/* Receive signal constants */
const SIG_RECORD_ON = 'RECORDON';
const SIG_RECORD_OFF = 'RECORDOFF';
const SIG_SAVE_ZEST = 'SAVEZEST';
const SIG_IMPORT = 'IMPORTZEST';
const SIG_SHOW_IMPORT = 'SHOWIMPORT';
const SIG_LOG_REQUEST = 'LOGREQUEST';

const HOTKEY_COMBO = 'alt-z';

// Visibility of the sidebar
let visibility = true;

// Sidebar initialization
let sidebar = Sidebar({ // jshint ignore:line
  id: 'zestsidebar',
  title: 'Zest',
  url: data.url('sidebar.html'),
  onAttach: function (worker) {
    let zRec = new ZestRecorder(worker);

    // Listen to control buttons
    worker.port.on(SIG_RECORD_ON, function() {
      disableCache();
      zRec.startWatching();
    });

    worker.port.on(SIG_RECORD_OFF, function() {
      setUserCachePref();
      zRec.stopWatching();
    });

    worker.port.on(SIG_SAVE_ZEST, (text) => {
      saveZest(text);
    });

    // Import zest from file and send it's content to the sidebar
    worker.port.on(SIG_IMPORT, () => {
      let z = importFile();
      if (z) {
        worker.port.emit(SIG_SHOW_IMPORT, z);
        worker.port.emit(SIG_LOG_REQUEST, z);
      }
      else {
        console.log('Error: Failed to import file');
      }
    });

    worker.port.on('RUNTHIS', (zest) => {
      runThis(zest, worker);
    });

    worker.port.on('TREE_CHANGED', (tree) => {
      let newZestString = treeChange(tree);
      // update zest text in sidebar
      worker.port.emit('UPDATE_TEXT_VIEW', newZestString);
    });
  }
});

// Make the sidebar visible at startup.
sidebar.show();

// Sidebar hotkey
Hotkey({ // jshint ignore:line
  combo: HOTKEY_COMBO,
  onPress: () => {
    if (visibility) {
      sidebar.hide();
      visibility = false;
    }
    else {
      sidebar.show();
      visibility = true;
    }
  }
});
