(() => {
    const btn_menu = document.querySelector('.btn_menu');
    const menu = document.querySelector('.menu');
    const main_chat = document.querySelector('.main_chat');
    btn_menu.addEventListener('click', toggleMenu, false);

    function toggleMenu(){
        if(btn_menu.classList.contains('open')){
            btn_menu.classList.remove('open');
            menu.classList.remove('open');
            main_chat.removeEventListener('click', toggleMenu, false);
        }else{
            btn_menu.classList.add('open');
            menu.classList.add('open');
            main_chat.addEventListener('click', toggleMenu, false);
        }
    }    

    activeModal();
    activeSocket();
    touchFunctionality();

    // Touch
    function touchFunctionality(){
        const body = document.querySelector('body');
        var touchStart;
        body.addEventListener('touchstart', e => {
            if(e.touches[0].clientX < 30
            && e.touches[0].clientY > 80){
                touchStart = {
                    X: e.touches[0].clientX,
                    timeStamp: e.timeStamp
                }
                menu.style.transition = 'unset';
                body.addEventListener('touchmove', move, false);
            }else
                touchStart = undefined;
        },true);
    
        body.addEventListener('touchend', e => {
            if(touchStart !== undefined){
                body.removeEventListener('touchmove', move, false);
                menu.style.transition = '';
                menu.style.transform = '';
                let clientX = e.changedTouches[0].clientX;
                let miliSeconds = e.timeStamp - touchStart.timeStamp;
                let difference = clientX > touchStart.X ? clientX - touchStart.X : touchStart.X - clientX;
                if(miliSeconds < 200
                || miliSeconds >= 200 && difference > 75){
                    toggleMenu();
                }
            }
        }, false);
    
        function move(event){
            if(event.touches[0].clientX < 275){
                menu.style.transform = `translateX(${event.touches[0].clientX - 275}px)`;
            }
        }
    }

    // Modals
    function activeModal(){
        for(modal of document.querySelectorAll('.modal')){
            modal.querySelector('.modal_background').addEventListener('click', e => {
                if(e.target.closest('.modal_content') == null)
                    closeModal(e);
            }, false);
            modal.querySelector('.btn_hide').addEventListener('click', closeModal, false);
        }
        function closeModal(e){
            let modal = e.currentTarget.closest('.modal');
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = '';
            },500);
            e.preventDefault();
        }
    }

    // Socket.io
    function activeSocket(){
        const socket = io();
        socket.on('num_salas', function (data) {
            console.log(data);
        });

        var client_array_salas = [];
        const contenedor_salas = document.querySelector('.salas');
        const contenedor_chat = document.querySelector('.chat');
        const span_sala_actual = document.getElementById('sala_actual');
        var sala_actual = '';
        var ola;
        socket.on('refrescar_salas', array_salas => {
            if (client_array_salas != array_salas) {
                document.getElementById('num_salas').innerText = array_salas.length;
                if (client_array_salas.length < array_salas.length) {
                    let arr = array_salas.filter(el => !client_array_salas.includes(el));

                    for(const name_sala of arr){
                        let sala = div_sala(name_sala);
                        contenedor_salas.appendChild(sala);
                        document.getElementById('u_' + name_sala).addEventListener('click',function(e){
                            unirse_sala(e.currentTarget.id.substring(2));   
                            toggleMenu();
                        });
                        document.getElementById('e_' + name_sala).addEventListener('click',function(e){
                            eliminar_sala(name_sala);
                        });
                        setTimeout(() => {
                            contenedor_salas.querySelector('#sala_' + name_sala).classList.remove('remove');
                        },100);
                    }

                } else {
                    let arr = client_array_salas.filter(el => !array_salas.includes(el));
                    for(const name_sala of arr){
                        let sala = contenedor_salas.querySelector('#sala_' + name_sala)
                        sala.addEventListener('transitionend', e => {
                            if(e.porpertyName = 'height'){
                                sala.remove();
                            }
                        });
                        sala.classList.add('remove');
                        // document.getElementById('sala_' + element).remove();
                    }
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
                contenedor_salas.querySelector('#sala_' + sala_actual).classList.remove('unido');
            sala_actual = nombre_sala;
            span_sala_actual.innerText = nombre_sala;
            contenedor_salas.querySelector('#sala_' + nombre_sala).classList.add('unido');
            contenedor_chat.innerHTML = '';
        }

        function div_sala(element) {
            let t_sala = document.querySelector('#template_sala').content;
            t_sala.querySelector('.sala').id = 'sala_' + element;
            t_sala.querySelector('span').innerText = element;

            t_sala.querySelector('.btn_unirse').id = `u_${element}`;
            t_sala.querySelector('.btn_eliminar').id = `e_${element}`;

            return document.importNode(t_sala, true);
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
                    toggleMenu();
                }, 500);
            }
        });
        const text_area = document.getElementById('textChat');
        text_area.addEventListener('keypress', e => {
            // https://stackoverflow.com/a/27227765
            let touch = ('ontouchstart' in window) || window.DocumentTouch && window.document instanceof DocumentTouch || window.navigator.maxTouchPoints || window.navigator.msMaxTouchPoints ? true : false;
            if(!touch && e.keyCode == 13 && !e.shiftKey){
                e.preventDefault();
                crear_mensaje(text_area.value);
                text_area.value = '';
            }
        }, false);
        document.querySelector('.btn_send').addEventListener('click', e => {
            if(text_area.value.length > 0){
                crear_mensaje(text_area.value);
                text_area.value = '';
            }
        }, false);

        var itvl = setInterval(() => {
            let general = document.getElementById('sala_General');
            if (general != null) {
                unirse_sala('General');
                clearInterval(itvl);
                itvl = null;
            }
        }, 200);

        if(navigator.serviceWorker){
            navigator.serviceWorker.register('/sw.js');
        }
    }
})();