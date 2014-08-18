/* global CustomEvent, $ */

define(function() {
  'use strict';

  var zestId;
  var statusCodeList = [100, 101, 200, 201, 202, 203, 204, 205, 206, 300,
                        301, 302, 303, 304, 305, 306, 400, 401, 402, 403,
                        404, 405, 406, 407, 408, 409, 410, 411, 412, 413,
                        414, 415, 416, 417, 500, 501, 502, 503, 504, 505];
  var varExpList = ['request.body', 'request.header', 'request.method',
                    'request.url', 'response.body', 'response.header',
                    'response.url'];

  function emitSignal(eventName, data) {
    var evt = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(evt);
  }

  // Pass the given node to the runner
  function runNode(node) {
    emitSignal('runNode', {
      nodeKey: parseInt(node.data.key),
      treeId: parseInt(zestId)
    });
  }

  // Delete the given node from the tree and also emits 'deleteNode'
  // to delete the same node from the data store.
  function deleteNode(node) {
    var newNode;
    if (!node.isLastSibling()) {
      newNode = node.getNextSibling();
    }
    var num = node.data.key;
    emitSignal('deleteNode', {
      nodeKey: parseInt(node.data.key),
      treeId: parseInt(zestId)
    });
    node.remove();
    if (newNode) {
      renameTree(num, newNode);
    }
  }

  function deleteAssertionNode(node) {
    var parent = node.getParent();
    emitSignal('deleteAssertionNode', {
      nodeKey: node.data.parentNodeKey,
      treeId: parseInt(zestId),
      id: node.data.childId
    });
    node.remove();
    parent.data.childNodes--;
    try {
      var list = parent.getChildren();
      var i = 0;
      for (var c of list) {
        c.data.childId = i;
        i++;
      }
    }
    catch(e) {}
  }

  // Rename a given tree from a given starting node till the end with
  // a provided initial number.
  function renameTree(initNum, start) {
    var num = initNum;
    start.data.key = num;
    while(true) {
      start = start.getNextSibling();
      num++;
      start.data.key = num;
      if (start.isLastSibling()) {
        break;
      }
    }
  }

  function updateNode(attr, node, val) {
    var changes, title;
    switch (attr) {
      case 'ZestRequest':
        node.data['request.url'] = val['request.url'];
        node.data['request.method'] = val['request.method'];
        node.data['request.body'] = val['request.body'];
        node.data['request.header'] = val['request.header'];
        node.data['response.statusCode'] = val['response.statusCode'];
        node.data['response.time'] = val['response.time'];
        node.data['response.header'] = val['response.header'];
        node.data['response.body'] = val['response.body'];
        title = node.data['request.method'] + ' : ' + node.data['request.url'];
        node.setTitle(title);
        changes = {
          type: node.data.type,
          attr: val
        };
        break;
      case 'ZestComment':
        node.data.comment = val;
        title = 'Comment: ' + val;
        node.setTitle(title);
        changes = {
          type: node.data.type,
          attr: val
        };
        break;
      case 'ZestExpressionStatusCode':
        node.data.statCode = val;
        title = 'Assert - Status Code (' + node.data.statCode + ')';
        node.setTitle(title);
        changes = {
          type: node.data.type,
          code: node.data.statCode
        };
        break;
      case 'ZestExpressionLength':
        node.data.selectedVar = val.selectedVar;
        node.data[val.selectedVar] = val.length;
        node.data.approx = val.approx;
        title = 'Assert - Length (' + val.selectedVar + ' = ' +
                val.length + ' +/- ' + val.approx + '%)';
        node.setTitle(title);
        changes = {
          type: node.data.type,
          variableName: node.data.selectedVar,
          length: val.length,
          approx: node.data.approx
        };
        break;
      case 'ZestExpressionRegex':
        node.data.selectedVar = val.selectedVar;
        node.data.regex = val.regex;
        node.data.caseSense = val.caseSense;
        node.data.inverse = val.inverse;
        title = 'Assert - ' + val.selectedVar + ' Regex (' + val.regex + ')';
        node.setTitle(title);
        changes = {
          type: node.data.type,
          variableName: node.data.selectedVar,
          regex: node.data.regex,
          caseSense: node.data.caseSense,
          inverse: node.data.inverse
        };
        break;
      default:
    }
    var data = {
      nodeKey: node.data.isFolder ?
               parseInt(node.data.key) : parseInt(node.data.parentNodeKey),
      treeId: parseInt(zestId),
      changes: changes
    };
    if (node.data.childId !== undefined) {
      data.id = node.data.childId;
    }
    emitSignal('changeAttr', data);
  }

  // Add element as a child node to a request node.
  function addElementToReq(attr, node, val) {
    var ele;
    node.data.childNodes++;
    switch (attr) {
      case 'ZestExpressionStatusCode':
        node.addChild({
          title: 'Assert - Status Code (' + val + ')',
          icon: 'assert.png',
          parentNodeKey: node.data.key,
          type: attr,
          statCode: val,
          childId: (node.data.childNodes - 1)
        });

        ele = {
          type: attr,
          statusCode: val,
        };
        break;
      case 'ZestExpressionLength':
        var child = {
          title: 'Assert - Length (' + val.selectedVar + ' = ' +
                 val.length + ' +/- ' + val.approx + '%)',
          icon: 'assert.png',
          parentNodeKey: node.data.key,
          type: attr,
          selectedVar: val.selectedVar,
          approx: val.approx,
          childId: (node.data.childNodes - 1)
        };
        child['response.body'] = node.data['response.body'].length;
        // need to get original response url
        child['response.url'] = node.data['request.url'].length;
        child['response.header'] = node.data['response.header'].length;
        child['request.body'] = node.data['request.body'].length;
        child['request.header'] = node.data['request.header'].length;
        child['request.method'] = node.data['request.method'].length;
        child['request.url'] = node.data['request.url'].length;
        child[val.selectedVar] = val.length;
        node.addChild(child);
        ele = {
          type: attr,
          length: val.length,
          approx: val.approx,
          varName: val.selectedVar,
        };
        break;
      case 'ZestExpressionRegex':
        node.addChild({
          title: 'Assert - ' + val.selectedVar + ' Regex (' + val.regex + ')',
          icon: 'assert.png',
          parentNodeKey: node.data.key,
          type: attr,
          selectedVar: val.selectedVar,
          regex: val.regex,
          caseSense: val.caseSense,
          inverse: val.inverse,
          childId: (node.data.childNodes - 1)
        });
        ele = {
          type: attr,
          regex: val.regex,
          varName: val.selectedVar,
          caseSense: val.caseSense,
          inverse: val.inverse,
        };
        break;
      default:
    }
    emitSignal('addElement', {
      nodeKey: node.data.key,
      treeId: parseInt(zestId),
      element: ele,
      id: (node.data.childNodes - 1)
    });
  }


  // Get the type of element to be inserted and call the appropriate method.
  function addElement(node, assets) {
    var type, height = 200,
        title = 'Type of Assertion';
    if (assets.name == 'condition') {
      height = 300;
      title = 'Type of Condition';
    }
    var eleName = assets.name.charAt(0).toUpperCase() + assets.name.slice(1);
    $('#zestDialog').load('dialog.html #addElement', function () {
      $('#dialogTitle').text(eleName);
      var radio;
      for (var t of assets.types) {
        radio = $('<input type="radio" name="' + assets.name +
                '" value="' + t + '"/>' + t + '<br>');
        $('#typesRadio').append(radio);
      }
    }).dialog({
      modal: true,
      height: height,
      width: 350,
      title: title,
      buttons: [
        {
          text: 'Next',
          click: function() {
            type = $('input[name="' + assets.name + '"]:checked').val();
            $(this).dialog('close');
            switch (assets.name) {
              case 'assertion':
                addAssertion(type, node);
                break;

              case 'condition':
                addCondition(type, node);
                break;

              default:
            }
          }
        },
        {
          text: 'Cancel',
          click: function() {
            $(this).dialog('close');
          }
        }
      ],
      beforeClose: function(event, ui) { // jshint ignore:line
        $('#zestDialog').empty();
      }
    });
  }

  function addAssertion(type, node) {
    var data = {
      isNew: true,
      title: 'Add Assertion',
      button1: 'Add',
      type: 'assertion'
    };
    switch (type) {
      case 'Status Code':
        addStatusCodeDialog(node, data);
        break;
      case 'Length':
        addLengthDialog(node, data);
        break;
      case 'Regex':
        addRegexDialog(node, data);
        break;
      default:
    }
  }

  function addCondition(type, node) { //jshint ignore:line
    var data = {
      title: 'Add Zest Condition',
      type: 'condition'
    };
    switch (type) {
      case 'Regex':
        addRegexDialog(node, data);
        break;
      case 'Equals':
        break;
      case 'Length':
        addLengthDialog(node, data);
        break;
      case 'Status Code':
        addStatusCodeDialog(node, data);
        break;
      case 'Response Time':
        break;
      case 'URL':
        break;
      case 'Empty AND':
        break;
      case 'Empty OR':
        break;
      default:
    }
    //addConditionStatusCode(type, node);
  }

  function insertCondition(attr, node, value) { // jshint ignore:line
    // XXX INCOMPLETE
    /*
    var ele, childIF, childTHEN, childELSE;
    var root = node.getParent();
    var index = root.getChildren().length + 1;

    switch (attr) {
      case 'ZestExpressionStatusCode':
        childIF = {
          title: 'IF : Status Code',
          isFolder: true,
          key: index,
          icon: 'foo.png',
          type: 'ZestConditional'
        }
        childTHEN = {
          title: 'THEN',
          isFilder: true,
          key: index + 1,
          icon: 'foo.png',
          type: ''
        }
        childELSE = {
          title: 'ELSE'
        }
        break;
      case 'ZestExpressionRegex':
        break;
      case 'ZestExpressionLength':
        break;
      default:
    }
    */
  }

  function addStatusCodeDialog(node, assets) {
    var tmp, title;
    if (assets.type == 'assertion') {
      if (!assets.isNew) {
        title = 'Edit Assertion';
      }
      else {
        title = 'Add Zest Assertion';
      }
    }
    else if (assets.type == 'condition') {
      title = 'Add Zest Condition';
    }

    $('#zestDialog').load('dialog.html #expStatus', function() {
      for (var c of statusCodeList) {
        tmp = $('<option value="' + c + '">' + c + '</option>');
        if (!assets.isNew && c == node.data.statCode) {
          tmp.attr('selected', 'selected');
        }
        $('#statCode').append(tmp);
      }
    }).dialog({
      modal: true,
      height: 200,
      width: 350,
      title: title,
      buttons: [
        {
          text: 'Save',
          click: function() {
            var v = $('#statCode :selected').text();
            $(this).dialog('close');
            if (assets.type == 'assertion') {
              if (!assets.isNew) {
                updateNode('ZestExpressionStatusCode', node, parseInt(v));
              }
              else {
                addElementToReq('ZestExpressionStatusCode', node, parseInt(v));
              }
            }
            else if (assets.type == 'condition') {
              insertCondition('ZestExpressionStatusCode', node, parseInt(v));
            }
          }
        },
        {
          text: 'Cancel',
          click: function() {
            $(this).dialog('close');
          }
        }
      ],
      beforeClose: function(event, ui) { // jshint ignore:line
        $('#zestDialog').empty();
      }
    });
  }

  function addLengthDialog(node, assets) {
    var tmp;
    var selectedVar = node.data.selectedVar;
    $('#zestDialog').load('dialog.html #expLength', function() {
      for (var v of varExpList) {
        tmp = $('<option value="' + v + '">' + v + '</option>');
        if (!assets.isNew && v == selectedVar) {
          tmp.attr('selected', 'selected');
        }
        $('#varName').append(tmp);
      }
      if (!assets.isNew) {
        $('#length').val(node.data[selectedVar]);
        $('#approx').val(node.data.approx);
      }
      $('#varName').on('change', function() {
        if (assets.isNew) {
          var newSel = $('#varName :selected').text();
          $('#length').val(node.data[newSel].length);
        }
        else {
          console.log('failed to register');
        }
      });
    }).dialog({
      modal: true,
      height: 200,
      width: 350,
      title: assets.title,
      buttons: [
        {
          text: assets.button1,
          click: function() {
            var approx = $('#approx').val();
            var len = $('#length').val();
            selectedVar = $('#varName :selected').text();
            var v = {
              selectedVar: selectedVar,
              length: len,
              approx: approx
            };
            $(this).dialog('close');
            if (assets.type == 'assertion') {
              if (!assets.isNew) {
                updateNode('ZestExpressionLength', node, v);
              }
              else {
                addElementToReq('ZestExpressionLength', node, v);
              }
            }
            else if (assets.type == 'condition') {
              insertCondition('ZestExpressionLength', node, parseInt(v));
            }
          }
        },
        {
          text: 'Cancel',
          click: function() {
            $(this).dialog('close');
          }
        }
      ],
      beforeClose: function(event, ui) { // jshint ignore:line
        $('#zestDialog').empty();
      }
    });
  }

  function addRegexDialog(node, assets) {
    var tmp;
    var selectedVar = node.data.selectedVar;
    $('#zestDialog').load('dialog.html #expRegex', function() {
      for (var v of varExpList) {
        tmp = $('<option value="' + v + '">' + v + '</option>');
        if (!assets.isNew && v == selectedVar) {
          tmp.attr('selected', 'selected');
        }
        $('#varName').append(tmp);
      }
      if (!assets.isNew) {
        $('#regexString').val(node.data.regex);
        $('#caseSense').prop('checked', node.data.caseSense);
        $('#inverse').prop('checked', node.data.inverse);
      }
    }).dialog({
      modal: true,
      height: 300,
      width: 350,
      title: assets.title,
      buttons: [
        {
          text: assets.button1,
          click: function() {
            selectedVar = $('#varName :selected').text();
            var regexString = $('#regexString').val();
            var caseSense = $('#caseSense').is(':checked');
            var inverse = $('#inverse').is(':checked');
            var v = {
              selectedVar: selectedVar,
              regex: regexString,
              caseSense: caseSense,
              inverse: inverse
            };
            $(this).dialog('close');
            if (assets.type == 'assertion') {
              if (!assets.isNew) {
                updateNode('ZestExpressionRegex', node, v);
              }
              else {
                addElementToReq('ZestExpressionRegex', node, v);
              }
            }
            else if (assets.type == 'condition') {
              insertCondition('ZestExpressionRegex', node, v);
            }
          }
        },
        {
          text: 'Cancel',
          click: function() {
            $(this).dialog('close');
          }
        }
      ],
      beforeClose: function(event, ui) { // jshint ignore:line
        $('#zestDialog').empty();
      }
    });
  }

  function addComment(node, isNew) {
    $('#zestDialog').load('dialog.html #addComment', function() {
      if (!isNew) {
        $('#commentText').val(node.data.comment);
      }
    }).dialog({
      modal: true,
      height: 300,
      width: 350,
      title: 'Add Zest Comment',
      buttons: [
        {
          text: 'Save',
          click: function() {
            var cmt = $('#commentText').val();
            var root = node.getParent();
            var index = root.getChildren().length + 1;

            if (isNew) {
              var newComment = root.addChild({
                title: 'Comment: ' + cmt,
                isFolder: true,
                key: index,
                icon: 'comment.png',
                type: 'ZestComment',
                comment: cmt
              });
              newComment.move(node, 'after');
              var nodeKey = parseInt(node.data.key) + 1;
              renameTree(nodeKey, newComment);

              var ele = {
                comment: cmt,
                index: nodeKey,
                elementType: 'ZestComment'
              };
              emitSignal('addParentElement', {
                precedingNodeKey: parseInt(node.data.key),
                treeId: parseInt(zestId),
                element: ele
              });
            }
            else {
              updateNode(node.data.type, node, cmt);
            }
            $(this).dialog('close');
          }
        },
        {
          text: 'Cancel',
          click: function() {
            $(this).dialog('close');
          }
        }
      ],
      beforeClose: function(event, ui) { // jshint ignore:line
        $('#zestDialog').empty();
      }
    });
  }

  // Request Info of a node
  function requestInfo(node) {
    switch (node.data.type) {
      case 'ZestRequest':
        $('#zestDialog').load('dialog.html #requestInfo', function() {
          var tmp;
          $('#tabs').tabs();

          $('#reqInfo-url').val(node.data['request.url']);
          var methodList = ['GET', 'POST'];
          for (var m of methodList) {
            tmp = $('<option value="' + m + '">' + m + '</option>');
            if (m == node.data['request.method']) {
              tmp.attr('selected', 'selected');
            }
            $('#reqInfo-method').append(tmp);
          }

          $('#reqInfo-method [name=options]').val(node.data['request.method']);
          $('#reqInfo-header').val(node.data['request.header']);
          $('#reqInfo-body').val(node.data['request.body']);
          for (var c of statusCodeList) {
            tmp = $('<option value="' + c + '">' + c + '</option>');
            if (c == node.data['response.statusCode']) {
              tmp.attr('selected', 'selected');
            }
            $('#resInfo-status').append(tmp);
          }
          $('#resInfo-time').val(node.data['response.time']);
          $('#resInfo-header').val(node.data['response.header']);
          $('#resInfo-body').val(node.data['response.body']);
        }).dialog({
          modal: true,
          height: 700,
          width: 350,
          title: 'Zest Request',
          buttons: [
            {
              text: 'Save',
              click: function() {
                var reqUrl = $('#reqInfo-url').val();
                var reqMethod = $('#reqInfo-method :selected').text();
                var reqHeaders = $('#reqInfo-header').val();
                var reqBody = $('#reqInfo-body').val();

                var resStatus = $('#resInfo-status :selected').text();
                var resTime = $('#resInfo-time').val();
                var resHeaders = $('#resInfo-header').text();
                var resBody = $('#resInfo-body').text();

                var v = {
                  'request.url': reqUrl,
                  'request.method': reqMethod,
                  'request.body': reqBody,
                  'request.header': reqHeaders,
                  'response.statusCode': resStatus,
                  'response.time': resTime,
                  'response.header': resHeaders,
                  'response.body': resBody
                };

                updateNode(node.data.type, node, v);
                $(this).dialog('close');
              }
            },
            {
              text: 'Cancel',
              click: function() {
                $(this).dialog('close');
              }
            }
          ],
          beforeClose: function(event, ui) { // jshint ignore:line
            $('#zestDialog').empty();
          }
        });
        break;
      case 'ZestComment':
        addComment(node);
        break;
    }
  }

  // Open the respective assertion editor base on the type of node.
  function assertionEditor(node) {
    var assets = {
      title: 'Edit Assertion',
      button1: 'Save',
      type: 'assertion'
    };
    if (node.data.type == 'ZestExpressionStatusCode') {
      addStatusCodeDialog(node, assets);
    }
    else if (node.data.type == 'ZestExpressionLength') {
      addLengthDialog(node, assets);
    }
    else if (node.data.type == 'ZestExpressionRegex') {
      addRegexDialog(node, assets);
    }
    else {
      console.log('ME NO KNOW NODE');
    }
  }

  function setZestId(zId) {
    zestId = zId;
  }

  function getZestId() {
    return zestId;
  }

  return {
    emitSignal: emitSignal,
    runNode: runNode,
    deleteNode: deleteNode,
    deleteAssertionNode: deleteAssertionNode,
    renameTree: renameTree,
    addElement: addElement,
    addComment: addComment,
    requestInfo: requestInfo,
    assertionEditor: assertionEditor,
    setZestId: setZestId,
    getZestId: getZestId
  };
});
