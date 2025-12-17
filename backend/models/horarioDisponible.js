import mongoose from "mongoose";

const horarioDisponibleSchema = new mongoose.Schema(
  {
    hora: {
      type: String,
      required: true,
      unique: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/, // Formato HH:MM
    },
    capacidad: {
      type: Number,
      required: true,
      default: 50,
      min: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    orden: {
      type: Number,
      default: 0,
    },
    descripcion: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: false,
    collection: "horarios_disponibles",
  }
);

// Índice para ordenamiento
horarioDisponibleSchema.index({ orden: 1 });

export default mongoose.model("HorarioDisponible", horarioDisponibleSchema);
