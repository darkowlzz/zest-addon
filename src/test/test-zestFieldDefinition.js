'use strict';

const { ZestFieldDefinition } = require('./Zest/core/zestFieldDefinition');

exports['test zestFieldDefinition'] = function (assert) {
  let opts = {
    formIndex: 1,
    fieldName: 'foo'
  };
  let zfd = new ZestFieldDefinition(opts);
  assert.equal(zfd.formIndex, 1, 'returns correct formIndex');
  assert.equal(zfd.fieldName, 'foo', 'returns correct fieldName');
  assert.equal(zfd.elementType, 'ZestFieldDefinition', 'correct type');

  zfd.formIndex = 4;
  assert.equal(zfd.formIndex, 4, 'returns correct formIndex');
  zfd.fieldName = 'bar';
  assert.equal(zfd.fieldName, 'bar', 'returns correct fieldName');

  let temp = {
    formIndex: 4,
    fieldName: 'bar',
    elementType: 'ZestFieldDefinition'
  };
  temp = JSON.stringify(temp);
  let temp2 = zfd.toZest();
  temp2 = JSON.stringify(temp2);
  assert.equal(temp2, temp, 'returns correct zest');
};

require('sdk/test').run(exports);
