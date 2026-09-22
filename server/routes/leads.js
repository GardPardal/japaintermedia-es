import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const leadsFilePath = path.join(__dirname, '../data/leads.json');

function readLeads() {
  try {
    if (!fs.existsSync(leadsFilePath)) {
      return [];
    }
    const data = fs.readFileSync(leadsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler leads:', error);
    return [];
  }
}

function saveLeads(leads) {
  try {
    fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar leads:', error);
    return false;
  }
}

// GET /api/leads - Listar todas as propostas/leads
router.get('/', (req, res) => {
  const leads = readLeads();
  res.json({
    total: leads.length,
    leads
  });
});

// POST /api/leads - Criar proposta, simulação ou avaliação
router.post('/', (req, res) => {
  const {
    tipo,
    nome,
    telefone,
    email,
    veiculoId,
    veiculoNome,
    mensagem,
    entrada,
    parcelas,
    trocaModelo,
    trocaAno,
    trocaKm
  } = req.body;

  if (!nome || !telefone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });
  }

  const leads = readLeads();
  const newLead = {
    id: `lead-${Date.now()}`,
    tipo: tipo || 'proposta', // 'proposta' | 'financiamento' | 'avaliacao_troca' | 'contato'
    nome,
    telefone,
    email: email || '',
    veiculoId: veiculoId || null,
    veiculoNome: veiculoNome || '',
    mensagem: mensagem || '',
    simulacao: entrada || parcelas ? { entrada, parcelas } : null,
    veiculoTroca: trocaModelo ? { modelo: trocaModelo, ano: trocaAno, km: trocaKm } : null,
    status: 'Novo',
    data: new Date().toISOString()
  };

  leads.unshift(newLead);
  saveLeads(leads);

  res.status(201).json({
    success: true,
    message: 'Proposta registrada com sucesso.',
    lead: newLead
  });
});

// PATCH /api/leads/:id/status - Atualizar status do lead
router.patch('/:id/status', (req, res) => {
  const leads = readLeads();
  const index = leads.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lead não encontrado.' });
  }

  leads[index].status = req.body.status || leads[index].status;
  saveLeads(leads);

  res.json({
    success: true,
    lead: leads[index]
  });
});

export default router;
