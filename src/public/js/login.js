var usuario = '';
document.getElementById('btnLog').addEventListener('click',function(e){
    let user_name = prompt('Nombre de usuario');
    if(user_name == null){
        console.log('Logueo cancelado');
        return;
    }
    let fd = {'user_name' : user_name};
    fetch('/login',{
        method : 'POST',
        body : JSON.stringify(fd),
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
});
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
            document.getElementById('btnLog').innerHTML = u;
        }
    });
}
var cont_salas = document.querySelector('.cont_salas');
document.getElementById('btnSalas').addEventListener('click',e=>{
    if(cont_salas.style.left == '0px')
        cont_salas.style.left = '-100%';
    else
        cont_salas.style.left = '0px';
});