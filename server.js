const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Gunakan Objek agar lebih mudah dikelola berdasarkan Socket ID
let outputDevices = {};

app.get('/', (req, res) => res.render('index'));
app.get('/output', (req, res) => res.render('output'));
app.get('/control', (req, res) => res.render('control'));

io.on('connection', (socket) => {
    console.log('Koneksi baru:', socket.id);

    // Kirim list device yang ada saat ini ke siapa pun yang baru konek (terutama controller)
    socket.emit('update-device-list', Object.values(outputDevices));

    // Registrasi device sebagai output
    socket.on('register-output', (deviceName) => {
        outputDevices[socket.id] = { id: socket.id, name: deviceName };
        // Beritahu semua orang bahwa ada device baru
        io.emit('update-device-list', Object.values(outputDevices));
        console.log(`Device terdaftar: ${deviceName}`);
    });

    // Kontrol suara (Play/Pause)
    socket.on('send-command', (data) => {
        io.to(data.targetId).emit('audio-control', data.action);
    });

    socket.on('disconnect', () => {
        if (outputDevices[socket.id]) {
            console.log('Device keluar:', outputDevices[socket.id].name);
            delete outputDevices[socket.id];
            io.emit('update-device-list', Object.values(outputDevices));
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
