const { data } = require('sdk/self');
const { Sidebar } = require('sdk/ui/sidebar');
const { Hotkey } = require('sdk/hotkeys');
const utils = require('sdk/window/utils');
const { Cu, Cc, Ci } = require('chrome');
const fileIO = require('sdk/io/file');

const nsIFilePicker = Ci.nsIFilePicker;
let fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);

let { ZestRecorder } = require('zestRecorder');


// Visibility of the sidebar
let visibility = true;

let sidebar = Sidebar({
  id: 'zestsidebar',
  title: 'Zest',
  url: data.url('sidebar.html'),
  onAttach: function (worker) {
    let zRec = new ZestRecorder(worker);
    // Listen to control buttons
    worker.port.on('RECORDON', function() {
      zRec.startWatching(worker);
    });

    worker.port.on('RECORDOFF', function() {
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
