/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use-strict';

const { ZestAssertion } = require('./Zest/core/zestAssertion');
const { ZestExpressionLength } = require('./Zest/core/zestExpressionLength');
const { ZestExpressionStatusCode } =
  require('./Zest/core/zestExpressionStatusCode');
const { ZestExpressionRegex } = require('./Zest/core/zestExpressionRegex');

// Create a zestAssertion object from scratch
let exp = [];
let expStatusCode = new ZestExpressionStatusCode(300);
exp.push(expStatusCode);
let expLength = new ZestExpressionLength('response.body', 13, 1);
exp.push(expLength);
let e = [];
for (let i of exp) {
  let tmp = {
    'rootExpression': i.toZest(),
    'elementType': 'ZestAssertion'
  };
  e.push(tmp);
}
let t0 = JSON.stringify(e);

let expRegex = new ZestExpressionRegex('response.url', 'www', false);
exp.push(expRegex);
e  = [];
for (let i of exp) {
  let tmp = {
    'rootExpression': i.toZest(),
    'elementType': 'ZestAssertion'
  };
  e.push(tmp);
}
let tx = JSON.stringify(e);

exports['test zestAssertion new request'] = function (assert) {

  // Create a zestAssertion using zestAssertion constructor
  let opts = {
    type: 'new',
    response: {
      body: '<html></html>',
      statusCode: 300
    }
  };
  let za = new ZestAssertion(opts);
  let t = za.toZest();
  t = JSON.stringify(t);

  assert.equal(t, t0, 'returns correct zest assertion');
};

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
      },
      {
        rootExpression: {
          regex: 'www',
          variableName: 'response.url',
          caseExact: false,
          not: false,
          elementType: 'ZestExpressionRegex'
        },
        elementType: 'ZestAssertion'
      }
    ]
  };
  let za = new ZestAssertion(opts);
  let t1 = za.toZest();
  t1 = JSON.stringify(t1);

  assert.equal(t1, tx, 'returns correct zest assertion');
};

require('sdk/test').run(exports);
