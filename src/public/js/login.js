var usuario = '';
document.getElementById('btnLog').addEventListener('click', e => {
    let modal = document.querySelector('#modal_usuario');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    });
}, false);

document.querySelector('.change_username button').addEventListener('click', e => {
    let input = document.querySelector('.change_username input');
    let user_name = input.value;
    if(user_name.length == 0){
        console.log('Logueo cancelado');
        return;
    }

    fetch('/login',{
        method : 'POST',
        body : JSON.stringify({user_name}),
        headers : {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .catch(error => console.error('Error:', error))
    .then(response => {
        if(response.state){
            window.location.reload();
        }
    });
}, false);

verificar_sesion();

function verificar_sesion(){
    fetch('/usuario',{
        method:'GET',
        headers : {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .catch(error => console.error('Error:', error))
    .then(response => {
        if(response.state){
            let u = response.user_name;
            usuario = u;
            document.querySelector('#lbl_username').innerText = u;
        }
    });
}