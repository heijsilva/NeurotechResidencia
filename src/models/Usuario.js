import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  telefone: { type: String, required: true },
  senha: { type: String, required: true },
  tipo_usuario: [{ type: String, required: true }],
  adotante_info: {
    endereco: {
      rua: { type: String, required: function () { return this.tipo_usuario.includes('adotante'); } },
      numero: { type: Number, required: function () { return this.tipo_usuario.includes('adotante'); } },
      cidade: { type: String, required: function () { return this.tipo_usuario.includes('adotante'); } },
      estado: { type: String, required: function () { return this.tipo_usuario.includes('adotante'); } },
    },
    pets_adotados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'pets' }],
  },
  ong_info: {
    nome_ong: { type: String, required: function () { return this.tipo_usuario.includes('ong'); } },
    cnpj: { type: String, required: function () { return this.tipo_usuario.includes('ong'); } },
    endereco: {
      rua: { type: String, required: function () { return this.tipo_usuario.includes('ong'); } },
      numero: { type: Number, required: function () { return this.tipo_usuario.includes('ong'); } },
      cidade: { type: String, required: function () { return this.tipo_usuario.includes('ong'); } },
      estado: { type: String, required: function () { return this.tipo_usuario.includes('ong'); } },
    },
    telefone_ong: { type: String, required: function () { return this.tipo_usuario.includes('ong'); } },
    pets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'pets' }],
  }
});

// Criptografar senha antes de salvar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

const Usuario = mongoose.model('usuarios', usuarioSchema);

export default Usuario;