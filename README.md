<div align="center">
  <h1>🚀 WorkInX</h1>
  <p><strong>Plataforma de conexión laboral enfocada en el primer empleo</strong></p>
</div>

<hr />

## 📖 Acerca del Proyecto

**WorkInX** nace con la misión de democratizar el acceso a oportunidades laborales para jóvenes, recién egresados y personas sin experiencia. Muchas veces, el principal obstáculo para conseguir un trabajo es precisamente "la falta de experiencia previa". WorkInX soluciona esto conectando a **empresas** dispuestas a dar primeras oportunidades con **talento emergente**.

La plataforma permite a los candidatos buscar y postularse a entrevistas, y a las empresas publicar vacantes de manera estructurada.

## 🛠 Arquitectura y Tecnologías

El proyecto fue desarrollado utilizando el stack **MERN** (con MySQL en lugar de MongoDB) garantizando escalabilidad, velocidad y un desarrollo moderno.

### Frontend
- **React.js 19** + **Vite**: Interfaz de usuario rápida e interactiva.
- **React Router**: Manejo de rutas de la Single Page Application (SPA).
- **CSS Vanilla (Módulos)**: Estilos responsivos y personalizados, utilizando buenas prácticas de UI/UX, Flexbox y Grid.
- **Lucide React**: Sistema de iconografía minimalista y moderno.

### Backend
- **Node.js** + **Express**: Servidor backend rápido y ligero para la API REST.
- **MySQL2**: Conexión a la base de datos relacional.
- **JWT (JSON Web Tokens)**: Sistema de seguridad y autenticación sin estado.
- **Bcrypt.js**: Encriptación de contraseñas de usuarios y empresas.
- **Multer**: Manejo seguro de subida de archivos (currículums, etc).
- **Cors**: Políticas de seguridad de orígenes cruzados.

## 📂 Estructura de Directorios

```text
WorkInX/
│
├── frontend/                # Aplicación cliente (React)
│   ├── src/
│   │   ├── components/      # Componentes reutilizables (Modales, Header, etc.)
│   │   ├── pages/           # Vistas principales (Home, Entrevistas, Perfil, etc.)
│   │   ├── styles/          # Hojas de estilo globales
│   │   └── assets/          # Imágenes estáticas e íconos
│   └── package.json         # Dependencias del cliente
│
├── backend/                 # Servidor API (Node.js)
│   ├── src/
│   │   ├── config/          # Conexión a DB (db.js)
│   │   ├── controllers/     # Lógica de negocio (auth, entrevistas, postulaciones)
│   │   ├── middlewares/     # Interceptores (Validación JWT, Multer)
│   │   └── routes/          # Definición de endpoints de la API REST
│   └── package.json         # Dependencias del servidor
│
└── database/                # Scripts SQL de inicialización
    ├── workinx.sql          # Esquema de tablas principal
    ├── inserts_demo.sql     # Datos semilla (Seeders)
    └── procedures_triggers.sql # Lógica avanzada en base de datos
```

## 🚀 Guía de Instalación y Ejecución Local

Para levantar el proyecto en tu entorno local, asegúrate de tener instalados **Node.js (v18+)** y **MySQL**.

### 1. Base de Datos
1. Abre tu gestor de MySQL (XAMPP, MySQL Workbench, etc).
2. Ejecuta los scripts en la carpeta `database/` en el siguiente orden:
   - `workinx.sql` (Crea la DB y las tablas)
   - `procedures_triggers.sql`
   - `inserts_demo.sql` (Opcional, carga datos de prueba)

### 2. Configurar el Backend
```bash
cd backend
npm install
```
Crea un archivo llamado `.env` en la raíz de la carpeta `backend` basado en `.env.example`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=workinx
JWT_SECRET=tu_secreto_super_seguro
```
Inicia el servidor en modo desarrollo:
```bash
npm run dev
```

### 3. Configurar el Frontend
Abre una nueva terminal en paralelo:
```bash
cd frontend
npm install
npm run dev
```
La aplicación abrirá automáticamente en `http://localhost:5173`.

---

## 📡 Endpoints Principales (API REST)

La API cuenta con endpoints protegidos por JWT. A continuación un resumen:

- **Auth:**
  - `POST /api/auth/registro/usuario` - Registro de candidatos.
  - `POST /api/auth/login` - Autenticación universal.
  - `GET /api/auth/perfil` - Obtener datos del usuario logueado.
- **Entrevistas:**
  - `GET /api/entrevistas` - Listado con filtros.
  - `POST /api/entrevistas` - (Protegido) Crear vacante (solo Empresas).
- **Postulaciones:**
  - `POST /api/postulaciones` - (Protegido) Aplicar a una entrevista enviando un archivo CV.

## 🤝 Contribuciones
Este proyecto fue creado con el objetivo de fomentar el acceso al empleo joven. Siéntete libre de clonarlo, enviar Pull Requests o reportar incidencias (Issues) si encuentras algún problema en la interfaz o la API.
