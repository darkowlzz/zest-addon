const { data } = require('sdk/self');
const { Sidebar } = require('sdk/ui/sidebar');
const { Hotkey } = require('sdk/hotkeys');
const utils = require('sdk/window/utils');
const { Cu, Cc, Ci } = require('chrome');
const fileIO = require('sdk/io/file');
const pref = require('sdk/preferences/service');

const nsIFilePicker = Ci.nsIFilePicker;
let fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);

let { ZestRecorder } = require('zestRecorder');


const CACHE_DISK = 'browser.cache.disk.enable';
const CACHE_MEMORY = 'browser.cache.memory.enable';


// Visibility of the sidebar
let visibility = true;

// User cache pref
let userCacheDiskPref = null;
let userCacheMemoryPref = null;


let sidebar = Sidebar({
  id: 'zestsidebar',
  title: 'Zest',
  url: data.url('sidebar.html'),
  onAttach: function (worker) {
    let zRec = new ZestRecorder(worker);
    // Listen to control buttons
    worker.port.on('RECORDON', function() {
      disableCache();
      zRec.startWatching();
    });

    worker.port.on('RECORDOFF', function() {
      setUserCachePref();
      zRec.stopWatching();
    });

    worker.port.on('SAVEZEST', (text) => {
      let recentWindow = utils.getMostRecentBrowserWindow();
      fp.init(recentWindow, 'Dialog Title', nsIFilePicker.modeSave);
      fp.appendFilter('Zest Files', "*.zst");

      let rv = fp.show();
      if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        let path = fp.file.path;
        // file extension check
        let ext = path.slice(path.length - 4);
        if (ext !== '.zst') {
          path += '.zst';
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
  combo: 'alt-z',
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
