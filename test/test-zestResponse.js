const { ZestResponse } = require('./Zest/core/zestResponse');
const { sampleResponse } = require('dataSet');

exports['test zestResponse'] = function (assert) {
  let response = sampleResponse;
  let opts = {
    type: 'raw',
    response: response,
    withRespBody: true
  }
  zr = new ZestResponse(opts);
  assert.equal(zr.url, 'example.com', 'returns correct url');
  assert.equal(zr.headers, 'xxxxyyyzzzz', 'returns correct headers');
  assert.equal(zr.body, 'aaabbbccc', 'returns correct body');
  assert.equal(zr.statusCode, 300, 'returns correct status code');
  assert.equal(zr.responseTime, 51, 'returns correct time');
  assert.equal(zr.elementType, 'ZestResponse', 'returns correct type');

  zr.url = 'www.example.com';
  assert.equal(zr.url, 'www.example.com', 'returns correct url');
  zr.headers = 'xxyyzz';
  assert.equal(zr.headers, 'xxyyzz', 'returns correct headers');
  zr.body = 'aabbcc';
  assert.equal(zr.body, 'aabbcc', 'returns correct body');
  zr.statusCode = 400;
  assert.equal(zr.statusCode, 400, 'returns correct status code');
  zr.responseTime = 50;
  assert.equal(zr.responseTime, 50, 'returns correct time');

  let z = {
    url: 'www.example.com',
    headers: 'xxyyzz',
    body: 'aabbcc',
    statusCode: 400,
    responseTimeInMs: 50,
    elementType: 'ZestResponse'
  };
  z = JSON.stringify(z);

  let tmp = zr.toZest();
  tmp = JSON.stringify(tmp);
  assert.equal(tmp, z, 'returns correct response object');
};

require('sdk/test').run(exports);
