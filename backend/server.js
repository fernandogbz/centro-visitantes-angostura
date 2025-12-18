import dotenv from "dotenv";
import app from "./app.js";
import conectarDB from "./config/db.js";
import insertHorariosCompleto from "./scripts/insert-horarios-completo.js";

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
await conectarDB();

// Inicializar horarios disponibles automáticamente
try {
  await insertHorariosCompleto();
  console.log("✅ Horarios disponibles inicializados");
} catch (error) {
  console.error("⚠️ Error inicializando horarios:", error.message);
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
});
