'use strict';

//let { ZestStatement } = require('Zest/core/zestStatement');
let { ZestResponse } = require('Zest/core/zestResponse');

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
function ZestRequest(index, request, withRespBody) {
  this.index = index;
  this.url = request.url;
  //this.urlToken = urlToken;
  this.data = request.data;
  this.method = request.method;
  this.headers = request.RequestHeaders;
  this.response = new ZestResponse(request.Response, withRespBody);
}

ZestRequest.prototype = {
  index: '',
  url: '',
  urlToken: '',
  data: '',
  method: '',
  headers: '',
  response: '',
  assertions: '',
  followRedirects: true,

  getUrl: function() {
    return this.url;
  },

  setUrl: function(url) {
    this.url = url;
  },

  getUrlToken: function() {
    return this.urlToken;
  },

  setUrlToken: function(urlToken) {
    this.urlToken = urlToken;
  },

  getData: function() {
    return this.data;
  },

  setData: function(data) {
    this.data = data;
  },

  getHeaders: function() {
    return this.headers;
  },

  setHeaders: function(headers) {
    this.headers = headers;
  },

  getMethod: function() {
    return this.method;
  },

  setMethod: function(method) {
    this.method = method;
  },

  addAssertion: function(assertion) {
    this.assertions = assertion; 
  },

  removeAssertion: function(assertion) {
    //let index = this.assertions.indexOf(assertion);
    //this.assertions.splice(index, 1);
  },

  getAssertions: function() {
    return this.assertions;
  },

  getResponse: function() {
    return this.response;
  },

  setResponse: function(response) {
    this.response = response;
  },

  isFollowRedirects: function() {
    return this.followRedirects;
  },

  setFollowRedirects: function(followRedirects) {
    this.followRedirects = followRedirects;
  },

  moveUp: function(ze) {
    /*
    let i;
    
    // XXX Implement ZestAssertion and import
    if (ze instanceof ZestAssertion) {
      i = this.assertions.indexOf(ze);
      if (i > 0) {
        this.assertions.splice(i, 1);
        this.assertions.splice(i-1, 0, ze);
      }
    }
    else {
      console.log('Not a ZestAssertion element');
    }
    */
  },

  moveDown: function(ze) {
    /*
    let i;

    if (ze instanceof ZestAssertion) {
      i = this.assertions.indexOf(ze);
      if (i >= 0  && i < this.assertions.length) {
        this.assertions.splice(i, 1);
        this.assertions.splice(i+1, 0, ze);
      }
    }
    else {
      console.log('Not a ZestAssertion element');
    }
    */
  },

  // XXX replaceTokens not implemented

  toZest: function() {
    let asrt;
    try {
      asrt = this.assertions.toZest();
    }
    catch(e) {
      console.log('Error: ' + e);
      asrt = '';
    }

    let zst = {
      'url': this.getUrl(),
      'data': this.getData(),
      'method': this.getMethod(),
      'headers': this.getHeaders() || '',
      'response': this.response.toZest() || '',
      'assertions': asrt,
      'followRedirect': '',
      'index': this.index,
      'elementType': 'ZestRequest'
    }

    return zst;
  }
}

exports.ZestRequest = ZestRequest;
