'use strict';

// Refactors the request objects to make them compatible with zest runner.
function beautify (requests) {
  let cleanRequests = [];
  let temp;
  for (let r of requests) {
    temp = {
      url: r.url,
      data: r.data,
      method: r.method,
      headers: r.RequestHeaders,
      response: {
        url: r.Response.url,
        headers: r.Response.ResponseHeaders || '',
        body: r.Response.bodyListener.responseBody || '',
        statusCode: r.Response.statusCode || '',
        responseTimeInMs: r.Response.responseTimeInMs || 0,
        elementType: 'ZestResponse'
      }
    };
    cleanRequests.push(temp);
  }
  return cleanRequests;
}
exports.beautify = beautify;
