import { Router } from 'express';
import { getAllUsers, getMe, updateMe, solicitarContato, listarSolicitacoesPorOng } from '../../controllers/userController.js';
import middleware from '../../middleware/index.js';

const router = Router();

// router.use([middleware.authenticated]);

router.get('/', getAllUsers);
router.get('/me', getMe);
router.get('/solicitacoes/:ongId', listarSolicitacoesPorOng)
router.patch('/me', updateMe);
router.post('/adocao', solicitarContato)

export default {
    prefix: "/users",
    router,
};  
