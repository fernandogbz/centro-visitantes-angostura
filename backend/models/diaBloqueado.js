import mongoose from 'mongoose';

const diaBloqueadoSchema = new mongoose.Schema({
fecha: {
    type: Date,
    required: true,
    unique: true
},
motivo: {
    type: String,
    required: true,
    trim: true
},
tipo: {
    type: String,
    enum: ['feriado', 'mantenimiento', 'otro'],
    default: 'feriado'
},
descripcion: {
    type: String,
    default: ''
},
activo: {
    type: Boolean,
    default: true
},
creadoPor: {
    type: String,
    default: 'sistema'
}
}, {
    timestamps: true,
    collection: 'dias_bloqueados'
});

// Índice para búsquedas por fecha
diaBloqueadoSchema.index({ fecha: 1, activo: 1 });

export default mongoose.model('DiaBloqueado', diaBloqueadoSchema);