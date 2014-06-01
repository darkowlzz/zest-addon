const ELEMENTTYPE = 'ZestExpressionStatusCode';

function ZestExpressionStatusCode(code) {
  this.code = code;
  this.not = false;
}

ZestExpressionStatusCode.prototype = {
  code: null,
  not: null,

  setCode: function(code) {
    this.code = code;
  },

  getCode: function(code) {
    return this.code;
  },

  getNot: function() {
    return this.not;
  },

  setNot: function(not) {
    this.not = not;
  }

  toZest: function() {
    let zst = {
      'code': this.getCode(),
      'not': this.getNot(),
      'elementType': ELEMENTTYPE
    }

    return zst;
  }
}

exports.ZestExpressionStatusCode = ZestExpressionStatusCode;
