import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UsuarioSchema = new mongoose.Schema({
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
  senha: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['ONG', 'adotante'],
    required: true
  },

  telefone: { type: String },
  telefone_contato: { type: String },
  whatsapp: { type: String },

  cidade: { type: String },
  estado: {
    type: String,
    minlength: 2,
    maxlength: 2
  },
  cep: { type: String },
  endereco: {
    logradouro: { type: String },
    bairro: { type: String },
    complemento: { type: String, default: null }
  },
  coordenadas: {
    latitude: { type: Number },
    longitude: { type: Number }
  },

  // ONG-specific
  cnpj: {
    type: String,
    validate: {
      validator: function (v) {
        return this.tipo !== 'ONG' || (this.tipo === 'ONG' && !!v);
      },
      message: 'CNPJ é obrigatório para ONGs'
    }
  },
  imagem_url: { type: String },
  redes_sociais: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    youtube: { type: String },
    site: { type: String }
  },

  // Adotante-specific
  preferencias: {
    especie: { type: String },
    porte: { type: String },
    idade_min: { type: Number },
    idade_max: { type: Number },
    sexo: { type: String },
    personalidades: [{ type: String }]
  },

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

// Indexes
UsuarioSchema.index({ tipo: 1 });
UsuarioSchema.index({ cidade: 1, estado: 1 });
UsuarioSchema.index({ 'coordenadas.latitude': 1, 'coordenadas.longitude': 1 });
UsuarioSchema.index({ 'metadata.status': 1 });

// Métodos
UsuarioSchema.methods.isONG = function () {
  return this.tipo === 'ONG';
};

UsuarioSchema.methods.isAdotante = function () {
  return this.tipo === 'adotante';
};

UsuarioSchema.methods.getLocalizacao = function () {
  return `${this.cidade}, ${this.estado}`;
};

// Criptografar senha antes de salvar
UsuarioSchema.pre('save', async function (next) {
  // Validação: CNPJ obrigatório para ONGs
  if (this.tipo === 'ONG' && !this.cnpj) {
    return next(new Error('CNPJ é obrigatório para ONGs'));
  }

  // Criptografar senha se for nova ou modificada
  if (this.isModified('senha')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.senha = await bcrypt.hash(this.senha, salt);
    } catch (err) {
      return next(err);
    }
  }

  next();
});

// Exportação no padrão ESModule
const Usuario = mongoose.model('Usuario', UsuarioSchema);
export default Usuario;
