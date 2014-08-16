/* global zestText */

define(function() {
  'use strict';

  function renderZestTextAs(z) {
    var zestText = document.getElementById('zestText');
    zestText.value = z;
  }

  return {
    renderZestTextAs: renderZestTextAs,

    // Change zest text property
    changeZestProperty: function(property, value) {
      var z = JSON.parse(zestText.value);
      z[property] = value;
      z = JSON.stringify(z, undefined, 2);
      renderZestTextAs(z);
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

    clearTextView: function() {
      var main = document.getElementById('zestText');
      main.value = '';
    },

    clearResults: function() {
      var tbody = document.getElementById('runTableBody');
      while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
      }
    }
  };
});
