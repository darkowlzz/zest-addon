const { ZestRequest } = require('./Zest/core/zestRequest');
const { ZestAssertion } = require('./Zest/core/zestAssertion');
const { goodRequest } = require('dataSet');

exports['test zestRequest new'] = function (assert) {
  let opts = {
    type: 'new',
    index: 3,
    request: {
      url: 'example.com',
      data: 'foo',
      method: 'GET',
      headers: 'aabbcc',
      response: {
        url: 'example.com',
        headers: 'xxxyyyzzz',
        body: 'mmmm',
        statusCode: 200,
        responseTimeInMs: 20
      }
    },
    withRespBody: true
  }
  let zr = new ZestRequest(opts);
  assert.equal(zr.index, 3, 'returns correct index');
  assert.equal(zr.url, 'example.com', 'returns correct url');
  assert.equal(zr.data, 'foo', 'returns correct data');
  assert.equal(zr.method, 'GET', 'returns correct method');
  assert.equal(zr.headers, 'aabbcc', 'returns correct headers');

  let z = zr.toZest();
  let t1 = JSON.stringify(goodRequest),
      t2 = JSON.stringify(z);
  assert.equal(t2, t1, 'returns correct request object');

  zr.index = 4;
  assert.equal(zr.index, 4, 'returns correct index');
  zr.url = 'www.example.com';
  assert.equal(zr.url, 'www.example.com', 'returns correct index');
  zr.data = 'bar';
  assert.equal(zr.data, 'bar', 'returns correct data');
  zr.method = 'POST';
  assert.equal(zr.method, 'POST', 'returns correct method');
  zr.headers = 'xxyyzz';
  assert.equal(zr.headers, 'xxyyzz', 'returns correct headers');
}

/*
exports['test zestRequest existing'] = function (assert) {
  let opts = {
    type: 'existing',
  }
}
*/

require('sdk/test').run(exports);
