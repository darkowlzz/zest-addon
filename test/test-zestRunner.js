//const { parseIt } = require('./zestRunner');
const { zest } = require('dataSet');

exports['test zestRunner'] = function(assert) {
  assert.equal('hello', 'hello', 'it works');
};

require('sdk/test').run(exports);
