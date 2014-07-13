define(['dynatree/jquery/jquery',
        'dynatree/jquery/jquery-ui.custom',
        'dynatree/src/jquery.dynatree',
        'dynatree/doc/contextmenu/jquery.contextMenu-custom'],
        function(_){

  var currentZest;
  var zestId;

  function emitSignal(eventName, data) {
    var evt = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(evt);
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

  function bindContextMenu(span) {
    $(span).contextMenu({menu: "nodeMenu"}, function(action, el, pos) {
      var node = $.ui.dynatree.getNode(el);
      console.log(action);
      switch(action) {
        case "delete":
          deleteNode(node);
          break;
        case "key":
          console.log('key: ' + node.data.key);
      }
    })
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
        bindContextMenu(span);
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
            temp2.push({title: 'Assert - Status Code (' + i.assertions[0].rootExpression.code + ')', icon: 'assert.png' })
          }
          if (i.assertions[1].rootExpression.elementType == 'ZestExpressionLength') {
            temp2.push({title: 'Assert - Length (response.body = ' + i.assertions[1].rootExpression.length + ')', icon: 'assert.png' });
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
