// Registro simple sin DOMContentLoaded: asumimos que el script se carga con `defer` como module
const aceptar = document.getElementById('aceptar');
const nombreInput = document.getElementById('nombre');
const saludo = document.getElementById('saludo');
const alerta = document.getElementById('alert');

const saved = localStorage.getItem('usuario');
if (saved) {
    if (saludo) saludo.textContent = `😁Hola ${saved} ❤`;
    if (nombreInput) nombreInput.value = saved;
}

if (aceptar) {
    aceptar.addEventListener('click', (e) => {
        e.preventDefault();
        const nombre = (nombreInput && nombreInput.value.trim()) || '';
        if (saludo) saludo.textContent = '';
        if (alerta) alerta.textContent = '';

        if (nombre === '') {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Por favor ingresa tu Nombre' });
            } else {
                alerta.textContent = 'Por favor ingresa tu Nombre';
            }
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'success', title: 'Registrado', text: `😁Hola ${nombre} ❤`, timer: 1600, showConfirmButton: false });
            }
            if (saludo) saludo.innerHTML = `😁Hola ${nombre} ❤`;
            localStorage.setItem('usuario', nombre);
        }
    });
}