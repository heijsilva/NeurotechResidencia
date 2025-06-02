import { Router } from 'express';
import { registerUser, loginUser, refreshToken } from '../../controllers/authController.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/token/refresh', refreshToken);

export default {
    prefix: "/auth",
    router,
};

