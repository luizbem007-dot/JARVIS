import express from 'express';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HUME_API_KEY = process.env.HUME_API_KEY || 'HeIsF0jU9qh6GIJTwvPhFXtd6fc2fOceGjsEqTUjeTQREG3E';
const HUME_CLIENT_SECRET = process.env.HUME_CLIENT_SECRET || '4jP4ggxAbgKYDSwfhdppCwZXTk0yi4uu34NvVBPmrBLwCVh9VoBI034hmQNE1CAS';

app.use(express.text());
app.use(express.json());

// Servir arquivos estáticos da pasta raiz
app.use(express.static(join(__dirname, '..')));

// Servir @vapi-ai/web do node_modules
app.use('/vapi-sdk', express.static(join(__dirname, '../node_modules/@vapi-ai/web/dist')));

// Servir vapi-wrapper.js
app.get('/vapi-wrapper.js', (req, res) => {
  res.sendFile(join(__dirname, '../vapi-wrapper.js'));
});

// Servir Vapi bundle
app.get('/vapi-bundle.js', (req, res) => {
  try {
    const vapiPath = join(__dirname, '../vapi-bundle.js');
    res.sendFile(vapiPath);
    console.log('📦 Vapi bundle enviado para o browser');
  } catch (err) {
    console.error('❌ Erro ao servir Vapi:', err);
    res.status(500).send(`console.error('Erro ao carregar Vapi: ${err.message}')`);
  }
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../index.html'));
});

// Rotas dos sistemas de voz
app.get('/vapi-voice.html', (req, res) => {
  res.sendFile(join(__dirname, '../vapi-voice.html'));
});

app.get('/openai-voice.html', (req, res) => {
  res.sendFile(join(__dirname, '../openai-voice.html'));
});

app.get('/hume-voice.html', (req, res) => {
  res.sendFile(join(__dirname, '../hume-voice.html'));
});

// Servir system-config.js
app.get('/system-config.js', (req, res) => {
  res.sendFile(join(__dirname, '../system-config.js'));
});

// Generate ephemeral token for OpenAI realtime API
app.get('/token', async (req, res) => {
  try {
    console.log('🔑 Gerando token efêmero OpenAI...');
    
    const response = await fetch(
      'https://api.openai.com/v1/realtime/client_secrets',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'realtime=v1',
        },
      }
    );

    const data = await response.json();
    console.log('✅ Token OpenAI gerado com sucesso');
    res.json(data);
  } catch (error) {
    console.error('❌ Erro ao gerar token OpenAI:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Generate access token for Hume EVI
app.get('/hume-token', async (req, res) => {
  try {
    console.log('🔮 Gerando access token Hume...');

    const response = await fetch(
      'https://api.hume.ai/oauth2-cc/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
          'client_id': HUME_API_KEY,
          'client_secret': HUME_CLIENT_SECRET,
        }),
      }
    );

    const data = await response.json();
    if (!data?.access_token) {
      throw new Error('Hume sem access_token');
    }

    console.log('✅ Token Hume gerado com sucesso');
    res.json(data);
  } catch (error) {
    console.error('❌ Erro ao gerar token Hume:', error);
    res.status(500).json({ error: 'Failed to generate Hume token' });
  }
});

export default app;
