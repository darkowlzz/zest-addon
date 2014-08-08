let fullZest = {
  "about": "This is a Zest script. For more details about Zest visit https://developer.mozilla.org/en-US/docs/Zest",
  "zestVersion": "0.3",
  "generatedBy": "zest-addon for firefox",
  "author": "anon",
  "title": "gmail.zst",
  "description": "sample description",
  "prefix": "",
  "parameters": {
    "tokenStart": "{{",
    "tokenEnd": "}}",
    "tokens": {},
    "elementType": "ZestVariables"
  },
  "statements": [
    {
      "url": "http://gmail.com/",
      "data": "",
      "method": "GET",
      "headers": "Host: gmail.com\nUser-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:30.0) Gecko/20100101 Firefox/30.0\nAccept: text/html,application/xhtml+xml,application/xml;q\u003d0.9,*/*;q\u003d0.8\nAccept-Language: en-US,en;q\u003d0.5\nAccept-Encoding: gzip, deflate\n",
      "response": {
        "url": "http://gmail.com/",
        "headers": "",
        "body": "",
        "statusCode": 301,
        "responseTimeInMs": 306,
        "elementType": "ZestResponse"
      },
      "assertions": [
        {
          "rootExpression": {
            "code": 200,
            "not": false,
            "elementType": "ZestExpressionStatusCode"
          },
          "elementType": "ZestAssertion"
        },
        {
          "rootExpression": {
            "length": 68120,
            "approx": 1,
            "variableName": "response.body",
            "not": false,
            "elementType": "ZestExpressionLength"
          },
          "elementType": "ZestAssertion"
        },
        {
          "rootExpression": {
            "regex": "Mozilla",
            "variableName": "response.header",
            "caseExact": false,
            "not": false,
            "elementType": "ZestExpressionRegex"
          },
          "elementType": "ZestAssertion"
        }
      ],
      "followRedirects": true,
      "cookies": [],
      "index": 1,
      "elementType": "ZestRequest"
    },
    {
      "rootExpression": {
        "code": 100,
        "not": false,
        "elementType": "ZestExpressionStatusCode"
      },
      "ifStatements": [
        {
          "message": "hi",
          "index": 3,
          "elementType": "ZestActionPrint"
        }
      ],
      "elseStatements": [
        {
          "message": "bye",
          "index": 4,
          "elementType": "ZestActionPrint"
        }
      ],
      "index": 2,
      "elementType": "ZestConditional"
    },
    {
      "comment": "Redirects from gmail",
      "index": 5,
      "elementType": "ZestComment"
    },
    {
      "url": "http://gmail.com/",
      "data": "",
      "method": "GET",
      "headers": "Host: mail.google.com\r\nUser-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:30.0) Gecko/20100101 Firefox/30.0\r\nAccept: text/html,application/xhtml+xml,application/xml;q\u003d0.9,*/*;q\u003d0.8\r\nAccept-Language: en-US,en;q\u003d0.5\r\nAccept-Encoding: gzip, deflate\r\n",
      "response": {
        "url": "http://gmail.com/",
        "headers": "HTTP/1.1 302 Moved Temporarily\r\nAlternate-Protocol: 443:quic\r\nCache-Control: no-cache, no-store, max-age\u003d0, must-revalidate\r\nContent-Encoding: gzip\r\nContent-Length: 260\r\nContent-Type: text/html; charset\u003dUTF-8\r\nDate: Sun, 20 Jul 2014 06:53:29 GMT\r\nExpires: Fri, 01 Jan 1990 00:00:00 GMT\r\nLocation: https://accounts.google.com/ServiceLogin?service\u003dmail\u0026passive\u003dtrue\u0026rm\u003dfalse\u0026continue\u003dhttps://mail.google.com/mail/\u0026ss\u003d1\u0026scc\u003d1\u0026ltmpl\u003ddefault\u0026ltmplcache\u003d2\u0026emr\u003d1\r\nPragma: no-cache\r\nServer: GSE\r\nX-Content-Type-Options: nosniff\r\nX-Frame-Options: SAMEORIGIN\r\nX-XSS-Protection: 1; mode\u003dblock\r\nX-Firefox-Spdy: 3.1\r\n",
        "body": "",
        "statusCode": 302,
        "responseTimeInMs": 993,
        "elementType": "ZestResponse"
      },
      "assertions": [
        {
          "rootExpression": {
            "code": 302,
            "not": false,
            "elementType": "ZestExpressionStatusCode"
          },
          "elementType": "ZestAssertion"
        },
        {
          "rootExpression": {
            "length": 68116,
            "approx": 1,
            "variableName": "response.body",
            "not": false,
            "elementType": "ZestExpressionLength"
          },
          "elementType": "ZestAssertion"
        }
      ],
      "followRedirects": true,
      "cookies": [],
      "index": 6,
      "elementType": "ZestRequest"
    }
  ],
  "authentication": [],
  "index": 1,
  "elementType": "ZestScript"
}
exports.fullZest = fullZest;

// Request obtained by recording.
let sampleRequest = {
  url: 'example.com',
  data: 'foo',
  method: 'GET',
  RequestHeaders: 'aabbcc',
  Response: {
    url: 'example.com',
    ResponseHeaders: 'xxxyyyzzz',
    bodyListener: {
      responseBody: 'mmmm'
    },
    statusCode: 200,
    responseTimeInMs: 20
  }
}
exports.sampleRequest = sampleRequest;

let sampleResponse = {
  url: 'example.com',
  headers: 'xxxxyyyzzzz',
  body: 'aaabbbccc',
  statusCode: 300,
  responseTimeInMs: 51
}
exports.sampleResponse = sampleResponse;

let tinyZest = {
  author: 'John Doe',
  generatedBy: 'firefox',
  title: 'Awesome script',
  description: 'xyz',
  statements: [
    {
      url: 'fooxxx',
      data: 'faa',
      method: 'GET',
      headers: 'xxxx',
      response: {
        url: 'fooxxx',
        headers: 'yyyy',
        body: 'I am a mozillian',
        statusCode: 200,
        responseTimeInMs: 100,
        elementType: 'ZestRequest'
      },
      assertions: [
        {
          rootExpression: {
            code: 200,
            not: false,
            elementType: 'ZestExpressionStatusCode'
          },
          elementType: 'ZestAssertion'
        },
        {
          rootExpression: {
            length: 250,
            approx: 1,
            variableName: 'request.body',
            not: false,
            elementType: 'ZestExpressionLength'
          },
          elementType: 'ZestAssertion'
        }
      ],
      followRedirect: '',
      index: 1,
      elementType: 'ZestRequest'
    }
  ],
  authentication: [],
  index: 1,
  elementType: 'ZestScript'
}
exports.tinyZest = tinyZest;

let goodRequest = {
  url: 'example.com',
  data: 'foo',
  method: 'GET',
  headers: 'aabbcc',
  response: {
    url: 'example.com',
    headers: 'xxxyyyzzz',
    body: 'mmmm',
    statusCode: 200,
    responseTimeInMs: 20,
    elementType: 'ZestResponse'
  },
  assertions: [
    {
      rootExpression: {
        code: 200,
        not: false,
        elementType: 'ZestExpressionStatusCode'
      },
      elementType: 'ZestAssertion'
    },
    {
      rootExpression: {
        length: 4,
        approx: 1,
        variableName: 'response.body',
        not: false,
        elementType: 'ZestExpressionLength'
      },
      elementType: 'ZestAssertion'
    }
  ],
  followRedirect: '',
  index: 3,
  elementType: 'ZestRequest'
};
exports.goodRequest = goodRequest;
