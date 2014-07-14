requirejs.config({
  'baseUrl': 'scripts',
  'shim': {
    'dynatree/jquery/jquery-ui.custom': ['dynatree/jquery/jquery'],
    'dynatree/src/jquery.dynatree': ['dynatree/jquery/jquery'],
    'dynatree/doc/contextmenu/jquery.contextMenu-custom': ['dynatree/jquery/jquery']
  }
});

requirejs(['main'], function(m) {
  m.start(addon);
});
