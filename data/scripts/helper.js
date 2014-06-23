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
    }
  }
});
