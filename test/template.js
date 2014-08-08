'use strict';

const { foo } = require('bar');

exports['test foo'] = function (assert) {
  assert.equal(1, 1, 'success');
};

require('sdk/test').run(exports);
