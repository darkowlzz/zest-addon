'use strict';

const { read } = require('sdk/io/file');
const { ZestObject } = require('zestObject');
const ZestLog = require('zestLog');

function importZest(path) {
  let zString = read(path);
  let z = JSON.parse(zString);
  let opts2 = {
    type: 'existing',
    zest: z,
    withRespBody: true
  };
  let script = new ZestObject(opts2);
  let id = ZestLog.add(script);

  return {
    title: z.title,
    zest: z,
    id: id
  };
}
exports.importZest = importZest;
