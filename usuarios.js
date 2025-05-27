const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  // Campos de identificação
  _id: mongoose.Schema.Types.ObjectId,
  user_id: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  nome: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  tipo: { 
    type: String, 
    enum: ['ONG', 'adotante'], 
    required: true 
  },
  
  // Campos de contato
  telefone: { 
    type: String 
  },
  telefone_contato: { 
    type: String 
  },
  whatsapp: { 
    type: String 
  },
  
  // Campos de localização
  cidade: { 
    type: String 
  },
  estado: { 
    type: String, 
    minlength: 2, 
    maxlength: 2 
  },
  cep: { 
    type: String 
  },
  endereco: {
    logradouro: { type: String },
    bairro: { type: String },
    complemento: { type: String, default: null }
  },
  coordenadas: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  
  // Campos específicos para ONGs
  cnpj: { 
    type: String,
    validate: {
      validator: function(v) {
        return this.tipo !== 'ONG' || (this.tipo === 'ONG' && v);
      },
      message: 'CNPJ é obrigatório para ONGs'
    }
  },
  imagem_url: { 
    type: String 
  },
  redes_sociais: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    youtube: { type: String },
    site: { type: String }
  },
  
  // Campos específicos para adotantes
  preferencias: {
    especie: { type: String },
    porte: { type: String },
    idade_min: { type: Number },
    idade_max: { type: Number },
    sexo: { type: String },
    personalidades: [{ type: String }]
  },
  
  // Metadados
  metadata: {
    criadoEm: { 
      type: Date, 
      default: Date.now 
    },
    atualizadoEm: { 
      type: Date 
    },
    ultimoLogin: { 
      type: Date 
    },
    status: { 
      type: String, 
      enum: ['ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE'], 
      default: 'ATIVO' 
    }
  }
}, {
  timestamps: {
    createdAt: 'metadata.criadoEm',
    updatedAt: 'metadata.atualizadoEm'
  }
});

// Índices para melhorar a performance de consultas
UsuarioSchema.index({ user_id: 1 }, { unique: true });
UsuarioSchema.index({ email: 1 }, { unique: true });
UsuarioSchema.index({ tipo: 1 });
UsuarioSchema.index({ cidade: 1, estado: 1 });
UsuarioSchema.index({ 'coordenadas.latitude': 1, 'coordenadas.longitude': 1 });
UsuarioSchema.index({ 'metadata.status': 1 });

// Método para verificar se o usuário é uma ONG
UsuarioSchema.methods.isONG = function() {
  return this.tipo === 'ONG';
};

// Método para verificar se o usuário é um adotante
UsuarioSchema.methods.isAdotante = function() {
  return this.tipo === 'adotante';
};

// Método para obter a localização formatada
UsuarioSchema.methods.getLocalizacao = function() {
  return `${this.cidade}, ${this.estado}`;
};

// Middleware para garantir que campos específicos de ONGs sejam preenchidos
UsuarioSchema.pre('save', function(next) {
  if (this.tipo === 'ONG' && !this.cnpj) {
    const err = new Error('CNPJ é obrigatório para ONGs');
    return next(err);
  }
  next();
});

module.exports = mongoose.model('Usuario', UsuarioSchema);