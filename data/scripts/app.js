requirejs.config({
  'baseUrl': 'scripts',
  'shim': {
    'dynatree/jquery/jquery-ui.custom': ['dynatree/jquery/jquery'],
    'dynatree/src/jquery.dynatree': ['dynatree/jquery/jquery']
  }
});

requirejs(['main'], function(m) {
  console.log('PASSING addon');
  m.start(addon);
});