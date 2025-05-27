import { Router } from 'express';
import { createPet, getPetsByOng, updatePetImage, getAllPets, getPetById, getEnums } from '../../controllers/petController.js';
import { upload } from '../../middleware/uploadMiddleware.js';
import middleware from '../../middleware/index.js';

const router = Router();

// router.use([middleware.authenticated]);

router.get('/', getAllPets);
router.get('/:id', getPetById)
router.get('/ong/:id_ong', getPetsByOng); // Atenção aqui!
router.get('/enums', getEnums);
router.post('/', createPet);
router.post('/:id/image', upload.single('image'), updatePetImage);

export default {
    prefix: "/pets",
    router,
};  