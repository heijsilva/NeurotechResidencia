import { Pet } from '../models/Pet.js';
import mongoose from 'mongoose';

// Criar novo pet (adaptado ao novo schema)
const createPet = async (req, res) => {
  const {
    nome,
    especie,
    idade,
    porte,
    peso,
    descricao,
    ong_id,
    foto_url,
    vacinado,
    castrado,
    vermifugado,
    microchipado,
    sexo, // removido se não faz mais parte do schema
    cor,  // removido se não faz mais parte do schema
    raca_id,
    personalidades,
    coordenadas,
    cidade,
    estado,
    nivelEnergia,
    necessidades_especiais,
    imagens
  } = req.body;

  try {
    const newPet = new Pet({
      pet_id: Math.floor(Math.random() * 1000000), // Geração simplificada
      nome,
      especie,
      idade,
      porte,
      peso,
      descricao,
      ong_id: Number(ong_id),
      foto_url,
      vacinado,
      castrado,
      vermifugado,
      microchipado,
      nivelEnergia,
      raca_id: Number(raca_id),
      personalidades: personalidades?.map(Number) || [],
      coordenadas,
      cidade,
      estado,
      necessidades_especiais,
      imagens
    });

    await newPet.save();

    res.status(201).json({ message: 'Pet criado com sucesso!', pet: newPet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Buscar pets por ONG
const getPetsByOng = async (req, res) => {
  const { id_ong } = req.params;

  try {
    const pets = await Pet.find({ ong_id: Number(id_ong) });
    res.status(200).json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updatePetImage = async (req, res) => {
  try {
    const { id } = req.params;
    const foto_url = `/uploads/${req.file.filename}`;

    const pet = await Pet.findByIdAndUpdate(
      id,
      { foto_url },
      { new: true }
    );

    if (!pet) return res.status(404).json({ message: 'Pet não encontrado' });

    res.status(200).json({ message: 'Upload realizado com sucesso', pet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find(); // Busca todos os documentos da coleção
    res.status(200).json(pets);    // Retorna os pets com status 200
  } catch (error) {
    console.error("Erro ao buscar pets:", error);
    res.status(500).json({ message: "Erro ao buscar pets" });
  }
};


const getPetById = async (req, res) => {
  const { id } = req.params;
  console.log(id)

  try {
    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet não encontrado' });
    }

    res.status(200).json(pet);
  } catch (error) {
    console.error('Erro ao buscar pet por ID:', error);
    res.status(500).json({ message: 'Erro ao buscar pet' });
  }
};

export { createPet, getPetsByOng, updatePetImage, getAllPets, getPetById};
