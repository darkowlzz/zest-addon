define(function() {

  return {
    // Change zest text property
    changeZest: function(property, value) {
      var zestText = document.getElementById('zestText');
      var z = JSON.parse(zestText.value);
      z[property] = value;
      var z = JSON.stringify(z, undefined, 2);
      zestText.value = z;
    },

    // Get zest content textbox text wrap state
    getTextWrapState: function() {
      var zestText = document.getElementById('zestText');
      if (zestText.wrap == 'off') {
        return false;
      }
      else if (zestText.wrap == 'on') {
        return true;
      }
      return null;
    },

    // Change the card view
    showCard: function(card) {
      var treeV = document.getElementById('treeview');
      var textV = document.getElementById('textview');
      var runV = document.getElementById('runview');

      switch(card) {
        case 'tree':
          treeV.style.display = 'inline';
          textV.style.display = 'none';
          runV.style.display = 'none';
          break;
        case 'text':
          treeV.style.display = 'none';
          textV.style.display = 'inline';
          runV.style.display = 'none';
          break;
        case 'run':
          treeV.style.display = 'none';
          textV.style.display = 'none';
          runV.style.display = 'inline';
          break;
      }
    },

    clearResults: function() {
      var tbody = document.getElementById('runTableBody');
      while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
      }
    }
  }
});
