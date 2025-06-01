import Adocao from '../models/Adocao.js';
import Usuario from '../models/Usuario.js';

const getAllUsers = async (req, res) => {
    try {
        const users = await Usuario.find();
        return res.status(200).json(users);
    } catch (err) {
        return res.status(400).json(err);
    }
};

const getMe = async (req, res) => {
    try {
        const user = await Usuario.findOne({ _id: req.user.id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (err) {
        return res.status(400).json(err);
    }
};

const updateMe = async (req, res) => {
    try {
        const user = await Usuario.findOne({ _id: req.user.id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const {
            nome,
            email,
            senha,
            telefone,
            telefone_contato,
            whatsapp,
            cidade,
            estado,
            cep,
            endereco,
            coordenadas,
            imagem_url,
            redes_sociais,
            preferencias
        } = req.body;

        const update = {};

        if (email) update.email = email;
        if (nome) update.nome = nome;
        if (senha) update.senha = senha;
        if (telefone) update.telefone = telefone;
        if (telefone_contato) update.telefone_contato = telefone_contato;
        if (whatsapp) update.whatsapp = whatsapp;
        if (cidade) update.cidade = cidade;
        if (estado) update.estado = estado;
        if (cep) update.cep = cep;
        if (endereco) update.endereco = endereco;
        if (coordenadas) update.coordenadas = coordenadas;

        if (user.isONG()) {
            if (imagem_url) update.imagem_url = imagem_url;
            if (redes_sociais) update.redes_sociais = redes_sociais;
        } else if (user.isAdotante()) {  // ← CORRIGIDO: era "update.isAdotante()"
            if (preferencias) update.preferencias = preferencias;
        }

        const userF = await Usuario.findOneAndUpdate(
            { _id: user.id },
            update,
            { new: true, runValidators: true }
        );

        return res.status(200).json(userF);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: err.message });
        }
        return res.status(500).json(err);
    }
};


const solicitarContato = async (req, res) => {
  try {
    const {
      petId,
      ongId,
      nomeAdotante,
      emailAdotante,
      telefoneAdotante,
      mensagem
    } = req.body;

    if (!petId || !ongId || !nomeAdotante || !emailAdotante || !telefoneAdotante) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const novaSolicitacao = new Adocao({
      petId,
      ongId,
      nomeAdotante,
      emailAdotante,
      telefoneAdotante,
      mensagem
    });

    await novaSolicitacao.save();

    res.status(201).json({ message: 'Solicitação enviada com sucesso.' });
  } catch (err) {
    console.error('Erro ao registrar solicitação de adoção:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const listarSolicitacoesPorOng = async (req, res) => {
  try {
    const { ongId } = req.params;

    if (!ongId) {
      return res.status(400).json({ error: 'ID da ONG é obrigatório.' });
    }

    const solicitacoes = await Adocao.find({ ongId }).sort({ dataSolicitacao: -1 });

    res.status(200).json(solicitacoes);
  } catch (err) {
    console.error('Erro ao buscar solicitações:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


export {
    getAllUsers,
    getMe,
    updateMe,
    solicitarContato,
    listarSolicitacoesPorOng
};
