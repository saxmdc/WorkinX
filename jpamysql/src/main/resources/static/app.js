const API_URL = '/demo';

// DOM Elements
const userForm = document.getElementById('userForm');
const userIdInput = document.getElementById('userId');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const direccionInput = document.getElementById('direccion');
const celularInput = document.getElementById('celular');
const cargoInput = document.getElementById('cargo');
const tableBody = document.getElementById('tableBody');
const formTitle = document.getElementById('formTitle');
const btnCancel = document.getElementById('btnCancel');
const btnSave = document.getElementById('btnSave');
const notification = document.getElementById('notification');

const searchType = document.getElementById('searchType');
const searchInput = document.getElementById('searchInput');
const searchCargo = document.getElementById('searchCargo');
const searchEmailExtra = document.getElementById('searchEmailExtra');
const btnSearch = document.getElementById('btnSearch');
const btnReset = document.getElementById('btnReset');

// State
let isEditing = false;

// Initialize
document.addEventListener('DOMContentLoaded', loadUsers);

// Load all users
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/all`);
        const data = await response.json();
        renderTable(data);
    } catch (error) {
        showNotification('Error al cargar usuarios', 'error');
    }
}

// Render Table
function renderTable(users) {
    tableBody.innerHTML = '';
    
    // Si users no es un arreglo (ej: es un solo usuario devuelto por ID), lo convertimos
    if (!Array.isArray(users)) {
        if(users && Object.keys(users).length !== 0) users = [users];
        else users = []; 
    }

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No se encontraron usuarios.</td></tr>';
        return;
    }

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${user.id}</td>
            <td style="font-weight: 600;">${user.name}</td>
            <td>${user.email}</td>
            <td>${user.direccion || ''}</td>
            <td>${user.celular || ''}</td>
            <td><span style="background: #fee2e2; padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.85rem; color: #be123c; font-weight: 600;">${user.cargo || 'N/A'}</span></td>
            <td class="actions-cell">
                <button class="btn-edit" onclick='editUser(${JSON.stringify(user).replace(/'/g, "&#39;")})''>Editar</button>
                <button class="btn-danger" onclick="deleteUser(${user.id})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Save or Update User
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Preparar datos tal como los espera Spring (@RequestParam requiere x-www-form-urlencoded)
    const formData = new URLSearchParams();
    formData.append('name', nameInput.value);
    formData.append('email', emailInput.value);
    formData.append('direccion', direccionInput.value);
    formData.append('celular', celularInput.value);
    formData.append('cargo', cargoInput.value);

    let url = `${API_URL}/add`;
    let method = 'POST';

    if (isEditing) {
        url = `${API_URL}/update`;
        method = 'PUT';
        formData.append('id', userIdInput.value);
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });

        const result = await response.text();
        
        if (response.ok) {
            showNotification(isEditing ? 'Usuario actualizado exitosamente! 🎉' : 'Usuario creado exitosamente! 🚀', 'success');
            resetForm();
            loadUsers();
        } else {
            showNotification('Error al guardar: ' + result, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
    }
});

// Edit Mode
window.editUser = function(user) {
    isEditing = true;
    formTitle.innerHTML = '✏️ Editar Usuario';
    btnSave.textContent = 'Actualizar Cambios';
    btnCancel.classList.remove('hidden');

    userIdInput.value = user.id;
    nameInput.value = user.name;
    emailInput.value = user.email;
    direccionInput.value = user.direccion || '';
    celularInput.value = user.celular || '';
    cargoInput.value = user.cargo || '';
    
    // Scroll arriba para móviles
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reset Form
function resetForm() {
    isEditing = false;
    formTitle.innerHTML = '✨ Nuevo Usuario';
    btnSave.textContent = 'Guardar Usuario';
    btnCancel.classList.add('hidden');
    userForm.reset();
    userIdInput.value = '';
}

btnCancel.addEventListener('click', resetForm);

// Delete User
window.deleteUser = async function(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar a este usuario? 🗑️')) return;

    try {
        const response = await fetch(`${API_URL}/delete?id=${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Usuario eliminado 🗑️', 'success');
            loadUsers();
            if(isEditing && userIdInput.value == id) resetForm();
        }
    } catch (error) {
        showNotification('Error al eliminar', 'error');
    }
}

