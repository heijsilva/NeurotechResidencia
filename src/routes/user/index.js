import { Router } from 'express';
import { getAllUsers, getMe, updateMe } from '../../controllers/userController.js';
import middleware from '../../middleware/index.js';

const router = Router();

// router.use([middleware.authenticated]);

router.get('/', getAllUsers);
router.get('/me', getMe);
router.patch('/me', updateMe);

export default {
    prefix: "/users",
    router,
};  