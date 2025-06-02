import { Router } from 'express';
import { createPet, getPetsByOng, updatePetImage, getAllPets, getPetById, getEnums } from '../../controllers/petController.js';
import { upload } from '../../middleware/uploadMiddleware.js';
import middleware from '../../middleware/index.js';

const router = Router();

// router.use([middleware.authenticated]);

router.get('/', getAllPets);
router.get('/enums', getEnums);  // ← MOVIDO PARA CIMA
router.get('/:id', getPetById);
router.get('/ong/:id_ong', getPetsByOng);
router.post('/', createPet);
router.post('/:id/image', upload.single('image'), updatePetImage);

export default {
    prefix: "/pets",
    router,
};