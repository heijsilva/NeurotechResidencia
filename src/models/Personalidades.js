import mongoose from "mongoose";

// Define enum para opções de compatibilidade
const compatibilidadeEnum = [
  'apartamento',
  'casa',
  'outros_caes',
  'outros_gatos',
  'crianças',
  'idosos',
  'família',
  'iniciantes',
  'experientes'
];

// Cria o schema de Personalidade
const personalidadeSchema = new mongoose.Schema({
  personalidade_id: {
    type: Number,
    required: true,
    unique: true
  },
  nome: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    required: true
  },
  compativel_com: [{
    type: String,
    enum: compatibilidadeEnum
  }]
}, {
  timestamps: true,
  collection: 'personalidades'
});

// Métodos para verificar compatibilidade
personalidadeSchema.methods = {
  isCompativelCom: function(ambiente) {
    return this.compativel_com.includes(ambiente);
  },
  
  isCompativelComApartamento: function() {
    return this.compativel_com.includes('apartamento');
  },
  
  isCompativelComCasa: function() {
    return this.compativel_com.includes('casa');
  },
  
  isCompativelComOutrosCaes: function() {
    return this.compativel_com.includes('outros_caes');
  },
  
  isCompativelComOutrosGatos: function() {
    return this.compativel_com.includes('outros_gatos');
  },
  
  isCompativelComCriancas: function() {
    return this.compativel_com.includes('crianças');
  }
};

// Métodos estáticos para encontrar personalidades por compatibilidade
personalidadeSchema.statics = {
  encontrarPorCompatibilidade: function(ambientes) {
    if (!Array.isArray(ambientes)) {
      ambientes = [ambientes];
    }
    
    return this.find({
      compativel_com: { $all: ambientes }
    });
  },
  
  encontrarCompativelComFamilia: function() {
    return this.find({
      compativel_com: 'família'
    });
  },
  
  encontrarCompativelComIniciantes: function() {
    return this.find({
      compativel_com: 'iniciantes'
    });
  }
};

// Criar índices para consultas comuns
personalidadeSchema.index({ personalidade_id: 1 });
personalidadeSchema.index({ nome: 1 });
personalidadeSchema.index({ compativel_com: 1 });

// Criar e exportar o modelo
const Personalidade = mongoose.model('Personalidade', personalidadeSchema);
export {Personalidade};