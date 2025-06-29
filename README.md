
# PilotSeries – Backend

**PilotSeries** es una API RESTful en Node.js para gestionar y descubrir series, permitiendo a los usuarios seguir, puntuar, reseñar y recibir recomendaciones personalizadas. Incluye autenticación JWT, roles de usuario/admin, y relación de datos entre usuarios, series y reseñas. Soporta subida de imágenes a Cloudinary.

---

## 🌟 Características

- API REST con [Express](https://expressjs.com/)
- MongoDB + Mongoose (usuarios, series, reseñas)
- Autenticación JWT (login/registro seguro)
- Roles (usuario, admin) y middlewares de protección
- Endpoints para gestionar series, usuarios, listas y reseñas
- Subida de imágenes a Cloudinary (avatar y posters)
- Script de seed: carga datos iniciales desde CSV (series, reseñas, usuarios)
- Buenas prácticas, validación y gestión de errores
- Arquitectura modular (modelos, controladores, rutas, middlewares)

---

## 📦 Estructura del proyecto

- `/src/models/`: Modelos Mongoose (Usuario, Serie, Review)
- `/src/controllers/`: Lógica de negocio por entidad
- `/src/routes/`: Definición de rutas Express
- `/src/middlewares/`: Middlewares (auth, isAdmin, errorHandler)
- `/src/config/`: Conexión DB, configuración Cloudinary, etc.
- `/src/scripts/`: Scripts de seed para poblar la BBDD desde CSV
- `/uploads/`: Carpeta temporal para imágenes antes de Cloudinary

---

## 🛠️ Instalación y uso local

1. **Clona el repo y entra en la carpeta**  
   ```bash
   git clone <REPO_BACKEND_URL>
   cd pilotseries-backend
   ```

2. **Instala dependencias**  
   ```bash
   npm install
   ```

3. **Configura el archivo `.env`** (ejemplo):
   ```
   PORT=3001
   ORIGINS=http://localhost:5173
   MONGO_URI=mongodb+srv://<usuario>:<pass>@cluster.mongodb.net/pilotseriesdb
   JWT_SECRET=supersecreto
   CLOUDINARY_CLOUD_NAME=xxxx
   CLOUDINARY_API_KEY=xxxx
   CLOUDINARY_API_SECRET=xxxx
   ```

4. **Arranca el servidor de desarrollo**  
   ```bash
   npm run dev
   ```

5. **Carga los datos iniciales (opcional pero recomendado)**  
   ```bash
   npm run seed
   ```
   Esto borra y rellena la base de datos con series, usuarios y reseñas de ejemplo desde CSV.

---

## 🧑‍💻 Endpoints principales

- `/api/auth/`: Registro y login (JWT)
- `/api/series/`: Catálogo de series (CRUD, filtro, detalle)
- `/api/reviews/`: Reseñas (crear, listar, editar, like)
- `/api/usuarios/`: Perfil, gestión de listas (favoritas, seguidas, finalizadas), recomendaciones
- `/api/admin/`: Gestión avanzada para administradores (usuarios, series, reseñas)
- Subida de imágenes por form-data (usuarios y series)

Consulta el código fuente para ver la documentación detallada de cada ruta y sus middlewares.

---

## ✅ Requisitos previos

- Node.js 18+
- MongoDB (local o Atlas)
- Cloudinary (opcional, pero recomendable)
- Configuración de `.env`

---

## 📣 Autoría

Proyecto realizado como entrega final para Rock The Code en The Power.
Desarrollado por Àrian Castro.

---


