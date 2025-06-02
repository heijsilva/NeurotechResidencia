import authRoute from './_auth/index.js';
import recomendationRoute from './recomendation/index.js';

// Rota de autenticação (já vem com prefix e router)
export { authRoute };

// Outras rotas
const routes = [
  {
    prefix: '/recomendation',
    router: recomendationRoute
  }
];

export default routes;