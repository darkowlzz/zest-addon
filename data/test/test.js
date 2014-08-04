'use strict';

require.config({
  baseUrl: '../scripts/',
  paths: {
    QUnit: '../test/qunit',
    jquery: 'dynatree/jquery/jquery',
    jqueryUi: 'dynatree/jquery/jquery-ui.custom',
    dynatree: 'dynatree/src/jquery.dynatree',
    contextMenu: 'dynatree/doc/contextMenu/jquery.contextMenu-custom'
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
]

require(['QUnit', ...testList], function(QUnit, ...tests) {
    for (var test of tests) {
      test.run();
    }

    QUnit.load();
    QUnit.start();
  }
);
