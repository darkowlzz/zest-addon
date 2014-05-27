//let { ZestStatement } = require('Zest/core/zestStatement');
//let { ZestResponse } = require('zestResponse');

/**
 * Refer:
 * https://github.com/mozilla/zest/blob/master/src/org/mozilla/zest/core/v1/ZestRequest.java
 */

// XXX import after implementation
//let ZestAssertion = require('zestAssertion');

function ZestRequest(index, request, response) {
  this.index = index;
  this.url = request.url;
  //this.urlToken = urlToken;
  //this.data = data;
  this.method = request.method;
  this.headers = request.RequestHeaders;
  //let rsp = new ZestResponse(response);
  //this.response = rsp;
  //this.assertions = assertions;
}

ZestRequest.prototype = {
  index: null,
  url: null,
  urlToken: null,
  data: null,
  method: null,
  headers: null,
  response: null,
  assertions: [],
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
    this.assertions.push(assertion); 
  },

  removeAssertion: function(assertion) {
    let index = this.assertions.indexOf(assertion);
    this.assertions.splice(index, 1);
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
  },

  moveDown: function(ze) {
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
  },

  // XXX replaceTokens not implemented

  toZest: function() {
    let zst = {
      'url': this.getUrl(),
      'data': '',
      'method': this.getMethod(),
      'headers': this.getHeaders(),
      'response': '',
      'index': this.index,
      'elementType': 'ZestRequest'
    }

    return zst;
  }
}

exports.ZestRequest = ZestRequest;
