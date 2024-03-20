"use strict";
const Gpio = require('onoff').Gpio;
const button = new Gpio(17, 'in', 'rising');

let i = 0;
 
button.watch(function(err, value) {
  if (value) {
	console.log(++i);
	}
});
