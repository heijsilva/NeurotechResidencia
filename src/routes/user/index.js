import { Router } from 'express';
import { getAllUsers } from '../../controllers/userController.js';
import middleware from '../../middleware/index.js';

const router = Router();

router.use([middleware.authenticated]);

router.get('/', getAllUsers)

export default {
    prefix: "/users",
    router,
};  