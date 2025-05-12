import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';


const registerUser = async (req, res) => {
  const {
    nome,
    email,
    telefone,
    senha,
    tipo_usuario,
    adotante_info,
    ong_info
  } = req.body;

  try {
    const existingUser = await Usuario.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const newUser = new Usuario({
      nome,
      email,
      telefone,
      senha, // será criptografada pelo middleware do schema
      tipo_usuario,
      adotante_info: tipo_usuario.includes('adotante') ? adotante_info : undefined,
      ong_info: tipo_usuario.includes('ong') ? ong_info : undefined
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Usuario.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.senha);
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
    const users = await Usuario.find()
    res.status(200).json(users)
  } catch (err){
    res.status(400).json(err)
  }
}

export { registerUser
  , loginUser,
  getAllUsers
};
