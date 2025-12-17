import mongoose from "mongoose";

const visitaSchema = new mongoose.Schema(
  {
    codigoVisita: {
      type: String,
      required: true,
      unique: true,
    },
    dia: {
      type: String,
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    hora: {
      type: String,
      required: true,
      enum: ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00"],
    },
    institucion: {
      type: String,
      default: "",
    },
    numVisitantes: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
    arboretum: {
      type: String,
      required: true,
      enum: ["Si", "No"],
    },
    contacto: {
      nombre: {
        type: String,
        required: true,
      },
      telefono: {
        type: String,
        required: true,
        match: /^\+56\d{9}$/,
      },
      comuna: {
        type: String,
        required: true,
      },
      correo: {
        type: String,
        required: true,
        lowercase: true,
      },
    },
    estado: {
      type: String,
      enum: ["confirmada", "completada", "cancelada", "no_asistio"],
      default: "confirmada",
    },
    creadoEn: {
      type: Date,
      default: Date.now,
    },
    fechaValidacion: {
      type: Date,
      default: null,
    },
    horaLlegadaReal: {
      type: String,
      default: null,
    },
    notas: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "visitas",
  }
);

// ✅ ÍNDICES CORREGIDOS
visitaSchema.index({ fecha: 1, hora: 1 }); // ← CORREGIDO
visitaSchema.index({ estado: 1 }); // ← OK
visitaSchema.index({ codigoVisita: 1 }); // ← CORREGIDO

export default mongoose.model("Visita", visitaSchema);
