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

// GET /api/sales - Listar histórico de vendas
app.get('/api/sales', (req, res) => {
  try {
    const salesPath = path.join(__dirname, 'data/sales.json');
    const sales = fs.existsSync(salesPath) ? JSON.parse(fs.readFileSync(salesPath, 'utf-8')) : [];
    const totalFaturado = sales.reduce((acc, curr) => acc + (Number(curr.valorVenda) || 0), 0);
    const totalLucro = sales.reduce((acc, curr) => acc + (Number(curr.lucroEstimado) || 0), 0);
    const ticketMedio = sales.length > 0 ? Math.round(totalFaturado / sales.length) : 0;
    res.json({ total: sales.length, sales, totalFaturado, totalLucro, ticketMedio });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao ler vendas.' });
  }
});

// POST /api/sales - Registrar nova venda
app.post('/api/sales', (req, res) => {
  try {
    const salesPath = path.join(__dirname, 'data/sales.json');
    const vehiclesPath = path.join(__dirname, 'data/vehicles.json');

    const sales = fs.existsSync(salesPath) ? JSON.parse(fs.readFileSync(salesPath, 'utf-8')) : [];
    const vehicles = fs.existsSync(vehiclesPath) ? JSON.parse(fs.readFileSync(vehiclesPath, 'utf-8')) : [];

    const body = req.body;
    if (!body.clienteNome || !body.valorVenda) {
      return res.status(400).json({ error: 'Nome do cliente e valor da venda são obrigatórios.' });
    }

    let veiculoNome = body.veiculoNome || '';
    let veiculoFoto = body.veiculoFoto || '';

    if (body.veiculoId) {
      const v = vehicles.find(item => String(item.id) === String(body.veiculoId));
      if (v) {
        v.status = 'Vendido';
        veiculoNome = veiculoNome || `${v.marca} ${v.modelo} ${v.versao || ''}`.trim();
        veiculoFoto = veiculoFoto || v.fotos?.[0] || '/veiculo-sedan.webp';
        fs.writeFileSync(vehiclesPath, JSON.stringify(vehicles, null, 2), 'utf-8');
      }
    }

    const newSale = {
      id: `venda-${Date.now()}`,
      veiculoId: body.veiculoId || null,
      veiculoNome: veiculoNome || 'Veículo Avulso',
      veiculoFoto: veiculoFoto || '/veiculo-sedan.webp',
      clienteNome: body.clienteNome.trim(),
      clienteCpf: body.clienteCpf || '',
      clienteTelefone: body.clienteTelefone || '',
      valorVenda: Number(body.valorVenda),
      formaPagamento: body.formaPagamento || 'Financiamento',
      vendedor: body.vendedor || 'Equipe JAPA',
      dataVenda: body.dataVenda || new Date().toISOString(),
      lucroEstimado: Number(body.lucroEstimado || 0),
      observacoes: body.observacoes || ''
    };

    sales.unshift(newSale);
    fs.writeFileSync(salesPath, JSON.stringify(sales, null, 2), 'utf-8');
    res.status(201).json({ success: true, sale: newSale, message: 'Venda registrada com sucesso.' });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao registrar venda.' });
  }
});

// DELETE /api/sales/:id - Cancelar venda
app.delete('/api/sales/:id', (req, res) => {
  try {
    const salesPath = path.join(__dirname, 'data/sales.json');
    const vehiclesPath = path.join(__dirname, 'data/vehicles.json');

    const sales = fs.existsSync(salesPath) ? JSON.parse(fs.readFileSync(salesPath, 'utf-8')) : [];
    const vehicles = fs.existsSync(vehiclesPath) ? JSON.parse(fs.readFileSync(vehiclesPath, 'utf-8')) : [];

    const saleIndex = sales.findIndex(s => String(s.id) === String(req.params.id));
    if (saleIndex === -1) return res.status(404).json({ error: 'Venda não encontrada.' });

    const deleted = sales.splice(saleIndex, 1)[0];
    if (deleted.veiculoId) {
      const v = vehicles.find(item => String(item.id) === String(deleted.veiculoId));
      if (v && v.status === 'Vendido') {
        v.status = 'Disponível';
        fs.writeFileSync(vehiclesPath, JSON.stringify(vehicles, null, 2), 'utf-8');
      }
    }

    fs.writeFileSync(salesPath, JSON.stringify(sales, null, 2), 'utf-8');
    res.json({ success: true, message: 'Venda cancelada com sucesso.' });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao excluir venda.' });
  }
});

