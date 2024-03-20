const app = require('http').createServer();
const io = require('socket.io')(app);

app.listen(4242);

io.on('connection', socket => {
    socket.emit('hello');
});