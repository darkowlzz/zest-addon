'use strict';

const { ZestExpressionLength } = require('./Zest/core/zestExpressionLength');

exports['test zestExpressionLength'] = function (assert) {
  let zel = new ZestExpressionLength('foo', 1000, 5);
  assert.equal(zel.getVariableName(), 'foo', 'returns correct variable name');
  assert.equal(zel.getLength(), 1000, 'returns correct length');
  assert.equal(zel.getApprox(), 5, 'returns correct approx');
  assert.equal(zel.getNot(), false, 'returns correct not');
  assert.equal(zel.getElementType(), 'ZestExpressionLength',
               'return correct type');

  zel.setVariableName('bar');
  assert.equal(zel.getVariableName(), 'bar', 'returns correct variable name');
  zel.setLength(999);
  assert.equal(zel.getLength(), 999, 'returns correct length');
  zel.setApprox(10);
  assert.equal(zel.getApprox(), 10, 'returns correct approx');
  zel.setNot(true);
  assert.equal(zel.getNot(), true, 'returns correct not');

  let x = {
    length: 999,
    approx: 10,
    variableName: 'bar',
    not: true,
    elementType: 'ZestExpressionLength'
  };
  x = JSON.stringify(x);

  let a = zel.toZest();
  a = JSON.stringify(a);

  assert.equal(a, x, 'returns correct zest');
};

require('sdk/test').run(exports);