// GET /api/reports - Inteligência e relatórios consolidados
app.get('/api/reports', (req, res) => {
  try {
    const salesPath = path.join(__dirname, 'data/sales.json');
    const vehiclesPath = path.join(__dirname, 'data/vehicles.json');
    const leadsPath = path.join(__dirname, 'data/leads.json');

    const sales = fs.existsSync(salesPath) ? JSON.parse(fs.readFileSync(salesPath, 'utf-8')) : [];
    const vehicles = fs.existsSync(vehiclesPath) ? JSON.parse(fs.readFileSync(vehiclesPath, 'utf-8')) : [];
    const leads = fs.existsSync(leadsPath) ? JSON.parse(fs.readFileSync(leadsPath, 'utf-8')) : [];

    const totalFaturado = sales.reduce((acc, curr) => acc + (Number(curr.valorVenda) || 0), 0);
    const totalLucro = sales.reduce((acc, curr) => acc + (Number(curr.lucroEstimado) || 0), 0);
    const ticketMedio = sales.length > 0 ? Math.round(totalFaturado / sales.length) : 0;
    const disponiveis = vehicles.filter(v => v.status === 'Disponível').length;
    const valorEstoque = vehicles.filter(v => v.status === 'Disponível').reduce((acc, curr) => acc + (Number(curr.preco) || 0), 0);

    const porCarroceria = {};
    vehicles.forEach(v => {
      const c = v.carroceria || 'Outros';
      porCarroceria[c] = (porCarroceria[c] || 0) + 1;
    });

    const porMarca = {};
    vehicles.forEach(v => {
      const m = v.marca || 'Outras';
      porMarca[m] = (porMarca[m] || 0) + 1;
    });

    const porPagamento = {};
    sales.forEach(s => {
      const p = s.formaPagamento || 'Outros';
      porPagamento[p] = (porPagamento[p] || 0) + 1;
    });

    res.json({
      metricas: {
        totalFaturado,
        totalLucro,
        ticketMedio,
        veiculosVendidos: sales.length,
        veiculosEmEstoque: disponiveis,
        valorEstoque,
        totalLeads: leads.length,
        taxaConversao: leads.length > 0 ? Number(((sales.length / leads.length) * 100).toFixed(1)) : 0
      },
      vendasPorMes: [
        { mes: 'Abr/26', total: 65000, quantidade: 1, lucro: 5000 },
        { mes: 'Mai/26', total: 110000, quantidade: 2, lucro: 9200 },
        { mes: 'Jun/26', total: 145000, quantidade: 2, lucro: 11400 },
        { mes: 'Jul/26', total: 190000, quantidade: 3, lucro: 15800 },
        { mes: 'Ago/26', total: 160000, quantidade: 2, lucro: 13000 },
        { mes: 'Set/26', total: totalFaturado, quantidade: sales.length, lucro: totalLucro }
      ],
      porCarroceria,
      porMarca,
      porPagamento,
      ultimasVendas: sales.slice(0, 5)
    });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao gerar relatórios.' });
  }
});

// GET & PUT /api/settings - Configurações da loja
app.get('/api/settings', (req, res) => {
  try {
    const settingsPath = path.join(__dirname, 'data/settings.json');
    if (!fs.existsSync(settingsPath)) {
      return res.json({
        nomeLoja: 'JAPA Intermediações',
        telefone: '(43) 99643-7966',
        whatsapp: '43996437966',
        email: 'contato@japaintermediacoes.com.br',
        cidade: 'Wenceslau Braz',
        uf: 'PR'
      });
    }
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao ler configurações.' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const settingsPath = path.join(__dirname, 'data/settings.json');
    const current = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) : {};
    const updated = { ...current, ...req.body };
    fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2), 'utf-8');
    res.json({ success: true, settings: updated, message: 'Configurações salvas com sucesso.' });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar configurações.' });
  }
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 4 caracteres.' });
  }
  process.env.ADMIN_PASSWORD = newPassword;
  res.json({ success: true, message: 'Senha atualizada com sucesso.' });
});

// POST /api/auth/login - Autenticação do painel administrativo
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  const configuredUser = process.env.ADMIN_USER;
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (
    configuredUser && configuredPassword && username && password &&
    username.trim().toLowerCase() === configuredUser.trim().toLowerCase() &&
    password === configuredPassword
  ) {
    return res.json({
      success: true,
      token: `japa-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      user: {
        name: 'Administrador JAPA',
        role: 'Diretoria / Gestor de Estoque',
        email: configuredUser
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
