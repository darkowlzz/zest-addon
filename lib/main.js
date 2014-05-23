const { data } = require('sdk/self');
const { Sidebar } = require('sdk/ui/sidebar');

let { ZestRecorder } = require('zestRecorder');

let zRec = new ZestRecorder();

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
