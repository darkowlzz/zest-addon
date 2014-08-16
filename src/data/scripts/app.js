'use strict';

require.config({
  paths: {
    jquery: 'dynatree/jquery/jquery',
    jqueryUi: 'dynatree/jquery/jquery-ui.custom',
    dynatree: 'dynatree/src/jquery.dynatree',
    contextMenu: 'dynatree/doc/contextmenu/jquery.contextMenu-custom'
  },
  shim: {
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

require(['main'], function(m) {
  m.start(addon);
});
