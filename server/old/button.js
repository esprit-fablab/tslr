"use strict";

const raspi = require('raspi');
const gpio = require('raspi-gpio');

raspi.init(() => {
    const input = new gpio.DigitalInput({
        pin: 'GPIO17',
        pullResistor: gpio.PULL_DOWN
    });

    let i = 0;  

    input.on('change', value => {
        if (value) {
		i++;
		console.log(i);
	}
    });
});
