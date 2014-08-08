'use strict';

const { ZestExpressionStatusCode } =
  require('./Zest/core/zestExpressionStatusCode');

exports['test zestExpressionStatusCode'] = function (assert) {
  let zesc = new ZestExpressionStatusCode('300');
  assert.equal(zesc.getCode(), '300', 'returns correct code');
  assert.equal(zesc.getNot(), false, 'returns correct not');
  assert.equal(zesc.getElementType(), 'ZestExpressionStatusCode',
               'returns correct type');

  zesc.setCode(200);
  assert.equal(zesc.getCode(), '200', 'returns correct code');
  zesc.setNot(true);
  assert.equal(zesc.getNot(), true, 'returns correct not');

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
