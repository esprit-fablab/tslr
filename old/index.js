"use strict";

console.log('=============================');
console.log('== Tension sur les réseaux ==');
console.log('=============================');
console.log();

const mustacheExpress = require('mustache-express');

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const arduino = require('./arduino');

/**
 * MONGOOSE
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

console.log('Connecting to MongoDB');
mongoose.connect('mongodb://localhost/tslr');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
    console.log('Connected to MongoDB');
});

const roundSchema = Schema({
    start: {type: Date, default: Date.now}
});

const gameSchema = new Schema({
    date: {type: Date, default: Date.now},
    rounds: [roundSchema],
    completed: {type: Boolean, default: false}
});

const Game = mongoose.model('Game', gameSchema);

/**
 * EXPRESS
 */

app.engine('mustache', mustacheExpress());

app.set('views', './views');
app.set('view engine', 'mustache');

app.use(express.static('public'));
app.use(express.static('node_modules/socket.io-client/dist/'));

app.get('/', (req, res) => {
    res.render('index');
});

server.listen(3000, () => {
    console.log('Listening on port 3000');
});

/**
 * WEBSOCKETS
 */

let s;

io.on('connection', socket => {
    s = socket;
    s.emit('init', {
        arduinoState: arduino.state
    });

    Game.find({
        completed: false
    }).exec((error, results) => {
        if (error) {
            throw error;
        }
        s.emit('games', results);
    });

    s.on('setup', () => {

    });

    s.on('event', () => {
        console.log('Préparation de l’évènement');
    });

    s.on('play', () => {
        console.log('Début d’un tour');
        let nuclear = 0;
        let nuclearLoop = setInterval(() => {
            nuclear++;
            clearInterval(nuclearLoop);
        }, 1000);
    });
});

/**
 * ARDUINO
 */

console.log('Looking for the arduino...');

arduino.on('notfound', () => {
    arduino.emit('search');
});

arduino.once('found', () => {
    if (s) {
        s.emit('arduinoState', arduino.state);
    }
    console.log('Arduino found! Waiting for pong...');
});

arduino.once('ready', () => {
    if (s) {
        s.emit('arduinoState', arduino.state);
    }
    console.log('Connected to Arduino! (pong)');
});

arduino.emit('search');
