/* global CustomEvent, $ */

define(
  [
    'dynatree/jquery/jquery',
    'dynatree/jquery/jquery-ui.custom',
    'dynatree/src/jquery.dynatree',
    'dynatree/doc/contextmenu/jquery.contextMenu-custom'
  ],
  function(_){ // jshint ignore:line
  'use strict';

  var currentZest;
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

  function bindRequestContextMenu(span) {
    $(span).contextMenu({menu: 'nodeMenu'}, function(action, el, pos) { // jshint ignore:line
      var node = $.ui.dynatree.getNode(el);
      switch(action) {
        case 'run':
          runNode(node);
          break;

        case 'delete':
          deleteNode(node);
          break;

        case 'key':
          console.log('key: ' + node.data.key);
          break;

        case 'addAssertion':
          var assets = {
            name: 'assertion',
            types: ['Length', 'Regex'],
          };
          addElement(node, assets);
          break;

        case 'addComment':
          var isNew = true;
          addComment(node, isNew);
          break;

        default:

      }
    });
  }

  function runNode(node) {
    emitSignal('runNode', {
      nodeKey: parseInt(node.data.key),
      treeId: parseInt(zestId)
    });
  }

  function deleteNode(node) {
    var newNode;
    if (node.isLastSibling()) {
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

  // Add element as a child node to a request node.
  function addElementToReq(attr, node, val) {
    var ele;
    node.data.childNodes++;
    switch (attr) {
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
          caseExact: val.caseSense,
          not: val.inverse,
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

  function renameTree(initNum, start) {
    var num = initNum;
    start.data.key = num;
    while(start == start.getNextSibling()) {
      num++;
      start.data.key = num;
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


  // Bind context menu to assertion elements
  function bindAssertContextMenu(span) {
    $(span).contextMenu({menu: 'assertMenu'}, function(action, el, pos) { // jshint ignore:line
      var node = $.ui.dynatree.getNode(el);
      switch(action) {
        case 'edit':
          assertionEditor(node);
          break;

        case 'delete':
          deleteAssertionNode(node);
          break;

        default:
          break;
      }
    });
  }

  // Open the respective assertion editor base on the type of node.
  function assertionEditor(node) {
    var assets;
    if (node.data.type == 'ZestExpressionStatusCode') {
      addAssertionStatusCode(node);
    }
    else if (node.data.type == 'ZestExpressionLength') {
      assets = {
        title: 'Edit Assertion',
        button1: 'Save'
      };
      addAssertionLength(node, assets);
    }
    else if (node.data.type == 'ZestExpressionRegex') {
      assets = {
        title: 'Edit Assertion',
        button1: 'Save'
      };
      addAssertionRegex(node, assets);
    }
    else {
      console.log('ME NO KNOW NODE');
    }
  }

  function addAssertionStatusCode(node) {
    var p = $('<p id="statPara">Status Code: </p>');
    var x = $('<select></select>');
    var tmp;
    for (var c of statusCodeList) {
      tmp = $('<option value="' + c + '">' + c + '</option>');
      if (c == node.data.statCode) {
        tmp.attr('selected', 'selected');
      }
      x.append(tmp);
    }
    p.append(x);

    $('#zestDialog').append(p);
    $('#zestDialog').dialog({
      modal: true,
      height: 200,
      width: 350,
      title: 'Edit Assertion',
      buttons: [
        {
          text: 'Save',
          click: function() {
            var v = $('#statPara :selected').text();
            updateNode('ZestExpressionStatusCode', node, parseInt(v));
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

  function addAssertionLength(node, assets) {
    var p0 = $('<p>Variable Name: </p>');
    var x0 = $('<select id="varName"></select>');
    var tmp;
    var selectedVar = node.data.selectedVar;
    for (var v of varExpList) {
      tmp = $('<option value="' + v + '">' + v + '</option>');
      if (!assets.isNew && v == selectedVar) {
        tmp.attr('selected', 'selected');
      }
      x0.append(tmp);
    }
    p0.append(x0);
    $('#zestDialog').append(p0);

    var p1 = $('<p>Length: </p>');
    var x1 = $('<input id="length" type="number" value="0">');
    if (!assets.isNew) {
      x1.val(node.data[selectedVar]);
    }

    p1.append(x1);
    $('#zestDialog').append(p1);

    var p2 = $('<p>Plus/minus %: </p>');
    var x2 = $('<input id="approx" type="number" min="0" max="100" value="0">');
    if (!assets.isNew) {
      x2.val(node.data.approx);
    }
    p2.append(x2);
    $('#zestDialog').append(p2);

    $('#varName').on('change', function() {
      if (assets.isNew) {
        var newSel = $('#varName :selected').text();
        $('#length').val(node.data[newSel].length);
      }
      else {
        console.log('failed to register');
      }
    });

    $('#zestDialog').dialog({
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
            if (!assets.isNew) {
              updateNode('ZestExpressionLength', node, v);
            }
            else {
              addElementToReq('ZestExpressionLength', node, v);
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

  function addAssertionRegex(node, assets) {
    var p0 = $('<p>Variable Name: </p>');
    var x0 = $('<select id="varName"></select>');
    var tmp;
    var selectedVar = node.data.selectedVar;

    for (var v of varExpList) {
      tmp = $('<option value="' + v + '">' + v + '</option>');
      if (!assets.isNew && v == selectedVar) {
        tmp.attr('selected', 'selected');
      }
      x0.append(tmp);
    }
    p0.append(x0);
    $('#zestDialog').append(p0);

    var p1 = $('<p>Regex: </p>');
    var x1 = $('<input id="regexString" type="text">');
    if (!assets.isNew) {
      x1.val(node.data.regex);
    }
    p1.append(x1);
    $('#zestDialog').append(p1);

    var p2 = $('<p>Case Exact: </p>');
    var x2 = $('<input id="caseSense" type="checkbox">');
    if (!assets.isNew) {
      x2.prop('checked', node.data.caseSense);
    }
    p2.append(x2);
    $('#zestDialog').append(p2);

    var p3 = $('<p>Inverse: </p>');
    var x3 = $('<input id="inverse" type="checkbox">');
    if (!assets.isNew) {
      x3.prop('checked', node.data.inverse);
    }
    p3.append(x3);
    $('#zestDialog').append(p3);


    $('#zestDialog').dialog({
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
            if (!assets.isNew) {
              updateNode('ZestExpressionRegex', node, v);
            }
            else {
              addElementToReq('ZestExpressionRegex', node, v);
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

  // Get the type of element to be inserted and call the appropriate method.
  function addElement(node, assets) {
    var type;
    var eleName = assets.name.charAt(0).toUpperCase() + assets.name.slice(1);
    var p0 = $('<p>' + eleName + ': </p>');
    var radioDiv = $('<div></div>');

    var radio;
    for (var typ of assets.types) {
      radio = $('<input type="radio" name="' + assets.name +
              '" value="' + typ + '"/>' + typ + '<br>');
      radioDiv.append(radio);
    }

    p0.append(radioDiv);
    $('#zestDialog').append(p0);
    var data;

    $('#zestDialog').dialog({
      modal: true,
      height: 200,
      width: 350,
      title: 'Type of Assertion',
      buttons: [
        {
          text: 'Next',
          click: function() {
            type = $('input[name="' + assets.name + '"]:checked').val();
            $(this).dialog('close');
            if (type == 'Length') {
              data = {
                isNew: true,
                title: 'Add Assertion',
                button1: 'Add'
              };
              addAssertionLength(node, data);
            }
            else if (type == 'Regex') {
              data = {
                isNew: true,
                title: 'Add Assertion',
                button1: 'Add'
              };
              addAssertionRegex(node, data);
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

  // Request Info of a node
  function requestInfo(node) {
    switch (node.data.type) {
      case 'ZestRequest':
        var tabDiv = $('<div id="tabs">' + 
                       '<ul>' +
                         '<li><a href="#tabs-1">Request</a></li>' +
                         '<li><a href="#tabs-2">Response</a></li>' +
                       '</ul>' +
                       '</div>');
        var tab1 = $('<div id="tabs-1"></div>');
        var tab2 = $('<div id="tabs-2"></div>');

        /** Creating request tab content **/
        var tab1p0 = $('<p id="reqInfo-url-para">URL: <input type="url"' + 
                       'id="reqInfo-url" value="' + node.data['request.url'] + 
                       '"></p>');
        tab1.append(tab1p0);

        var tab1p1 = $('<p id="reqInfo-method-para">Method: </p>');
        var x0 = $('<select id="reqInfo-method"></select>');
        var methodList = ['GET', 'POST'];
        var selectedMethod = node.data['request.method'];
        var tmp;
        for (var m of methodList) {
          tmp = $('<option value="' + m + '">' + m + '</option>');
          if (m == selectedMethod) {
            tmp.attr('selected', 'selected');
          }
          x0.append(tmp);
        }
        tab1p1.append(x0);
        tab1.append(tab1p1);

        var tab1p2 = $('<p id="reqInfo-header-para">Headers: </p>');
        var x1 = $('<textarea id="reqInfo-header" rows="15" cols="50" wrap="hard">' + node.data['request.header'] + '</textarea>'); // jshint ignore:line
        tab1p2.append(x1);
        tab1.append(tab1p2);

        var tab1p3 = $('<p id="reqInfo-body-para">Body: </p>');
        var x2 = $('<textarea id="reqInfo-body" rows="10" cols="50" wrap="hard">' + node.data['request.body'] + '</textarea>'); // jshint ignore:line
        tab1p3.append(x2);
        tab1.append(tab1p3);

        /** Creating response tab content **/
        var tab2p0 = $('<p id="resInfo-status-para">' + 
                       'Status Code: </p>');
        var xn = $('<select id="resInfo-status"></select>');
        for (var c of statusCodeList) {
          tmp = $('<option value="' + c + '">' + c + '</option>');
          if (c == node.data['response.statusCode']) {
            tmp.attr('selected', 'selected');
          }
          xn.append(tmp);
        }
        tab2p0.append(xn);
        tab2.append(tab2p0);

        var tab2p1 = $('<p id="resInfo-time-para">' + 
                       'Time in ms: <input type="number" id="resInfo-time" ' +
                       'value="' + node.data['response.time'] + '"></p>');
        tab2.append(tab2p1);

        var tab2p2 = $('<p id="resInfo-header-para">Headers: </p>');
        var x3 = $('<textarea id="resInfo-header" rows="15" cols="50" wrap="hard">' + node.data['response.header'] + '</textarea>'); // jshint ignore:line
        tab2p2.append(x3);
        tab2.append(tab2p2);

        var tab2p3 = $('<p id="resInfo-body-para">Body: </p>');
        var x4 = $('<textarea id="resInfo-body" rows="10" cols="50" wrap="hard">' + node.data['response.body'] + '</textarea>'); // jshint ignore:line
        tab2p3.append(x4);
        tab2.append(tab2p3);

        tabDiv.append(tab1);
        tabDiv.append(tab2);

        tabDiv.tabs();

        $('#zestDialog').append(tabDiv);
        $('#zestDialog').dialog({
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

  function addComment(node, isNew) {
    var p0 = $('<p>Comment:</p>');
    var x0 = $('<textarea id="commentText" rows="7" cols="40"></textarea>');
    if (!isNew) {
      console.log('Not NEW');
      console.log(node.data.comment);
      x0.val(node.data.comment);
    }
    p0.append(x0);

    $('#zestDialog').append(p0);

    $('#zestDialog').dialog({
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
              console.log('UPDATING OLD');
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


  // Initialize dynatree
  $(function(){
    $('#tree').dynatree({
      onClick: function(node, event) { // jshint ignore:line
        node.activate();
        // Expand only when the expander is clicked
        if (node.getEventTargetType(event) == 'expander') {
          node.toggleExpand();
        }
        // Hide context menu, avoiding multiple context menus
        if ($('.contextMenu:visible').length > 0) {
          $('.contextMenu').hide();
        }
        return false;
      },
      onDblClick: function(node, event) { // jshint ignore:line
        if (node.data.isFolder) {
          requestInfo(node);
        }
        else {
          assertionEditor(node);
        }
      },
      onCreate: function(node, span) {
        if (node.data.isFolder) {
          bindRequestContextMenu(span);
        }
        else {
          // context menu for non-folders
          bindAssertContextMenu(span);
        }
      },
      dnd: {
        onDragStart: function(node) {
          // Drag only the folders
          if (node.data.isFolder) {
            return true;
          }
          else {
            return false;
          }
        },
        onDragStop: function(node) { // jshint ignore:line

        },
        autoExpandMS: 1000,
        preventVoidMoves: true,
        onDragEnter: function(node, sourceNode) { // jshint ignore:line
          return true;
        },
        onDragOver: function(node, sourceNode, hitMode) { // jshint ignore:line
          // Prevent dropping a parent below it's own child.
          if (node.isDescendantOf(sourceNode)) {
            return false;
          }
          // Prevent dropping a folder below a non-folder
          if (!node.data.isFolder) {
            return false;
          }
        },
        onDrop: function(node, sourceNode, hitMode, // jshint ignore:line
                         ui, draggable) { // jshint ignore:line
          if (node.data.isFolder) {
            var first, num;

            // Emit signal to apply the change in zestLogs
            emitSignal('treeChange', {
              src: parseInt(sourceNode.data.key),
              trg: parseInt(node.data.key),
              id: parseInt(zestId)
            });

            // Rename the 'key' of the reorganized tree.
            // Select the first element to rename.
            if (sourceNode.isFirstSibling()) {
              first = sourceNode.getNextSibling();
              num = 1;
            } else if (sourceNode.data.key < node.data.key) {
              first = sourceNode.getPrevSibling();
              num = sourceNode.data.key - 1;
            } else {
              first = node;
              num = node.data.key;
            }

            // Drop folder as a sibling after the target
            sourceNode.move(node, 'after');

            // Apply renaming after moving the node above.
            renameTree(num, first);
          }
        },
        onDragLeave: function(node, sourceNode) { // jshint ignore:line
        }
      }
    });
  });

  return {
    clear: function() {
      try {
        $('#tree').dynatree('getRoot').removeChildren();
      }
      catch(e) {}
    },

    createTree: function(importedZest) {
      currentZest = importedZest.zest;
      zestId = importedZest.id;

      var root = $('#tree').dynatree('getRoot');
      try {
        root.removeChildren();
      }
      catch(e) {}

      var z = JSON.parse(currentZest);
      //var numOfReq = z.statements.length;
      var temp = null;
      var temp2 = null;
      for (var i of z.statements) {
        temp2 = [];
        try {
          if (i.assertions[0].rootExpression.elementType ==
              'ZestExpressionStatusCode') {
            temp2.push({
              title: 'Assert - Status Code (' +
                     i.assertions[0].rootExpression.code + ')',
              icon: 'assert.png',
              parentNodeKey: i.index,
              type: i.assertions[0].rootExpression.elementType,
              statCode: i.assertions[0].rootExpression.code,
              childId: 0
            });
          }
          if (i.assertions[1].rootExpression.elementType ==
              'ZestExpressionLength') {
            temp2.push({
              title: 'Assert - Length (response.body = ' +
                     i.assertions[1].rootExpression.length + ' +/- ' +
                     i.assertions[1].rootExpression.approx + '%)',
              icon: 'assert.png',
              parentNodeKey: i.index,
              type: i.assertions[1].rootExpression.elementType,
              selectedVar: 'response.body',
              approx: i.assertions[1].rootExpression.approx,
              'response.body': i.assertions[1].rootExpression.length,
              'response.url': i.response.url.length,
              'response.header': i.response.headers.length,
              'request.body': i.data.length,
              'request.header': i.headers.length,
              'request.method': i.method.length,
              'request.url': i.url.length,
              childId: 1
            });
          }
        }
        catch(e) {}

        temp = {
          // All the req/res data is binded to node to reduce complexity in
          // returning data.
          title: (i.method + ' : ' + i.url), isFolder: true, key: i.index,
          icon: 'request.png', children: temp2,
          type: i.elementType,
          'request.url': i.url,
          'request.method': i.method,
          'request.body': i.data,
          'request.header': i.headers,
          'response.statusCode': i.response.statusCode,
          'response.time': i.response.responseTimeInMs,
          'response.header': i.response.headers,
          'response.body': i.response.body,
          childNodes: 2
        };
        root.addChild(temp);
      }

    }

  };

});
