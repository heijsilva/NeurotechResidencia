import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const registerUser = async (req, res) => {
  const {
    nome,
    email,
    telefone,
    senha,
    tipo,
    telefone_contato,
    whatsapp,
    cidade,
    estado,
    cep,
    endereco,
    coordenadas,
    cnpj,
    imagem_url,
    redes_sociais,
    preferencias
  } = req.body;

  try {
    const existingUser = await Usuario.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const newUser = new Usuario({
      _id: new mongoose.Types.ObjectId(),
      user_id: Math.floor(Math.random() * 1000000), // gere um ID único conforme sua lógica
      nome,
      email,
      telefone,
      senha, // será criptografada no pre('save')
      tipo,
      telefone_contato,
      whatsapp,
      cidade,
      estado,
      cep,
      endereco,
      coordenadas,
      cnpj: tipo === 'ONG' ? cnpj : undefined,
      imagem_url: tipo === 'ONG' ? imagem_url : undefined,
      redes_sociais: tipo === 'ONG' ? redes_sociais : undefined,
      preferencias: tipo === 'adotante' ? preferencias : undefined
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await Usuario.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha incorreta' });
    }

    const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Usuario.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json(err);
  }
};

export {
  registerUser,
  loginUser,
  getAllUsers
};
