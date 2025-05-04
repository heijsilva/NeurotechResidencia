import Pet from '../models/Pet.js'; // Certifique-se do caminho correto
import mongoose from 'mongoose';

// Criar novo pet
const createPet = async (req, res) => {
  const {
    nome,
    tipo,
    idade,
    porte,
    descricao,
    id_ong,
    foto_url,
    vacinado,
    castrado,
    sexo,
    cor,
    raca
  } = req.body;

  try {
    const pet = new Pet({
      nome,
      tipo,
      idade,
      porte,
      descricao,
      id_ong: new mongoose.Types.ObjectId(id_ong),
      foto_url,
      vacinado,
      castrado,
      sexo,
      cor,
      raca: raca ? new mongoose.Types.ObjectId(raca) : undefined
    });

    await pet.save();

    res.status(201).json({ message: 'Pet criado com sucesso!', pet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar pets por ONG
const getPetsByOng = async (req, res) => {
  const { id_ong } = req.params;

  try {
    const pets = await Pet.find({ id_ong: new mongoose.Types.ObjectId(id_ong) }).populate('raca');

    res.status(200).json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { createPet, getPetsByOng };
