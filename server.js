import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import authRoutes from './src/routes/authRoutes.js';  
import petRoutes from './src/routes/petRoutes.js';  
const app = express();

const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
