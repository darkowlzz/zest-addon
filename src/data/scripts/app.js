/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery',
    jqueryUi: '../bower_components/jquery-ui/jquery-ui',
    dynatree: '../bower_components/dynatree/dist/jquery.dynatree',
    contextMenu: '../bower_components/dynatree/doc/contextmenu/jquery.contextMenu-custom'
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
