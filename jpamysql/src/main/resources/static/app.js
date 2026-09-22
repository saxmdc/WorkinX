const API_URL = '/api/empresas';

// Elementos DOM
const empresaForm      = document.getElementById('empresaForm');
const empresaIdInput   = document.getElementById('empresaId');
const nombreInput      = document.getElementById('nombreEmpresa');
const industriaInput   = document.getElementById('industria');
const telefonoInput    = document.getElementById('telefonoContacto');
const direccionInput   = document.getElementById('direccion');
const sitioWebInput    = document.getElementById('sitioWeb');
const descripcionInput = document.getElementById('descripcion');

const formTitle        = document.getElementById('formTitle');
const btnSubmit        = document.getElementById('btnSubmit');
const btnCancel        = document.getElementById('btnCancel');
const tableBody        = document.getElementById('tableBody');
const badgeCount       = document.getElementById('badgeCount');

// Búsqueda
const searchType       = document.getElementById('searchType');
const searchInput      = document.getElementById('searchInput');
const searchExtra1     = document.getElementById('searchExtra1');
const searchExtra2     = document.getElementById('searchExtra2');
const btnSearch        = document.getElementById('btnSearch');
const btnReset         = document.getElementById('btnReset');

// Controles de Paginación
const paginationBar    = document.getElementById('paginationBar');
const pageInfo         = document.getElementById('pageInfo');
const totalInfo        = document.getElementById('totalInfo');
const pageNumbers      = document.getElementById('pageNumbers');
const pageSizeSelect   = document.getElementById('pageSize');
const btnFirst         = document.getElementById('btnFirst');
const btnPrev          = document.getElementById('btnPrev');
const btnNext          = document.getElementById('btnNext');
const btnLast          = document.getElementById('btnLast');

// Estado de paginación
let currentPage = 0;
let totalPages  = 1;
let currentSize = 5;

// Manejo dinámico de campos de búsqueda según el tipo
searchType.addEventListener('change', () => {
    const val = searchType.value;
    searchExtra1.classList.add('hidden');
    searchExtra2.classList.add('hidden');
    searchExtra1.value = '';
    searchExtra2.value = '';
    searchInput.value  = '';

    if (val === 'id') {
        searchInput.placeholder = 'ID de la empresa (Ej. 1)';
    } else if (val === 'and') {
        searchInput.placeholder = 'Industria (Ej. Software)';
        searchExtra1.placeholder = 'Dirección (Ej. Calle)';
        searchExtra1.classList.remove('hidden');
    } else if (val === 'or') {
        searchInput.placeholder = 'Nombre (Ej. Tech)';
        searchExtra1.placeholder = 'Industria (Ej. Software)';
        searchExtra2.placeholder = 'Descripción (Ej. Servicios)';
        searchExtra1.classList.remove('hidden');
        searchExtra2.classList.remove('hidden');
    }
});

// Cargar página de empresas (RETO 5: Paginación)
async function loadEmpresasPage() {
    try {
        const res = await fetch(`${API_URL}/page?page=${currentPage}&size=${currentSize}`);
        if (!res.ok) throw new Error('Error al cargar página de empresas');
        const data = await res.json();

        totalPages = data.totalPages || 1;
        renderTable(data.content || []);
        renderPagination(data.number, data.totalPages, data.totalElements);
        paginationBar.style.display = 'flex';
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

// Renderizar tabla
function renderTable(empresas) {
    tableBody.innerHTML = '';
    badgeCount.textContent = `${empresas.length} empresa${empresas.length !== 1 ? 's' : ''}`;

    if (!empresas || empresas.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">No se encontraron empresas registradas.</td></tr>`;
        return;
    }

    empresas.forEach(emp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge">#${emp.id}</span></td>
            <td><strong>${escapeHtml(emp.nombreEmpresa || '')}</strong></td>
            <td>${escapeHtml(emp.industria || '-')}</td>
            <td>${escapeHtml(emp.telefonoContacto || '-')}</td>
            <td>${escapeHtml(emp.direccion || '-')}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-action btn-edit" onclick="editarEmpresa(${emp.id})" title="Editar">✏️</button>
                    <button class="btn-action btn-delete" onclick="eliminarEmpresa(${emp.id})" title="Eliminar">🗑️</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Renderizar controles de paginación
function renderPagination(pageNum, total, totalElements) {
    pageInfo.textContent  = `Página ${pageNum + 1} de ${Math.max(total, 1)}`;
    totalInfo.textContent = `${totalElements} registro${totalElements !== 1 ? 's' : ''}`;

    btnFirst.disabled = (pageNum === 0);
    btnPrev.disabled  = (pageNum === 0);
    btnNext.disabled  = (pageNum >= total - 1);
    btnLast.disabled  = (pageNum >= total - 1);

    pageNumbers.innerHTML = '';
    const windowSize = 5;
    let start = Math.max(0, pageNum - Math.floor(windowSize / 2));
    let end   = Math.min(total - 1, start + windowSize - 1);
    if (end - start < windowSize - 1) start = Math.max(0, end - windowSize + 1);

    for (let i = start; i <= end; i++) {
        const btn = document.createElement('button');
        btn.textContent = i + 1;
        btn.className   = `btn-page${i === pageNum ? ' active' : ''}`;
        btn.disabled    = (i === pageNum);
        btn.addEventListener('click', () => { currentPage = i; loadEmpresasPage(); });
        pageNumbers.appendChild(btn);
    }
}

// Navegación de páginas
btnFirst.addEventListener('click', () => { if (currentPage > 0) { currentPage = 0; loadEmpresasPage(); } });
btnPrev.addEventListener('click',  () => { if (currentPage > 0) { currentPage--;   loadEmpresasPage(); } });
btnNext.addEventListener('click',  () => { if (currentPage < totalPages - 1) { currentPage++; loadEmpresasPage(); } });
btnLast.addEventListener('click',  () => { if (currentPage < totalPages - 1) { currentPage = totalPages - 1; loadEmpresasPage(); } });

pageSizeSelect.addEventListener('change', () => {
    currentSize = parseInt(pageSizeSelect.value);
    currentPage = 0;
    loadEmpresasPage();
});

// Guardar o Actualizar Empresa (RETO 4: Manejo de errores de validación)
empresaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const empresa = {
        nombreEmpresa: nombreInput.value.trim(),
        industria: industriaInput.value.trim(),
        telefonoContacto: telefonoInput.value.trim(),
        direccion: direccionInput.value.trim(),
        sitioWeb: sitioWebInput.value.trim(),
        descripcion: descripcionInput.value.trim()
    };

    const id = empresaIdInput.value;
    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(empresa)
        });

        if (!res.ok) {
            const errorMsg = await res.text();
            throw new Error(errorMsg || 'Error al procesar la solicitud');
        }

        showNotification(id ? 'Empresa actualizada exitosamente' : 'Empresa creada exitosamente', 'success');
        resetForm();
        loadEmpresasPage();
    } catch (err) {
        showNotification(err.message, 'error');
    }
});

