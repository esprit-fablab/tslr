var socket = io.connect('http://10.42.0.182:3000');
var roles = [];

socket.on('roles', function (rs) {
	roles = rs;
	socket.emit('ready');
});

socket.on('players', function (players) {
	for (var i in players) {
		if (players[i].online === true) {
			makeOnline(players[i]);
		} else {
			makeOffline(players[i]);
		}
	}
});

socket.on('online', function (player) {
	makeOnline(player);
});

socket.on('offline', function (player) {
	makeOffline(player);
});

socket.on('canStart', function (canStart) {
	$('#start').prop('disabled', !canStart);
});

$('#start').on('click', function () {
	socket.emit('start');
});

function makeOnline(player) {
	if (!$('#p' + player.i).length) {
		var li = $(document.createElement('li'));
		li.attr('id', 'p' + player.i);
		li.addClass('list-group-item justify-content-between');
		li.text('Joueur #' + (player.i + 1));
		var select = $(document.createElement('select'));
		select.addClass('custom-select');
		select.append('<option value="" selected>Choisir un rôle</option>');
		if (player.p) {
			for (var i in roles.p) {
				var o = document.createElement('option');
				o.value = i;
				o.innerText = roles.p[i].name;
				select.append(o);
			}
			$(li).append(select);
		} else {
			for (var i in roles.c) {
				var o = document.createElement('option');
				o.value = i;
				o.innerText = roles.c[i].name;
				select.append(o);
			}
			$(li).append(select);
		}
		if (player.role !== null) {
			select.val(player.role + 1);
		}
		select.on('change', function (e) {
			var v = $(e.target).val();
			if (v === '') {
				v = null;
			} else {
				v = Number(v);
			}
			socket.emit('role', {
				player: player,
				role: v
			});
		});
		if (player.p) {
			$('#p').append(li);
		} else {
			$('#c').append(li);
		}
	}
}

function makeOffline(player) {
	if ($('#p' + player.i).length) {
		$('#p' + player.i).remove();
	}
}
