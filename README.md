# Centro de Visitantes Angostura del Biobío

Sistema web completo para gestión de visitas al Centro de Visitantes Angostura del Biobío.

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

### 2. Configurar Backend
```sh
cd backend
npm install

# Asegúrate de que MongoDB esté corriendo
# El archivo .env ya está configurado para desarrollo local
```

### 3. Configurar Frontend
```sh
cd ..
npm install

# El archivo .env ya está configurado
```

### 4. Iniciar Aplicación

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

## Funcionalidades MVP

### ✅ Implementado
- **Sistema de Reservas Público**
  - Formulario de reserva en 2 pasos
  - Validación client-side y server-side
  - Consulta de disponibilidad en tiempo real
  - Generación de código de visita único (formato VIS-YYYYMMDD-NNN)
  - Código QR de confirmación
  - Control de aforo (máximo 250 visitantes/día)

- **Backend API**
  - POST /api/visitas - Crear reserva
  - GET /api/visitas/disponibilidad - Consultar aforo
  - Validaciones exhaustivas con express-validator
  - Rate limiting (100 req/15min)
  - Seguridad con helmet
  - CORS configurado

- **Base de Datos**
  - Modelo Visita completo en MongoDB
  - Índices optimizados para búsquedas

### 🚧 Pendiente
- Panel administrativo (login, dashboard, check-in)
- Sistema de autenticación JWT
- Envío de emails de confirmación
- Guías QR multilingües (español/inglés)
- Exportación a Excel
- Métricas y reportes

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
│   │   └── NotFound.tsx
│   ├── services/
│   │   └── api.ts          # Cliente Axios
│   └── App.tsx
├── .env
└── package.json
```

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

- El backend usa ES Modules (`type: "module"` en package.json)
- MongoDB debe estar corriendo en `localhost:27017`
- El código QR se genera en el frontend usando la librería `qrcode`
- Las validaciones son tanto client-side (React) como server-side (express-validator)
- Se implementó rate limiting para evitar abuso de la API



