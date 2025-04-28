const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPet = async (req, res) => {
  const { name, age, userId } = req.body;

  try {
    const pet = await prisma.pets.create({
      data: {
        name,
        age,
        userId
      }
    });

    res.status(201).send({ message: 'Pet criado com sucesso!', pet });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const getPetsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const pets = await prisma.pets.findMany({
      where: {
        userId: userId
      }
    });

    res.status(200).send(pets);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

module.exports = {
  createPet,
  getPetsByUser
};
