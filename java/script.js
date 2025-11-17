import { fetchPrices } from './prices.js';

async function init() {
    const PRICES = await fetchPrices();

    const form = document.getElementById('formAgenda');
    const resultadoDiv = document.getElementById('resultado');
    const listaPresupuesto = document.getElementById('listaPresupuesto');
    const totalesDiv = document.getElementById('totales');
    const confirmarBtn = document.getElementById('confirmarPresupuesto');
    const vaciarBtn = document.getElementById('vaciarPresupuesto');

    function obtenerDatosAgenda() {
        const tapa = document.getElementById('tapa').value;
        const papel = document.getElementById('papel').value;
        const formato = document.getElementById('formato').value;
        const tipologia = document.getElementById('tipologia').value;
        const encuadernado = document.getElementById('encuadernado').value;
        const cantidad = parseInt(document.getElementById('cantidad').value, 10) || 1;
        return { tapa, papel, formato, tipologia, encuadernado, cantidad };
    }

    function calcularPrecioUnitario(agenda) {
        let precio = PRICES.base || 1000;
        precio += (PRICES.tapa[agenda.tapa] || 0);
        precio += (PRICES.papel[agenda.papel] || 0);
        precio += (PRICES.formato[agenda.formato] || 0);
        precio += (PRICES.tipologia[agenda.tipologia] || 0);
        precio += (PRICES.encuadernado[agenda.encuadernado] || 0);
        return precio;
    }

    function mostrarResultadoAgenda(agenda, unitPrice, totalPrice) {
        resultadoDiv.innerHTML = `
            <strong>Agenda armada:</strong><br>
            Tapa: ${agenda.tapa}<br>
            Papel: ${agenda.papel}<br>
            Formato: ${agenda.formato}<br>
            Tipología: ${agenda.tipologia}<br>
            Encuadernado: ${agenda.encuadernado}<br>
            Cantidad: ${agenda.cantidad}<br>
            <strong>Precio unitario: $${unitPrice.toLocaleString()}</strong><br>
            <strong>Precio total: $${totalPrice.toLocaleString()}</strong>
        `;
    }

    function cargarPresupuesto() {
        const pres = JSON.parse(localStorage.getItem('presupuesto')) || [];
        renderPresupuesto(pres);
    }

    function renderPresupuesto(pres) {
        if (!listaPresupuesto) return;
        listaPresupuesto.innerHTML = '';
        let totalGeneral = 0;
        pres.forEach((item, idx) => {
            const li = document.createElement('li');
            const subtotal = (item.unitPrice || 0) * (item.cantidad || 1);
            totalGeneral += subtotal;
            li.innerHTML = `
                <div>
                    <strong>${item.tipologia} (${item.formato})</strong> — ${item.tapa} / ${item.papel} — ${item.encuadernado}
                    <br>Cant: ${item.cantidad} — Unit: $${(item.unitPrice || 0).toLocaleString()} — Subtotal: $${subtotal.toLocaleString()}
                </div>
                <div style="margin-top:6px">
                    <button data-idx="${idx}" class="quitarBtn">Quitar</button>
                </div>
            `;
            listaPresupuesto.appendChild(li);
        });
        if (totalesDiv) totalesDiv.textContent = `Total: $${totalGeneral.toLocaleString()}`;

        // attach remove handlers
        document.querySelectorAll('.quitarBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.getAttribute('data-idx'), 10);
                quitarItem(index);
            });
        });
    }

    function guardarPresupuesto(pres) {
        localStorage.setItem('presupuesto', JSON.stringify(pres));
    }

    function agregarPresupuesto(item) {
        const pres = JSON.parse(localStorage.getItem('presupuesto')) || [];
        pres.push(item);
        guardarPresupuesto(pres);
        cargarPresupuesto();
    }

    function quitarItem(index) {
        const pres = JSON.parse(localStorage.getItem('presupuesto')) || [];
        pres.splice(index, 1);
        guardarPresupuesto(pres);
        cargarPresupuesto();
    }

    form && form.addEventListener('submit', (event) => {
        event.preventDefault();
        const agenda = obtenerDatosAgenda();
        const unitPrice = calcularPrecioUnitario(agenda);
        const totalPrice = unitPrice * agenda.cantidad;
        mostrarResultadoAgenda(agenda, unitPrice, totalPrice);
        agregarPresupuesto({ ...agenda, unitPrice });
    });

    confirmarBtn && confirmarBtn.addEventListener('click', async () => {
        const pres = JSON.parse(localStorage.getItem('presupuesto')) || [];
        if (!pres.length) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'info', title: 'Presupuesto vacío', text: 'Agrega al menos un artículo antes de confirmar.' });
            }
            return;
        }

        const { value: formValues } = await Swal.fire({
            title: 'Datos del cliente',
            html:
                '<input id="swal-nombre" class="swal2-input" placeholder="Nombre">' +
                '<input id="swal-email" class="swal2-input" placeholder="Email">' +
                '<input id="swal-telefono" class="swal2-input" placeholder="Teléfono">',
            focusConfirm: false,
            preConfirm: () => {
                const nombre = document.getElementById('swal-nombre').value;
                const email = document.getElementById('swal-email').value;
                const telefono = document.getElementById('swal-telefono').value;
                if (!nombre) {
                    Swal.showValidationMessage('El nombre es obligatorio');
                }
                return { nombre, email, telefono };
            }
        });

        if (formValues) {
            // construir resumen
            let totalGeneral = 0;
            let itemsHtml = '<ul style="text-align:left;">';
            pres.forEach(item => {
                const subtotal = (item.unitPrice || 0) * (item.cantidad || 1);
                totalGeneral += subtotal;
                itemsHtml += `<li>${item.tipologia} ${item.formato} — ${item.tapa} — ${item.papel} — ${item.cantidad} x $${item.unitPrice.toLocaleString()} = $${subtotal.toLocaleString()}</li>`;
            });
            itemsHtml += '</ul>';

            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + 30);

            const summary = `
                <div style="text-align:left">
                    <h3>Presupuesto</h3>
                    <div><strong>Cliente:</strong> ${formValues.nombre}</div>
                    <div><strong>Email:</strong> ${formValues.email || '-'} | <strong>Tel:</strong> ${formValues.telefono || '-'}</div>
                    <div style="margin-top:8px">${itemsHtml}</div>
                    <div style="margin-top:8px"><strong>Total:</strong> $${totalGeneral.toLocaleString()}</div>
                    <div><small>Válido hasta: ${validUntil.toLocaleDateString()}</small></div>
                </div>
            `;

            if (typeof Swal !== 'undefined') {
                Swal.fire({ title: 'Presupuesto generado', html: summary, width: 800 });
            } else {
                alert('Presupuesto generado:\nTotal: ' + totalGeneral);
            }

            // guardar registro del presupuesto y limpiar
            const record = { cliente: formValues, items: pres, total: totalGeneral, validUntil: validUntil.toISOString(), createdAt: new Date().toISOString() };
            localStorage.setItem('ultimoPresupuesto', JSON.stringify(record));
            localStorage.removeItem('presupuesto');
            cargarPresupuesto();
            resultadoDiv.innerHTML = '';
        }
    });

    vaciarBtn && vaciarBtn.addEventListener('click', () => {
        localStorage.removeItem('presupuesto');
        cargarPresupuesto();
    });

    // init render
    cargarPresupuesto();
}

init().catch(err => console.error('Error inicializando la app:', err));
