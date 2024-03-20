/**
 * Management of the screens by communicating with the arduino with a
 * serial connection.
 */

const SerialPort = require('serialport');

let a;

SerialPort.list((err, ports) => {
  for (let port of ports) {
    if (port.manufacturer && port.manufacturer.includes('Arduino')) {
      found = true;
      module.exports.state = 'waiting';
      module.exports.emit('found');
      a = new SerialPort(port.comName, {
        autoOpen: true,
        baudRate: 115200,
        parser: SerialPort.parsers.readline('\n')
      }, err => {
        if (err) {
          throw err;
        }
      });
    }
  }
});

module.exports = exports = {
  turnOn(i) {
    // turn screen on
  },
  turnOff(i) {
    // turn screen off
  },
  setRole(i, role) {
    // set the icon
  },
  setNumber(i, n) {
    // set the number
  }
};
