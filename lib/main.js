let { ZestRecorder } = require('zestRecorder');

console.log('imported!');

let zRec = new ZestRecorder();
console.log('starting to watch');
zRec.startWatching();
