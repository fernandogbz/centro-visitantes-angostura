# 🚀 Instalación Paso a Paso para Otro PC

Esta guía está diseñada para que **cualquier persona** pueda ejecutar el proyecto en su computadora, sin importar si es Windows, Mac o Linux.

---

## ✅ Prerequisitos

Antes de empezar, necesitas tener instalado:

### 1. Node.js (versión 18 o superior)
- **Descarga:** https://nodejs.org/
- **Verificar instalación:**
  ```sh
  node --version
  # Debe mostrar: v18.x.x o superior
  ```

### 2. Git
- **Descarga:** https://git-scm.com/
- **Verificar instalación:**
  ```sh
  git --version
  ```

### 3. MongoDB (elegir UNA opción)

**Opción A: MongoDB Local (para desarrollo)**
- **Windows:** https://www.mongodb.com/try/download/community
- **Mac:** `brew install mongodb-community`
- **Linux:** `sudo apt install mongodb-org` (Ubuntu/Debian)

**Opción B: MongoDB Atlas (recomendado - nube gratis)**
- Crea cuenta en: https://www.mongodb.com/cloud/atlas
- No requiere instalar nada en tu PC

---

## 📥 Paso 1: Clonar el Proyecto

```sh
# Clona el repositorio
git clone https://github.com/fernandogbz/angostura-visitor-hub.git

# Entra al directorio
cd angostura-visitor-hub
```

---

## 🗄️ Paso 2: Configurar MongoDB

### Opción A: MongoDB Local

**Windows:**
1. Instala MongoDB Community
2. El servicio se inicia automáticamente
3. Verifica en "Servicios" (busca "MongoDB Server")

**Mac/Linux:**
```sh
# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
sudo systemctl enable mongod  # Para que inicie al arrancar
```

**Verifica que esté corriendo:**
```sh
# Intenta conectarte
mongosh
# Si se conecta, MongoDB está funcionando
# Escribe "exit" para salir
```

### Opción B: MongoDB Atlas (Nube)

1. **Crea una cuenta gratuita:**
   - Ve a: https://www.mongodb.com/cloud/atlas
   - Click en "Try Free"

2. **Crea un cluster:**
   - Selecciona el plan M0 (FREE)
   - Elige la región más cercana
   - Click "Create Cluster" (tarda 3-5 minutos)

3. **Configura acceso:**
   - **Database Access:**
     - Click en "Add New Database User"
     - Usuario: `angostura_user`
     - Contraseña: Genera una segura (guárdala)
     - Rol: "Read and write to any database"
   
   - **Network Access:**
     - Click en "Add IP Address"
     - Click "Allow Access from Anywhere" (0.0.0.0/0)
     - Confirm

4. **Obtén el Connection String:**
   - Click en "Connect" en tu cluster
   - "Connect your application"
   - Copia el string (se ve así):
     ```
     mongodb+srv://angostura_user:<password>@cluster0.xxxxx.mongodb.net/
     ```
   - Reemplaza `<password>` con tu contraseña real

---

## ⚙️ Paso 3: Configurar Backend

```sh
# Entra a la carpeta backend
cd backend

# Instala dependencias (tarda 1-2 minutos)
npm install

# Copia el archivo de ejemplo
# Windows PowerShell:
Copy-Item .env.example .env

# Mac/Linux/Git Bash:
cp .env.example .env
```

**Edita `backend/.env`:**

Abre el archivo `backend/.env` con cualquier editor de texto y completa:

```env
PORT=3000
NODE_ENV=development

# Si usas MongoDB LOCAL:
MONGODB_URI=mongodb://localhost:27017/angostura

# Si usas MongoDB ATLAS (reemplaza con tu connection string):
MONGODB_URI=mongodb+srv://angostura_user:TU_PASSWORD@cluster0.xxxxx.mongodb.net/angostura

FRONTEND_URL=http://localhost:5173
```

**Inicializa la base de datos:**
```sh
# Esto crea las colecciones y datos iniciales
node scripts/init-database.js

# Deberías ver:
# ✅ Conectado a MongoDB
# ✅ Horarios disponibles creados
# ✅ Configuración inicial completada
```

---

## 🎨 Paso 4: Configurar Frontend

```sh
# Vuelve a la raíz del proyecto
cd ..

# Instala dependencias (tarda 2-3 minutos)
npm install

# Copia el archivo de ejemplo
# Windows PowerShell:
Copy-Item .env.example .env

# Mac/Linux/Git Bash:
cp .env.example .env
```

**Edita `.env` (en la raíz del proyecto):**

```env
VITE_API_URL=http://localhost:3000/api

# Credenciales EmailJS (obtener en paso 5)
VITE_EMAILJS_SERVICE_ID=service_XXXXXXX
VITE_EMAILJS_TEMPLATE_ID=template_XXXXXXX
VITE_EMAILJS_PUBLIC_KEY=XXXXXXXXX

# Clave para panel admin (cámbiala)
VITE_ADMIN_PASSKEY=123456
```

---

## 📧 Paso 5: Configurar EmailJS (Opcional)

Si quieres que funcione el envío de emails de confirmación:

1. **Crea cuenta gratuita:** https://www.emailjs.com/

2. **Crea un servicio de email:**
   - "Email Services" → "Add New Service"
   - Selecciona Gmail, Outlook, etc.
   - Conecta tu cuenta de email

