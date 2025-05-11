const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define enums para os tipos de interação
const tipoInteracaoEnum = ['like', 'deslike', 'match'];

// Define enums para as plataformas
const plataformaEnum = ['APP_ANDROID', 'APP_IOS', 'WEB'];

// Define enums para status de match
const statusMatchEnum = [
  'AGUARDANDO_RESPOSTA',
  'EM_CONVERSA',
  'VISITA_AGENDADA',
  'ADOCAO_CONCLUIDA',
  'CANCELADO'
];

// Define enums para motivos de interesse
const motivosInteresseEnum = [
  'Aparência',
  'Compatibilidade',
  'História do pet',
  'Idade adequada',
  'Personalidade',
  'Porte adequado',
  'Proximidade'
];

// Define enums para motivos de desinteresse
const motivosDesinteresseEnum = [
  'Idade inadequada',
  'Muita distância',
  'Necessidades especiais',
  'Não castrado',
  'Não vacinado',
  'Porte inadequado'
];

// Cria o schema de metadados
const metadataSchema = new Schema({
  tempo_visualizacao: {
    type: Number,
    required: true
  },
  distancia_momento_interacao: {
    type: Number,
    required: true
  },
  versao_app: {
    type: String,
    required: true
  },
  device_info: {
    type: String,
    required: true
  }
}, { _id: false });

// Cria o schema de Interacao
const interacaoSchema = new Schema({
  interacao_id: {
    type: Number,
    required: true,
    unique: true
  },
  user_id: {
    type: Number,
    required: true,
    ref: 'Usuario'
  },
  pet_id: {
    type: Number,
    required: true,
    ref: 'Pet'
  },
  tipo: {
    type: String,
    required: true,
    enum: tipoInteracaoEnum
  },
  data: {
    type: Date,
    required: true,
    default: Date.now
  },
  plataforma: {
    type: String,
    required: true,
    enum: plataformaEnum
  },
  metadata: {
    type: metadataSchema,
    required: true
  },
  motivosInteresse: [{
    type: String,
    enum: motivosInteresseEnum
  }],
  motivosDesinteresse: [{
    type: String,
    enum: motivosDesinteresseEnum
  }],
  status_match: {
    type: String,
    enum: statusMatchEnum
  },
  data_conclusao: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'interacoes'
});

// Validação condicional para garantir que os campos corretos estejam presentes com base no tipo de interação
interacaoSchema.pre('validate', function(next) {
  if (this.tipo === 'like' && (!this.motivosInteresse || this.motivosInteresse.length === 0)) {
    this.invalidate('motivosInteresse', 'Motivos de interesse são obrigatórios para interações do tipo like');
  }
  
  if (this.tipo === 'deslike' && (!this.motivosDesinteresse || this.motivosDesinteresse.length === 0)) {
    this.invalidate('motivosDesinteresse', 'Motivos de desinteresse são obrigatórios para interações do tipo deslike');
  }
  
  if (this.tipo === 'match' && !this.status_match) {
    this.invalidate('status_match', 'Status de match é obrigatório para interações do tipo match');
  }
  
  if (this.status_match === 'ADOCAO_CONCLUIDA' || this.status_match === 'CANCELADO') {
    if (!this.data_conclusao) {
      this.invalidate('data_conclusao', 'Data de conclusão é obrigatória para matches concluídos ou cancelados');
    }
  }
  
  next();
});

// Índices para otimizar consultas comuns
interacaoSchema.index({ user_id: 1 });
interacaoSchema.index({ pet_id: 1 });
interacaoSchema.index({ tipo: 1 });
interacaoSchema.index({ data: -1 });
interacaoSchema.index({ 'metadata.distancia_momento_interacao': 1 });
interacaoSchema.index({ status_match: 1 });

// Métodos para verificar o tipo de interação
interacaoSchema.methods = {
  isLike: function() {
    return this.tipo === 'like';
  },
  
  isDeslike: function() {
    return this.tipo === 'deslike';
  },
  
  isMatch: function() {
    return this.tipo === 'match';
  },
  
  isAdocaoConcluida: function() {
    return this.tipo === 'match' && this.status_match === 'ADOCAO_CONCLUIDA';
  },
  
  tempoDesdeInteracao: function() {
    return new Date() - this.data;
  }
};

// Métodos estáticos para consultas comuns
interacaoSchema.statics = {
  // Encontrar todas as interações de um usuário
  encontrarPorUsuario: function(userId) {
    return this.find({ user_id: userId }).sort({ data: -1 });
  },
  
  // Encontrar todas as interações de um pet
  encontrarPorPet: function(petId) {
    return this.find({ pet_id: petId }).sort({ data: -1 });
  },
  
  // Encontrar matches em andamento
  encontrarMatchesEmAndamento: function() {
    return this.find({
      tipo: 'match',
      status_match: { $in: ['AGUARDANDO_RESPOSTA', 'EM_CONVERSA', 'VISITA_AGENDADA'] }
    }).sort({ data: -1 });
  },
  
  // Encontrar adoções concluídas
  encontrarAdocoesConcluidas: function() {
    return this.find({
      tipo: 'match',
      status_match: 'ADOCAO_CONCLUIDA'
    }).sort({ data_conclusao: -1 });
  },
  
  // Encontrar interações recentes
  encontrarInteracoesRecentes: function(dias = 7) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);
    
    return this.find({
      data: { $gte: dataLimite }
    }).sort({ data: -1 });
  },
  
  // Estatísticas de interações
  estatisticasInteracoes: async function() {
    return this.aggregate([
      {
        $group: {
          _id: '$tipo',
          count: { $sum: 1 },
          tempoMedioVisualizacao: { $avg: '$metadata.tempo_visualizacao' },
          distanciaMedia: { $avg: '$metadata.distancia_momento_interacao' }
        }
      }
    ]);
  }
};

// Criar e exportar o modelo
const Interacao = mongoose.model('Interacao', interacaoSchema);
module.exports = Interacao;