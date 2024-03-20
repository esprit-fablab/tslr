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
        console.log('salut');
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
          console.log('coucou');
          p.write('<p>\r\n');
//          p.write(['<', 'p', '>']);

                setInterval(() => {p.write('<w,1,ping>');p.write('<w,2,pong>');}, 1000);
        setTimeout(() => {
                setInterval(() => {p.write('<w,1,pong>');p.write('<w,2,ping>');}, 1000);
        }, 500);

        });

        p.on('data', data => {
          console.log('beep' + data);
          switch (data) {
            case 'pong':
              module.exports.state = 'ready';
              module.exports.emit('ready');
          }
/*		setInterval(() => {p.write('<w,1,ping>');p.write('<w,2,pong>');}, 1000);
	setTimeout(() => {
		setInterval(() => {p.write('<w,1,pong>');p.write('<w,2,ping>');}, 1000);
	}, 500); 
  */   });
      }
    }
    if (!found) {
      module.exports.emit('notfound');
    }
  });
});

module.exports.emit('search');