3. **Crea un template:**
   - "Email Templates" → "Create New Template"
   - Usa este contenido básico:
     ```
     Hola {{nombre}},

     Tu reserva ha sido confirmada:
     - Código: {{codigoVisita}}
     - Fecha: {{fecha}}
     - Hora: {{hora}}
     - Visitantes: {{numVisitantes}}

     Gracias por tu reserva.
     ```
   - Variables: `{{nombre}}`, `{{codigoVisita}}`, `{{fecha}}`, `{{hora}}`, `{{numVisitantes}}`

4. **Copia las credenciales:**
   - Service ID
   - Template ID
   - Public Key (en "Account" → "General")

5. **Pégalas en `.env`** (raíz del proyecto)

**Si NO quieres configurar EmailJS ahora:**
- Deja valores de ejemplo
- El sistema funcionará, pero no enviará emails

---

## ▶️ Paso 6: Ejecutar el Proyecto

Necesitas **DOS terminales abiertas** (dos ventanas de PowerShell, Terminal, etc.)

### Terminal 1: Backend

```sh
cd backend
npm run dev
```

**Deberías ver:**
```
✅ Backend corriendo en http://localhost:3000
✅ Conectado a MongoDB
Ambiente: development
```

**¡Déjalo corriendo! No cierres esta terminal.**

---

### Terminal 2: Frontend

```sh
# En la raíz del proyecto
npm run dev
```

**Deberías ver:**
```
  VITE v6.0.1  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**¡Déjalo corriendo! No cierres esta terminal.**

---

## 🎉 Paso 7: Verificar que Funciona

1. **Abre tu navegador:** http://localhost:5173

2. **Deberías ver:** La página principal del Centro de Visitantes Angostura

3. **Prueba crear una reserva:**
   - Click en "Reservar"
   - Selecciona una fecha futura
   - Completa el formulario
   - Deberías recibir un código de visita y un QR

4. **Verifica el backend:** http://localhost:3000/api/visitas/disponibilidad?fecha=2025-12-20&hora=10:00
   - Deberías ver JSON con `cuposDisponibles`

---

## ❌ Solución de Problemas

### Error: "Sin respuesta del servidor"
**Causa:** Backend no está corriendo.  
**Solución:** Verifica que la Terminal 1 (backend) esté ejecutándose.

---

### Error: "MongooseError: connect ECONNREFUSED"
**Causa:** MongoDB no está corriendo (si es local) o la URI es incorrecta.  
**Solución:**
- **MongoDB Local:** Inicia el servicio MongoDB
- **MongoDB Atlas:** Verifica tu connection string en `backend/.env`

---

### Error: "Module not found"
**Causa:** No instalaste las dependencias.  
**Solución:**
```sh
# En la raíz
npm install

# En backend
cd backend
npm install
```

---

### La página no carga
**Causa:** Frontend no está corriendo.  
**Solución:** Verifica que la Terminal 2 (frontend) esté ejecutándose.

---

### CORS Error
**Causa:** El backend no acepta peticiones del frontend.  
**Solución:** Verifica que `FRONTEND_URL` en `backend/.env` sea `http://localhost:5173`

---

## 📂 Estructura de Archivos Importantes

```
angostura-visitor-hub/
├── .env                    ← Variables de entorno FRONTEND
├── backend/
│   ├── .env               ← Variables de entorno BACKEND
│   ├── server.js          ← Entrada del backend
│   └── scripts/
│       └── init-database.js  ← Inicialización de BD
└── package.json
```

---

## 🎓 Para tu Equipo

Cuando otro compañero necesite ejecutar el proyecto:

1. **Compártele este archivo:** `INSTALACION.md`
2. **Asegúrate de NO compartir archivos `.env`** con credenciales reales
3. **Comparte por separado:**
   - Connection string de MongoDB Atlas
   - Credenciales de EmailJS (si las hay)

---

## ✅ Checklist de Instalación Exitosa

Marca cada paso completado:

- [ ] Node.js instalado (v18+)
- [ ] Git instalado
- [ ] MongoDB configurado (local o Atlas)
- [ ] Proyecto clonado
- [ ] `npm install` ejecutado en raíz
- [ ] `npm install` ejecutado en `backend/`
- [ ] `backend/.env` configurado
- [ ] `.env` (raíz) configurado
- [ ] `node scripts/init-database.js` ejecutado sin errores
- [ ] Backend corriendo en http://localhost:3000
- [ ] Frontend corriendo en http://localhost:5173
- [ ] Puedes crear una reserva de prueba

---

## 🆘 Ayuda Adicional

Si después de seguir todos los pasos aún tienes problemas:

1. **Revisa la sección [Troubleshooting en README.md](./README.md#troubleshooting-solución-de-problemas)**

2. **Verifica versiones:**
   ```sh
   node --version   # Debe ser v18 o superior
   npm --version
   ```

3. **Limpia e intenta de nuevo:**
   ```sh
   # Borra node_modules y reinstala
   rm -rf node_modules package-lock.json
   npm install
   
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 🚀 Próximos Pasos

Una vez que todo funcione en tu PC:

- Lee **[DEPLOYMENT.md](./DEPLOYMENT.md)** para desplegar en Internet
- Explora el código en `src/` (frontend) y `backend/`
- Revisa **[diagrama-er.md](./diagrama-er.md)** para entender la base de datos

¡Éxito con tu proyecto! 🎉
