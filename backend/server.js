import dotenv from 'dotenv';
import app from './app.js';
import conectarDB from './config/db.js';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
await conectarDB();

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
