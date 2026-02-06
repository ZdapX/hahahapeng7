const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Database sederhana di memori untuk menyimpan device yang aktif
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

// Socket.io Logic
io.on('connection', (socket) => {
    // Registrasi device sebagai output
    socket.on('register-output', (deviceName) => {
        const device = { id: socket.id, name: deviceName };
        outputDevices.push(device);
        io.emit('update-device-list', outputDevices);
        console.log(`Device Output terhubung: ${deviceName}`);
    });

    // Kirim list device ke controller yang baru buka
    socket.on('get-devices', () => {
        socket.emit('update-device-list', outputDevices);
    });

    // Kontrol suara (Play/Pause)
    socket.on('send-command', (data) => {
        // data = { targetId: '...', action: 'play' atau 'pause' }
        io.to(data.targetId).emit('audio-control', data.action);
    });

    socket.on('disconnect', () => {
        outputDevices = outputDevices.filter(d => d.id !== socket.id);
        io.emit('update-device-list', outputDevices);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
