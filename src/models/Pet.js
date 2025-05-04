import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    tipo: { type: String, required: true },
    idade: { type: Number, required: true },
    porte: { type: String, required: true },
    descricao: { type: String, required: true },
    adotado: { type: Boolean, default: false },
    id_ong: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios' },  // Referência para o modelo 'usuarios'
    foto_url: { type: String },
    vacinado: { type: Boolean },
    castrado: { type: Boolean },
    sexo: { type: String },
    cor: { type: String },
    raca: { type: mongoose.Schema.Types.ObjectId, ref: 'racas' },  // Referência para o modelo 'racas'
    data_registro: { type: Date, default: Date.now },
});

const Pet = mongoose.model('pets', petSchema);

export default Pet;