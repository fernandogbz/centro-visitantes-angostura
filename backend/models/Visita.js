import mongoose from 'mongoose';

const visitaSchema = new mongoose.Schema({
  codigoVisita: {
    type: String,
    required: true,
    unique: true
  },
  dia: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  hora: {
    type: String,
    required: true,
    enum: ['10:00', '11:00', '14:00']
  },
  institucion: {
    type: String,
    default: ''
  },
  numVisitantes: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  arboretum: {
    type: String,
    required: true,
    enum: ['Si', 'No']
  },
  contacto: {
    nombre: {
      type: String,
      required: true
    },
    telefono: {
      type: String,
      required: true,
      match: /^\+56\d{9}$/
    },
    comuna: {
      type: String,
      required: true
    },
    correo: {
      type: String,
      required: true,
      lowercase: true
    }
  },
  estado: {
    type: String,
    required: true,
    enum: ['confirmada', 'realizada', 'cancelada'],
    default: 'confirmada'
  },
  creadoEn: {
    type: Date,
    default: Date.now
  },
  horaLlegada: {
    type: Date,
    default: null
  }
});

// Índices para búsquedas eficientes
visitaSchema.index({ fecha: 1, hora: 1 });
visitaSchema.index({ codigoVisita: 1 });
visitaSchema.index({ 'contacto.telefono': 1 });

const Visita = mongoose.model('Visita', visitaSchema);

export default Visita;
