"use strict";

let socket = io('http://192.168.1.33:3000');

let arduinoAlert1 = $('#arduino-alert-1');
let arduinoAlert2 = $('#arduino-alert-2');
let gamesState = $('#games-alert');

function updateAlerts(arduinoState, games) {
    if (arduinoState === 'waiting') {
        arduinoAlert1.hide();
        arduinoAlert2.show();
    } else if (arduinoState === 'ready') {
        arduinoAlert1.hide();
        arduinoAlert2.hide();
    }
    if (games) {
        gamesState.hide();
    }
}

socket.on('init', data => {
    updateAlerts(data.arduinoState, data.games);
});

socket.on('arduinoState', state => {
    updateAlerts(state);
});

socket.on('games', games => {
    console.log(games);
});