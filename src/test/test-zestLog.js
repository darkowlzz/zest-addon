'use strict';

const { add, addToId, clearAll, getLogById,
        getStringLogById, getLogCount } = require('zestLog');
const { fullZest, tinyZest } = require('dataSet');

exports['test ZestLog'] = function (assert) {
  let id = add(fullZest);
  assert.equal(id, 0, 'zest saved');
  id = add(fullZest);
  assert.equal(id, 1, 'another zest saved');
  id = add('foo');
  assert.equal(id, false, 'not an object');

  let r = addToId(0, tinyZest);
  assert.equal(r, true, 'removed and added new');
  r = addToId(10, tinyZest);
  assert.equal(r, false, 'failed to add');

  let t = {
    zest: tinyZest,
    id: 0
  };
  let tStr = JSON.stringify(t);

  let t2 = getLogById(0);
  let t2Str = JSON.stringify(t2);
  assert.equal(t2Str, tStr, 'logs match');

  t = getStringLogById(9);
  assert.equal(t, false, 'log index not found');

  assert.equal(getLogCount(), 2, 'returns correct count');

  clearAll();
  assert.equal(getLogCount(), 0, 'clearAll works');

};

require('sdk/test').run(exports);
