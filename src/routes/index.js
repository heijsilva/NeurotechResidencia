import authRoute from './_auth/index.js';
import pet from './pet/index.js';
import user from './user/index.js';

export { authRoute };

export default [
    pet,
    user
];

