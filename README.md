# Centro de Visitantes Angostura del Biobío

Sistema web completo para gestión de visitas al Centro de Visitantes Angostura del Biobío.

## Documentación

- **[INSTALACION.md](./INSTALACION.md)** - Guía paso a paso para configurar el proyecto en otro PC
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de despliegue en producción (Vercel, Render, MongoDB Atlas)

- **[script-franjas-horarias.md](./script-franjas-horarias.md)** - Script para configuración de horarios operacionales

## Tecnologías

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Axios
- QRCode
- date-fns

### Backend
- Node.js + Express
- MongoDB + Mongoose
- express-validator
- helmet (seguridad)
- express-rate-limit

## Instalación

### Prerequisitos
- Node.js 18+
- MongoDB instalado y corriendo localmente
- npm o bun

### 1. Clonar el repositorio
```sh
git clone <YOUR_GIT_URL>
cd angostura-visitor-hub
```

### 2. Instalar y configurar MongoDB

**Opción A: MongoDB Local**
```sh
# Windows: Descarga e instala MongoDB Community desde https://www.mongodb.com/try/download/community
# Inicia el servicio MongoDB

# Linux/Mac:
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

**Opción B: MongoDB Atlas (Nube - Recomendado)**
1. Crea cuenta gratuita en https://www.mongodb.com/cloud/atlas
2. Crea un cluster gratuito (M0)
3. Obtén tu connection string

### 3. Configurar Backend
```sh
cd backend
npm install

# Copia el archivo de ejemplo y configúralo
cp .env.example .env

# Edita backend/.env con tus valores:
# - MONGODB_URI: Tu connection string de MongoDB
# - PORT: Puerto del backend (default: 3000)
# - FRONTEND_URL: URL de tu frontend (default: http://localhost:5173)
```

**Ejemplo backend/.env:**
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/angostura
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/angostura
FRONTEND_URL=http://localhost:5173
```

**Inicializar base de datos:**
```sh
node scripts/init-database.js
```

### 4. Configurar Frontend
```sh
cd ..
npm install

# Copia el archivo de ejemplo y configúralo
cp .env.example .env

# Edita .env con tus valores de EmailJS
```

**Ejemplo .env (raíz):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
VITE_ADMIN_PASSKEY=tu_clave_admin
```

**Obtener credenciales EmailJS:**
1. Crea cuenta en https://www.emailjs.com/
2. Crea un servicio de email
3. Crea un template de email
4. Copia tus credenciales

### 5. Iniciar Aplicación

**Terminal 1 - Backend:**
```sh
cd backend
npm run dev
```
El backend estará en http://localhost:3000

**Terminal 2 - Frontend:**
```sh
npm run dev
```
El frontend estará en http://localhost:5173

## Funcionalidades Implementadas

### Sistema de Reservas Público
- Formulario de reserva en 3 pasos (fecha/hora, datos, confirmación)
- Validación client-side (React Hook Form + Zod) y server-side (express-validator)
- Consulta de disponibilidad en tiempo real
- Generación de código de visita único (formato VIS-YYYYMMDD-NNN)
- Generación de código QR de confirmación
- Control de capacidad por horario (30 visitantes/franja)
- Bloqueo automático de días lunes

### Backend API RESTful
- POST /api/visitas - Crear nueva reserva
- GET /api/visitas/disponibilidad - Consultar cupos disponibles
- GET /api/visitas/dashboard/stats - Estadísticas administrativas
- 15 validaciones server-side con express-validator
- Rate limiting (100 req/15min por IP)
- Seguridad: Helmet, CORS restrictivo, sanitización de inputs
- Manejo centralizado de errores

### Base de Datos MongoDB
- 4 colecciones: visitas, horarios_disponibles, dias_bloqueados, configuracion_sistema
- Modelo Visita con subdocumento de contacto embebido
- 8 índices optimizados para consultas frecuentes
- Aggregation pipelines para cálculo de disponibilidad en tiempo real
- Validaciones a nivel de schema (regex, enums, rangos)

### Panel Administrativo
- Dashboard con estadísticas (visitas totales, confirmadas, hoy, semana)
- Protección mediante passkey
- Visualización de métricas del sistema

### Horarios Operacionales
- Martes a Domingo
- Horario matutino: 09:00 - 12:00 (4 franjas)
- Horario vespertino: 15:00 - 17:00 (3 franjas)
- Capacidad: 30 visitantes por franja
- Capacidad total: 210 visitantes/día

## Estructura del Proyecto

```
/
├── backend/
│   ├── config/
│   │   └── db.js           # Conexión MongoDB
│   ├── models/
│   │   └── Visita.js       # Schema de visitas
│   ├── routes/
│   │   └── visitas.js      # Endpoints de visitas
│   ├── utils/
│   │   └── generarCodigo.js
│   ├── app.js              # Configuración Express
│   ├── server.js           # Punto de entrada
│   ├── package.json
│   └── .env
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── CalendarioDisponibilidad.tsx
│   │   └── ui/             # Componentes shadcn/ui
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Reservar.tsx    # Flujo de reserva completo
│   │   ├── Informacion.tsx
## Solución de Problemas

### Error: "Sin respuesta del servidor" o "Network Error"

