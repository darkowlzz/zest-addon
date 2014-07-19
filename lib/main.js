/* Library imports */
const { data } = require('sdk/self');
const { Sidebar } = require('sdk/ui/sidebar');
const { Hotkey } = require('sdk/hotkeys');
const utils = require('sdk/window/utils');
const { Cu, Cc, Ci } = require('chrome');
const fileIO = require('sdk/io/file');
const pref = require('sdk/preferences/service');

let { ZestRecorder } = require('zestRecorder');
let { ZestImport } = require('zestImport');
let ZestLog = require('zestLog');
let ZestRunner = require('zestRunner');

/* Receive signal constants */
const SIG_RECORD_ON = 'RECORDON';
const SIG_RECORD_OFF = 'RECORDOFF';
const SIG_SAVE_ZEST = 'SAVEZEST';
const SIG_GET_IMPORT = 'GETIMPORTEDZEST';
const SIG_IMPORT = 'IMPORTZEST';

/* Emit signal constants */
//const SIG_LOG_IMPORT = 'LOGIMPORT';
const SIG_SHOW_IMPORT = 'SHOWIMPORT';
const SIG_SHOW_IMPORT_IN_VIEW = 'SHOWIMPORTINVIEW';
const SIG_LOG_REQUEST = 'LOGREQUEST';

/* Other constants */
const nsIFilePicker = Ci.nsIFilePicker;
const CACHE_DISK = 'browser.cache.disk.enable';
const CACHE_MEMORY = 'browser.cache.memory.enable';

const SAVE_DIALOG_TITLE = 'Save Zest';
const ZEST_FILE_FILTER = 'Zest Files';
const ZEST_FILE_EXTENSION = '.zst';
const ALL_ZEST_FILES = '*' + ZEST_FILE_EXTENSION;

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
let sidebar = Sidebar({
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

        let id = ZestLog.add(importedZest.zest);
        let z = {
          zest: importedZest.zest,
          url: importedZest.url,
          id: id
        }
        // XXX Might wanna use sometime in future to list imports
        // worker.port.emit(SIG_LOG_IMPORT, importedZest);
        
        worker.port.emit(SIG_SHOW_IMPORT, z);
        worker.port.emit(SIG_LOG_REQUEST, z);
      }
    });

    worker.port.on('RUNTHIS', (zest) => {
      ZestRunner.run(zest, 'zest', worker);
    });
  }
});

// Sidebar hotkey
Hotkey({
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
