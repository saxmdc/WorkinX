const API_URL = '/api/empresas';

const empresaForm = document.getElementById('empresaForm');
const empresasList = document.getElementById('empresasList');
const formTitle = document.getElementById('formTitle');
const btnCancel = document.getElementById('btnCancel');
const btnSave = document.getElementById('btnSave');

// Inputs
const inputId = document.getElementById('empresaId');
const inputNombre = document.getElementById('nombreEmpresa');
const inputIndustria = document.getElementById('industria');
const inputTelefono = document.getElementById('telefono');
const inputDireccion = document.getElementById('direccion');

// Cargar todas las empresas al iniciar
document.addEventListener('DOMContentLoaded', cargarEmpresas);

async function cargarEmpresas() {
    try {
        const response = await fetch(API_URL);
        const empresas = await response.json();
        renderizarEmpresas(empresas);
    } catch (error) {
        console.error("Error al cargar empresas:", error);
        empresasList.innerHTML = '<p style="color:red">Error al cargar las empresas. Asegúrate de que el backend esté funcionando.</p>';
    }
}

function renderizarEmpresas(empresas) {
    empresasList.innerHTML = '';
    if (empresas.length === 0) {
        empresasList.innerHTML = '<p>No hay empresas registradas.</p>';
        return;
    }

    empresas.forEach(empresa => {
        const div = document.createElement('div');
        div.className = 'empresa-card';
        div.innerHTML = `
            <div class="empresa-info">
                <h3>${empresa.nombreEmpresa || 'Sin Nombre'}</h3>
                <p><strong>Industria:</strong> ${empresa.industria || 'N/A'}</p>
                <p><strong>Teléfono:</strong> ${empresa.telefonoContacto || 'N/A'} | <strong>Dirección:</strong> ${empresa.direccion || 'N/A'}</p>
            </div>
            <div class="empresa-actions">
                <button class="btn-edit" onclick="editarEmpresa(${empresa.id})">Editar</button>
                <button class="btn-danger" onclick="borrarEmpresa(${empresa.id})">Eliminar</button>
            </div>
        `;
        empresasList.appendChild(div);
    });
}

// Guardar o Actualizar Empresa
empresaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const empresa = {
        nombreEmpresa: inputNombre.value,
        industria: inputIndustria.value,
        telefonoContacto: inputTelefono.value,
        direccion: inputDireccion.value
    };

    const id = inputId.value;

    try {
        if (id) {
            // Actualizar (PUT)
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empresa)
            });
            alert('Empresa actualizada exitosamente');
        } else {
            // Crear (POST)
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empresa)
            });
            alert('Empresa creada exitosamente');
        }
        resetForm();
        cargarEmpresas();
    } catch (error) {
        console.error("Error al guardar:", error);
        alert('Ocurrió un error al guardar.');
    }
});

// Editar Empresa (pre-llenar formulario)
window.editarEmpresa = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const empresa = await response.json();
        
        inputId.value = empresa.id;
        inputNombre.value = empresa.nombreEmpresa || '';
        inputIndustria.value = empresa.industria || '';
        inputTelefono.value = empresa.telefonoContacto || '';
        inputDireccion.value = empresa.direccion || '';

        formTitle.textContent = "Editar Empresa";
        btnSave.textContent = "Actualizar Empresa";
        btnCancel.classList.remove('hidden');
    } catch (error) {
        console.error("Error al obtener la empresa:", error);
    }
};

// Borrar Empresa
window.borrarEmpresa = async (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta empresa?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            alert('Empresa eliminada');
            cargarEmpresas();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
};

// Cancelar Edición
btnCancel.addEventListener('click', resetForm);

function resetForm() {
    empresaForm.reset();
    inputId.value = '';
    formTitle.textContent = "Nueva Empresa";
    btnSave.textContent = "Guardar Empresa";
    btnCancel.classList.add('hidden');
}
