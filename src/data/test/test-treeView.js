/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* global $, define, ok, test, equal */

'use strict';

define(['treeView'],
  function (tv) {

    function initializeTree(z) {
      var $fixture = $('#qunit-fixture');
      $fixture.append('<div id="tree"></div>');
      $('#tree').dynatree();
      tv.createTree(z);
    }

    var run = function() {
      module('TreeView tests');

      test('Create tree with some nodes', function () {
        initializeTree(z);
        var root = $('#tree').dynatree('getRoot');
        equal(root.getChildren().length, 4,
              'Failed to match correct count of nodes.');
      });

      test('Check ZestRequest node properties', function () {
        initializeTree(z);
        var tree = $('#tree').dynatree('getTree');
        var node = tree.getNodeByKey('1');
        equal(node.data.title, 'GET : http://gmail.com/',
              'Titles do not match');
        equal(node.data.icon, 'request.png', 'Icons do not match');
        ok(node.data.isFolder, 'Folder not recognized');
        equal(node.data.type, 'ZestRequest', 'Node types do not match');
        equal(node.data['request.url'], 'http://gmail.com/',
              'Request url do not match');
        equal(node.data['request.method'], 'GET', 'Methods do not match');
        equal(node.data['request.body'], '', 'Body do not match');
        /* jshint ignore:start */
        equal(node.data['request.header'], head,
              'Request Headers do not match');
        equal(node.data['response.statusCode'], '301',
              'Status code do not match');
        equal(node.data['response.time'], '306',
              'Response time do not match');
        equal(node.data['response.header', '',
              'Response Headers do not match']);
        equal(node.data['response.body'], '',
              'Response Body do not match');
        /* jshint ignore:end */
        equal(node.data.childNodes, 3, 'Child node count do not match');
      });

      test('Check ZestExpressionStatusCode node properties', function () {
        initializeTree(z);
        var tree = $('#tree').dynatree('getTree');
        var parentNode = tree.getNodeByKey('1');
        var node = parentNode.getChildren()[0];
        equal(node.data.title, 'Assert - Status Code (200)',
              'Titles do not match');
        equal(node.data.icon, 'assert.png', 'Icons do not match');
        equal(node.data.parentNodeKey, parentNode.data.key,
              'Parent node keys do not match');
        equal(node.data.type, 'ZestExpressionStatusCode',
              'Node types do not match');
        equal(node.data.statCode, 200, 'Status code do not match');
        equal(node.data.childId, 0, 'ChildIds do not match');
      });

      test('Check ZestExpressionLength node properties', function () {
        initializeTree(z);
        var tree = $('#tree').dynatree('getTree');
        var parentNode = tree.getNodeByKey('1');
        var node = parentNode.getChildren()[1];
        equal(node.data.title, 'Assert - Length (response.body = 68120 +/- 1%)',
              'Titles do not match');
        equal(node.data.icon, 'assert.png', 'Icons do not match');
        equal(node.data.parentNodeKey, parentNode.data.key,
              'Parent node keys do not match');
        equal(node.data.type, 'ZestExpressionLength',
              'Node types do not match');
        equal(node.data.selectedVar, 'response.body',
              'Selected variables do not match');
        equal(node.data.approx, '1', 'Approx values do not match');
        equal(node.data['response.body'], 68120,
              'Response body length do not match');
        equal(node.data['response.url'], 17,
              'Response url length do not match');
        equal(node.data['response.header'], '',
              'Response header length do not match');
        equal(node.data['request.body'], 0,
              'Request body length do not match');
        equal(node.data['request.header'], 245,
              'Request header length do not match');
        equal(node.data['request.method'], 3,
              'Request method length do not match');
        equal(node.data['request.url'], 17,
              'Request url length do not match');
        equal(node.data.childId, 1, 'ChildIds do not match');
      });

      test('Check ZestExpressionRegex node properties', function () {
        initializeTree(z);
        var tree = $('#tree').dynatree('getTree');
        var parentNode = tree.getNodeByKey('1');
        var node = parentNode.getChildren()[2];
        equal(node.data.title, 'Assert - response.header Regex (Mozilla)',
              'Titles do not match');
        equal(node.data.icon, 'assert.png', 'Icons do not match');
        equal(node.data.parentNodeKey, parentNode.data.key,
              'Parent node keys do not match');
        equal(node.data.type, 'ZestExpressionRegex',
              'Node types do not match');
        equal(node.data.selectedVar, 'response.header',
              'Selected variables do not match');
        equal(node.data.regex, 'Mozilla', 'Regex string do not match');
        equal(node.data.caseSense, false, 'CaseExact do not match');
        equal(node.data.inverse, false, 'not do not match');
        equal(node.data.childId, 2, 'ChildIds do not match');
      });
    };
    return {run: run};
  }
);


var z = {};
/* jshint ignore:start */
var head = "Host: gmail.com\nUser-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:30.0) Gecko/20100101 Firefox/30.0\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\nAccept-Language: en-US,en;q=0.5\nAccept-Encoding: gzip, deflate\n";

