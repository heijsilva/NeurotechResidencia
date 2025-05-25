import { Router } from 'express';
import { getAllUsers } from '../../controllers/userController.js';
import middlewares from '../../middleware/index.js';

const router = Router();

router.get('/', getAllUsers)

export default {
    prefix: "/users",
    middlewares: [middlewares.authenticated],
    router,
};  
