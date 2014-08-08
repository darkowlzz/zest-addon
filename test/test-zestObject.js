const { ZestObject } = require('./zestObject');
const { goodRequest, tinyZest } = require('dataSet');

exports['test zestObject'] = function (assert) {
  let opts1 = {
    type: 'raw',
    requests: [ goodRequest ],
    withRespBody: true
  }

  let zo = new ZestObject(opts1);
  let s = zo.getJSON();
  assert.equal(s.author, 'anon', 'returns correct author');
  assert.equal(s.generatedBy, 'zest-addon for firefox', 'returns correct app');
  assert.equal(s.title, 'sample title', 'returns correct title');
  assert.equal(s.description, 'sample description', 'correct desc');
  let stmt = s.statements[0];
  assert.equal(stmt.url, 'example.com', 'returns correct url');
  assert.equal(stmt.data, 'foo', 'returns correct data');
  assert.equal(stmt.method, 'GET', 'returns correct method');
  assert.equal(stmt.headers, 'aabbcc', 'returns correct headers');
  let rsp = stmt.response;
  assert.equal(rsp.url, 'example.com', 'returns correct url');
  assert.equal(rsp.headers, 'xxxyyyzzz', 'returns correct headers');
  assert.equal(rsp.body, 'mmmm', 'returns correct body');
  assert.equal(rsp.statusCode, 200, 'returns correct statusCode');
  assert.equal(rsp.responseTimeInMs, 20, 'returns correct time');
  assert.equal(rsp.elementType, 'ZestResponse', 'returns correct type');
  let assert1 = stmt.assertions[0];
  assert.equal(assert1.rootExpression.code, 200, 'status code');
  assert.equal(assert1.rootExpression.not, false, 'not');
  assert.equal(assert1.rootExpression.elementType, 'ZestExpressionStatusCode',
               'status code type');
  assert.equal(assert1.elementType, 'ZestAssertion', 'assertion type');
  let assert2 = stmt.assertions[1];
  assert.equal(assert2.rootExpression.length, 4, 'length value');
  assert.equal(assert2.rootExpression.approx, 1, 'approx value');
  assert.equal(assert2.rootExpression.variableName, 'response.body',
               'variable name');
  assert.equal(assert2.rootExpression.not, false, 'not');
  assert.equal(assert2.rootExpression.elementType, 'ZestExpressionLength',
               'expression length type');
  assert.equal(assert2.elementType, 'ZestAssertion', 'assertion type');

  let opts2 = {
    type: 'json',
    zest: tinyZest  
  }
}

require('sdk/test').run(exports);
