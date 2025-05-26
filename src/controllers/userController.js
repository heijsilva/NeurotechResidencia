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

        const { nome, email, endereco } = req.body;
        if (nome) user.nome = nome;
        if (email) user.email = email;
        
        await user.save();

        return res.status(200).json(user);
    } catch (err) {
        return res.status(400).json(err);
    }
};

export {
    getAllUsers,
    getMe,
    updateMe
};