// Search Type Selection Change
searchType.addEventListener('change', () => {
    const type = searchType.value;
    searchInput.value = '';
    searchCargo.value = '';
    searchEmailExtra.value = '';

    if (type === 'id') {
        searchInput.placeholder = 'Ej. 1';
        searchInput.classList.remove('hidden');
        searchCargo.classList.add('hidden');
        searchEmailExtra.classList.add('hidden');
    } else if (type === 'email') {
        searchInput.placeholder = 'Ej. sam@gmail.com';
        searchInput.classList.remove('hidden');
        searchCargo.classList.add('hidden');
        searchEmailExtra.classList.add('hidden');
    } else if (type === 'and') {
        searchInput.placeholder = 'Nombre (Ej. Nicolas)';
        searchInput.classList.remove('hidden');
        searchCargo.placeholder = 'Cargo (Ej. Administrador)';
        searchCargo.classList.remove('hidden');
        searchEmailExtra.classList.add('hidden');
    } else if (type === 'or') {
        searchInput.placeholder = 'Nombre (opcional)';
        searchInput.classList.remove('hidden');
        searchEmailExtra.placeholder = 'Email (opcional)';
        searchEmailExtra.classList.remove('hidden');
        searchCargo.placeholder = 'Cargo (opcional)';
        searchCargo.classList.remove('hidden');
    }
});

// Search Users
btnSearch.addEventListener('click', async () => {
    const type = searchType.value;

    try {
        let url = '';
        if (type === 'id') {
            const term = searchInput.value.trim();
            if (!term) { typeof loadUsersPage === 'function' ? loadUsersPage() : loadUsers(); return; }
            url = `${API_URL}/find/id?id=${encodeURIComponent(term)}`;
        } else if (type === 'email') {
            const term = searchInput.value.trim();
            if (!term) { typeof loadUsersPage === 'function' ? loadUsersPage() : loadUsers(); return; }
            url = `${API_URL}/find/email?email=${encodeURIComponent(term)}`;
        } else if (type === 'and') {
            const name = searchInput.value.trim();
            const cargo = searchCargo.value.trim();
            if (!name || !cargo) {
                showNotification('Ingresa Nombre y Cargo para la búsqueda AND (Y)', 'error');
                return;
            }
            url = `${API_URL}/find/name-and-cargo?name=${encodeURIComponent(name)}&cargo=${encodeURIComponent(cargo)}`;
        } else if (type === 'or') {
            const name = searchInput.value.trim();
            const email = searchEmailExtra.value.trim();
            const cargo = searchCargo.value.trim();
            if (!name && !email && !cargo) {
                typeof loadUsersPage === 'function' ? loadUsersPage() : loadUsers();
                return;
            }
            url = `${API_URL}/find/name-or-email-or-cargo?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&cargo=${encodeURIComponent(cargo)}`;
        }

        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            renderTable(data);
        } else {
            renderTable([]);
        }
    } catch (error) {
        renderTable([]);
    }
});

btnReset.addEventListener('click', () => {
    searchInput.value = '';
    searchCargo.value = '';
    searchEmailExtra.value = '';
    if (typeof loadUsersPage === 'function') {
        currentPage = 0;
        loadUsersPage();
    } else {
        loadUsers();
    }
});

