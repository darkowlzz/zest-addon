const { data } = require('sdk/self');
const { Sidebar } = require('sdk/ui/sidebar');
const { Hotkey } = require('sdk/hotkeys');

let { ZestRecorder } = require('zestRecorder');

let zRec = new ZestRecorder();

// Visibility of the sidebar
let visibility = true;

let sidebar = Sidebar({
  id: 'zestsidebar',
  title: 'Zest',
  url: data.url('sidebar.html'),
  onAttach: function (worker) {
    // Listen to control buttons
    worker.port.on('RECORDON', function() {
      zRec.startWatching();
    });

    worker.port.on('RECORDOFF', function() {
      zRec.stopWatching();
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
