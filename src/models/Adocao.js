import mongoose from 'mongoose';

const adocaoSchema = new mongoose.Schema({
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet', // opcional se tiver o model
    required: true
  },
  ongId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ong', // opcional se tiver o model
    required: true
  },
  nomeAdotante: {
    type: String,
    required: true
  },
  emailAdotante: {
    type: String,
    required: true
  },
  telefoneAdotante: {
    type: String,
    required: true
  },
  mensagem: {
    type: String,
    default: ''
  },
  dataSolicitacao: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pendente', 'em_contato', 'finalizado'],
    default: 'pendente'
  }
},
{
  timestamps: true,
  collection: 'adocoes'
});

const Adocao = mongoose.model('Adocao', adocaoSchema);

export default Adocao;
