define(
  [
    'dynatree/jquery/jquery',
    'dynatree/jquery/jquery-ui.custom',
    'dynatree/src/jquery.dynatree',
    'dynatree/doc/contextmenu/jquery.contextMenu-custom'
  ],
  function(_){

  var currentZest;
  var zestId;

  function emitSignal(eventName, data) {
    var evt = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(evt);
  }

  function runNode(node) {
    emitSignal('runNode', {
      nodeKey: parseInt(node.data.key),
      treeId: parseInt(zestId)
    });
  }

  function updateNode(attr, node, val) {
    var changes;
    if (attr == 'ZestExpressionStatusCode') {
      node.data.statCode = val;
      var line = 'Assert - Status Code (' + node.data.statCode + ')';
      node.setTitle(line);
      changes = {
        type: 'ZestExpressionStatusCode',
        code: val
      }
    }
    else if (attr == 'ZestExpressionLength') {
      node.data.selectedVar = val.selectedVar;
      node.data.body = val.length;
      node.data.approx = val.approx;
      var line = 'Assert - Length (' + node.data.selectedVar + ' = ' + node.data.body + ' +/- ' + node.data.approx + '%)';
      node.setTitle(line);
      changes = {
        type: 'ZestExpressionLength',
        variableName: val.selectedVar,
        length: val.length,
        approx: val.approx
      }
    }

    emitSignal('changeAttr', {
      nodeKey: parseInt(node.data.parentNodeKey),
      treeId: parseInt(zestId),
      changes: changes,
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

  function renameTree(initNum, start) {
    var num = initNum;
    start.data.key = num;
    while(start = start.getNextSibling()) {
      num++;
      start.data.key = num;
    }
  }

  function bindRequestContextMenu(span) {
    $(span).contextMenu({menu: 'nodeMenu'}, function(action, el, pos) {
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
      }
    })
  }

  function bindAssertContextMenu(span) {
    $(span).contextMenu({menu: 'assertMenu'}, function(action, el, pos) {
      var node = $.ui.dynatree.getNode(el);
      switch(action) {
        case 'edit':
          if (node.data.type == 'ZestExpressionStatusCode') {
            var p = $('<p id="statPara">Status Code: </p>');
            var x = $('<select></select>');
            var codeList = [100, 101, 200, 201, 202, 203, 204, 205, 206, 300,
                            301, 302, 303, 304, 305, 306, 400, 401, 402, 403,
                            404, 405, 406, 407, 408, 409, 410, 411, 412, 413,
                            414, 415, 416, 417, 500, 501, 502, 503, 504, 505];
            var tmp;
            for (var c of codeList) {
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
              beforeClose: function(event, ui) {
                $('#zestDialog').empty();
              }
            });
          }
          else if (node.data.type == 'ZestExpressionLength') {
            var p0 = $('<p>Variable Name: </p>');
            var x0 = $('<select id="varName"></select>');
            var varList = ['request.body', 'request.header', 'request.method',
                           'request.url', 'response.body', 'response.header',
                           'response.url'];
            var tmp;
            var selectedVar = node.data.selectedVar;
            for (var v of varList) {
              tmp = $('<option value="' + v + '">' + v + '</option>');
              if (v == node.data.selectedVar) {
                console.log('matches ' + v);
                tmp.attr('selected', 'selected');
              }
              x0.append(tmp);
            }
            p0.append(x0);
            $('#zestDialog').append(p0);

            var p1 = $('<p>Length: </p>');
            var x1 = $('<input id="length" type="number" value="' + 
                       (selectedVar?node.data[selectedVar] : 0) + '">');
            p1.append(x1);
            $('#zestDialog').append(p1);

            var p2 = $('<p>Plus/minus %: </p>');
            var x2 = $('<input id="approx" type="number" min="0" max="100"' +
                      'value="' + node.data.approx + '">');
            p2.append(x2);
            $('#zestDialog').append(p2);

            $('#varName').change(function() {
              var newSel = $('#varName :selected').text();
              $('#length').val(node.data[newSel]);
            });

            $('#zestDialog').dialog({
              modal: true,
              height: 200,
              width: 350,
              title: 'Edit Assertion',
              buttons: [
                {
                  text: 'Save',
                  click: function() {
                    var approx = $('#approx').val();
                    var len = $('#length').val();
                    selectedVar = $('#varName :selected').text();
                    var v = {
                      selectedVar: selectedVar,
                      length: len,
                      approx: approx
                    }
                    updateNode('ZestExpressionLength', node, v);
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
              beforeClose: function(event, ui) {
                $('#zestDialog').empty();
              }
            });
          }
          break;
        case 'delete':
          console.log('Deleting...');
          //deleteAssertNode(node);
          break;
        default:
          break;
      }
    });
  }

  // Initialize dynatree
  $(function(){
    $('#tree').dynatree({
      onClick: function(node, event) {
        if ($('.contextMenu:visible').length > 0) {
          $('.contextMenu').hide();
          return false;
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
        onDragStop: function(node) {
        },
        autoExpandMS: 1000,
        preventVoidMoves: true,
        onDragEnter: function(node, sourceNode) {
          return true;
        },
        onDragOver: function(node, sourceNode, hitMode) {
          // Prevent dropping a parent below it's own child.
          if (node.isDescendantOf(sourceNode)) {
            return false;
          }
          // Prevent dropping a folder below a non-folder
          if (!node.data.isFolder) {
            return false;
          }
        },
        onDrop: function(node, sourceNode, hitMode, ui, draggable) {
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
        onDragLeave: function(node, sourceNode) {
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
      var numOfReq = z.statements.length;
      var temp = null;
      var temp2 = null;
      for (var i of z.statements) {
        temp2 = []
        try {
          if (i.assertions[0].rootExpression.elementType == 'ZestExpressionStatusCode') {
            temp2.push({
              title: 'Assert - Status Code (' + i.assertions[0].rootExpression.code + ')',
              icon: 'assert.png',
              parentNodeKey: i.index,
              type: i.assertions[0].rootExpression.elementType,
              statCode: i.assertions[0].rootExpression.code,
            })
          }
          if (i.assertions[1].rootExpression.elementType == 'ZestExpressionLength') {
            temp2.push({
              title: 'Assert - Length (response.body = ' + i.assertions[1].rootExpression.length + ' +/- ' + i.assertions[1].rootExpression.approx + '%)',
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
              'request.url': i.url.length
            });
          }
        }
        catch(e) {}

        temp = {
          title: (i.method + ' : ' + i.url), isFolder: true, key: i.index, icon: 'request.png',
                 children: temp2
        }
        root.addChild(temp);
      }

    }

  }

});
