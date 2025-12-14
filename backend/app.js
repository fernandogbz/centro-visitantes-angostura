import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import visitasRoutes from "./routes/visitas.js";

const app = express();

// Seguridad - Headers HTTP seguros
app.use(helmet());

// CORS - Configurado para desarrollo local
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true,
  })
);

// Rate limiting general
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: { error: "Demasiadas peticiones, intenta más tarde" },
});
app.use("/api/", limiter);

// Parseo de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/visitas", visitasRoutes);

// Ruta de health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint no encontrado" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Error interno del servidor"
        : err.message,
  });
});

export default app;
