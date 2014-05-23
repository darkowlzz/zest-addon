const { data } = require('sdk/self');
const { Sidebar } = require('sdk/ui/sidebar');

let { ZestRecorder } = require('zestRecorder');


let sidebar = Sidebar({
  id: 'zestsidebar',
  title: 'Zest',
  url: data.url('sidebar.html')
});

let zRec = new ZestRecorder();
//zRec.startWatching();
