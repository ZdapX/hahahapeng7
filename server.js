const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Setting views dan static files dengan path absolute
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

let outputDevices = [];

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/output', (req, res) => {
    res.render('output');
});

app.get('/control', (req, res) => {
    res.render('control');
});

io.on('connection', (socket) => {
    socket.on('register-output', (deviceName) => {
        const device = { id: socket.id, name: deviceName };
        outputDevices.push(device);
        io.emit('update-device-list', outputDevices);
    });

    socket.on('get-devices', () => {
        socket.emit('update-device-list', outputDevices);
    });

    socket.on('send-command', (data) => {
        io.to(data.targetId).emit('audio-control', data.action);
    });

    socket.on('disconnect', () => {
        outputDevices = outputDevices.filter(d => d.id !== socket.id);
        io.emit('update-device-list', outputDevices);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server nyala di port ${PORT}`);
});
