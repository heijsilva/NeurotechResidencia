const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Enum para espécies de animais
const EspecieEnum = {
  GATO: 'GATO',
  CACHORRO: 'CACHORRO'
};

// Enum para portes de animais
const PorteEnum = {
  PEQUENO: 'PEQUENO',
  MEDIO: 'MEDIO',
  GRANDE: 'GRANDE'
};

// Schema para a coleção Raca
const RacaSchema = new Schema({
  raca_id: {
    type: Number,
    required: true,
    unique: true
  },
  nome: {
    type: String,
    required: true,
    trim: true
  },
  especie: {
    type: String,
    required: true,
    enum: Object.values(EspecieEnum)
  },
  porte_comum: {
    type: String,
    required: true,
    enum: Object.values(PorteEnum)
  },
  caracteristicas: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  collection: 'racas'
});

// Método para verificar se a raça é de gato
RacaSchema.methods.isGato = function() {
  return this.especie === EspecieEnum.GATO;
};

// Método para verificar se a raça é de cachorro
RacaSchema.methods.isCachorro = function() {
  return this.especie === EspecieEnum.CACHORRO;
};

// Método para verificar se a raça tem uma característica específica
RacaSchema.methods.temCaracteristica = function(caracteristica) {
  return this.caracteristicas.includes(caracteristica);
};

// Índices para melhorar a performance de consultas
RacaSchema.index({ raca_id: 1 });
RacaSchema.index({ especie: 1 });
RacaSchema.index({ nome: 1 });
RacaSchema.index({ porte_comum: 1 });

const Raca = mongoose.model('Raca', RacaSchema);

module.exports = {
  Raca,
  EspecieEnum,
  PorteEnum
};