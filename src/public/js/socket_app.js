const socket = io();
socket.on('num_salas', function (data) {
    console.log(data);
});

var client_array_salas = [];
var contenedor_salas = document.querySelector('.salas');
var contenedor_chat = document.querySelector('.chat');
var span_sala_actual = document.getElementById('sala_actual');
var sala_actual = '';

socket.on('refrescar_salas', function (array_salas) {
    if (client_array_salas != array_salas) {
        document.getElementById('num_salas').innerHTML = array_salas.length;
        if (client_array_salas.length < array_salas.length) {
            let arr = array_salas.filter(el => !client_array_salas.includes(el));
            arr.forEach(element => {
                contenedor_salas.appendChild(div_sala(element));
                setTimeout(() => {
                    document.getElementById('u_' + element).addEventListener('click',function(e){
                        console.log(e.target.id.substring(2));
                        unirse_sala(e.target.id.substring(2));
                    });
                    document.getElementById('e_' + element).addEventListener('click',function(e){
                            eliminar_sala(element);
                    });
                }, 1);
            });
        }else {
            let arr = client_array_salas.filter(el => !array_salas.includes(el));
            arr.forEach(element => {
                document.getElementById(element).remove();
            });
        }
        client_array_salas = array_salas;
    }
});

socket.on('mensaje_chat', function (msg) {
    contenedor_chat.appendChild(mensaje(msg));
    contenedor_chat.scrollTop = contenedor_chat.scrollHeight;
});

function crear_sala(nombre) {
    socket.emit('nueva_sala', nombre);
}

function eliminar_sala(nombre) {
    socket.emit('eliminar_sala', nombre);
}

function recargar_salas() {
    socket.emit('recargar_salas');
}
function unirse_sala(id) {
    let nombre_sala = id;
    socket.emit('unirse_sala', nombre_sala);
    if (sala_actual != '')
        document.getElementById(sala_actual).classList.remove('unido');
    sala_actual = nombre_sala;
    span_sala_actual.innerHTML = '';
    span_sala_actual.append(nombre_sala);
    document.getElementById(nombre_sala).classList.add('unido');
    contenedor_chat.innerHTML = '';
    text_area.focus();
}

function div_sala(element) {
    let div = document.createElement('div');
    div.className = 'sala';
    div.id = element;
    div.append(element);
    let button = document.createElement('button');
    button.className = 'btn_unirse';
    button.id = 'u_' + element;
    button.append('Unirse');
    let button2 = document.createElement('button');
    button2.className = 'btn_eliminar';
    button2.id = 'e_' + element;
    button2.append('Eliminar');
    let div2 = document.createElement('div')
    div2.className = 'actions';
    div2.appendChild(button);
    div2.appendChild(button2);
    div.appendChild(div2);
    return div;
}

function mensaje(msg) {
    let div = document.createElement('div');
    div.className = 'mensaje';
    div.append(msg);
    return div;
}

function crear_mensaje(msg) {
    socket.emit('mensaje_chat', { msg: msg, sala: sala_actual, usuario: usuario });
}

document.getElementById('btn_NuevaSala').addEventListener('click', function (e) {
    let n_s = prompt('Nombre de la sala');
    if (n_s == null)
        return;
    else if (n_s.trim() == '')
        return;

    if (n_s != '') {
        crear_sala(n_s);
        setTimeout(() => {
            unirse_sala(n_s);
        }, 500);
    }
});
var text_area = document.getElementById('textChat');
text_area.addEventListener('keydown', e => {
    if (sala_actual != '') {
        if (e.keyCode == 13) {
            let mensaje = text_area.value;
            text_area.value = '';
            crear_mensaje(mensaje);
            text_area.focus();
        }
    } else {
        e.preventDefault();
        alert('Únase a una sala primero');
    }
}, false);

var itvl = setInterval(() => {
    let general = document.getElementById('General');
    if (general != null) {
        unirse_sala('General');
        clearInterval(itvl);
        itvl = null;
    }
}, 200);