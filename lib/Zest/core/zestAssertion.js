/**
 * Refer:
 * https://github.com/mozilla/zest/blob/master/src/org/mozilla/zest/core/v1/ZestAssertion.java
 */

function ZestAssertion(response) {
  //this.length = response.length;
  this.responseTime = response.responseTimeInMs;
  this.statusCode = response.statusCode;

  this.expressions = [];
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
  }

  toZest: function() {
    
  }
}

exports.ZestAssertion = ZestAssertion;
