import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// Para ES Modules, precisamos definir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/gerar-recomendacoes', async (req, res) => {
  console.log('🎯 REQUISIÇÃO RECEBIDA - INÍCIO');
  
  // AUMENTAR TIMEOUT DA REQUISIÇÃO PARA 2 MINUTOS
  req.setTimeout(120000); // 2 minutos
  res.setTimeout(120000); // 2 minutos
  
  try {
    console.log('📝 Dados recebidos:', req.body);

    // Salvar preferências em arquivo JSON na pasta python_ml
    const preferencesPath = path.join(__dirname, '../../../python_ml/preferencias_usuario.json');
    fs.writeFileSync(preferencesPath, JSON.stringify(req.body, null, 2));
    
    console.log('💾 Preferências salvas em:', preferencesPath);

    // Executar script Python na pasta python_ml
    const pythonScript = path.join(__dirname, '../../../python_ml/recomendar.py');
    
    console.log('🐍 Executando Python script... (pode demorar até 90s)');

    const pythonProcess = spawn('python', [pythonScript], {
      cwd: path.join(__dirname, '../../../python_ml'),
      timeout: 90000, // 90 segundos
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      result += output;
      // Log apenas os primeiros 100 caracteres para não poluir o console
      console.log('📤 Python:', output.substring(0, 100) + (output.length > 100 ? '...' : ''));
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error('❌ Python stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      console.log('🏁 Python process finished with code:', code);
      
      if (code !== 0) {
        console.error('❌ Python script failed:', error);
        return res.status(500).json({ 
          error: 'Erro ao executar script Python', 
          details: error,
          code: code
        });
      }

      if (!result.trim()) {
        console.error('❌ Python não retornou dados');
        return res.status(500).json({ 
          error: 'Script Python não retornou dados'
        });
      }

      try {
        // Tentar parsear o resultado como JSON
        const recommendations = JSON.parse(result.trim());
        console.log('✅ Enviando', recommendations.length, 'recomendações para o frontend');
        res.json(recommendations);
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON:', parseError);
        console.log('📄 Resultado bruto (primeiros 500 chars):', result.substring(0, 500));
        res.status(500).json({ 
          error: 'Erro ao processar resultado do Python',
          details: parseError.message,
          rawResult: result.substring(0, 500)
        });
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('❌ Erro ao executar Python:', err);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Erro ao executar Python', 
          details: err.message 
        });
      }
    });

    // Timeout manual adicional como backup
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        console.log('⏰ Timeout de 90s atingido, matando processo Python');
        pythonProcess.kill('SIGTERM');
        res.status(408).json({ 
          error: 'Timeout - Python demorou mais que 90 segundos' 
        });
      }
    }, 90000);

    // Limpar timeout se a resposta for enviada antes
    pythonProcess.on('close', () => {
      clearTimeout(timeoutId);
    });

  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Erro interno do servidor', 
        details: error.message 
      });
    }
  }
});

export default {
    prefix: "/recomendation",
    router,
};  
