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
  let url = opts.response.url,
      headers,
      body,
      statusCode = opts.response.statusCode,
      responseTime = opts.response.responseTimeInMs,
      elementType = ELEMENT_TYPE;

  try {
    headers = opts.response.headers;
  }
  catch(e) {
    headers = '';
  }

  if (opts.withRespBody) {
    try {
      body = opts.response.body;
    }
    catch(e) {
      console.log('error: zestResponse.js : ' + e);
      body = '';
    }
  }
  else {
    body = '';
  }

  this.__defineGetter__('url', function() {
    return url;
  });
  this.__defineSetter__('url', function(val) {
    url = val;
  });

  this.__defineGetter__('headers', function() {
    return headers;
  });
  this.__defineSetter__('headers', function(val) {
    headers = val;
  });

  this.__defineGetter__('body', function() {
    return body;
  });
  this.__defineSetter__('body', function(val) {
    body = val;
  });

  this.__defineGetter__('statusCode', function() {
    return statusCode;
  });
  this.__defineSetter__('statusCode', function(val) {
    statusCode = val;
  });

  this.__defineGetter__('responseTime', function() {
    return responseTime;
  });
  this.__defineSetter__('responseTime', function(val) {
    responseTime = val;
  });

  this.__defineGetter__('elementType', function() {
    return elementType;
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
