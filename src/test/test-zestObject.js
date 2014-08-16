const { ZestObject } = require('./zestObject');
const { goodRequest, tinyZest } = require('dataSet');

exports['test zestObject with new data'] = function (assert) {
  let opts1 = {
    type: 'new',
    requests: [ goodRequest ],
    withRespBody: true
  };

  let s = new ZestObject(opts1);
  assert.equal(s.author, 'anon', 'returns correct author');
  assert.equal(s.generatedBy, 'zest-addon for firefox', 'returns correct app');
  assert.equal(s.title, 'sample title', 'returns correct title');
  assert.equal(s.description, 'sample description', 'correct desc');
  let stmt = s.getStatements()[0];
  assert.equal(stmt.url, 'example.com', 'returns correct url');
  assert.equal(stmt.data, 'foo', 'returns correct data');
  assert.equal(stmt.method, 'GET', 'returns correct method');
  assert.equal(stmt.headers, 'aabbcc', 'returns correct headers');
  let rsp = stmt.response;
  assert.equal(rsp.url, 'example.com', 'returns correct url');
  assert.equal(rsp.headers, 'xxxyyyzzz', 'returns correct headers');
  assert.equal(rsp.body, 'mmmm', 'returns correct body');
  assert.equal(rsp.statusCode, 200, 'returns correct statusCode');
  assert.equal(rsp.responseTime, 20, 'returns correct time');
  assert.equal(rsp.elementType, 'ZestResponse', 'returns correct type');
  let assert1 = stmt.assertions.expressions[0];
  assert.equal(assert1.code, 200, 'status code');
  assert.equal(assert1.not, false, 'correct not');
  assert.equal(assert1.elementType, 'ZestExpressionStatusCode',
               'correct type');
  let assert2 = stmt.assertions.expressions[1];
  assert.equal(assert2.length, 4, 'correct length');
  assert.equal(assert2.approx, 1, 'correct approx');
  assert.equal(assert2.variableName, 'response.body',
               'correct variable name');
  assert.equal(assert2.not, false, 'correct not');
  assert.equal(assert2.elementType, 'ZestExpressionLength',
               'expression length type');
};

exports['test zestObject with existing data'] = function (assert) {
  let opts1 = {
    type: 'existing',
    zest: tinyZest,
    withRespBody: true
  };

  let s = new ZestObject(opts1);
  assert.equal(s.author, 'John Doe', 'returns correct author');
  assert.equal(s.generatedBy, 'firefox', 'returns correct app');
  assert.equal(s.title, 'Awesome script', 'returns correct title');
  assert.equal(s.description, 'xyz', 'returns correct desc');

  let stmt = s.getStatements()[0];
  assert.equal(stmt.url, 'fooxxx', 'returns correct url');
  assert.equal(stmt.data, 'faa', 'returns correct data');
  assert.equal(stmt.method, 'GET', 'returns correct method');
  assert.equal(stmt.headers, 'xxxx', 'returns correct headers');
  let rsp = stmt.response;
  assert.equal(rsp.url, 'fooxxx', 'returns correct url');
  assert.equal(rsp.headers, 'yyyy', 'returns correct headers');
  assert.equal(rsp.body, 'I am a mozillian', 'returns correct body');
  assert.equal(rsp.statusCode, 200, 'returns correct status code');
  assert.equal(rsp.responseTime, 100, 'returns correct time');
  assert.equal(rsp.elementType, 'ZestResponse', 'returns correct type');
  let assert1 = stmt.assertions.expressions[0];
  assert.equal(assert1.code, 200, 'correct status code');
  assert.equal(assert1.not, false, 'correct not');
  assert.equal(assert1.elementType, 'ZestExpressionStatusCode',
               'correct type');
  let assert2 = stmt.assertions.expressions[1];
  assert.equal(assert2.length, 250, 'correct length');
  assert.equal(assert2.approx, 1, 'correct approx');
  assert.equal(assert2.variableName, 'request.body',
               'correct variable name');
  assert.equal(assert2.not, false, 'correct not');
  assert.equal(assert2.elementType, 'ZestExpressionLength',
               'expression length type');

  let stmt = s.getStatements()[1];
  assert.equal(stmt.comment, 'ssss', 'returns correct comment');
  assert.equal(stmt.index, 2, 'returns correct index');
  assert.equal(stmt.elementType, 'ZestComment', 'returns correct type');
};

require('sdk/test').run(exports);
