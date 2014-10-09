/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define(
  [
    'jquery',
    'jqueryUi',
    'dynatree',
    'contextMenu',
    'treeHelper'
  ],
  function($, ui, dynatree, cm, helper){ // jshint ignore:line
  'use strict';

  var currentZest;
  var zestId;

  function bindRequestContextMenu(span) {
    var assets;
    $(span).contextMenu({menu: 'nodeMenu'}, function(action, el, pos) { // jshint ignore:line
      var node = $.ui.dynatree.getNode(el);
      switch(action) {
        case 'run':
          helper.runNode(node);
          break;

        case 'delete':
          helper.deleteNode(node);
          break;

        case 'key':
          console.log('key: ' + node.data.key);
          break;

        case 'addAssertion':
          assets = {
            name: 'assertion',
            types: ['Status Code', 'Length', 'Regex'],
          };
          helper.addElement(node, assets);
          break;

        case 'addComment':
          helper.addComment(node, true);
          break;

        case 'addCondition':
          assets = {
            name: 'condition',
            types: ['Regex', 'Equals', 'Length', 'Status Code',
                    'Response Time', 'URL', 'Empty AND', 'Empty OR']
          };
          helper.addElement(node, assets);
          break;

        default:

      }
    });
  }

  // Bind context menu to assertion elements
  function bindAssertContextMenu(span) {
    $(span).contextMenu({menu: 'assertMenu'}, function(action, el, pos) { // jshint ignore:line
      var node = $.ui.dynatree.getNode(el);
      switch(action) {
        case 'edit':
          helper.assertionEditor(node);
          break;
        case 'delete':
          helper.deleteAssertionNode(node);
          break;
        default:
          break;
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
          helper.requestInfo(node);
        }
        else {
          helper.assertionEditor(node);
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
            helper.emitSignal('treeChange', {
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
            helper.renameTree(num, first);
          }
        },
        onDragLeave: function(node, sourceNode) { // jshint ignore:line
        }
      }
    });
  });

  // Extract and frame child objects for tree parent node.
  function extractAsserts(assertions, parentReq) {
    var childCount = 0;
    var asserts = [];
    try {
      assertions.forEach(function(assert) {
        switch (assert.rootExpression.elementType) {
          case 'ZestExpressionStatusCode':
            asserts.push({
              title: 'Assert - Status Code (' +
                     assert.rootExpression.code + ')',
              icon: '../../../../images/assert.png',
              parentNodeKey: parentReq.index,
              type: assert.rootExpression.elementType,
              statCode: assert.rootExpression.code,
              childId: childCount
            });
            childCount++;
            break;

          case 'ZestExpressionLength':
            asserts.push({
              title: 'Assert - Length (response.body = ' +
                     assert.rootExpression.length + ' +/- ' +
                     assert.rootExpression.approx + '%)',
              icon: '../../../../images/assert.png',
              parentNodeKey: parentReq.index,
              type: assert.rootExpression.elementType,
              selectedVar: assert.rootExpression.variableName,
              approx: assert.rootExpression.approx,
              'response.body': assert.rootExpression.length,
              'response.url': parentReq.response.url.length,
              'response.header': parentReq.response.headers.length,
              'request.body': parentReq.data.length,
              'request.header': parentReq.headers.length,
              'request.method': parentReq.method.length,
              'request.url': parentReq.url.length,
              childId: childCount
            });
            childCount++;
            break;

          case 'ZestExpressionRegex':
            asserts.push({
              title: 'Assert - ' + assert.rootExpression.variableName +
                     ' Regex (' + assert.rootExpression.regex + ')',
              icon: '../../../../images/assert.png',
              parentNodeKey: parentReq.index,
              type: assert.rootExpression.elementType,
              selectedVar: assert.rootExpression.variableName,
              regex: assert.rootExpression.regex,
              caseSense: assert.rootExpression.caseExact,
              inverse: assert.rootExpression.not,
              childId: childCount
            });
            childCount++;
            break;

          default:

        }
      });
    }
    catch(e) {
      console.log('ErRoR: ' + e);
    }
    return asserts;
  }

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
      helper.setZestId(zestId);

      var root = $('#tree').dynatree('getRoot');
      try {
        root.removeChildren();
      }
      catch(e) {}

      var z = JSON.parse(currentZest);
      var temp;
      var temp2;
      var asserts;
      z.statements.forEach(function(stmt) {
        switch(stmt.elementType) {
          case 'ZestRequest':
            temp2 = [];
            asserts = extractAsserts(stmt.assertions, stmt);
            asserts.forEach(function(assert) {
              temp2.push(assert);
            });
            temp = {
              // All the req/res data is binded to node to reduce complexity in
              // returning data.
              title: (stmt.method + ' : ' + stmt.url),
              isFolder: true, key: stmt.index,
              icon: '../../../../images/request.png', children: temp2,
              type: stmt.elementType,
              'request.url': stmt.url,
              'request.method': stmt.method,
              'request.body': stmt.data,
              'request.header': stmt.headers,
              'response.statusCode': stmt.response.statusCode,
              'response.time': stmt.response.responseTimeInMs,
              'response.header': stmt.response.headers,
              'response.body': stmt.response.body,
              childNodes: asserts.length
            };
            break;

          case 'ZestComment':
            temp = {
              title: 'Comment: ' + stmt.comment,
              isFolder: true, key: stmt.index,
              icon: '../../../../images/comment.png',
              type: stmt.elementType,
              comment: stmt.comment,
              chidNodes: 0
            };
            break;

          default:
            temp = {
              title: 'Unknown',
              isFolder: true
            };
        }
        root.addChild(temp);
      });
    }
  };
});
