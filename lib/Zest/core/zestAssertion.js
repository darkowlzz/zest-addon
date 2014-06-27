let { ZestExpressionStatusCode } = require('Zest/core/zestExpressionStatusCode');
let { ZestExpressionLength } = require('Zest/core/zestExpressionLength');

/**
 * Refer:
 * https://github.com/mozilla/zest/blob/master/src/org/mozilla/zest/core/v1/ZestAssertion.java
 */

const ELEMENTTYPE = 'ZestAssertion';

function ZestAssertion(response) {
  this.expressions = [];
  this.length = response.length;
  this.statusCode = response.statusCode;

  let assertStatusCode = new ZestExpressionStatusCode(this.statusCode);

  // XXX Passing hard coded values (Avoid)
  let assertLength = new ZestExpressionLength('response.body', this.length, 20);

  this.expressions.push(assertStatusCode);
  this.expressions.push(assertLength);
}

ZestAssertion.prototype = {
  rootExpression: null,
  length: null,
  responseTime: null,
  statusCode: null,
  expressions: [],

  getRootExpression: function() {
    return this.rootExpression;
  },

  setRootExpression: function(rootExpression) {
    this.rootExpression = rootExpression;
  },

  addExpression: function(expression) {
    this.expressions.push(expression);
  },

  toZest: function() {
    let exp = [];
    for (let i of this.expressions) {
      let tmp = {
        'rootExpression': i.toZest(),
        'elementType': ELEMENTTYPE
      }
      exp.push(tmp);
    }

    return exp;
  }
}

exports.ZestAssertion = ZestAssertion;
