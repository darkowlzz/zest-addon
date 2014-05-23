// Control buttons
var zestON = document.getElementById('zestButtonON');
zestON.onclick = function() {
  addon.port.emit('RECORDON');
}

var zestOFF = document.getElementById('zestButtonOFF');
zestOFF.onclick = function() {
  addon.port.emit('RECORDOFF');
}
