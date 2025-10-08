# MANUAL DE FUNCIONES - D10 SOLUTIONS

## Funciones del Sitio Público (1-6)

### Función 1: Ver Página Principal
**Ubicación:** index.html  
**Descripción:** Acceso a la landing page con hero section, presentación de empresa y servicios destacados.  
**Uso:** Abrir navegador → Ir a URL del sitio → Se carga automáticamente.

### Función 2: Navegar a Servicios
**Ubicación:** Navbar → "Servicios" | index.html → Botones CTA  
**Descripción:** Acceso al catálogo completo de 10 servicios.  
**Uso:** Click en "Servicios" del menú principal.

### Función 3: Filtrar Servicios por Categoría
**Ubicación:** services.html → Pestañas superiores  
**Descripción:** Filtrado instantáneo de servicios por: Todos, Gestión, Académico, Virtual, Comunicación.  
**Uso:** Click en la categoría deseada → La página filtra sin recargar.

### Función 4: Ver Detalle de Servicio
**Ubicación:** services.html → Botón "Ver Detalles" en cada tarjeta  
**Descripción:** Carga información completa: descripción extendida, precio, cantidad disponible, características.  
**Uso:** Click en "Ver Detalles" → Redirige a service-detail.html?id=X

### Función 5: Navegación Responsive
**Ubicación:** Todas las páginas  
**Descripción:** Menú adaptable a dispositivos móviles con hamburger icon.  
**Uso:** Automático según tamaño de pantalla.

### Función 6: Acceder a Login
**Ubicación:** Navbar → Botón "Iniciar Sesión"  
**Descripción:** Redirección al formulario de autenticación administrativa.  
**Uso:** Click en "Iniciar Sesión" → Redirige a login.html

## Funciones de Autenticación (7-11)

### Función 7: Iniciar Sesión
**Ubicación:** login.html  
**Descripción:** Autenticación de administradores mediante email y contraseña.  
**Uso:**  
1. Ingresar email: admin@d10solutions.com
2. Ingresar password: adminpass
3. Click en "Iniciar Sesión"
4. Sistema valida y genera token
5. Redirección a admin.html

### Función 8: Validación de Formulario
**Ubicación:** login.html → Validación en tiempo real  
**Descripción:** Verificación de campos vacíos y formato de email antes de enviar.  
**Uso:** Automático al escribir e intentar submit.

### Función 9: Toggle Mostrar/Ocultar Contraseña
**Ubicación:** login.html → Icono de ojo en campo password  
**Descripción:** Alternancia entre tipo "password" y "text" para ver la contraseña.  
**Uso:** Click en icono de ojo → Alterna visibilidad.

### Función 10: Persistencia de Sesión
**Ubicación:** Todas las páginas administrativas  
**Descripción:** Token guardado en localStorage mantiene sesión activa.  
**Uso:** Automático tras login exitoso.

### Función 11: Protección de Rutas Administrativas
**Ubicación:** admin.html, users.html  
**Descripción:** Verificación de token al cargar → Redirige a login si no está autenticado.  
**Uso:** Automático al intentar acceder a páginas admin.

## Funciones de Gestión de Servicios (12-16)

### Función 12: Ver Dashboard de Servicios
**Ubicación:** admin.html → Sección superior  
**Descripción:** Visualización de 4 tarjetas estadísticas: Total Servicios, Activos, En Promoción, Ingresos.  
**Uso:** Carga automática al acceder a admin.html

### Función 13: Listar Servicios en Tabla
**Ubicación:** admin.html → Tabla central  
**Descripción:** Tabla dinámica con todos los servicios: Nombre, Categoría, Precio, Cantidad, Estado, Acciones.  
**Uso:** Carga automática desde API /services

### Función 14: Agregar Nuevo Servicio
**Ubicación:** admin.html → Botón "➕ Agregar Servicio"  
**Descripción:** Modal con formulario para crear servicio.  
**Uso:**  
1. Click en "Agregar Servicio"
2. Llenar campos: Nombre, Descripción, Precio, Cantidad, Categoría, Icon URL, Badge
3. Click en "Guardar Servicio"
4. Petición POST /services
5. Tabla se actualiza automáticamente

