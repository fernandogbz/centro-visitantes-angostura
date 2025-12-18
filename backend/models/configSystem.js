import mongoose from 'mongoose';

const configuracionSistemaSchema = new mongoose.Schema({
clave: {
    type: String,
    required: true,
    unique: true,
    trim: true
},
valor: {
    type: String,
    required: true
},
descripcion: {
    type: String,
    default: ''
},
tipo: {
    type: String,
    enum: ['string', 'number', 'boolean', 'json'],
    default: 'string'
}
}, {
    timestamps: true,
    collection: 'configuracion_sistema'
});

// Método helper para obtener valor parseado
configuracionSistemaSchema.methods.getValorParseado = function() {
    switch (this.tipo) {
        case 'number':
        return parseInt(this.valor);
    case 'boolean':
        return this.valor === 'true' || this.valor === '1';
    case 'json':
        try {
        return JSON.parse(this.valor);
    } catch (e) {
        return this.valor;
    }
    default:
        return this.valor;
    }
};

export default mongoose.model('ConfiguracionSistema', configuracionSistemaSchema);