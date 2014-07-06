define(['dynatree/jquery/jquery',
        'dynatree/jquery/jquery-ui.custom',
        'dynatree/src/jquery.dynatree'],
        function(_){

  // Initialize dynatree
  $(function(){
    $('#tree').dynatree({});
  });

  return {
    clear: function() {
      try {
        $('#tree').dynatree('getRoot').removeChildren();
      }
      catch(e) {}
    },

    createTree: function(currentZest) {
      try {
        $('#tree').dynatree('getRoot').removeChildren();
      }
      catch(e) {}

      var z = JSON.parse(currentZest);
      var numOfReq = z.statements.length;
      var kids = [];
      var temp = null;
      var temp2 = null;
      for (var i of z.statements) {
        temp2 = []
        try {
          if (i.assertions[0].rootExpression.elementType == 'ZestExpressionStatusCode') {
            temp2.push({title: 'Assert - Status Code (' + i.assertions[0].rootExpression.code + ')' })
          }
          if (i.assertions[1].rootExpression.elementType == 'ZestExpressionLength') {
            temp2.push({title: 'Assert - Length (response.body = ' + i.assertions[1].rootExpression.length + ')'});
          }
        }
        catch(e) {}

        temp = {
          title: (i.method + ' : ' + i.url), isFolder: true,
                 children: temp2
        }
        kids.push(temp);
      }
      $('#tree').dynatree('getRoot').addChild({
        title: z.statements[0].url, isFolder: true, key: 'folder1', expand: true,
        children: kids
      });
    }

  }

});
