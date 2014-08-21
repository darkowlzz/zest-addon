/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Refer:
 * https://github.com/mozilla/zest/blob/master/src/org/mozilla/zest/core/v1/ZestResponse.java
 */

const ELEMENT_TYPE = 'ZestResponse';

/**
 * ZestResponse class
 * @param {Object} response
 *    The raw response object.
 */
function ZestResponse (opts) {
  let _url = opts.response.url,
      _headers,
      _body,
      _statusCode = opts.response.statusCode,
      _responseTime = opts.response.responseTimeInMs,
      _elementType = ELEMENT_TYPE;

  try {
    _headers = opts.response.headers;
  }
  catch(e) {
    _headers = '';
  }

  if (opts.withRespBody) {
    try {
      _body = opts.response.body;
    }
    catch(e) {
      console.log('error: zestResponse.js : ' + e);
      _body = '';
    }
  }
  else {
    _body = '';
  }

  this.__defineGetter__('url', function() {
    return _url;
  });
  this.__defineSetter__('url', function(val) {
    _url = val;
  });

  this.__defineGetter__('headers', function() {
    return _headers;
  });
  this.__defineSetter__('headers', function(val) {
    _headers = val;
  });

  this.__defineGetter__('body', function() {
    return _body;
  });
  this.__defineSetter__('body', function(val) {
    _body = val;
  });

  this.__defineGetter__('statusCode', function() {
    return _statusCode;
  });
  this.__defineSetter__('statusCode', function(val) {
    _statusCode = val;
  });

  this.__defineGetter__('responseTime', function() {
    return _responseTime;
  });
  this.__defineSetter__('responseTime', function(val) {
    _responseTime = val;
  });

  this.__defineGetter__('elementType', function() {
    return _elementType;
  });
}

ZestResponse.prototype.toZest = function() {
  let zst = {
    'url': this.url,
    'headers': this.headers,
    'body': this.body,
    'statusCode': this.statusCode,
    'responseTimeInMs': this.responseTime,
    'elementType': 'ZestResponse'
  };
  return zst;
};

exports.ZestResponse = ZestResponse;
