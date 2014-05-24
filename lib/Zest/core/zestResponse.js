/**
 * Refer:
 * https://github.com/mozilla/zest/blob/master/src/org/mozilla/zest/core/v1/ZestResponse.java
 */

function ZestResponse (url, headers, body, statusCode, responseTime) {
  this.url = url;
  this.headers = headers;
  this.body = body;
  this.statusCode = statusCode;
  this.responseTime = responseTime;
}

ZestResponse.prototype = {
  url: null,
  headers: null,
  body: null,
  statusCode: null,
  responseTimeInMs: null,

  getUrl: function() {
    return this.url;
  },

  getHeaders: function() {
    return this.headers;
  },

  getBody: function() {
    return this.body;
  },

  getStatusCode: function() {
    return this.statusCode;
  },

  getResponseTimeInMs: function() {
    return this.responseTimeInMs;
  }
}
