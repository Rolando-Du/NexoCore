# NexoCore

NexoCore es una plataforma SaaS empresarial para la gestión de clientes, operaciones, evidencias, notificaciones y auditoría.

El proyecto está organizado como una solución fullstack con backend, frontend web y una carpeta mobile preparada para futuras integraciones.

## Estructura del proyecto

```txt
NexoCore/
├── backend/
├── frontend/
├── mobile/
├── docs/
├── docker-compose.yml
└── README.md
```

## Tecnologías principales

### Backend

* Node.js
* Express
* Prisma ORM
* PostgreSQL
* JWT
* Zod
* Swagger
* Multer
* Helmet
* CORS

### Frontend

* React
* Vite
* TailwindCSS
* Axios
* React Router
* Lucide React

### Base de datos

* PostgreSQL
* Docker Compose para entorno local
* Compatible con bases externas como Neon

## Requisitos previos

Antes de iniciar el proyecto, tener instalado:

```bash
node --version
pnpm --version
docker --version
```

Versiones recomendadas:

```txt
Node.js >= 20
pnpm >= 11
Docker Desktop
```

## Configuración del backend

Entrar a la carpeta del backend:

```bash
cd backend
```

Instalar dependencias:

```bash
pnpm install
```

Crear el archivo `.env` tomando como referencia:

```bash
cp .env.example .env
```

Ejemplo de variables necesarias:

```env
PORT=4000
NODE_ENV=development

DATABASE_URL="postgresql://postgres:postgres@localhost:5433/nexocore_db?schema=public"

JWT_SECRET="replace_this_with_a_secure_secret"

CORS_ORIGIN=http://localhost:5173
```

Importante: el archivo `.env` no debe subirse al repositorio.

## Base de datos local con Docker

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Verificar que PostgreSQL esté corriendo:

```bash
docker ps
```

Probar conexión a la base:

```bash
docker exec -it nexocore_postgres psql -U postgres -d nexocore_db
```

Salir de PostgreSQL:

```sql
\q
```

## Prisma

Desde la carpeta `backend`:

```bash
pnpm prisma:validate
pnpm prisma:generate
pnpm prisma:migrate
```

Abrir Prisma Studio:

```bash
pnpm prisma:studio
```

## Iniciar backend

Desde la carpeta `backend`:

```bash
pnpm dev
```

El backend queda disponible en:

```txt
http://localhost:4000
```

Swagger queda disponible en:

```txt
http://localhost:4000/api/docs
```

Health check:

```txt
http://localhost:4000/health
```

## Configuración del frontend

Entrar a la carpeta del frontend:

```bash
cd frontend
```

Instalar dependencias:

```bash
pnpm install
```

Crear el archivo `.env`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_DEFAULT_TENANT_ID=TU_TENANT_ID_LOCAL
```

Importante: el `VITE_DEFAULT_TENANT_ID` debe coincidir con el tenant creado en el backend.

## Iniciar frontend

Desde la carpeta `frontend`:

```bash
pnpm dev
```

El frontend queda disponible en:

```txt
http://localhost:5173
```

## Build del frontend

```bash
pnpm build
```

Para previsualizar el build:

```bash
pnpm preview
```

## Autenticación

El backend utiliza JWT.

Para probar endpoints protegidos en Swagger:

1. Ejecutar `POST /api/auth/login`.
2. Copiar el token recibido.
3. Presionar `Authorize`.
4. Pegar el token con el formato:

```txt
Bearer TU_TOKEN
```

## Módulos principales

### Auth

* Registro de tenant
* Login
* Usuario autenticado
* Validación de JWT

### Clients

* Crear clientes
* Listar clientes
* Obtener cliente por ID
* Actualizar cliente
* Deshabilitar cliente
* Validación de duplicados por email o CUIT / Tax ID

### Operations

* Crear operaciones
* Listar operaciones
* Obtener operación por ID
* Cambiar estado
* Asignar usuario
* Historial de estados
* Auditoría
* Notificaciones automáticas

### Attachments

* Subida de evidencias
* Imágenes
* PDF
* Word
* Excel
* Asociación de archivos a operaciones
* Validación de tipo y tamaño de archivo

### Notifications

* Listar notificaciones del usuario
* Filtrar por estado
* Filtrar por tipo
* Marcar una notificación como leída
* Marcar todas como leídas

### Audit

* Consulta de auditoría por tenant
* Filtros por módulo
* Filtros por acción
* Filtros por usuario
* Filtros por entidad
* Filtros por rango de fechas
* Paginación

## Scripts útiles del backend

```bash
pnpm dev
pnpm start
pnpm prisma:validate
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:migrate:deploy
pnpm prisma:studio
```

## Scripts útiles del frontend

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm check
```

## Flujo recomendado de desarrollo

Levantar base de datos local:

```bash
docker compose up -d
```

Levantar backend:

```bash
cd backend
pnpm dev
```

Levantar frontend en otra terminal:

```bash
cd frontend
pnpm dev
```

Abrir frontend:

```txt
http://localhost:5173
```

Abrir Swagger:

```txt
http://localhost:4000/api/docs
```

## Seguridad

El proyecto incluye:

* Autenticación con JWT
* Middleware de permisos
* Validación de datos con Zod
* CORS configurable
* Helmet
* Protección de archivos `.env`
* Validación de archivos subidos
* Límite de tamaño para uploads
* Auditoría de acciones principales
* Separación por tenant

## Git

Archivos que no deben subirse:

```txt
.env
node_modules
dist
build
coverage
uploads reales
```

Solo se versionan archivos `.gitkeep` dentro de uploads para mantener la estructura de carpetas.

## Estado actual

El proyecto cuenta con backend y frontend funcionales para:

* Login
* Dashboard
* Clientes
* Operaciones
* Evidencias
* Notificaciones
* Auditoría
* Swagger
* PostgreSQL local con Docker

## Autor

Rolando Duarte
