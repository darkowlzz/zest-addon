/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

let { ZestResponse } = require('Zest/core/zestResponse');
let { ZestAssertion } = require('Zest/core/zestAssertion');

/**
 * Refer:
 * https://github.com/mozilla/zest/blob/master/src/org/mozilla/zest/core/v1/ZestRequest.java
 */

const ELEMENT_TYPE = 'ZestRequest';

/**
 * ZestRequest class
 */
function ZestRequest(opts) {
  let _index, _url, _data, _method, _headers, _response, _assertions,
      _elementType = ELEMENT_TYPE;

  _index = opts.index || opts.request.index;
  _url = opts.request.url;
  _data = opts.request.data;
  _method = opts.request.method;
  _headers = opts.request.headers;

  let opts2 = {
    response: opts.request.response,
    withRespBody: opts.withRespBody || false
  };
  _response = new ZestResponse(opts2);
  let opts3 = {
    type: opts.type,
    response: opts.request.response,
    assertions: opts.request.assertions
  };
  _assertions = new ZestAssertion(opts3);

  this.__defineGetter__('index', function() {
    return _index;
  });
  this.__defineSetter__('index', function(val) {
    _index = val;
  });

  this.__defineGetter__('url', function() {
    return _url;
  });
  this.__defineSetter__('url', function(val) {
    _url = val;
  });

  this.__defineGetter__('data', function() {
    return _data;
  });
  this.__defineSetter__('data', function(val) {
    _data = val;
  });

  this.__defineGetter__('method', function() {
    return _method;
  });
  this.__defineSetter__('method', function(val) {
    _method = val;
  });

  this.__defineGetter__('headers', function() {
    return _headers;
  });
  this.__defineSetter__('headers', function(val) {
    _headers = val;
  });

  this.__defineGetter__('assertions', function() {
    return _assertions;
  });
  this.__defineSetter__('assertions', function(val) {
    _assertions = val;
  });

  this.__defineGetter__('response', function() {
    return _response;
  });
  this.__defineSetter__('response', function(val) {
    _response = val;
  });

  this.__defineGetter__('elementType', function() {
    return _elementType;
  });
}

ZestRequest.prototype.toZest = function() {
  let asrt;
  try {
    asrt = this.assertions.toZest();
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
    'response': this.response.toZest() || '',
    'assertions': asrt,
    'followRedirect': '',
    'index': this.index,
    'elementType': 'ZestRequest'
  };
  return zst;
};

exports.ZestRequest = ZestRequest;
