## 8. Manual de Funciones de la Aplicación

---

### 8.1. Funciones del Sitio Público

#### 🔹 Función 1: Ver Página Principal
**Ubicación:** `index.html`  
**URL:** [https://dakotapog.github.io/D20_solutions/](https://dakotapog.github.io/D20_solutions/)  
**Descripción:** Página de inicio con hero section, presentación corporativa y servicios destacados.  
**Uso:** Acceso directo desde URL principal.  
**Elementos:** Navbar, Hero section, grid de 6 servicios, footer.

#### 🔹 Función 2: Navegar a Servicios
**Ubicación:** Navbar → “Servicios”  
**URL:** [https://dakotapog.github.io/D20_solutions/services.html](https://dakotapog.github.io/D20_solutions/services.html)  
**Descripción:** Acceso al catálogo completo de servicios.  
**Uso:** Click en menú “Servicios”.

#### 🔹 Función 3: Filtrar Servicios por Categoría
**Ubicación:** `services.html` → pestañas de filtro  
**Descripción:** Filtrado instantáneo por categoría (Todos, Gestión, Académico, Comunicación).  
**Tecnología:** Manipulación del DOM con JavaScript sin recarga de página.

#### 🔹 Función 4: Ver Detalle de Servicio
**Ubicación:** `services.html` → botón “Ver Detalles”  
**URL:** `service-detail.html?id=[ID]`  
**Descripción:** Información completa del servicio con pestañas (Características, Descripción, Precios, Soporte).

#### 🔹 Función 5: Navegación Responsive
**Ubicación:** Todas las páginas  
**Descripción:** Menú adaptable a dispositivos móviles con ícono hamburguesa.  
**Breakpoints:** Mobile (<768px), Tablet (768–1024px), Desktop (>1024px).

#### 🔹 Función 6: Acceder a Login
**Ubicación:** Navbar → “Iniciar Sesión”  
**URL:** [https://dakotapog.github.io/D20_solutions/login.html](https://dakotapog.github.io/D20_solutions/login.html)  
**Descripción:** Acceso al panel administrativo mediante formulario de login.

---

### 8.2. Funciones de Autenticación

#### 🔹 Función 7: Iniciar Sesión
**Ubicación:** `login.html`  
**Endpoint Backend:** `POST https://d20-solutions.onrender.com/auth/login`  
**Credenciales de prueba:**
- Email: `admin@d10solutions.com`
- Password: `adminpass`

**Pasos:**
1. Ingresar email  
2. Ingresar contraseña  
3. Click en “Iniciar Sesión”  
4. Redirección automática a `admin.html`

#### 🔹 Función 8: Validación de Formulario
**Ubicación:** `login.html`  
**Descripción:** Verificación de campos en tiempo real (email y longitud mínima de contraseña).  
**Feedback:** Mensajes visuales de error por campo.

#### 🔹 Función 9: Toggle Contraseña
**Ubicación:** `login.html` → icono de ojo  
**Descripción:** Mostrar/ocultar contraseña visualmente.  
**Estados:** Visible / Oculto (•••).

#### 🔹 Función 10: Persistencia de Sesión
**Ubicación:** Páginas administrativas  
**Descripción:** Token JWT almacenado en `localStorage`.  
**Duración:** Hasta cierre manual de sesión.

#### 🔹 Función 11: Protección de Rutas
**Ubicación:** `admin.html`, `users.html`  
**Endpoint:** `POST /auth/verify`  
**Descripción:** Verificación automática del token al cargar páginas admin.  
**Acción:** Redirección a `login.html` si el token no es válido.

---

### 8.3. Funciones de Gestión de Servicios

#### 🔹 Función 12: Ver Dashboard
**Ubicación:** `admin.html`  
**Descripción:** Dashboard con tarjetas estadísticas (servicios, activos, inactivos, ingresos).  
**Actualización:** Dinámica tras operaciones CRUD.

#### 🔹 Función 13: Listar Servicios
**Ubicación:** `admin.html`  
**Endpoint:** `GET /services`  
**Descripción:** Tabla con ID, nombre, categoría, precio, cantidad y estado.

#### 🔹 Función 14: Agregar Servicio
**Ubicación:** `admin.html` → “Agregar Servicio”  
**Endpoint:** `POST /services`  
**Pasos:**  
1. Abrir modal  
2. Llenar formulario  
3. Guardar  
**Validaciones:** Campos obligatorios, precio > 0.

#### 🔹 Función 15: Editar Servicio
**Ubicación:** `admin.html` → “Editar”  
**Endpoint:** `PUT /services/[ID]`  
**Descripción:** Modificar servicio existente desde modal precargado.

#### 🔹 Función 16: Eliminar Servicio
**Ubicación:** `admin.html` → “Eliminar”  
**Endpoint:** `DELETE /services/[ID]`  
**Descripción:** Eliminación con confirmación visual.

---

### 8.4. Funciones de Gestión de Usuarios

#### 🔹 Función 17: Ver Dashboard de Usuarios
**Ubicación:** `users.html`  
**Descripción:** Estadísticas de usuarios (totales, activos, administradores).

#### 🔹 Función 18: Listar Usuarios
**Ubicación:** `users.html`  
**Endpoint:** `GET /users`  
**Descripción:** Tabla con datos de usuarios y acciones CRUD.

#### 🔹 Función 19: Buscar Usuarios
**Ubicación:** `users.html` → campo de búsqueda  
**Descripción:** Filtrado instantáneo por nombre o email con JavaScript.

#### 🔹 Función 20: Ordenar Usuarios
**Ubicación:** `users.html` → encabezados de tabla  
**Descripción:** Orden ascendente/descendente por columna.

#### 🔹 Función 21: Agregar Usuario
**Ubicación:** `users.html` → “Agregar Usuario”  
**Endpoint:** `POST /users`  
**Descripción:** Creación mediante modal con validación de email único.

#### 🔹 Función 22: Editar Usuario
**Ubicación:** `users.html` → “Editar”  
**Endpoint:** `PUT /users/[ID]`  
**Descripción:** Edición de datos de usuario (username, email, rol, estado).

#### 🔹 Función 23: Eliminar Usuario
**Ubicación:** `users.html` → “Eliminar”  
**Endpoint:** `DELETE /users/[ID]`  
**Restricción:** No se puede eliminar al administrador principal.

---

### 8.5. Funciones Adicionales

#### 🔹 Función 24: Cerrar Sesión
**Ubicación:** Header admin  
**Descripción:** Limpieza de token en `localStorage` y redirección a `index.html`.

#### 🔹 Función 25: Navegación Admin
**Ubicación:** Navbar administrativa  
**Enlaces:**  
- Servicios → `admin.html`  
- Usuarios → `users.html`

#### 🔹 Función 26: Breadcrumb
**Ubicación:** Páginas administrativas  
**Descripción:** Navegación jerárquica contextual.

#### 🔹 Función 27: Manejo de Errores
**Ubicación:** Todas las peticiones API  
**Errores manejados:** Red (0), 401, 404, 500  
**Feedback:** Alertas visuales descriptivas.

#### 🔹 Función 28: Carga Dinámica
**Ubicación:** Páginas con datos API  
**Descripción:** Carga asíncrona mediante `fetch()` con indicadores y promesas.

#### 🔹 Función 29: Validación de Formularios
**Ubicación:** Todos los formularios  
**Descripción:** Validación dual (cliente y servidor).

#### 🔹 Función 30: Confirmación de Acciones Destructivas
**Ubicación:** Botones de eliminación  
**Descripción:** Modal de confirmación con mensaje personalizado.

---

### 8.6. Endpoints de la API Backend

**Base URL:** [https://d20-solutions.onrender.com](https://d20-solutions.onrender.com)

#### 🔸 Autenticación
- `POST /auth/login` — Iniciar sesión  
- `POST /auth/verify` — Verificar token  

#### 🔸 Servicios
- `GET /services` — Listar servicios  
- `GET /services/<id>` — Obtener servicio  
- `POST /services` — Crear servicio  
- `PUT /services/<id>` — Actualizar servicio  
- `DELETE /services/<id>` — Eliminar servicio  

#### 🔸 Usuarios
- `GET /users` — Listar usuarios  
- `GET /users/<id>` — Obtener usuario  
- `POST /users` — Crear usuario  
- `PUT /users/<id>` — Actualizar usuario  
- `DELETE /users/<id>` — Eliminar usuario  
