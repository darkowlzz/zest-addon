/**
 * Refer:
 * https://github.com/mozilla/zest/blob/master/src/org/mozilla/zest/core/v1/ZestResponse.java
 */

/**
 * ZestResponse class
 * @param {Object} response
 *    The raw response object.
 */
function ZestResponse (response) {
  this.url = response.url;
  this.headers = response.ResponseHeaders;
  this.body = response.bodyListener.responseBody;
  this.statusCode = response.statusCode;
  //this.responseTime = responseTime;
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
  },

  toZest: function() {
    let zst = {
      'url': this.getUrl(),
      'headers': this.getHeaders(),
      'body': this.getBody(),
      'statusCode': this.getStatusCode(),
      'responseTimeInMs': '',
      'elementType': 'ZestResponse'
    }

    return zst;
  }
}

exports.ZestResponse = ZestResponse;
