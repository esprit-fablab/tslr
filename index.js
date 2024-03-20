/**
* Main source file of the TSLR server.
* This file manages the game, and manages the link between the arduino, the
* leds, the buttons, and the web panel.
*/

/**
* Loading the configuration
*/

const config = require('./config');

/**
* Import NPM libraries
*/

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Button = require('gpio-button');
const motor = require("stepper-wiringpi").setup(2048, config.stepper.pinA, config.stepper.pinB, config.stepper.pinC, config.stepper.pinD);

/**
* Project components
*/

const screens = require('./screens');
const leds = require('./leds');
const roles = require('./roles.json');
const Player = require('./Player');

/**
* Miscellaneous
*/

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
	return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

/**
* Stepper motor management:
* The engine must turn until it reaches the endstop, then make a half-turn
* forward (2048 steps for a revolution, so 1024 steps for a half turn) in order
* to be located at the right starting position.
*/

motor.currentPos = null;
motor.setSpeed(15);
motor.forward();

const endstop = new Button('button2');

endstop.once('press', () => {
	motor.stop();
	motor.step(1024, () => {
		motor.currentPos = 1024;
	});
});

/**
* Connection to push buttons
*/

const b1 = new Button('button17');
const b2 = new Button('button4');

/**
* Generating players and listening to buttons
*/

const players = [new Player(b1, true), new Player(b2, false)];

let c = [];
let p = [];

let playing = false;
let pause = true;
let nuclearInterval;

players.forEach((p, i) => {
	p.i = i;
	p.button.on('press', () => {
		if (playing) {
			if (p.p && !pause) {
				b.p += 1;
				check();
			} else if (!pause) {
				b.c += 1;
				check();
			}
		} else if (p.online) {
			p.online = false;
			console.log('Player #' + i + ' is offline.');
			io.sockets.emit('offline', p);
			canStart();
		} else {
			p.online = true;
			console.log('Player #' + i + ' is online.');
			io.sockets.emit('online', p);
			canStart();
		}
	});
});

/**
* Configuring the web interface
*/

server.listen(3000);

app.use('/', express.static('public'));

/**
* Game management
*/

io.on('connection', socket => {
	console.log('Panel online');

	socket.emit('roles', roles);

	socket.on('ready', () => {
		socket.emit('players', players);
		canStart();
	});

	socket.on('role', data => {
		players[data.player.i].role = data.role;
		canStart();
	});

	socket.on('start', () => {
		console.log('start');
		playing = true;
		pause = true;
		for (let player of players) {
			if (player.online && player.p) {
				p.push(player);
			} else if (player.online) {
				c.push(player);
			}
		}
	});

	socket.on('next', () => {
		nextTurn();
	});

	socket.on('pause', () => {
		pauseNext = true;
	});

	socket.on('event', () => {
		// TODO: gérer les événements
	});

	socket.on('mj', () => {
		// TODO: gérer les cartes MJ
	});
});

/**
* Electrical network balance
*/

let b = {
	c: 10,
	p: 10,
	nuclear: 0,
	tx() {
		return ((this.p + this.nuclear) - this.c) / this.c * 100;
	},
	isBalanced() {
		return this.tx() >= -25 && this.tx() <= 25;
	},
	pos() {
		return Math.round(this.tx().map(-100, 100, 0, 2048));
	}
}

/**
* Main duties
*/

function canStart() {
	let can = true;
	let notAlone = false;
	for (let player of players) {
		if (player.online) {
			notAlone = true;
		}
		if (player.online && player.role === null) {
			can = false;
			break;
		}
	}
	io.sockets.emit('canStart', notAlone && can);
}

function check() {
	if (!b.isBalanced()) {
		// TODO: gérer la fin de la partie
		console.log('The balance is broken!');
		endTurn(true);
	}
}

function nextTurn() {
	io.sockets.emit('next');
	leds.nuclear.clear();
	pause = false;
	nuclearInterval = setInterval(() => {
		leds.nuclear.inc();
		b.nuclear++;
		check();
		if (b.nuclear === 60) {
			endTurn();
		}
	}, 1000);
}

function endTurn(problem = false) {
	clearInterval(nuclearInterval);
	if (problem) {
		pause = true;
		io.sockets.emit('pause');
	} else {
		if (pauseNext) {
			pause = true;
			pauseNext = false;
			io.sockets.emit('pause');
		} else {
			nextTurn();
		}
	}
}

/**
* Stepper motor loop:
* This loop is infinite, it uses the scale in order to know where to go. To do
* this, it retains the current position and moves one step forward or backward
* until it reaches the requested position.
* This makes it possible to react to sudden changes of direction.
*/

(function move() {
	if (playing) {
		const step = motor.currentPos < b.pos() ? 1 : motor.currentPos > b.pos() ? -1 : 0;
		motor.step(step, () => {
			motor.currentPos += step;
			setImmediate(move);
		});
	} else {
		setImmediate(move);
	}
})();
