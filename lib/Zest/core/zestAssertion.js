let { ZestExpressionStatusCode } = require('Zest/core/zestExpressionStatusCode');
//let { ZestExpressionResponseTime } = require('Zest/core/zestExpressionResponseTime');

/**
 * Refer:
 * https://github.com/mozilla/zest/blob/master/src/org/mozilla/zest/core/v1/ZestAssertion.java
 */

const ELEMENTTYPE = 'ZestAssertion';

function ZestAssertion(response) {
  this.expressions = [];
  //this.length = response.length;
  this.responseTime = response.responseTimeInMs;
  this.statusCode = response.statusCode;

  let assertStatusCode = new ZestExpressionStatusCode(this.statusCode);
//  let assertResponseTime = new ZestExpressionResponseTime(this.responseTime);

  this.expressions.push(assertStatusCode);
//  this.expressions.push(assertResponseTime);
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

    console.log('at zestAssertion: ' + JSON.stringify(exp))
    return exp;
  }
}

exports.ZestAssertion = ZestAssertion;