**Causa:** El backend no está ejecutándose.

**Solución:**
```sh
cd backend
npm run dev
```
Verifica que se muestre el mensaje "Backend corriendo en http://localhost:3000"

### Error: "MongooseError: connect ECONNREFUSED"

**Causa:** MongoDB no está corriendo o la URI es incorrecta.

**Soluciones:**

1. **MongoDB Local:** Verifica que el servicio esté activo
   ```sh
   # Windows: Verifica en Servicios (services.msc)
   # Linux: sudo systemctl status mongod
   # Mac: brew services list
   ```

2. **MongoDB Atlas:** Verifica tu connection string en `backend/.env`
   - Asegúrate de reemplazar `<password>` con tu contraseña real
   - Verifica que tu IP esté en la whitelist de Atlas

### Error al ejecutar en otro PC

**Causa:** Archivos `.env` no están configurados.

**Solución:**
1. Copia los archivos `.env.example`:
   ```sh
   # En la raíz del proyecto
   cp .env.example .env
   
   # En backend
   cd backend
   cp .env.example .env
   ```

2. Edita ambos archivos `.env` con tus credenciales reales

3. Instala MongoDB o usa MongoDB Atlas

4. Ejecuta el script de inicialización:
   ```sh
   cd backend
   node scripts/init-database.js
   ```

### Error: "Module not found" o errores de dependencias

**Causa:** Dependencias no están instaladas.

**Solución:**
```sh
# En la raíz (frontend)
npm install

# En backend
cd backend
npm install
```

### CORS Error en el navegador

**Causa:** El frontend intenta conectarse a un backend en diferente URL.

**Solución:**
1. Verifica que `VITE_API_URL` en `.env` coincida con el backend
2. Verifica que `FRONTEND_URL` en `backend/.env` coincida con tu frontend

### Checklist de Instalación Exitosa

Antes de reportar un problema, verifica:

- MongoDB está corriendo (local) o tienes un cluster en Atlas
- `backend/.env` existe y tiene valores correctos
- `.env` (raíz) existe y tiene valores correctos
- Ejecutaste `npm install` en raíz y en `backend/`
- Ejecutaste `node scripts/init-database.js` en backend
- Backend está corriendo en http://localhost:3000
- Frontend está corriendo en http://localhost:5173
- Puedes acceder a http://localhost:3000/api/visitas/disponibilidad
- [ ] MongoDB está corriendo (local) o tienes un cluster en Atlas
- [ ] `backend/.env` existe y tiene valores correctos
- [ ] `.env` (raíz) existe y tiene valores correctos
- [ ] Ejecutaste `npm install` en raíz y en `backend/`
- [ ] Ejecutaste `node scripts/init-database.js` en backend
- [ ] Backend está corriendo en http://localhost:3000
- [ ] Frontend está corriendo en http://localhost:5173
- [ ] Puedes acceder a http://localhost:3000/api/visitas/disponibilidad

## API Endpoints

### POST /api/visitas
Crea una nueva reserva.

**Body:**
```json
{
  "fecha": "2025-12-20",
  "hora": "10:00",
  "institucion": "Colegio Los Ángeles" // opcional
  "numVisitantes": 25,
  "arboretum": "Si",
  "contacto": {
    "nombre": "Juan Pérez",
    "telefono": "+56912345678",
    "comuna": "Los Ángeles",
    "correo": "juan@example.com"
  }
}
```

**Response 201:**
```json
{
  "mensaje": "Reserva creada exitosamente",
  "visita": {
    "codigoVisita": "VIS-20251220-001",
    "fecha": "2025-12-20T00:00:00.000Z",
    "hora": "10:00",
    "numVisitantes": 25,
    "estado": "confirmada"
  }
}
```

### GET /api/visitas/disponibilidad?fecha=YYYY-MM-DD
Consulta el aforo disponible para una fecha.

**Response 200:**
```json
{
  "aforoMaximo": 250,
  "reservado": 180,
  "disponible": 70
}
```

## Validaciones

- **Fecha**: Debe ser futura
- **Hora**: Solo 10:00, 11:00 o 14:00
- **Número de visitantes**: 1-100
- **Teléfono**: Formato +56XXXXXXXXX (9 dígitos después de +56)
- **Email**: Formato válido
- **Aforo**: No puede exceder 250 visitantes por día

## Notas de Desarrollo
## Validaciones Implementadas

### Client-Side (React Hook Form + Zod)
- Fecha: Debe ser futura (mínimo 24 horas de anticipación)
- Hora: Enum ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00']
- Número de visitantes: Rango 1-30 por franja
- Teléfono: Formato +56XXXXXXXXX (regex: /^\+56\d{9}$/)
- Email: Formato RFC 5322 válido, lowercase
- Institución: Opcional, máximo 100 caracteres
- Comuna: Requerido, máximo 50 caracteres

### Server-Side (express-validator)
- 15 validaciones exhaustivas en backend/routes/visitas.js
- Sanitización de inputs (trim, escape)
- Validación de disponibilidad en tiempo real
- Verificación de capacidad por horario (30 visitantes/franja)
- Validación de días bloqueados (lunes + feriados)
- Generación de código único con verificación de duplicados
