import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import vehiclesRouter from './routes/vehicles.js';
import leadsRouter from './routes/leads.js';
import integrationsRouter from './routes/integrations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static public files (logos, assets)
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/assets', express.static(path.join(__dirname, '../src/assets')));

// API Routes
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/integrations', integrationsRouter);

// GET /api/stats - Estatísticas gerais do painel
app.get('/api/stats', (req, res) => {
  try {
    const vehiclesPath = path.join(__dirname, 'data/vehicles.json');
    const leadsPath = path.join(__dirname, 'data/leads.json');

    const vehicles = fs.existsSync(vehiclesPath) ? JSON.parse(fs.readFileSync(vehiclesPath, 'utf-8')) : [];
    const leads = fs.existsSync(leadsPath) ? JSON.parse(fs.readFileSync(leadsPath, 'utf-8')) : [];

    const totalEstoque = vehicles.length;
    const disponiveis = vehicles.filter(v => v.status === 'Disponível').length;
    const vendidos = vehicles.filter(v => v.status === 'Vendido').length;
    const reservados = vehicles.filter(v => v.status === 'Reservado').length;
    const demoPrices = vehicles.filter(v => v.isDemoPrice).length;

    const valorTotalEstoque = vehicles
      .filter(v => v.status === 'Disponível')
      .reduce((acc, curr) => acc + (Number(curr.preco) || 0), 0);

    const precoMedio = disponiveis > 0 ? Math.round(valorTotalEstoque / disponiveis) : 0;

    res.json({
      totalEstoque,
      disponiveis,
      vendidos,
      reservados,
      demoPrices,
      valorTotalEstoque,
      precoMedio,
      totalLeads: leads.length,
      leadsNovos: leads.filter(l => l.status === 'Novo').length
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular estatísticas.' });
  }
});

// POST /api/auth/login - Autenticação do painel administrativo
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  const validUsernames = ['admin', 'brenza', 'admin@brenza.com.br'];
  const validPasswords = ['brenza2026', 'admin', 'brenza'];

  if (
    username && 
    validUsernames.includes(username.trim().toLowerCase()) && 
    password && 
    validPasswords.includes(password.trim())
  ) {
    return res.json({
      success: true,
      token: 'brenza-admin-token-2026',
      user: {
        name: 'Administrador Brenza',
        role: 'Diretoria / Gestor de Estoque',
        email: 'contato@brenzamotors.com.br'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Credenciais inválidas. Verifique o usuário e a senha.'
  });
});


// Servir frontend se existir build em 'dist'
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Servidor Brenza Multimarcas rodando na porta ${PORT}`);
  console.log(`API Veículos: http://localhost:${PORT}/api/vehicles`);
  console.log(`Feed Webmotors XML: http://localhost:${PORT}/api/integrations/webmotors/feed.xml`);
  console.log(`Feed Webmotors JSON: http://localhost:${PORT}/api/integrations/webmotors/feed.json`);
});
