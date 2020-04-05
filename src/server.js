var express = require('express');
var session = require('express-session');
const sharedsession = require('express-socket.io-session');
const fs = require('fs');
var app = express();

const https = require('https').createServer({
    key: fs.readFileSync('certificados/cert.key'),
    cert: fs.readFileSync('certificados/cert.pem'),
    passphrase: 'ola k ace'
},app);

const path = require('path');
const io = require('socket.io')(https);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
var ses = session({
    secret: 'clave secreta',
    resave: true,
    saveUninitialized: true
});
app.use(ses);
io.use(sharedsession(ses, {
    autoSave: true
}));

var array_salas = ['General'];

app.get('/', function (req, res) {
    console.log(req);
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/new', function (req, res) {
    res.sendFile(path.join(__dirname, 'newIndex/index.html'));
});


app.get('/about', function (req, res) {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.post('/login', function (req, res) {
    let user_name = req.body.user_name;
    req.session.usuario = user_name;
    res.json({ 'state': true, 'msg': 'Logueado', 'usuario': req.session.user_name }
    );
});

app.get('/usuario', function (req, res) {
    if (req.session.usuario) {
        res.json({ 'state': true, 'user_name': req.session.usuario });
    } else {
        res.json({ 'state': false, 'user_name': null });
    }
});

var child;
app.get('/code_server', function (req, res) {
    var exec = require('child_process').exec;
    child = exec('code-server --auth password --cert --port 8443 ..', function (error, stdout, stderr) {
        res.send(stdout);
        if (error != null) {
            res.send(stdout);
        }
    });
});

// Atrapar error 404
app.use(function (req, res, next) {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});


io.on('connection', function (socket) {
    socket.join('General');

    socket.emit('refrescar_salas', array_salas);

    socket.on('recargar_salas', function () {
        socket.emit('refrescar_salas', array_salas);
    });

    socket.on('nueva_sala', function (nombre_sala) {
        if (!verificar_nombre_sala(nombre_sala))
            return;
        if (!array_salas.includes(nombre_sala)) {
            array_salas.push(nombre_sala);
            socket.join(nombre_sala);
            io.emit('refrescar_salas', array_salas);
        }
    });

    socket.on('eliminar_sala', function (nombre_sala) {
        if (!verificar_nombre_sala(nombre_sala))
            return;
        if (array_salas.includes(nombre_sala)) {
            let pos = array_salas.indexOf(nombre_sala);
            array_salas.splice(pos, 1);
            // io.in(nombre_sala).removeAllListeners();
            io.emit('refrescar_salas', array_salas);
        }
    });

    socket.on('unirse_sala', function (nombre_sala) {
        if (array_salas.includes(nombre_sala)) {
            socket.leaveAll();
            socket.join(nombre_sala);
        }
    });
    socket.on('mensaje_chat', function (obj) {
        if (!verificar_mensaje(obj))
            return;
        let u = 'Anónimo';
        // socket.handshake.session,reload(err=>{
        //      console.log(err);
        // });
        if (socket.handshake.session.usuario) {
            u = socket.handshake.session.usuario;
        } else {
            u = 'Anónimo';
        }
        io.in(obj.sala).emit('mensaje_chat', u + ': ' + obj.msg);
    });
});

function verificar_nombre_sala(nombre) {
    if (nombre != null) {
        if (typeof nombre === 'string') {
            if (nombre != '' && nombre != 'General') {
                return true;
            }
        }
    }
    return false;
}

function verificar_mensaje(obj) {
    if (obj != null) {
        if (typeof obj === 'object') {
                    // if(typeof obj.sala !== 'undefined' && typeof obj.msg !== undefined && typeof obj.usuario !== undefined) {
            if (typeof obj.sala !== 'undefined' && typeof obj.msg !== undefined) {
                if (obj.msg.trim() != '') {
                    console.log('Sala: ' + obj.sala + '\nMensaje: ' + obj.msg);
                    return true;
                }
            }
        }
    }
    console.log('Mensaje con formato incorrecto');
    return false;
}


https.listen(443, function () {
    console.log('Servidor activo en el puerto 443 :D');
});

var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);