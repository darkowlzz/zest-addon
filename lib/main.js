/* Library imports */
const { data } = require('sdk/self');
const { Sidebar } = require('sdk/ui/sidebar');
const { Hotkey } = require('sdk/hotkeys');
const utils = require('sdk/window/utils');
const { Cu, Cc, Ci } = require('chrome');
const fileIO = require('sdk/io/file');
const pref = require('sdk/preferences/service');

let { ZestRecorder } = require('zestRecorder');

/* Receive signal constants */
const SIG_RECORD_ON = 'RECORDON';
const SIG_RECORD_OFF = 'RECORDOFF';
const SIG_SAVE_ZEST = 'SAVEZEST';

/* Other constants */
const nsIFilePicker = Ci.nsIFilePicker;
const CACHE_DISK = 'browser.cache.disk.enable';
const CACHE_MEMORY = 'browser.cache.memory.enable';

const SAVE_DIALOG_TITLE = 'Save Zest';
const ZEST_FILE_FILTER = 'Zest Files';
const ZEST_FILE_EXTENSION = '.zst';
const ALL_ZEST_FILES = '*' + ZEST_FILE_EXTENSION;

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
