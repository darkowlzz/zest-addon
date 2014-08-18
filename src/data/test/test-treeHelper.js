/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
