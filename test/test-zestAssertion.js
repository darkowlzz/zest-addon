const { ZestAssertion } = require('./Zest/core/zestAssertion');
const { ZestExpressionLength } = require('./Zest/core/zestExpressionLength');
const { ZestExpressionStatusCode } =
  require('./Zest/core/zestExpressionStatusCode');

// Create a zestAssertion object from scratch
let exp = [];
let expStatusCode = new ZestExpressionStatusCode(300);
exp.push(expStatusCode);
let expLength = new ZestExpressionLength('response.body', 13, 1);
exp.push(expLength);
let e  = [];
for (let i of exp) {
  let tmp = {
    'rootExpression': i.toZest(),
    'elementType': 'ZestAssertion'
  }
  e.push(tmp);
}
let t0 = JSON.stringify(e);

exports['test zestAssertion new request'] = function (assert) {

  // Create a zestAssertion using zestAssertion constructor
  let opts = {
    type: 'new',
    response: {
      body: '<html></html>',
      statusCode: 300
    }
  }
  let za = new ZestAssertion(opts);
  let t1 = za.toZest();
  t1 = JSON.stringify(t1);

  assert.equal(t1, t0, 'returns correct zest assertion');
}

exports['test zestAssertion existing assertions'] = function (assert) {
  let opts = {
    type: 'existing',
    assertions: [
      {
        rootExpression: {
          code: 300,
          not: false,
          elementType: 'ZestExpressionStatusCode'
        },
        elementType: 'ZestAssertion'
      },
      {
        rootExpression: {
          length: 13,
          approx: 1,
          variableName: 'response.body',
          not: false,
          elementType: 'ZestExpressionLength'
        },
        elementType: 'ZestAssertion'
      }
    ]
  }
  let za = new ZestAssertion(opts);
  let t1 = za.toZest();
  t1 = JSON.stringify(t1);

  assert.equal(t1, t0, 'returns correct zest assertion');
}

require('sdk/test').run(exports);
