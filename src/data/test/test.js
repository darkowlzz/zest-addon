/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* global QUnit */

'use strict';

require.config({
  baseUrl: '../scripts/',
  paths: {
    QUnit: '../bower_components/qunit/qunit',
    jquery: '../bower_components/jquery/jquery',
    jqueryUi: '../bower_components/jquery-ui/jquery-ui',
    dynatree: '../bower_components/dynatree/dist/jquery.dynatree',
    contextMenu: '../bower_components/dynatree/doc/contextMenu/jquery.contextMenu-custom'
  },
  shim: {
    QUnit: {
      exports: 'QUnit',
      init: function() {
        QUnit.config.autoload = false;
        QUnit.config.autostart = false;
      }
    },
    jqueryUi: {
      deps: ['jquery']
    },
    dynatree: {
      deps: ['jquery']
    },
    contextMenu: {
      deps: ['jquery']
    }
  }
});

var testList = [
  '../test/test-treeHelper',
  '../test/test-treeView'
];

require(['QUnit', ...testList], function(QUnit, ...tests) {
    for (var test of tests) {
      test.run();
    }

    QUnit.load();
    QUnit.start();
  }
);
