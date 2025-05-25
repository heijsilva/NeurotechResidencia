import Usuario from '../models/Usuario.js';

const getAllUsers = async (req, res) => {
    try {
        const users = await Usuario.find();
        return res.status(200).json(users);
    } catch (err) {
        return res.status(400).json(err);
    }
};

export {
    getAllUsers
};