### Función 15: Editar Servicio Existente
**Ubicación:** admin.html → Tabla → Botón "Editar" (✏️) por fila  
**Descripción:** Modal precargado con datos del servicio para modificación.  
**Uso:**  
1. Click en "Editar" del servicio deseado
2. Modal se abre con datos actuales
3. Modificar campos necesarios
4. Click en "Guardar Servicio"
5. Petición PUT /services/<id>
6. Tabla se actualiza

### Función 16: Eliminar Servicio
**Ubicación:** admin.html → Tabla → Botón "Eliminar" (🗑️) por fila  
**Descripción:** Eliminación permanente con confirmación.  
**Uso:**  
1. Click en "Eliminar"
2. Confirmar en el diálogo
3. Petición DELETE /services/<id>
4. Fila se elimina de la tabla

## Funciones de Gestión de Usuarios (17-23)

### Función 17: Ver Dashboard de Usuarios
**Ubicación:** users.html → Sección superior  
**Descripción:** Estadísticas: Total Usuarios, Activos, Admins, Bloqueados.  
**Uso:** Carga automática al acceder a users.html

### Función 18: Listar Todos los Usuarios
**Ubicación:** users.html → Tabla central  
**Descripción:** Tabla con usuarios: ID, Username, Email, Acciones.  
**Uso:** Carga automática desde API /users

### Función 19: Buscar Usuarios en Tiempo Real
**Ubicación:** users.html → Campo de búsqueda superior  
**Descripción:** Filtrado instantáneo de tabla mientras se escribe.  
**Uso:**  
1. Escribir en campo "Buscar por nombre o email..."
2. Tabla filtra automáticamente coincidencias

### Función 20: Ordenar Lista de Usuarios
**Ubicación:** users.html → Click en headers "Usuario" o "Email"  
**Descripción:** Ordenamiento ascendente/descendente alfabético.  
**Uso:**  
1. Click en "Usuario" o "Email"
2. Primera vez: orden ascendente (↑)
3. Segunda vez: orden descendente (↓)
4. Indicador visual muestra dirección

### Función 21: Agregar Nuevo Usuario
**Ubicación:** users.html → Botón "➕ Agregar Usuario"  
**Descripción:** Modal con formulario para crear usuario.  
**Uso:**  
1. Click en "Agregar Usuario"
2. Ingresar Username y Email
3. Click en "Guardar Usuario"
4. Petición POST /users
5. Tabla se actualiza

### Función 22: Editar Usuario Existente
**Ubicación:** users.html → Tabla → Botón "Editar" por fila  
**Descripción:** Modificación de username y email.  
**Uso:**  
1. Click en "Editar" del usuario
2. Modal con datos actuales
3. Modificar campos
4. Guardar → PUT /users/<id>

### Función 23: Eliminar Usuario
**Ubicación:** users.html → Tabla → Botón "Eliminar" por fila  
**Descripción:** Eliminación con confirmación.  
**Uso:**  
1. Click en "Eliminar"
2. Confirmar
3. DELETE /users/<id>
4. Usuario eliminado de tabla

## Funciones Adicionales (24-28)

### Función 24: Cerrar Sesión
**Ubicación:** admin.html / users.html → Header → "Cerrar Sesión"  
**Descripción:** Limpia token y redirige a página principal.  
**Uso:** Click en "Cerrar Sesión" → localStorage.clear() → Redirect index.html

### Función 25: Navegación entre Módulos Admin
**Ubicación:** Navbar administrativo  
**Descripción:** Menú con: Inicio, Gestión Servicios, Usuarios, Reportes.  
**Uso:** Click en opción deseada → Cambia de módulo manteniendo sesión.

### Función 26: Breadcrumb de Navegación
**Ubicación:** Todas las páginas administrativas y services  
**Descripción:** Migas de pan para tracking de ubicación.  
**Uso:** Visual automático → Click en enlaces para retroceder.

### Función 27: Manejo de Errores API
**Ubicación:** Todas las peticiones fetch  
**Descripción:** Captura errores de red y muestra mensajes amigables.  
**Uso:** Automático en caso de fallo de conexión o error 500.

### Función 28: Carga Dinámica de Contenido
**Ubicación:** services.html, service-detail.html, admin.html, users.html  
**Descripción:** Todos los datos se cargan desde API, no están hardcodeados.  
**Uso:** Automático al cargar cada página → fetch() → renderizado DOM.

---

**Total de funciones documentadas: 28**  
Cumple requisito mínimo de 20 funciones.