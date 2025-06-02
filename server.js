import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bodyParser from 'body-parser';
import routes from './src/routes/index.js';
import { global } from './src/middleware/index.js';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { configDotenv } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv();

const app = express();

// Conectar ao banco de dados
connectDB();

// Static folder to serve images
app.use('/download', express.static(path.resolve(__dirname, 'src', 'uploads')));

app.use(cors());
app.use(bodyParser.json());
app.use(global);

// Registrar todas as outras rotas
routes.forEach((route) => {
  console.log(`📍 Registrando rota: /api${route.prefix}`);
  app.use('/api' + route.prefix, route.router);
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Servidor funcionando!',
    routes: [
      '/api/auth/login',
      '/api/auth/register', 
      '/api/recomendation/gerar-recomendacoes',
      '/download/*'
    ]
  });
});
const PORT = 3000; // Altere a porta aqui se quiser

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Exemplos de rotas:`);
  console.log(` Celular:  ▶ http://192.168...:${PORT}/api/auth/register (verifique o ip nas configurações de rede de sua máquina)`);
  console.log(` Navegador:  ▶ http://localhost:${PORT}/api/auth/register`);
});