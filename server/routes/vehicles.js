import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFilePath = path.join(__dirname, '../data/vehicles.json');

function readVehicles() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler estoque de veículos:', error);
    return [];
  }
}

function saveVehicles(vehicles) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(vehicles, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar estoque de veículos:', error);
    return false;
  }
}

// GET /api/vehicles - Listar com filtros e busca
router.get('/', (req, res) => {
  let vehicles = readVehicles();
  const {
    q,
    marca,
    carroceria,
    cambio,
    combustivel,
    minPreco,
    maxPreco,
    anoMin,
    status,
    sort
  } = req.query;

  if (q) {
    const query = q.toLowerCase();
    vehicles = vehicles.filter(v => 
      v.marca.toLowerCase().includes(query) ||
      v.modelo.toLowerCase().includes(query) ||
      v.versao.toLowerCase().includes(query) ||
      (v.descricao && v.descricao.toLowerCase().includes(query))
    );
  }

  if (marca && marca !== 'todas') {
    vehicles = vehicles.filter(v => v.marca.toLowerCase() === marca.toLowerCase());
  }

  if (carroceria && carroceria !== 'todas') {
    vehicles = vehicles.filter(v => v.carroceria.toLowerCase() === carroceria.toLowerCase());
  }

  if (cambio && cambio !== 'todos') {
    vehicles = vehicles.filter(v => v.cambio.toLowerCase() === cambio.toLowerCase());
  }

  if (combustivel && combustivel !== 'todos') {
    vehicles = vehicles.filter(v => v.combustivel.toLowerCase() === combustivel.toLowerCase());
  }

  if (status && status !== 'todos') {
    vehicles = vehicles.filter(v => v.status.toLowerCase() === status.toLowerCase());
  }

  if (minPreco) {
    vehicles = vehicles.filter(v => v.preco >= Number(minPreco));
  }

  if (maxPreco) {
    vehicles = vehicles.filter(v => v.preco <= Number(maxPreco));
  }

  if (anoMin) {
    vehicles = vehicles.filter(v => v.anoModelo >= Number(anoMin));
  }

  // Ordenação
  if (sort === 'preco-asc') {
    vehicles.sort((a, b) => a.preco - b.preco);
  } else if (sort === 'preco-desc') {
    vehicles.sort((a, b) => b.preco - a.preco);
  } else if (sort === 'ano-desc') {
    vehicles.sort((a, b) => b.anoModelo - a.anoModelo);
  } else if (sort === 'km-asc') {
    vehicles.sort((a, b) => a.km - b.km);
  } else {
    // Padrão: destaques primeiro, depois mais recentes
    vehicles.sort((a, b) => {
      if (a.destaque && !b.destaque) return -1;
      if (!a.destaque && b.destaque) return 1;
      return b.anoModelo - a.anoModelo;
    });
  }

  res.json({
    total: vehicles.length,
    vehicles
  });
});

// GET /api/vehicles/filters/options - Obter opções dinâmicas para filtros
router.get('/filters/options', (req, res) => {
  const vehicles = readVehicles();
  const marcas = [...new Set(vehicles.map(v => v.marca))].sort();
  const carrocerias = [...new Set(vehicles.map(v => v.carroceria))].sort();
  const cambios = [...new Set(vehicles.map(v => v.cambio))].sort();
  const combustiveis = [...new Set(vehicles.map(v => v.combustivel))].sort();
  
  const precos = vehicles.map(v => v.preco);
  const minPreco = precos.length ? Math.min(...precos) : 0;
  const maxPreco = precos.length ? Math.max(...precos) : 300000;

  res.json({
    marcas,
    carrocerias,
    cambios,
    combustiveis,
    minPreco,
    maxPreco
  });
});

// GET /api/vehicles/:id - Obter veículo por ID
router.get('/:id', (req, res) => {
  const vehicles = readVehicles();
  const vehicle = vehicles.find(v => v.id === req.params.id);
  if (!vehicle) {
    return res.status(404).json({ error: 'Veículo não encontrado.' });
  }
  res.json(vehicle);
});

