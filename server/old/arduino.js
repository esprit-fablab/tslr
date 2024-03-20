"use strict";

const EventEmitter = require('events');
const SerialPort = require('serialport');

module.exports = new EventEmitter();
module.exports.state = 'searching';

module.exports.on('search', () => {
  SerialPort.list((err, ports) => {
    let found = false;
    for (let port of ports) {
      if (port.manufacturer && port.manufacturer.includes('Arduino')) {
        found = true;
        module.exports.state = 'waiting';
        module.exports.emit('found');
        let p = new SerialPort(port.comName, {
          autoOpen: true,
          baudRate: 115200,
          parser: SerialPort.parsers.readline('\n')
        }, err => {
          if (err) {
            throw err;
          }
          p.write('<p>')
        });

        p.on('data', data => {
          switch (data) {
            case 'pong':
              module.exports.state = 'ready';
              module.exports.emit('ready');
          }
        });
      }
    }
    if (!found) {
      module.exports.emit('notfound');
    }
  });
});
