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

/*
 * Could also be done as:
 * var testList = [
 *   '../test/test-treeHelper',
 *   '../test/test-treeView'
 * ];
 *
 * require(['QUnit', ...testList], function(QUnit, ...tests) {
 *
 * and later:
 * for (var test of tests) {
 *   test.run();
 * }
 *
 * only when rest parameters are available in v8(js).
 */
require(['QUnit',
         '../test/test-treeHelper',
         '../test/test-treeView'],
  function(QUnit) {
    console.log(JSON.stringify(arguments));

    for (var i = 1; i < arguments.length; i++) {
      arguments[i].run();
    }

    QUnit.load();
    QUnit.start();
  }
);
