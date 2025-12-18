import mongoose from "mongoose";
import dotenv from "dotenv";
import HorarioDisponible from "../models/horarioDisponible.js";

dotenv.config();

/**
 * Script para crear/actualizar todas las franjas horarias del Centro de Visitantes
 *
 * Horarios de operación:
 * - Martes a Domingo
 * - Mañana: 09:00 - 13:00 (4 franjas)
 * - Tarde: 15:00 - 17:00 (3 franjas)
 * - Capacidad: 30 visitantes por franja
 *
 * NOTA: El bloqueo de lunes se maneja en el backend mediante lógica de negocio,
 * no requiere configuración en horarios.
 */

async function insertHorariosCompleto() {
  try {
    // Ya está conectado desde server.js cuando se importa
    // ====================================
    // DEFINICIÓN DE FRANJAS HORARIAS
    // ====================================

    const horariosCompletos = [
      // HORARIO MATUTINO (09:00 - 13:00)
      {
        hora: "09:00",
        capacidad: 30,
        activo: true,
        orden: 1,
        descripcion: "Primera franja matutina",
      },
      {
        hora: "10:00",
        capacidad: 30,
        activo: true,
        orden: 2,
        descripcion: "Segunda franja matutina",
      },
      {
        hora: "11:00",
        capacidad: 30,
        activo: true,
        orden: 3,
        descripcion: "Tercera franja matutina",
      },
      {
        hora: "12:00",
        capacidad: 30,
        activo: true,
        orden: 4,
        descripcion: "Última franja matutina",
      },

      // HORARIO VESPERTINO (15:00 - 17:00)
      {
        hora: "15:00",
        capacidad: 30,
        activo: true,
        orden: 5,
        descripcion: "Primera franja vespertina",
      },
      {
        hora: "16:00",
        capacidad: 30,
        activo: true,
        orden: 6,
        descripcion: "Segunda franja vespertina",
      },
      {
        hora: "17:00",
        capacidad: 30,
        activo: true,
        orden: 7,
        descripcion: "Última franja vespertina",
      },
    ];

    // ====================================
    // INSERCIÓN/ACTUALIZACIÓN
    // ====================================

    let insertados = 0;
    let actualizados = 0;

    for (const horario of horariosCompletos) {
      const existente = await HorarioDisponible.findOne({ hora: horario.hora });

      await HorarioDisponible.findOneAndUpdate(
        { hora: horario.hora },
        horario,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (!existente) {
        insertados++;
      } else {
        actualizados++;
      }
    }

    return { insertados, actualizados, total: horariosCompletos.length };
  } catch (error) {
    console.error("❌ Error creando franjas horarias:", error);
    throw error;
  }
  // No cerramos la conexión porque el servidor la necesita
}

// Ejecutar script solo si se llama directamente (no cuando se importa)
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/angostura")
    .then(async () => {
      console.log("✅ Conectado a MongoDB");
      const resultado = await insertHorariosCompleto();
      console.log("📊 Resumen:");
      console.log(`   • Nuevas: ${resultado.insertados}`);
      console.log(`   • Actualizadas: ${resultado.actualizados}`);
      console.log(`   • Total: ${resultado.total}`);
      console.log("🎉 Proceso completado exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

export default insertHorariosCompleto;
