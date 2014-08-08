'use strict';

//let { ZestStatement } = require('Zest/core/zestStatement');
let { ZestResponse } = require('Zest/core/zestResponse');
let { ZestAssertion } = require('Zest/core/zestAssertion');

/**
 * Refer:
 * https://github.com/mozilla/zest/blob/master/src/org/mozilla/zest/core/v1/ZestRequest.java
 */

// XXX import after implementation
//let ZestAssertion = require('zestAssertion');

/**
 * ZestRequest class
 * @param {number} index
 *    The index of the statement.
 * @param {Object} request
 *    The raw request object.
 * @param {Object} response
 *    The raw response object.
 */
function ZestRequest(opts) {
  let index, url, data, method, headers, response, assertions;

  index = opts.index;
  url = opts.request.url;
  data = opts.request.data;
  method = opts.request.method;
  headers = opts.request.headers;

  let opts2 = {
    response: opts.request.response,
    withRespBody: opts.withRespBody || false
  };
  response = new ZestResponse(opts2);
  let opts3 = {
    type: (opts.type == 'raw') ? 'new' : 'existing',
    response: opts.request.response
  };
  assertions = new ZestAssertion(opts3);

  this.__defineGetter__('index', function() {
    return index;
  });
  this.__defineSetter__('index', function(val) {
    index = val;
  });

  this.__defineGetter__('url', function() {
    return url;
  });
  this.__defineSetter__('url', function(val) {
    url = val;
  });

  this.__defineGetter__('data', function() {
    return data;
  });
  this.__defineSetter__('data', function(val) {
    data = val;
  });

  this.__defineGetter__('method', function() {
    return method;
  });
  this.__defineSetter__('method', function(val) {
    method = val;
  });

  this.__defineGetter__('headers', function() {
    return headers;
  });
  this.__defineSetter__('headers', function(val) {
    headers = val;
  });

  this.setAssertions = function(asrt) {
    assertions = asrt;
  };

  this.getAssertions = function() {
    return assertions;
  };

  this.setResponse = function(val) {
    response = val;
  }

  this.getResponse = function() {
    return response;
  }
}

ZestRequest.prototype.toZest = function() {
  let asrt;
  try {
    asrt = this.getAssertions().toZest();
  }
  catch(e) {
    console.log('Error: in ZestRequest: ' + e);
    asrt = '';
  }

  let zst = {
    'url': this.url,
    'data': this.data,
    'method': this.method,
    'headers': this.headers || '',
    'response': this.getResponse().toZest() || '',
    'assertions': asrt,
    'followRedirect': '',
    'index': this.index,
    'elementType': 'ZestRequest'
  };
  return zst;
};

exports.ZestRequest = ZestRequest;