// Notification System
function showNotification(msg, type) {
    notification.textContent = msg;
    notification.className = `notification notif-${type}`;
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// ════════════════════════════════════════════════════════════════════════════
// PAGINACIÓN (NUEVO) — todo el bloque siguiente es código nuevo.
// El código original de arriba no fue modificado ni eliminado.
// ════════════════════════════════════════════════════════════════════════════

// Referencias a los elementos del DOM de la barra de paginación
const btnFirst       = document.getElementById('btnFirst');
const btnPrev        = document.getElementById('btnPrev');
const btnNext        = document.getElementById('btnNext');
const btnLast        = document.getElementById('btnLast');
const pageInfo       = document.getElementById('pageInfo');
const totalInfo      = document.getElementById('totalInfo');
const pageNumbers    = document.getElementById('pageNumbers');
const pageSizeSelect = document.getElementById('pageSize');

// Estado de la paginación
let currentPage = 0; // Página actual (base 0: la primera página es 0)
let totalPages  = 1; // Total de páginas disponibles
let currentSize = 5; // Registros por página

// Carga una página específica usando el endpoint GET /demo/page
// Este endpoint es NUEVO y devuelve un objeto Page<User> de Spring con:
//   data.content       → array con los usuarios de esta página
//   data.totalPages    → cuántas páginas hay en total
//   data.totalElements → cuántos registros hay en total en la BD
//   data.number        → índice de la página actual (base 0)
async function loadUsersPage() {
    try {
        const response = await fetch(`${API_URL}/page?page=${currentPage}&size=${currentSize}`);
        const data = await response.json();

        totalPages = data.totalPages;

        renderTable(data.content);                              // reutiliza la función ya existente
        renderPagination(data.number, data.totalPages, data.totalElements);
    } catch (error) {
        showNotification('Error al cargar usuarios', 'error');
    }
}

// Genera y actualiza visualmente la barra de paginación
// pageNum       → índice de la página actual (base 0)
// total         → total de páginas
// totalElements → total de registros en la BD
function renderPagination(pageNum, total, totalElements) {
    // Actualizar textos informativos
    pageInfo.textContent  = `Página ${pageNum + 1} de ${total}`;
    totalInfo.textContent = `${totalElements} registro${totalElements !== 1 ? 's' : ''}`;

    // Habilitar / deshabilitar los botones de navegación extremos
    btnFirst.disabled = (pageNum === 0);
    btnPrev.disabled  = (pageNum === 0);
    btnNext.disabled  = (pageNum >= total - 1);
    btnLast.disabled  = (pageNum >= total - 1);

    // Generar los botones numéricos con una ventana deslizante de 5 páginas
    // Ejemplo: si hay 10 páginas y estamos en la 6, se muestran [4][5][6][7][8]
    pageNumbers.innerHTML = '';
    const windowSize = 5;
    let start = Math.max(0, pageNum - Math.floor(windowSize / 2));
    let end   = Math.min(total - 1, start + windowSize - 1);
    if (end - start < windowSize - 1) start = Math.max(0, end - windowSize + 1);

    for (let i = start; i <= end; i++) {
        const btn = document.createElement('button');
        btn.textContent = i + 1; // mostrar base 1 al usuario
        btn.className   = `btn-page${i === pageNum ? ' active' : ''}`;
        btn.disabled    = (i === pageNum);
        btn.addEventListener('click', () => { currentPage = i; loadUsersPage(); });
        pageNumbers.appendChild(btn);
    }
}

// Event listeners para los botones de navegación
btnFirst.addEventListener('click', () => { if (currentPage > 0) { currentPage = 0; loadUsersPage(); } });
btnPrev.addEventListener ('click', () => { if (currentPage > 0) { currentPage--;   loadUsersPage(); } });
btnNext.addEventListener ('click', () => { if (currentPage < totalPages - 1) { currentPage++;              loadUsersPage(); } });
btnLast.addEventListener ('click', () => { if (currentPage < totalPages - 1) { currentPage = totalPages - 1; loadUsersPage(); } });

// Cuando cambia el selector de registros por página, volver a la primera
pageSizeSelect.addEventListener('change', () => {
    currentSize = parseInt(pageSizeSelect.value);
    currentPage = 0;
    loadUsersPage();
});

// Inicializar la vista con la primera página al cargar la página
// (reemplaza el loadUsers() del DOMContentLoaded original solo para la vista paginada)
document.addEventListener('DOMContentLoaded', loadUsersPage);
