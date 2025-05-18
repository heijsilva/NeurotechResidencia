import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bodyParser from 'body-parser';
import authRoutes from './src/routes/authRoutes.js';  
import petRoutes from './src/routes/petRoutes.js'; 
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
connectDB();

// Static folder to serve images
app.use('/download', express.static(path.resolve(__dirname, 'src')));


app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
