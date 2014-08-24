'use strict';

const { ZestAssignFieldValue } = require('./Zest/core/zestAssignFieldValue');

exports['test zestAssignFieldValue'] = function (assert) {
  let opts = {
    variableName: 'foo',
    index: 2,
    fieldDefinition: {
      formIndex: 1,
      fieldName: 'username'
    }
  };
  let zafv = new ZestAssignFieldValue(opts);
  assert.equal(zafv.variableName, 'foo', 'returns correct variableName');
  assert.equal(zafv.index, 2, 'returns correct index');
  let fd = zafv.fieldDefinition;
  assert.equal(fd.formIndex, 1, 'returns correct form index');
  assert.equal(fd.fieldName, 'username', 'returns correct field name');
};

require('sdk/test').run(exports);
