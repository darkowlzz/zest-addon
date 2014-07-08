define(['dynatree/jquery/jquery',
        'dynatree/jquery/jquery-ui.custom',
        'dynatree/src/jquery.dynatree'],
        function(_){

  // Initialize dynatree
  $(function(){
    $('#tree').dynatree({
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
            // Drop folder as a sibling after the target
            sourceNode.move(node, 'after');
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

    createTree: function(currentZest) {
      var tree = $('#tree').dynatree('getRoot');
      try {
        tree.removeChildren();
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
            temp2.push({title: 'Assert - Status Code (' + i.assertions[0].rootExpression.code + ')' })
          }
          if (i.assertions[1].rootExpression.elementType == 'ZestExpressionLength') {
            temp2.push({title: 'Assert - Length (response.body = ' + i.assertions[1].rootExpression.length + ')'});
          }
        }
        catch(e) {}

        temp = {
          title: (i.method + ' : ' + i.url), isFolder: true, key: i.url,
                 children: temp2
        }
        tree.addChild(temp);
      }
    }

  }

});
