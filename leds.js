/**
* Management of LEDs using shift registers.
*/

const config = require('./config.json').registers;
const wpi = require('wiring-pi');

String.prototype.replaceAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index + character.length);
}

wpi.wiringPiSetupGpio();

class Chain {
	constructor(pins, num) {
		wpi.pinMode(pins.lPin, wpi.OUTPUT);
		wpi.pinMode(pins.cPin, wpi.OUTPUT);
		wpi.pinMode(pins.dPin, wpi.OUTPUT);
		this.pins = pins;
		this.num = num;
		this.clear();
	}
	shift(values) {
		shift(this.pins, values);
	}
	clear(i = this.num) {
		clear(this.pins, i);
	}
	fill(i = this.num) {
		fill(this.pins, i);
	}
}

class Nuclear extends Chain {
	constructor(pins, num) {
		super(pins, num);
		this.i = 0;
	}
	clear() {
		super.clear(this.num);
	}
	inc() {
		this.i++;
		let values = new Array(this.num).fill(255, 0, Math.floor(this.i / 8)).fill(0, Math.floor(this.i / 8) + 1);
		values[Math.floor(this.i / 8)] = Number('0b' + new Array(8).fill(1, 0, this.i % 8).fill(0, this.i % 8).join(''));
		console.log(values);
		this.shift(values);
	}
	dec() {
		this.i -= 2;
		this.inc();
	}
}

class Events extends Chain {
	constructor(pins, num) {
		super(pins, num);
		this.current = new Array(num).fill('00000000');
	}
	fill(i = this.num) {
		this.current = new Array(this.num).fill('11111111');
		super.fill(i);
	}
	clear(i = this.num) {
		this.current = new Array(this.num).fill('00000000');
		super.clear(i);
	}
	turnOn(i) {
		i *= 2;
		this.current[Math.floor(i / 8)] = this.current[Math.floor(i / 8)].replaceAt(i % 8, '1');
		this.current[Math.floor(i / 8)] = this.current[Math.floor(i / 8)].replaceAt((i % 8) + 1, '1');
		this.shift(this.current.map(v => {return Number('0b' + v);}));
	}
	turnOff(i) {
		i *= 2;
		this.current[Math.floor(i / 8)] = this.current[Math.floor(i / 8)].replaceAt(i % 8, '0');
		this.current[Math.floor(i / 8)] = this.current[Math.floor(i / 8)].replaceAt((i % 8) + 1, '0');
		this.shift(this.current.map(v => {return Number('0b' + v);}));
	}
}

exports.nuclear = new Nuclear(config.nuclear, 8);

exports.events = new Events(config.events, 3);

exports.bargraphs = new Chain(config.bargraphs, 15);

function shift(pins, values) {
	wpi.digitalWrite(pins.lPin, wpi.LOW);
	for (const value of values) {
		wpi.shiftOut(pins.dPin, pins.cPin, wpi.MSBFIRST, value);
	}
	wpi.digitalWrite(pins.lPin, wpi.HIGH);
}

function clear(pins, i) {
	shift(pins, new Array(i).fill(0));
}

function fill(pins, i) {
	shift(pins, new Array(i).fill(255));
}
