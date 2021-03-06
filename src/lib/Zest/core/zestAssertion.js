/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { ZestExpressionStatusCode } =
  require('Zest/core/zestExpressionStatusCode');
const { ZestExpressionLength } = require('Zest/core/zestExpressionLength');
const { ZestExpressionRegex } = require('Zest/core/zestExpressionRegex');

/**
 * Refer:
 * https://github.com/mozilla/zest/blob/master/src/org/mozilla/zest/core/v1/ZestAssertion.java
 */

const ELEMENT_TYPE = 'ZestAssertion';

/**
 * ZestAssertion
 * opts -
 *    type: type of assertion. 'new' or 'existing'.
 *    response: the response object (opt)
 *    assertions: the assertion object from an existing zest(opt)
 */
function ZestAssertion(opts) {
  let _expressions = [],
      _elementType = ELEMENT_TYPE;

  if (opts.type == 'new') {
    let _length = opts.response.body.length,
        _statusCode = opts.response.statusCode;

    try {
      let assertStatusCode = new ZestExpressionStatusCode(_statusCode);
      _expressions.push(assertStatusCode);
    }
    catch(e) {
      console.log(e);
    }

    // XXX Passing hard coded values (Avoid)
    try {
      let assertLength = new ZestExpressionLength('response.body',
                                                  _length, 1);
      _expressions.push(assertLength);
    }
    catch(e) {
      console.log(e);
    }
  }
  else if (opts.type == 'existing') {
    let assertions = opts.assertions;
    let tmp;
    for (var assert of assertions) {
      switch (assert.rootExpression.elementType) {
        case 'ZestExpressionStatusCode':
          tmp = new ZestExpressionStatusCode(assert.rootExpression.code);
          _expressions.push(tmp);
          break;
        case 'ZestExpressionLength':
          tmp = new ZestExpressionLength(
                      assert.rootExpression.variableName,
                      assert.rootExpression.length,
                      assert.rootExpression.approx);
          _expressions.push(tmp);
          break;
        case 'ZestExpressionRegex':
          tmp = new ZestExpressionRegex(
                      assert.rootExpression.variableName,
                      assert.rootExpression.regex,
                      assert.rootExpression.caseExact);
          _expressions.push(tmp);
          break;
        default:

      }
    }
  }

  this.__defineGetter__('expressions', function() {
    return _expressions;
  });
  this.__defineSetter__('expressions', function(val) {
    _expressions = val;
  });

  this.addExpression = function(expression) {
    _expressions.push(expression);
  };

  this.__defineGetter__('elementType', function() {
    return _elementType;
  });
}

ZestAssertion.prototype.toZest = function() {
  let exp = [];
  let expressions = this.expressions;
  for (let i of expressions) {
    let tmp = {
      'rootExpression': i.toZest(),
      'elementType': this.elementType
    };
    exp.push(tmp);
  }
  return exp;
};

exports.ZestAssertion = ZestAssertion;
