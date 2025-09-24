// ========================================
// SISTEMA DE AUTENTICACIÓN PERSISTENTE
// ========================================

// Objeto global para manejar la autenticación de manera persistente
window.AuthManager = (function() {
    // Intenta recuperar los datos de la sesión al cargar
    let authToken = sessionStorage.getItem('authToken');
    let adminUser = JSON.parse(sessionStorage.getItem('adminUser'));
    let authCheckInterval = null;

    // Función para generar un ID único para la sesión
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Función para validar token (simulación básica)
    function validateToken(token) {
        if (!token || typeof token !== 'string') return false;
        // Aquí podrías agregar más validaciones del formato del token
        return token.length > 10; // Validación básica de longitud
    }

    return {
        // Establecer credenciales de autenticación
        setAuth: function(token, user) {
            if (!token || !user) {
                console.error('Token o usuario inválido');
                return false;
            }
            
            authToken = token;
            adminUser = user;
            
            // Guardar en sessionStorage para persistencia
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('adminUser', JSON.stringify(user));

            // Crear un identificador único para esta sesión
            if (!window.sessionId) {
                window.sessionId = generateSessionId();
            }
            
            console.log('Autenticación establecida y guardada en la sesión');
            return true;
        },

        // Obtener token de autenticación
        getToken: function() {
            return authToken;
        },

        // Obtener usuario autenticado
        getUser: function() {
            return adminUser;
        },

        // Verificar si está autenticado
        isAuthenticated: function() {
            return authToken !== null && adminUser !== null && validateToken(authToken);
        },

        // Limpiar autenticación
        clearAuth: function() {
            authToken = null;
            adminUser = null;

            // Limpiar de sessionStorage
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('adminUser');

            if (authCheckInterval) {
                clearInterval(authCheckInterval);
                authCheckInterval = null;
            }
            console.log('Autenticación limpiada de la sesión');
        },

        // Iniciar verificación periódica de autenticación
        startAuthCheck: function(intervalMs = 300000) { // 5 minutos por defecto
            if (authCheckInterval) {
                clearInterval(authCheckInterval);
            }
            
            authCheckInterval = setInterval(() => {
                if (this.isAuthenticated()) {
                    // Realizar ping al servidor para verificar que el token sigue válido
                    this.pingServer().catch(() => {
                        this.handleAuthExpired();
                    });
                }
            }, intervalMs);
        },

        // Realizar ping al servidor
        pingServer: async function() {
            if (!this.isAuthenticated()) {
                throw new Error('No autenticado');
            }

            const response = await fetch('http://127.0.0.1:5001/auth/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                throw new Error('Token expirado');
            }

            if (!response.ok) {
                throw new Error('Error de conexión');
            }

            return response.json();
        },

        // Manejar expiración de autenticación
        handleAuthExpired: function() {
            this.clearAuth();
            if (typeof showToast === 'function') {
                showToast('Sesión expirada. Redirigiendo al login...', 'error');
            }
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality for service detail page
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabs.length > 0 && tabContents.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                tabContents.forEach(content => {
                    if (content.id === target) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
    }

    // Filter functionality for services page
    const filterTabs = document.querySelectorAll('.filter-tab');
    const serviceCards = document.querySelectorAll('.service-card[data-category]');

    if (filterTabs.length > 0 && serviceCards.length > 0) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.textContent.toLowerCase();

                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                serviceCards.forEach(card => {
                    const category = card.dataset.category;
                    if (filter === 'todos' || category.includes(filter)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Login page functionality - CONECTADO AL BACKEND
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            // Limpiar mensajes anteriores
            clearLoginMessages();

            // Validación básica
            if (!email || !password) {
                showLoginMessage('Por favor completa todos los campos', 'error');
                return;
            }

            // Validación de email
            if (!isValidEmail(email)) {
                showLoginMessage('Por favor ingresa un email válido', 'error');
                emailInput.classList.add('error');
                return;
            }

            // Mostrar estado de carga
            setLoginLoadingState(true);
            showAuthProgress();

            try {
                const response = await fetch('http://127.0.0.1:5001/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Login exitoso
                    emailInput.classList.add('success');
                    passwordInput.classList.add('success');
                    showLoginMessage('¡Acceso concedido! Redirigiendo...', 'success');
                    showToast('Sesión iniciada correctamente', 'success');
                    
                    // Guardar token usando AuthManager
                    if (window.AuthManager.setAuth(data.token, data.user)) {
                        // Iniciar verificación periódica
                        window.AuthManager.startAuthCheck();
                        
                        // Completar barra de progreso
                        completeAuthProgress();
                        
                        // Redirección después de 1.5 segundos
                        setTimeout(() => {
                            window.location.href = 'admin.html';
                        }, 1500);
                    } else {
                        throw new Error('Error al establecer la autenticación');
                    }

                } else {
                    // Error de autenticación
                    emailInput.classList.add('error');
                    passwordInput.classList.add('error');
                    
                    const errorMessage = getErrorMessage(response.status, data.error);
                    showLoginMessage(errorMessage, 'error');
                    showToast(errorMessage, 'error');
                }

            } catch (error) {
                console.error('Error de conexión:', error);
                emailInput.classList.add('error');
                passwordInput.classList.add('error');
                
                const errorMsg = 'Error de conexión con el servidor. Verifica tu conexión a internet.';
                showLoginMessage(errorMsg, 'error');
                showToast('Error de conexión', 'error');
            } finally {
                // Restaurar estado del botón
                setTimeout(() => {
                    setLoginLoadingState(false);
                    hideAuthProgress();
                }, 1000);
            }
        });

        // Limpiar estados de error al escribir
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (emailInput) {
            emailInput.addEventListener('input', () => {
                emailInput.classList.remove('error', 'success');
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                passwordInput.classList.remove('error', 'success');
            });
        }
    }

    // ========================================
    // FUNCIONES AUXILIARES DE AUTENTICACIÓN
    // ========================================

    function showLoginMessage(message, type) {
        const container = document.getElementById('loginMessageContainer');
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `login-message ${type}-message`;
        
        const icon = type === 'error' ? 
            '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>' :
            '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>';
            
        messageDiv.innerHTML = `${icon}<span>${message}</span>`;
        container.appendChild(messageDiv);
    }

    function clearLoginMessages() {
        const container = document.getElementById('loginMessageContainer');
        if (container) {
            container.innerHTML = '';
        }
    }

    function setLoginLoadingState(loading) {
        const loginButton = document.getElementById('loginButton');
        if (!loginButton) return;

        const buttonText = loginButton.querySelector('.button-text');
        const loadingSpinner = loginButton.querySelector('.loading-spinner');
        
        loginButton.disabled = loading;
        
        if (loading) {
            loginButton.classList.add('loading');
            if (buttonText) buttonText.style.display = 'none';
            if (loadingSpinner) loadingSpinner.style.display = 'flex';
        } else {
            loginButton.classList.remove('loading');
            if (buttonText) buttonText.style.display = 'inline';
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    }

    function showAuthProgress() {
        const authProgress = document.getElementById('authProgress');
        const authProgressBar = document.getElementById('authProgressBar');
        
        if (authProgress && authProgressBar) {
            authProgress.style.display = 'block';
            authProgressBar.classList.add('active');
        }
    }

    function completeAuthProgress() {
        const authProgressBar = document.getElementById('authProgressBar');
        if (authProgressBar) {
            authProgressBar.classList.remove('active');
            authProgressBar.style.width = '100%';
        }
    }

    function hideAuthProgress() {
        const authProgress = document.getElementById('authProgress');
        const authProgressBar = document.getElementById('authProgressBar');
        
        if (authProgress && authProgressBar) {
            authProgress.style.display = 'none';
            authProgressBar.classList.remove('active');
            authProgressBar.style.width = '0%';
        }
    }

    function showToast(message, type, duration = 5000) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'error' ? 
            '<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>' :
            type === 'success' ?
            '<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>' :
            '<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>';
            
        toast.innerHTML = `${icon}<span>${message}</span>`;
        toastContainer.appendChild(toast);

        // Auto-remove toast
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }
        }, duration);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function getErrorMessage(status, defaultError) {
        const errorMessages = {
            400: 'Datos inválidos. Verifica tu email y contraseña.',
            401: 'Credenciales incorrectas. Verifica tu email y contraseña.',
            403: 'Acceso denegado. Tu cuenta puede estar suspendida.',
            404: 'Servicio no encontrado. Contacta al administrador.',
            429: 'Demasiados intentos de login. Espera unos minutos.',
            500: 'Error interno del servidor. Inténtalo más tarde.',
            503: 'Servicio temporalmente no disponible. Inténtalo más tarde.'
        };
        
        return errorMessages[status] || defaultError || 'Error desconocido. Inténtalo nuevamente.';
    }

    // ========================================
    // VERIFICACIÓN DE AUTENTICACIÓN CORREGIDA
    // ========================================

    function checkAuthStatus() {
        const currentPage = window.location.pathname;
        const adminPages = ['admin.html', 'users.html'];
        const isAdminPage = adminPages.some(page => currentPage.includes(page));

        if (isAdminPage && !window.AuthManager.isAuthenticated()) {
            showToast('Sesión expirada. Redirigiendo al login...', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return false;
        }
        return true;
    }

    // Función para hacer requests autenticados CORREGIDA
    async function authenticatedFetch(url, options = {}) {
        if (!window.AuthManager.isAuthenticated()) {
            throw new Error('No hay token de autenticación');
        }

        const token = window.AuthManager.getToken();
        const defaultHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        const response = await fetch(url, config);

        // Si recibimos 401, el token expiró
        if (response.status === 401) {
            window.AuthManager.handleAuthExpired();
            throw new Error('Token expirado');
        }

        return response;
    }

    // ========================================
    // ADMIN PANEL FUNCTIONALITY
    // ========================================

    if (window.location.pathname.includes('admin.html')) {
        // Verificar autenticación antes de continuar
        if (!checkAuthStatus()) return;

        const servicesTableBody = document.querySelector('.services-table tbody');
        const addServiceBtn = document.querySelector('.add-service-btn');
        const serviceModal = document.getElementById('serviceModal');
        const closeButton = document.querySelector('.close-button');
        const serviceForm = document.getElementById('serviceForm');
        const serviceIdInput = document.getElementById('serviceId');
        const serviceNameInput = document.getElementById('serviceName');
        const serviceDescriptionInput = document.getElementById('serviceDescription');
        const servicePriceInput = document.getElementById('servicePrice');

        // Show Modal
        function openServiceModal(service = null) {
            if (serviceModal) {
                serviceModal.style.display = 'flex';
                if (service) {
                    serviceIdInput.value = service.id;
                    serviceNameInput.value = service.name;
                    serviceDescriptionInput.value = service.description;
                    servicePriceInput.value = service.price;
                    serviceModal.querySelector('h2').textContent = 'Editar Servicio';
                } else {
                    serviceIdInput.value = '';
                    serviceNameInput.value = '';
                    serviceDescriptionInput.value = '';
                    servicePriceInput.value = '';
                    serviceModal.querySelector('h2').textContent = 'Agregar Servicio';
                }
            }
        }

        // Hide Modal
        function closeServiceModal() {
            if (serviceModal) {
                serviceModal.style.display = 'none';
            }
        }

        // Event Listeners for Modal
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', () => openServiceModal());
        }
        if (closeButton) {
            closeButton.addEventListener('click', closeServiceModal);
        }
        if (serviceModal) {
            window.addEventListener('click', (event) => {
                if (event.target == serviceModal) {
                    closeServiceModal();
                }
            });
        }

        async function fetchServices() {
            if (!servicesTableBody) return;
            
            try {
                const response = await authenticatedFetch('http://127.0.0.1:5001/services');
                const data = await response.json();
                renderServicesTable(data.services);
            } catch (error) {
                console.error('Error fetching services:', error);
                servicesTableBody.innerHTML = '<tr><td colspan="5">Error al cargar los servicios.</td></tr>';
                showToast('Error al cargar los servicios', 'error');
            }
        }

        function renderServicesTable(services) {
            if (!servicesTableBody) return;
            servicesTableBody.innerHTML = ''; // Clear existing static rows
            if (services.length === 0) {
                servicesTableBody.innerHTML = '<tr><td colspan="5">No hay servicios disponibles.</td></tr>';
                return;
            }

            services.forEach(service => {
                const row = servicesTableBody.insertRow();
                row.dataset.serviceId = service.id; // Store service ID on the row

                row.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <img src="https://via.placeholder.com/40" alt="${service.name}" class="service-image">
                            <span class="service-name">${service.name}</span>
                        </div>
                    </td>
                    <td>${service.description.substring(0, 50)}...</td>
                    <td>$${service.price.toFixed(2)}</td>
                    <td><span class="status-badge status-active">Activo</span></td>
                    <td>
                        <div class="actions-cell">
                            <button class="action-btn btn-edit" title="Editar" data-id="${service.id}">✏️</button>
                            <button class="action-btn btn-delete" title="Eliminar" data-id="${service.id}">🗑️</button>
                        </div>
                    </td>
                `;
            });

            // Attach event listeners to new buttons
            attachServiceActionListeners();
        }

        function attachServiceActionListeners() {
            document.querySelectorAll('.btn-edit').forEach(button => {
                button.onclick = async (e) => {
                    const serviceId = e.target.dataset.id;
                    try {
                        const response = await authenticatedFetch(`http://127.0.0.1:5001/services/${serviceId}`);
                        const service = await response.json();
                        openServiceModal(service);
                    } catch (error) {
                        console.error('Error fetching service for edit:', error);
                        showToast('Error al cargar el servicio para editar', 'error');
                    }
                };
            });

            document.querySelectorAll('.btn-delete').forEach(button => {
                button.onclick = async (e) => {
                    const serviceId = e.target.dataset.id;
                    if (confirm(`¿Estás seguro de que quieres eliminar el servicio con ID ${serviceId}?`)) {
                        try {
                            const response = await authenticatedFetch(`http://127.0.0.1:5001/services/${serviceId}`, {
                                method: 'DELETE'
                            });
                            if (response.ok) {
                                showToast('Servicio eliminado exitosamente', 'success');
                                fetchServices(); // Refresh the table
                            } else {
                                showToast('Error al eliminar el servicio', 'error');
                            }
                        } catch (error) {
                            console.error('Error deleting service:', error);
                            showToast('Error de conexión al eliminar el servicio', 'error');
                        }
                    }
                };
            });
        }

        // Handle form submission for Add/Edit Service
        if (serviceForm) {
            serviceForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const id = serviceIdInput.value;
                const name = serviceNameInput.value.trim();
                const description = serviceDescriptionInput.value.trim();
                const price = parseFloat(servicePriceInput.value);

                // Validación
                if (!name || !description || isNaN(price) || price <= 0) {
                    showToast('Por favor completa todos los campos correctamente', 'error');
                    return;
                }

                const method = id ? 'PUT' : 'POST';
                const url = id ? `http://127.0.0.1:5001/services/${id}` : 'http://127.0.0.1:5001/services';

                try {
                    const response = await authenticatedFetch(url, {
                        method: method,
                        body: JSON.stringify({ name, description, price })
                    });

                    if (response.ok) {
                        showToast(`Servicio ${id ? 'actualizado' : 'agregado'} exitosamente`, 'success');
                        closeServiceModal();
                        fetchServices(); // Refresh the table
                    } else {
                        const errorData = await response.json();
                        showToast(`Error al ${id ? 'actualizar' : 'agregar'} el servicio: ${errorData.error || response.statusText}`, 'error');
                    }
                } catch (error) {
                    console.error(`Error al ${id ? 'actualizar' : 'agregar'} servicio:`, error);
                    showToast('Error de conexión al guardar el servicio', 'error');
                }
            });
        }

        // Initial fetch when admin.html loads
        fetchServices();
    }

    // ========================================
    // USER MANAGER (PÁGINA DE USUARIOS)
    // ========================================

    const UserManager = {
        allUsers: [],
        filteredUsers: [],
        sortState: {
            key: 'username',
            asc: true
        },
        elements: {
            tableBody: document.querySelector('.users-table tbody'),
            searchInput: document.getElementById('userSearchInput'),
            addUserBtn: document.querySelector('.add-user-btn'),
            modal: document.getElementById('userModal'),
            closeModalBtn: null,
            form: document.getElementById('userForm'),
            idInput: document.getElementById('userId'),
            nameInput: document.getElementById('userName'),
            emailInput: document.getElementById('userEmail'),
            sortHeaders: document.querySelectorAll('.users-table th[data-sort]')
        },

        init: function() {
            if (!this.elements.tableBody) return;
            if (!checkAuthStatus()) return;

            this.elements.closeModalBtn = this.elements.modal ? this.elements.modal.querySelector('.close-button') : null;
            this.bindEvents();
            this.fetchUsers();
        },

        bindEvents: function() {
            this.elements.addUserBtn?.addEventListener('click', () => this.openModal());
            this.elements.closeModalBtn?.addEventListener('click', () => this.closeModal());
            this.elements.modal?.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) this.closeModal();
            });
            this.elements.form?.addEventListener('submit', (e) => this.handleFormSubmit(e));
            this.elements.searchInput?.addEventListener('input', (e) => this.handleSearch(e));
            this.elements.sortHeaders.forEach(th => {
                th.addEventListener('click', () => this.handleSort(th.dataset.sort));
            });
        },

        fetchUsers: async function() {
            try {
                const response = await authenticatedFetch('http://127.0.0.1:5001/users');
                const data = await response.json();
                this.allUsers = data.users;
                this.applyFiltersAndSort();
            } catch (error) {
                console.error('Error fetching users:', error);
                this.elements.tableBody.innerHTML = '<tr><td colspan="3">Error al cargar los usuarios.</td></tr>';
                showToast('Error al cargar los usuarios', 'error');
            }
        },

        applyFiltersAndSort: function() {
            const query = this.elements.searchInput.value.toLowerCase();
            
            // Filtrar
            this.filteredUsers = this.allUsers.filter(user => 
                user.username.toLowerCase().includes(query) || 
                user.email.toLowerCase().includes(query)
            );

            // Ordenar
            this.filteredUsers.sort((a, b) => {
                const valA = a[this.sortState.key].toLowerCase();
                const valB = b[this.sortState.key].toLowerCase();
                if (valA < valB) return this.sortState.asc ? -1 : 1;
                if (valA > valB) return this.sortState.asc ? 1 : -1;
                return 0;
            });

            this.renderTable();
            this.updateSortIndicators();
        },

        renderTable: function() {
            this.elements.tableBody.innerHTML = '';
            if (this.filteredUsers.length === 0) {
                this.elements.tableBody.innerHTML = '<tr><td colspan="3">No se encontraron usuarios.</td></tr>';
                return;
            }

            this.filteredUsers.forEach(user => {
                const row = this.elements.tableBody.insertRow();
                row.dataset.userId = user.id;
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="action-btn btn-edit" title="Editar" data-id="${user.id}">✏️</button>
                            <button class="action-btn btn-delete" title="Eliminar" data-id="${user.id}">🗑️</button>
                        </div>
                    </td>
                `;
            });

            this.attachActionListeners();
        },

        attachActionListeners: function() {
            this.elements.tableBody.querySelectorAll('.btn-edit').forEach(button => {
                button.onclick = async (e) => {
                    const userId = e.target.dataset.id;
                    const user = this.allUsers.find(u => u.id == userId);
                    if (user) this.openModal(user);
                };
            });

            this.elements.tableBody.querySelectorAll('.btn-delete').forEach(button => {
                button.onclick = async (e) => {
                    const userId = e.target.dataset.id;
                    if (confirm(`¿Estás seguro de que quieres eliminar este usuario?`)) {
                        try {
                            await authenticatedFetch(`http://127.0.0.1:5001/users/${userId}`, { method: 'DELETE' });
                            showToast('Usuario eliminado', 'success');
                            this.fetchUsers();
                        } catch (error) {
                            showToast('Error al eliminar usuario', 'error');
                        }
                    }
                };
            });
        },

        handleFormSubmit: async function(e) {
            e.preventDefault();
            const id = this.elements.idInput.value;
            const username = this.elements.nameInput.value.trim();
            const email = this.elements.emailInput.value.trim();

            if (!username || !email || !isValidEmail(email)) {
                showToast('Por favor, completa los campos correctamente.', 'error');
                return;
            }

            const method = id ? 'PUT' : 'POST';
            const url = id ? `http://127.0.0.1:5001/users/${id}` : 'http://127.0.0.1:5001/users';

            try {
                const response = await authenticatedFetch(url, {
                    method: method,
                    body: JSON.stringify({ username, email })
                });
                if (response.ok) {
                    showToast(`Usuario ${id ? 'actualizado' : 'agregado'}`, 'success');
                    this.closeModal();
                    this.fetchUsers();
                } else {
                    const errorData = await response.json();
                    showToast(errorData.error || 'Error al guardar', 'error');
                }
            } catch (error) {
                showToast('Error de conexión al guardar', 'error');
            }
        },

        handleSearch: function(e) {
            this.applyFiltersAndSort();
        },

        handleSort: function(key) {
            if (this.sortState.key === key) {
                this.sortState.asc = !this.sortState.asc;
            } else {
                this.sortState.key = key;
                this.sortState.asc = true;
            }
            this.applyFiltersAndSort();
        },

        updateSortIndicators: function() {
            this.elements.sortHeaders.forEach(th => {
                const indicator = th.querySelector('.sort-indicator');
                if (th.dataset.sort === this.sortState.key) {
                    indicator.textContent = this.sortState.asc ? ' ▲' : ' ▼';
                } else {
                    indicator.textContent = '';
                }
            });
        },

        openModal: function(user = null) {
            this.elements.form.reset();
            this.elements.idInput.value = '';
            if (user) {
                this.elements.idInput.value = user.id;
                this.elements.nameInput.value = user.username;
                this.elements.emailInput.value = user.email;
                this.elements.modal.querySelector('h2').textContent = 'Editar Usuario';
            } else {
                this.elements.modal.querySelector('h2').textContent = 'Agregar Usuario';
            }
            this.elements.modal.style.display = 'flex';
        },

        closeModal: function() {
            this.elements.modal.style.display = 'none';
        }
    };

    if (window.location.pathname.includes('users.html')) {
        UserManager.init();
    }

    // ========================================
    // NAVEGACIÓN Y LOGOUT FUNCTIONALITY
    // ========================================

    // Logout functionality
    const logoutButtons = document.querySelectorAll('.logout-btn, .nav-logout');
    logoutButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                try {
                    // Intentar hacer logout en el servidor
                    if (window.AuthManager.isAuthenticated()) {
                        await authenticatedFetch('http://127.0.0.1:5001/auth/logout', {
                            method: 'POST'
                        });
                    }
                } catch (error) {
                    console.error('Error durante logout:', error);
                    // Continuar con el logout local aunque falle el servidor
                } finally {
                    // Limpiar autenticación local
                    window.AuthManager.clearAuth();
                    showToast('Sesión cerrada exitosamente', 'success');
                    
                    // Redireccionar al login
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1000);
                }
            }
        });
    });

    // ========================================
    // MANEJO DE NAVEGACIÓN ENTRE PÁGINAS
    // ========================================

    // Verificar autenticación al cargar páginas de admin
    const currentPath = window.location.pathname;
    const protectedPages = ['admin.html', 'users.html'];
    
    if (protectedPages.some(page => currentPath.includes(page))) {
        // Inicializar verificación de autenticación si estamos en una página protegida
        if (window.AuthManager.isAuthenticated()) {
            // Mostrar información del usuario autenticado
            displayUserInfo();
            // Iniciar verificación periódica si no está ya iniciada
            window.AuthManager.startAuthCheck();
        } else {
            // Redireccionar si no hay autenticación válida
            showToast('Acceso denegado. Inicia sesión para continuar.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }

    function displayUserInfo() {
        const user = window.AuthManager.getUser();
        if (user) {
            // Actualizar elementos que muestren información del usuario
            const userNameElements = document.querySelectorAll('.user-name, .admin-name');
            const userEmailElements = document.querySelectorAll('.user-email, .admin-email');
            
            userNameElements.forEach(element => {
                if (element) element.textContent = user.username || user.name || 'Administrador';
            });
            
            userEmailElements.forEach(element => {
                if (element) element.textContent = user.email || '';
            });
        }
    }

    // ========================================
    // MANEJO DE ERRORES DE RED GLOBAL
    // ========================================

    // Interceptar errores de fetch global para manejo centralizado
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Error no manejado:', event.reason);
        
        // Verificar si es un error de autenticación
        if (event.reason && event.reason.message === 'Token expirado') {
            // El AuthManager ya maneja esto, no hacer nada más
            event.preventDefault();
        } else if (event.reason && event.reason.message && event.reason.message.includes('Failed to fetch')) {
            showToast('Error de conexión con el servidor', 'error');
            event.preventDefault();
        }
    });

    // ========================================
    // FUNCIONES DE UTILIDAD ADICIONALES
    // ========================================

    // Función para refrescar datos de forma periódica
    function startDataRefresh() {
        setInterval(() => {
            if (window.AuthManager.isAuthenticated()) {
                const currentPage = window.location.pathname;
                
                if (currentPage.includes('admin.html')) {
                    fetchServices();
                } else if (currentPage.includes('users.html')) {
                    fetchUsers();
                }
            }
        }, 300000); // Refrescar cada 5 minutos
    }

    // Función para manejar visibilidad de la página
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && window.AuthManager.isAuthenticated()) {
            // Verificar autenticación cuando la página vuelve a ser visible
            window.AuthManager.pingServer().catch(() => {
                window.AuthManager.handleAuthExpired();
            });
        }
    });

    // ========================================
    // INICIALIZACIÓN GLOBAL
    // ========================================

    // Inicializar funcionalidades globales
    if (window.AuthManager.isAuthenticated()) {
        startDataRefresh();
    }

    // Manejar redirección desde login si ya está autenticado
    if (currentPath.includes('login.html') && window.AuthManager.isAuthenticated()) {
        showToast('Ya tienes una sesión activa', 'info');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
    }

    // ========================================
    // NOTIFICACIONES Y FEEDBACK VISUAL
    // ========================================

    // Crear contenedor de toasts si no existe
    if (!document.getElementById('toastContainer')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }

    // ========================================
    // VALIDACIÓN DE FORMULARIOS MEJORADA
    // ========================================

    // Función para validar formularios en tiempo real
    function setupFormValidation(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                // Limpiar errores mientras el usuario escribe
                this.classList.remove('error');
                const errorMsg = this.parentNode.querySelector('.field-error');
                if (errorMsg) errorMsg.remove();
            });
        });
    }

    function validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldName = field.name || field.id;
        let isValid = true;
        let errorMessage = '';

        // Limpiar errores previos
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) existingError.remove();

        // Validaciones específicas
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Este campo es obligatorio';
        } else if (fieldType === 'email' && value && !isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Email inválido';
        } else if (fieldType === 'number' && value && (isNaN(value) || parseFloat(value) <= 0)) {
            isValid = false;
            errorMessage = 'Debe ser un número válido mayor a 0';
        }

        // Mostrar error si no es válido
        if (!isValid) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = errorMessage;
            errorDiv.style.cssText = 'color: #e74c3c; font-size: 0.8rem; margin-top: 5px;';
            field.parentNode.appendChild(errorDiv);
        }

        return isValid;
    }

    // Aplicar validación a formularios existentes
    setupFormValidation('adminLoginForm');
    setupFormValidation('serviceForm');
    setupFormValidation('userForm');

    // ========================================
    // MANEJO DE ESTADO DE CONEXIÓN
    // ========================================

    // Monitorear estado de conexión
    window.addEventListener('online', function() {
        showToast('Conexión restaurada', 'success', 3000);
        if (window.AuthManager.isAuthenticated()) {
            // Verificar estado de autenticación al restaurar conexión
            window.AuthManager.pingServer().catch(() => {
                window.AuthManager.handleAuthExpired();
            });
        }
    });

    window.addEventListener('offline', function() {
        showToast('Sin conexión a internet', 'error', 5000);
    });

    // ========================================
    // CLEANUP Y FINALIZACIÓN
    // ========================================

    // Limpiar intervalos y recursos antes de salir de la página
    window.addEventListener('beforeunload', function() {
        if (window.AuthManager) {
            // Los intervalos se limpian automáticamente en clearAuth()
            // pero podemos hacer cleanup adicional si es necesario
        }
    });

    console.log('Sistema de autenticación persistente inicializado correctamente');

    // ========================================
    // CARGA DINÁMICA PARA PÁGINAS PÚBLICAS
    // ========================================

    // Cargar servicios en services.html
    if (window.location.pathname.includes('services.html')) {
        const servicesGrid = document.querySelector('.services-grid');
        if (servicesGrid) {
            fetch('http://127.0.0.1:5001/services')
                .then(response => response.json())
                .then(data => {
                    servicesGrid.innerHTML = ''; // Limpiar contenido estático
                    data.services.forEach(service => {
                        // Determinar la clase de la insignia
                        let badgeClass = '';
                        if (service.badge) {
                            badgeClass = service.badge.toLowerCase();
                        }

                        // Crear el HTML de la insignia si existe
                        const badgeHTML = service.badge 
                            ? `<div class="service-badge ${badgeClass}">${service.badge}</div>` 
                            : '';

                        // Determinar la clase del contenedor de la tarjeta
                        let cardClass = 'service-card';
                        if (service.badge === 'Premium') {
                            cardClass += ' premium';
                        }

                        const serviceCard = `
                            <div class="${cardClass}" data-category="${service.category || 'general'}">
                                ${badgeHTML}
                                <div class="service-icon">
                                    <img src="${service.icon_url}" alt="${service.name}">
                                </div>
                                <h3>${service.name}</h3>
                                <p>${service.description}</p>
                                <div class="service-price">${service.price.toFixed(2)}<span>/mes</span></div>
                                <ul class="service-features">
                                    <li>CRM integrado</li>
                                    <li>Seguimiento de leads</li>
                                    <li>Reportes de ventas</li>
                                    <li>Dashboard analítico</li>
                                </ul>
                                <a href="service-detail.html?id=${service.id}" class="service-btn">Ver Detalles</a>
                                <button class="service-btn-outline">Prueba Gratis</button>
                            </div>
                        `;
                        servicesGrid.innerHTML += serviceCard;
                    });
                })
                .catch(error => {
                    console.error('Error al cargar los servicios:', error);
                    servicesGrid.innerHTML = '<p>No se pudieron cargar los servicios. Intente más tarde.</p>';
                });
        }
    }

    // Cargar detalle de servicio en service-detail.html
    if (window.location.pathname.includes('service-detail.html')) {
        const params = new URLSearchParams(window.location.search);
        const serviceId = params.get('id');

        if (serviceId) {
            fetch(`http://127.0.0.1:5001/services/${serviceId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Servicio no encontrado');
                    }
                    return response.json();
                })
                .then(service => {
                    // Actualizar dinámicamente el contenido de la página
                    document.title = `${service.name} - Detalle | D10 Solutions`;
                    document.querySelector('.breadcrumb-nav span:last-child').textContent = service.name;
                    document.querySelector('.service-info-section h1').textContent = service.name;
                    document.querySelector('.service-subtitle').textContent = service.description;
                    document.querySelector('.price-value').textContent = `$${service.price}`;
                    // ... y así sucesivamente para los demás campos que quieras actualizar.
                })
                .catch(error => {
                    console.error('Error al cargar el detalle del servicio:', error);
                    const container = document.querySelector('.service-detail-grid');
                    if(container) {
                        container.innerHTML = '<h1>Servicio no encontrado</h1><p>El servicio que buscas no existe o fue removido.</p><a href="services.html">Volver a servicios</a>';
                    }
                });
        }
    }
});