/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/* Library imports */
const { data } = require('sdk/self');
const { Sidebar } = require('sdk/ui/sidebar');
const { Hotkey } = require('sdk/hotkeys');

const { ZestRecorder } = require('zestRecorder');
const { runThis, runNode, treeChange, importFile, saveZest, changeAttr,
      disableCache, setUserCachePref, deleteAssertion, addAssertion,
      deleteNode, addParentElement } = require('zestHelper');
const { getStringLogById } = require('zestLog');

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

    // Listen to control buttons.
    worker.port.on(SIG_RECORD_ON, function() {
      disableCache();
      zRec.startWatching();
    });

    worker.port.on(SIG_RECORD_OFF, function() {
      setUserCachePref();
      zRec.stopWatching();
    });

    // Retrieve the zest json and display in sidebar.
    worker.port.on('SHOWJSON', (id) => {
      let b = getStringLogById(id);
      worker.port.emit('VIEWJSON', b);
    });

    // Save the received text form of zest.
    worker.port.on(SIG_SAVE_ZEST, (text) => {
      saveZest(text);
    });

    // Import zest from file and send it's content to the sidebar.
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

    // Run a whole zest script.
    worker.port.on('RUNTHIS', (zest) => {
      runThis(zest, worker);
    });

    // Run a single zest statement.
    worker.port.on('RUN_NODE', (node) => {
      runNode(node, worker);
    });

    // Receive the changes to a node (zest element) and apply on the stored
    // zest.
    worker.port.on('CHANGE_ATTR', (node) => {
      changeAttr(node, worker);
    });

    // Delete zest element from the zest object.
    worker.port.on('DELETE_NODE', (node) => {
      deleteNode(node, worker);
    });

    // Delete ZestAssertion elements from zest object.
    worker.port.on('DELETE_ASSERTION', (node) => {
      deleteAssertion(node, worker);
    });

    // Insert a new ZestAssertion element.
    worker.port.on('ADD_ASSERTION', (node) => {
      addAssertion(node, worker);
    });

    // Insert a new parent element.
    worker.port.on('ADD_PARENT_ELEMENT', (node) => {
      addParentElement(node, worker);
    });

    // Handle the drag and drop of zest elements and apply the changes to the
    // stored zest. Also update the zest text view.
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
