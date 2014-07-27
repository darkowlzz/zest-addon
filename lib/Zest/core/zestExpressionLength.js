'use strict';

const ELEMENTTYPE = 'ZestExpressionLength';

function ZestExpressionLength(variable, length, approx) {
  this.length = length;
  this.not = false;
  this.approx = approx; 
  this.variableName = variable;
}

ZestExpressionLength.prototype = {
  length: null,
  approx: null,
  variableName: null,
  not: null,

  getVariableName: function() {
    return this.variableName;
  },

  setVariableName: function(variableName) {
    this.variableName = variableName;
  },

  getLength: function() {
    return this.length;
  },

  setLength: function(length) {
    this.length = length;
  },

  getApprox: function() {
    return this.approx;
  },

  setApprox: function(approx) {
    this.approx = approx;
  },

  getNot: function() {
    return this.not;
  },

  setNot: function(not) {
    this.not = not;
  },

  toZest: function() {
    let zst = {
      'length': this.getLength(),
      'approx': this.getApprox(),
      'variableName': this.getVariableName(),
      'not': this.getNot(),
      'elementType': ELEMENTTYPE
    }

    return zst;
  }
}

exports.ZestExpressionLength = ZestExpressionLength;
