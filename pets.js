const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Enums para valores constantes
const EspecieEnum = {
  GATO: 'GATO',
  CACHORRO: 'CACHORRO'
};

const PorteEnum = {
  PEQUENO: 'PEQUENO',
  MEDIO: 'MEDIO',
  GRANDE: 'GRANDE'
};

const NivelEnergiaEnum = {
  BAIXO: 'BAIXO',
  MODERADO: 'MODERADO',
  ALTO: 'ALTO'
};

// Schema para coordenadas geográficas
const CoordenadasSchema = new Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
}, { _id: false });

// Schema para status do pet
const StatusSchema = new Schema({
  disponivel: {
    type: Boolean,
    default: true
  },
  destaque: {
    type: Boolean,
    default: false
  },
  data_cadastro: {
    type: Date,
    default: Date.now
  },
  data_ultima_atualizacao: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Schema principal para Pet
const PetSchema = new Schema({
  pet_id: {
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
  porte: {
    type: String,
    required: true,
    enum: Object.values(PorteEnum)
  },
  idade: {
    type: Number,
    required: true,
    min: 0
  },
  peso: {
    type: Number,
    required: true,
    min: 0
  },
  castrado: {
    type: Boolean,
    default: false
  },
  vacinado: {
    type: Boolean,
    default: false
  },
  vermifugado: {
    type: Boolean,
    default: false
  },
  microchipado: {
    type: Boolean,
    default: false
  },
  sociavelCaes: {
    type: Boolean,
    default: false
  },
  sociavelGatos: {
    type: Boolean,
    default: false
  },
  sociavelCriancas: {
    type: Boolean,
    default: false
  },
  nivelEnergia: {
    type: String,
    required: true,
    enum: Object.values(NivelEnergiaEnum)
  },
  raca_id: {
    type: Number,
    required: true,
    ref: 'Raca'
  },
  personalidades: {
    type: [Number],
    default: []
  },
  ong_id: {
    type: Number,
    required: true,
    ref: 'Usuario'
  },
  coordenadas: {
    type: CoordenadasSchema,
    required: true
  },
  cidade: {
    type: String,
    required: true,
    trim: true
  },
  estado: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 2
  },
  descricao: {
    type: String,
    required: true
  },
  necessidades_especiais: {
    type: String,
    default: null
  },
  imagens: {
    type: [String],
    default: []
  },
  status: {
    type: StatusSchema,
    default: () => ({})
  },
  foto_url: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'pets'
});

// Métodos para o modelo Pet
PetSchema.methods.isGato = function() {
  return this.especie === EspecieEnum.GATO;
};

PetSchema.methods.isCachorro = function() {
  return this.especie === EspecieEnum.CACHORRO;
};

PetSchema.methods.isFilhote = function() {
  return this.idade < 1;
};

PetSchema.methods.isIdoso = function() {
  return this.idade > 10;
};

PetSchema.methods.temNecessidadesEspeciais = function() {
  return this.necessidades_especiais !== null;
};

// Índices para otimizar consultas comuns
PetSchema.index({ pet_id: 1 });
PetSchema.index({ especie: 1 });
PetSchema.index({ porte: 1 });
PetSchema.index({ raca_id: 1 });
PetSchema.index({ ong_id: 1 });
PetSchema.index({ cidade: 1, estado: 1 });
PetSchema.index({ 'status.disponivel': 1 });
PetSchema.index({ 'status.destaque': 1 });
PetSchema.index({ 'coordenadas.latitude': 1, 'coordenadas.longitude': 1 });

// Método estático para buscar pets próximos a uma localização
PetSchema.statics.findNearby = function(lat, lng, maxDistanceKm) {
  // Implementação simplificada - em produção usaria $geoNear ou $nearSphere
  return this.find({
    'status.disponivel': true
  }).then(pets => {
    return pets.filter(pet => {
      const distance = calcularDistancia(
        lat, lng, 
        pet.coordenadas.latitude, 
        pet.coordenadas.longitude
      );
      return distance <= maxDistanceKm;
    });
  });
};

// Função auxiliar para calcular distância entre coordenadas (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const Pet = mongoose.model('Pet', PetSchema);

module.exports = {
  Pet,
  EspecieEnum,
  PorteEnum,
  NivelEnergiaEnum
};