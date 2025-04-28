const express = require('express');
const cors = require('cors');
require('dotenv/config');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./src/routes/authRoutes');
const petRoutes = require('./src/routes/petRoutes');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