// POST /api/vehicles - Criar novo veículo
router.post('/', (req, res) => {
  const vehicles = readVehicles();
  const newVehicle = {
    id: `brz-${Date.now().toString().slice(-4)}`,
    marca: req.body.marca || '',
    modelo: req.body.modelo || '',
    versao: req.body.versao || '',
    anoFabricacao: Number(req.body.anoFabricacao) || new Date().getFullYear(),
    anoModelo: Number(req.body.anoModelo) || new Date().getFullYear(),
    km: Number(req.body.km) || 0,
    preco: Number(req.body.preco) || 0,
    precoPromocional: req.body.precoPromocional ? Number(req.body.precoPromocional) : null,
    isDemoPrice: Boolean(req.body.isDemoPrice),
    cambio: req.body.cambio || 'Automático',
    combustivel: req.body.combustivel || 'Flex',
    cor: req.body.cor || 'Branco',
    portas: Number(req.body.portas) || 4,
    carroceria: req.body.carroceria || 'Sedan',
    finalPlaca: req.body.finalPlaca !== undefined ? Number(req.body.finalPlaca) : 0,
    cidade: req.body.cidade || 'Wenceslau Braz',
    uf: req.body.uf || 'PR',
    status: req.body.status || 'Disponível',
    destaque: Boolean(req.body.destaque),
    webmotorsSync: req.body.webmotorsSync !== undefined ? Boolean(req.body.webmotorsSync) : true,
    descricao: req.body.descricao || '',
    fotos: Array.isArray(req.body.fotos) && req.body.fotos.length > 0 ? req.body.fotos : [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
    ],
    opcionais: Array.isArray(req.body.opcionais) ? req.body.opcionais : []
  };

  vehicles.unshift(newVehicle);
  saveVehicles(vehicles);
  res.status(201).json(newVehicle);
});

// PUT /api/vehicles/:id - Atualizar veículo completo
router.put('/:id', (req, res) => {
  const vehicles = readVehicles();
  const index = vehicles.findIndex(v => v.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Veículo não encontrado.' });
  }

  vehicles[index] = {
    ...vehicles[index],
    ...req.body,
    id: vehicles[index].id,
    preco: Number(req.body.preco) || vehicles[index].preco,
    km: Number(req.body.km) || vehicles[index].km,
    anoFabricacao: Number(req.body.anoFabricacao) || vehicles[index].anoFabricacao,
    anoModelo: Number(req.body.anoModelo) || vehicles[index].anoModelo,
    finalPlaca: req.body.finalPlaca !== undefined ? Number(req.body.finalPlaca) : vehicles[index].finalPlaca
  };

  saveVehicles(vehicles);
  res.json(vehicles[index]);
});

// PATCH /api/vehicles/:id/price - Atualização rápida de preço
router.patch('/:id/price', (req, res) => {
  const vehicles = readVehicles();
  const index = vehicles.findIndex(v => v.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Veículo não encontrado.' });
  }

  const { preco, isDemoPrice, precoPromocional } = req.body;
  if (preco !== undefined) vehicles[index].preco = Number(preco);
  if (isDemoPrice !== undefined) vehicles[index].isDemoPrice = Boolean(isDemoPrice);
  if (precoPromocional !== undefined) vehicles[index].precoPromocional = precoPromocional ? Number(precoPromocional) : null;

  saveVehicles(vehicles);
  res.json({
    success: true,
    message: 'Preço atualizado com sucesso.',
    vehicle: vehicles[index]
  });
});

// DELETE /api/vehicles/:id - Excluir veículo
router.delete('/:id', (req, res) => {
  let vehicles = readVehicles();
  const exists = vehicles.some(v => v.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ error: 'Veículo não encontrado.' });
  }

  vehicles = vehicles.filter(v => v.id !== req.params.id);
  saveVehicles(vehicles);
  res.json({ success: true, message: 'Veículo removido com sucesso.' });
});

export default router;
