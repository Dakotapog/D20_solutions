# 🧾 DEPLOY.md  
## 📦 Despliegue de la Aplicación Web — D10 Solutions

**Proyecto:** Aplicación Front-End Web de Servicios Tecnológicos  
**Integrante:** David Alberto Coronado Tabares  
**Institución:** Politécnico Grancolombiano  
**Fecha:** Octubre de 2025  

---

### 🌍 1. Descripción General
Este documento explica el proceso de despliegue de la aplicación **D10 Solutions**, compuesta por un **frontend estático** y un **backend funcional** conectado a una base de datos SQLite.  
El objetivo es garantizar que la aplicación pueda ejecutarse completamente desde Internet, cumpliendo con el punto **C. Aplicación funcionando en Internet** de la entrega final.

---

### 🧱 2. Arquitectura de Despliegue
La arquitectura está dividida en dos partes:

| Componente | Plataforma | Descripción |
|-------------|-------------|--------------|
| **Frontend** | GitHub Pages | Alojamiento de los archivos HTML, CSS, JS y assets públicos. |
| **Backend (API)** | Render | Alojamiento del servidor Flask y base de datos SQLite. |

```
Cliente (Navegador)
       ↓
Frontend (GitHub Pages)
       ↓
Backend (Render - Flask API)
       ↓
Base de Datos (SQLite)
```

---

### ⚙️ 3. Despliegue del Frontend en GitHub Pages

**Repositorio:**  
👉 https://github.com/Dakotapog/D20_solutions  

**Pasos realizados:**
1. Se subieron los archivos del frontend (`index.html`, `css/`, `js/`, `images/`, `data.json`) al repositorio principal.  
2. Desde **Settings → Pages**, se seleccionó:
   - **Branch:** `main`  
   - **Folder:** `/ (root)`  
3. Se guardó la configuración y se esperó 2 minutos hasta la publicación automática.  

**Resultado:**  
✅ El sitio web quedó disponible en:  
👉 https://dakotapog.github.io/D20_solutions/

---

### 🖥️ 4. Despliegue del Backend en Render

**Repositorio Backend:** dentro del subdirectorio `/backend`

**Pasos realizados:**
1. Se creó una cuenta gratuita en [https://render.com](https://render.com).  
2. Se seleccionó **New Web Service** y se conectó al repositorio de GitHub.  
3. Se configuraron los parámetros de despliegue:
   - **Root Directory:** `backend`  
   - **Build Command:** `pip install -r requirements.txt`  
   - **Start Command:** `gunicorn app:app`  
   - **Environment:** Python 3.11  
4. Render instaló las dependencias y lanzó el servidor Flask con la base de datos `site.db`.

**Resultado:**  
✅ API en funcionamiento en:  
👉 https://d10solutions-backend.onrender.com  

---

### 🔗 5. Integración Frontend - Backend
El frontend se comunica con el backend mediante peticiones **Fetch API**.  
Los endpoints consumidos son:

| Tipo | Endpoint | Descripción |
|------|-----------|-------------|
| POST | `/auth/login` | Inicio de sesión de administrador |
| GET  | `/services` | Listado de servicios |
| GET  | `/services/<id>` | Detalle de servicio |
| POST | `/services` | Crear nuevo servicio |
| PUT  | `/services/<id>` | Actualizar servicio |
| DELETE | `/services/<id>` | Eliminar servicio |

---

### 🧰 6. Pruebas Post-Despliegue
Después del despliegue, se realizaron pruebas funcionales y de compatibilidad:

- ✅ Login y redirección correcta al panel administrativo  
- ✅ CRUD de servicios operativo  
- ✅ Filtrado y búsqueda de servicios en tiempo real  
- ✅ Responsive Design validado en móvil, tablet y escritorio  
- ✅ Navegadores compatibles: Chrome, Firefox, Edge y Safari  

---

### 🔒 7. Consideraciones de Seguridad
- Validación de formularios en frontend y backend  
- Sanitización de entradas en Flask antes de insertarlas en la base de datos  
- Autenticación basada en tokens almacenados en `localStorage`  
- Protección CORS configurada en Flask  

---

### 🚀 8. Acceso Final al Sistema

| Componente | Enlace |
|-------------|---------|
| **Sitio Web (Frontend)** | [https://dakotapog.github.io/D20_solutions/](https://dakotapog.github.io/D20_solutions/) |
| **API Backend (Render)** | [https://d10solutions-backend.onrender.com](https://d10solutions-backend.onrender.com) |

---

### 🧩 9. Créditos y Herramientas
- HTML5, CSS3, JavaScript ES6  
- Flask (Python 3)  
- SQLite  
- Git / GitHub  
- GitHub Pages  
- Render  
- Visual Studio Code  