const { beautify } = require('zestHelper');
const { sampleRequest } = require('dataSet');

exports['test beautify'] = function (assert) {
  let rawReq = [sampleRequest];
  let goodReq = beautify(rawReq);
  let req = goodReq[0];
  assert.equal(req.url, 'example.com', 'returns correct url');
  assert.equal(req.data, 'foo', 'returns correct data');
  assert.equal(req.method, 'GET', 'returns correct method');
  assert.equal(req.headers, 'aabbcc', 'returns correct headers');
  assert.equal(req.response.url, 'example.com', 'returns correct url');
  assert.equal(req.response.headers, 'xxxyyyzzz', 'returns correct headers');
  assert.equal(req.response.body, 'mmmm', 'returns correct body');
  assert.equal(req.response.statusCode, 200, 'returns correct statusCode');
  assert.equal(req.response.responseTimeInMs, 20, 'returns correct time');
  assert.equal(req.response.elementType, 'ZestResponse', 'correct type');
};

require('sdk/test').run(exports);