var x = {
  "about": "This is a Zest script. For more details about Zest visit https://developer.mozilla.org/en-US/docs/Zest",
  "zestVersion": "0.3",
  "title": "gmail",
  "description": "sample description",
  "prefix": "",
  "author": "anon",
  "generatedBy": "zest-addon for firefox",
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
      "headers": "Host: gmail.com\nUser-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:30.0) Gecko/20100101 Firefox/30.0\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\nAccept-Language: en-US,en;q=0.5\nAccept-Encoding: gzip, deflate\n",
      "response": {
        "url": "http://gmail.com/",
        "headers": "",
        "body": "",
        "statusCode": "301",
        "responseTimeInMs": "306",
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
            "length": "68120",
            "approx": "1",
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
      "followRedirect": "",
      "index": 1,
      "elementType": "ZestRequest"
    },
    {
      "comment": "Redirects from gmail",
      "index": 2,
      "elementType": "ZestComment"
    },
    {
      "url": "https://ssl.gstatic.com/accounts/ui/logo_2x.png",
      "data": "",
      "method": "GET",
      "headers": "Host: ssl.gstatic.com\r\nUser-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:30.0) Gecko/20100101 Firefox/30.0\r\nAccept: image/png,image/*;q=0.8,*/*;q=0.5\r\nAccept-Language: en-US,en;q=0.5\r\nAccept-Encoding: gzip, deflate\r\nReferer: https://accounts.google.com/ServiceLogin?service=mail&passive=true&rm=false&continue=https://mail.google.com/mail/&ss=1&scc=1&ltmpl=default&ltmplcache=2&emr=1\r\n",
      "response": {
        "url": "https://ssl.gstatic.com/accounts/ui/logo_2x.png",
        "headers": "HTTP/1.1 200 OK\r\nAge: 312770\r\nAlternate-Protocol: 443:quic\r\nCache-Control: public, max-age=31536000\r\nContent-Length: 9005\r\nContent-Type: image/png\r\nDate: Wed, 16 Jul 2014 16:00:40 GMT\r\nExpires: Thu, 16 Jul 2015 16:00:40 GMT\r\nLast-Modified: Tue, 17 Sep 2013 00:02:19 GMT\r\nServer: sffe\r\nX-Content-Type-Options: nosniff\r\nX-XSS-Protection: 1; mode=block\r\nX-Firefox-Spdy: 3.1\r\n",
        "body": "",
        "statusCode": 200,
        "responseTimeInMs": 661,
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
            "length": 9007,
            "approx": 1,
            "variableName": "response.body",
            "not": false,
            "elementType": "ZestExpressionLength"
          },
          "elementType": "ZestAssertion"
        }
      ],
      "followRedirect": "",
      "index": 6,
      "elementType": "ZestRequest"
    },
    {
      "url": "https://ssl.gstatic.com/accounts/ui/avatar_2x.png",
      "data": "",
      "method": "GET",
      "headers": "Host: ssl.gstatic.com\r\nUser-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:30.0) Gecko/20100101 Firefox/30.0\r\nAccept: image/png,image/*;q=0.8,*/*;q=0.5\r\nAccept-Language: en-US,en;q=0.5\r\nAccept-Encoding: gzip, deflate\r\nReferer: https://accounts.google.com/ServiceLogin?service=mail&passive=true&rm=false&continue=https://mail.google.com/mail/&ss=1&scc=1&ltmpl=default&ltmplcache=2&emr=1\r\n",
      "response": {
        "url": "https://ssl.gstatic.com/accounts/ui/avatar_2x.png",
        "headers": "HTTP/1.1 200 OK\r\nAge: 312768\r\nAlternate-Protocol: 443:quic\r\nCache-Control: public, max-age=31536000\r\nContent-Length: 2195\r\nContent-Type: image/png\r\nDate: Wed, 16 Jul 2014 16:00:42 GMT\r\nExpires: Thu, 16 Jul 2015 16:00:42 GMT\r\nLast-Modified: Tue, 08 Oct 2013 22:50:46 GMT\r\nServer: sffe\r\nX-Content-Type-Options: nosniff\r\nX-XSS-Protection: 1; mode=block\r\nX-Firefox-Spdy: 3.1\r\n",
        "body": "",
        "statusCode": 200,
        "responseTimeInMs": 679,
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
            "length": 2195,
            "approx": 1,
            "variableName": "response.body",
            "not": false,
            "elementType": "ZestExpressionLength"
          },
          "elementType": "ZestAssertion"
        }
      ],
      "followRedirect": "",
      "index": 7,
      "elementType": "ZestRequest"
    }
  ],
  "authentication": [],
  "index": 1,
  "elementType": "ZestScript"
}
/* jshint ignore:end */

z.id = 1;
z.zest = JSON.stringify(x); // jshint ignore:line