// Editar Empresa (Cargar en formulario)
window.editarEmpresa = async (id) => {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error('No se encontró la empresa');
        const emp = await res.json();

        empresaIdInput.value   = emp.id;
        nombreInput.value      = emp.nombreEmpresa || '';
        industriaInput.value   = emp.industria || '';
        telefonoInput.value    = emp.telefonoContacto || '';
        direccionInput.value   = emp.direccion || '';
        sitioWebInput.value    = emp.sitioWeb || '';
        descripcionInput.value = emp.descripcion || '';

        formTitle.textContent = `Editar Empresa #${emp.id}`;
        btnSubmit.textContent = 'Actualizar Empresa';
        btnCancel.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        showNotification(err.message, 'error');
    }
};

// Eliminar Empresa
window.eliminarEmpresa = async (id) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la empresa #${id}?`)) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar empresa');

        showNotification('Empresa eliminada exitosamente', 'success');
        loadEmpresasPage();
    } catch (err) {
        showNotification(err.message, 'error');
    }
};

// Resetear Formulario
btnCancel.addEventListener('click', resetForm);

function resetForm() {
    empresaForm.reset();
    empresaIdInput.value = '';
    formTitle.textContent = 'Nueva Empresa';
    btnSubmit.textContent = 'Guardar Empresa';
    btnCancel.classList.add('hidden');
}

// Búsquedas (RETO 1: AND y OR)
btnSearch.addEventListener('click', async () => {
    const type = searchType.value;
    const term = searchInput.value.trim();

    if (type === 'id') {
        if (!term) { loadEmpresasPage(); return; }
        try {
            const res = await fetch(`${API_URL}/${encodeURIComponent(term)}`);
            if (!res.ok) { renderTable([]); paginationBar.style.display = 'none'; return; }
            const data = await res.json();
            renderTable([data]);
            paginationBar.style.display = 'none';
        } catch {
            renderTable([]);
            paginationBar.style.display = 'none';
        }
    } else if (type === 'and') {
        const dir = searchExtra1.value.trim();
        if (!term && !dir) { loadEmpresasPage(); return; }
        try {
            const res = await fetch(`${API_URL}/find/and?industria=${encodeURIComponent(term)}&direccion=${encodeURIComponent(dir)}`);
            const data = await res.json();
            renderTable(data);
            paginationBar.style.display = 'none';
        } catch {
            renderTable([]);
            paginationBar.style.display = 'none';
        }
    } else if (type === 'or') {
        const ind = searchExtra1.value.trim();
        const desc = searchExtra2.value.trim();
        if (!term && !ind && !desc) { loadEmpresasPage(); return; }
        try {
            const res = await fetch(`${API_URL}/find/or?nombre=${encodeURIComponent(term)}&industria=${encodeURIComponent(ind)}&descripcion=${encodeURIComponent(desc)}`);
            const data = await res.json();
            renderTable(data);
            paginationBar.style.display = 'none';
        } catch {
            renderTable([]);
            paginationBar.style.display = 'none';
        }
    }
});

btnReset.addEventListener('click', () => {
    searchInput.value = '';
    searchExtra1.value = '';
    searchExtra2.value = '';
    currentPage = 0;
    loadEmpresasPage();
});

// Utilidades
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}

function showNotification(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    const container = document.getElementById('toastContainer');
    if (container) {
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    } else {
        alert(msg);
    }
}

// Iniciar cargando la primera página
document.addEventListener('DOMContentLoaded', loadEmpresasPage);
