'use strict';

const { ZestExpressionStatusCode } =
  require('./Zest/core/zestExpressionStatusCode');

exports['test zestExpressionStatusCode'] = function (assert) {
  let zesc = new ZestExpressionStatusCode('300');
  assert.equal(zesc.code, '300', 'returns correct code');
  assert.equal(zesc.not, false, 'returns correct not');
  assert.equal(zesc.elementType, 'ZestExpressionStatusCode',
               'returns correct type');

  zesc.code = 200;
  assert.equal(zesc.code, '200', 'returns correct code');
  zesc.not = true;
  assert.equal(zesc.not, true, 'returns correct not');

  let x = {
    code: 200,
    not: true,
    elementType: 'ZestExpressionStatusCode'
  };
  x = JSON.stringify(x);

  let a = zesc.toZest();
  a = JSON.stringify(a);

  assert.equal(a, x, 'returns correct zest');
};

require('sdk/test').run(exports);
