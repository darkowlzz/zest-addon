"use strict";

/* Library imports */
const { data } = require('sdk/self');
const { Sidebar } = require('sdk/ui/sidebar');
const { Hotkey } = require('sdk/hotkeys');
const utils = require('sdk/window/utils');
const { Cc, Ci } = require('chrome');
const fileIO = require('sdk/io/file');
const pref = require('sdk/preferences/service');

let { ZestRecorder } = require('zestRecorder');
let { ZestImport } = require('zestImport');
let { ZestObject } = require('zestObject');
let ZestLog = require('zestLog');
let { run } = require('zestRunner');

/* Receive signal constants */
const SIG_RECORD_ON = 'RECORDON';
const SIG_RECORD_OFF = 'RECORDOFF';
const SIG_SAVE_ZEST = 'SAVEZEST';
//const SIG_GET_IMPORT = 'GETIMPORTEDZEST';
const SIG_IMPORT = 'IMPORTZEST';

/* Emit signal constants */
//const SIG_LOG_IMPORT = 'LOGIMPORT';
const SIG_SHOW_IMPORT = 'SHOWIMPORT';
//const SIG_SHOW_IMPORT_IN_VIEW = 'SHOWIMPORTINVIEW';
const SIG_LOG_REQUEST = 'LOGREQUEST';

/* Other constants */
const nsIFilePicker = Ci.nsIFilePicker;
const CACHE_DISK = 'browser.cache.disk.enable';
const CACHE_MEMORY = 'browser.cache.memory.enable';

const SAVE_DIALOG_TITLE = 'Save Zest';
const ZEST_FILE_FILTER = 'Zest Files';
const ZEST_FILE_EXTENSION = '.zst';
//const ALL_ZEST_FILES = '*' + ZEST_FILE_EXTENSION;

const IMPORT_DIALOG_TITLE = 'Import Zest';

const HOTKEY_COMBO = 'alt-z';


/* Globals */
// Create file picker instance
let fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);

// Visibility of the sidebar
let visibility = true;

// User cache pref
let userCacheDiskPref = null;
let userCacheMemoryPref = null;


// Sidebar initialization
let sidebar = Sidebar({ // jshint ignore:line
  id: 'zestsidebar',
  title: 'Zest',
  url: data.url('sidebar.html'),
  onAttach: function (worker) {
    let zRec = new ZestRecorder(worker);
    let zImport = new ZestImport();

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
      let recentWindow = utils.getMostRecentBrowserWindow();
      fp.init(recentWindow, SAVE_DIALOG_TITLE, nsIFilePicker.modeSave);
      fp.appendFilter(ZEST_FILE_FILTER, ZEST_FILE_EXTENSION);

      let rv = fp.show();
      if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        let path = fp.file.path;
        // file extension check
        let ext = path.slice(path.length - 4);
        if (ext !== ZEST_FILE_EXTENSION) {
          path += ZEST_FILE_EXTENSION;
        }
        let textWriter = fileIO.open(path, 'w');
        if (!textWriter.closed) {
          textWriter.write(text);
          textWriter.close();
        }
      }
    });

    // Get the imported zest content given the id
    /*
    worker.port.on(SIG_GET_IMPORT, (id) => {
      let zstStr = importedZest.getZest(id);
      addon.port.emit(SIG_SHOW_IMPORT_IN_VIEW, zstStr);
    });
    */

    // Perform zest import when import button is clicked
    worker.port.on(SIG_IMPORT, () => {
      let recentWindow = utils.getMostRecentBrowserWindow();
      fp.init(recentWindow, IMPORT_DIALOG_TITLE, nsIFilePicker.modeOpen);
      fp.appendFilter(ZEST_FILE_FILTER, ZEST_FILE_EXTENSION);

      let rv = fp.show();
      if (rv == nsIFilePicker.returnOK) {
        let path = fp.file.path;
        let importedZest = zImport.importZest(path);
        /*
        let opts = {
          type: 'existing',
          zest: importedZest.zest,
          withRespBody: false
        };
        */
        //let script = new ZestObject(opts);

        let id = ZestLog.add(importedZest.zest);
        let z = {
          zest: JSON.stringify(importedZest.zest, undefined, 2),
          url: importedZest.url,
          id: id
        };
        // XXX Might wanna use sometime in future to list imports
        // worker.port.emit(SIG_LOG_IMPORT, importedZest);
        
        worker.port.emit(SIG_SHOW_IMPORT, z);
        worker.port.emit(SIG_LOG_REQUEST, z);
      }
    });

    worker.port.on('RUNTHIS', (zest) => {
      let o = {
        type: 'existing',
        zest: JSON.parse(zest),
        withRespBody: false
      };
      let script = new ZestObject(o);
      run(script, worker);
    });

    worker.port.on('TREE_CHANGED', (tree) => {
      let b = ZestLog.getLogById(tree.id);
      //console.log(JSON.stringify(b));

      let z = b.zest;
      z.moveStatement(tree.src, tree.dst);
      /*
      let stmts = z.statements;

      for (let stmt of stmts) {
        if (stmt.index == tree.src) {
          stmt.index = parseInt(tree.dst) + 1;
          stmts.splice(tree.src - 1, 1); // remove the source element
          // To avoid messing up arrangement due to deletion of above
          // array element
          if (tree.src < tree.dst) {
            stmts.splice(tree.dst-1, 0, stmt);
          }
          else {
            stmts.splice(tree.dst, 0, stmt); // add the source element
          }
          break;
        }
      }

      // rename the index of statements
      if (tree.src > tree.dst) {
        for (let j = (tree.dst + 1); j < tree.src; j++) {
          stmts[j].index = j + 1;
        }
      }
      else {
        for (let j = (tree.src - 1); j < tree.dst; j++) {
          stmts[j].index = j + 1;
        }
      }

      z.statements = stmts;
      z = JSON.stringify(z, undefined, 2);

      ZestLog.addToId(tree.id, z);
      worker.port.emit('UPDATE_TEXT_VIEW', z); // update zest text
      */
    });
  }
});

// Sidebar hotkey
new Hotkey({ // jshint ignore:line
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


// Disable browser cache
function disableCache() {
  // store the current pref
  userCacheDiskPref = pref.get(CACHE_DISK);
  userCacheMemoryPref = pref.get(CACHE_MEMORY);

  // disable caching
  pref.set(CACHE_DISK, false);
  pref.set(CACHE_MEMORY, false);
}

// Restore user cache pref
function setUserCachePref() {
  pref.set(CACHE_DISK, userCacheDiskPref);
  pref.set(CACHE_MEMORY, userCacheMemoryPref);
}
