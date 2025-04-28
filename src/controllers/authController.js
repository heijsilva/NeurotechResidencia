const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const registerUser = async (req, res) => {
  const { email, name, age, password } = req.body;

  try {
    const userExists = await prisma.users.findUnique({
      where: { email }
    });

    if (userExists) return res.status(400).send({ message: 'Usuário já existe' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        email,
        name,
        age,
        password: hashedPassword
      }
    });

    res.status(201).send({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) return res.status(400).send({ message: 'Usuário não encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ message: 'Senha incorreta' });

    const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
    res.status(200).send({ token });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser
};
