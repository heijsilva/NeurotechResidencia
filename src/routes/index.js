import authRoute from './_auth/index.js';
import pet from './pet/index.js';
import user from './user/index.js';
import recomendationRoute from './recomendation/index.js';

export { authRoute }; //pq n tá no default?

export default [
    pet,
    user
];

// const routes = [ //preciso colocar isso no padrão de pet, user e auth
//   {
//     prefix: '/recomendation',
//     router: recomendationRoute
//   }
// ];