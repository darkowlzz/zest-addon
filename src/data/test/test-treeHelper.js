/* global define, equal, test */

'use strict';

define(['jquery', 'jqueryUi', '../scripts/treeHelper'],
  function($, ui, help) {
    var run = function() {
      module('TreeHelper tests');
      test('Zest ID', function() {
        help.setZestId(7);
        equal(help.getZestId(), 7, 'id is incorrect');
      });
    };
    return {run: run};
  }
);
