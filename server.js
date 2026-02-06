const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// KONFIGURASI PENTING
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Mengunci lokasi folder views
app.use(express.static(path.join(__dirname, 'public'))); // Mengunci lokasi folder public

let outputDevices = {};

// ROUTING
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/output', (req, res) => {
    res.render('output');
});

app.get('/control', (req, res) => {
    res.render('control');
});

// SOCKET.IO LOGIC
io.on('connection', (socket) => {
    console.log('User terhubung:', socket.id);

    socket.on('register-output', (deviceName) => {
        outputDevices[socket.id] = { id: socket.id, name: deviceName };
        io.emit('update-device-list', Object.values(outputDevices));
    });

    socket.on('get-devices', () => {
        socket.emit('update-device-list', Object.values(outputDevices));
    });

    socket.on('send-command', (data) => {
        io.to(data.targetId).emit('audio-control', data.action);
    });

    socket.on('disconnect', () => {
        if (outputDevices[socket.id]) {
            delete outputDevices[socket.id];
            io.emit('update-device-list', Object.values(outputDevices));
        }
    });
});

// RUN SERVER
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server Berhasil Jalan!`);
    console.log(`Buka di browser: http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Gagal menjalankan server:', err.message);
});
