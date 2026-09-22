import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFilePath = path.join(__dirname, '../data/vehicles.json');

function readVehicles() {
  try {
    if (!fs.existsSync(dataFilePath)) return [];
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveVehicles(vehicles) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(vehicles, null, 2), 'utf-8');
    return true;
  } catch (error) {
    return false;
  }
}

// Utilitário para escapar caracteres especiais XML
function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 1. Webmotors XML Feed (Padrão de integração Webmotors Cockpit / Integrador)
router.get('/webmotors/feed.xml', (req, res) => {
  const vehicles = readVehicles().filter(v => v.status === 'Disponível' && v.webmotorsSync !== false);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<estoque>\n`;
  xml += `  <revenda>\n`;
  xml += `    <codigo_revenda>BRENZA-WB</codigo_revenda>\n`;
  xml += `    <nome_fantasia>Brenza Multimarcas</nome_fantasia>\n`;
  xml += `    <cnpj>48.650.390/0001-71</cnpj>\n`;
  xml += `    <cidade>Wenceslau Braz</cidade>\n`;
  xml += `    <uf>PR</uf>\n`;
  xml += `    <telefone>43996437966</telefone>\n`;
  xml += `    <total_veiculos>${vehicles.length}</total_veiculos>\n`;
  xml += `    <data_geracao>${new Date().toISOString()}</data_geracao>\n`;
  xml += `    <veiculos>\n`;

  vehicles.forEach(v => {
    xml += `      <veiculo>\n`;
    xml += `        <codigo_veiculo>${escapeXml(v.id)}</codigo_veiculo>\n`;
    xml += `        <tipo>Carro</tipo>\n`;
    xml += `        <marca>${escapeXml(v.marca)}</marca>\n`;
    xml += `        <modelo>${escapeXml(v.modelo)}</modelo>\n`;
    xml += `        <versao>${escapeXml(v.versao)}</versao>\n`;
    xml += `        <ano_fabricacao>${v.anoFabricacao}</ano_fabricacao>\n`;
    xml += `        <ano_modelo>${v.anoModelo}</ano_modelo>\n`;
    xml += `        <km>${v.km}</km>\n`;
    xml += `        <preco>${Number(v.preco).toFixed(2)}</preco>\n`;
    xml += `        <preco_demonstracao>${v.isDemoPrice ? 'S' : 'N'}</preco_demonstracao>\n`;
    xml += `        <cor>${escapeXml(v.cor)}</cor>\n`;
    xml += `        <combustivel>${escapeXml(v.combustivel)}</combustivel>\n`;
    xml += `        <cambio>${escapeXml(v.cambio)}</cambio>\n`;
    xml += `        <portas>${v.portas || 4}</portas>\n`;
    xml += `        <carroceria>${escapeXml(v.carroceria)}</carroceria>\n`;
    xml += `        <placa_final>${v.finalPlaca || 0}</placa_final>\n`;
    xml += `        <status>${escapeXml(v.status)}</status>\n`;
    xml += `        <cidade>${escapeXml(v.cidade || 'Wenceslau Braz')}</cidade>\n`;
    xml += `        <uf>${escapeXml(v.uf || 'PR')}</uf>\n`;
    xml += `        <descricao><![CDATA[${v.descricao || ''}]]></descricao>\n`;
    
    // Fotos
    xml += `        <fotos>\n`;
    (v.fotos || []).forEach((foto, i) => {
      xml += `          <foto ordem="${i + 1}"><![CDATA[${foto}]]></foto>\n`;
    });
    xml += `        </fotos>\n`;

    // Opcionais
    xml += `        <opcionais>\n`;
    (v.opcionais || []).forEach(item => {
      xml += `          <opcional>${escapeXml(item)}</opcional>\n`;
    });
    xml += `        </opcionais>\n`;

    xml += `      </veiculo>\n`;
  });

  xml += `    </veiculos>\n`;
  xml += `  </revenda>\n`;
  xml += `</estoque>`;

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

// 2. Webmotors JSON Feed
router.get('/webmotors/feed.json', (req, res) => {
  const vehicles = readVehicles().filter(v => v.status === 'Disponível' && v.webmotorsSync !== false);
  res.json({
    provider: "Brenza Multimarcas API",
    revenda: {
      codigo: "BRENZA-WB",
      nome: "Brenza Multimarcas",
      cidade: "Wenceslau Braz",
      uf: "PR",
      telefone: "(43) 99643-7966"
    },
    generatedAt: new Date().toISOString(),
    count: vehicles.length,
    vehicles: vehicles.map(v => ({
      id: v.id,
      make: v.marca,
      model: v.modelo,
      version: v.versao,
      yearFabrication: v.anoFabricacao,
      yearModel: v.anoModelo,
      mileage: v.km,
      price: v.preco,
      isDemoPrice: v.isDemoPrice || false,
      transmission: v.cambio,
      fuel: v.combustivel,
      color: v.cor,
      doors: v.portas,
      bodyType: v.carroceria,
      licensePlateEnding: v.finalPlaca,
      description: v.descricao,
      photos: v.fotos,
      features: v.opcionais
    }))
  });
});

// 3. iCarros / Universal XML Feed
router.get('/icarros/feed.xml', (req, res) => {
  const vehicles = readVehicles().filter(v => v.status === 'Disponível');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<carga_icarros>\n`;
  xml += `  <revenda id="BRENZA-WB" nome="Brenza Multimarcas">\n`;
  vehicles.forEach(v => {
    xml += `    <anuncio>\n`;
    xml += `      <id>${escapeXml(v.id)}</id>\n`;
    xml += `      <marca>${escapeXml(v.marca)}</marca>\n`;
    xml += `      <modelo>${escapeXml(v.modelo)}</modelo>\n`;
    xml += `      <versao>${escapeXml(v.versao)}</versao>\n`;
    xml += `      <ano_fabricacao>${v.anoFabricacao}</ano_fabricacao>\n`;
    xml += `      <ano_modelo>${v.anoModelo}</ano_modelo>\n`;
    xml += `      <km>${v.km}</km>\n`;
    xml += `      <preco>${v.preco}</preco>\n`;
    xml += `      <cambio>${escapeXml(v.cambio)}</cambio>\n`;
    xml += `      <combustivel>${escapeXml(v.combustivel)}</combustivel>\n`;
    xml += `      <cor>${escapeXml(v.cor)}</cor>\n`;
    xml += `      <portas>${v.portas}</portas>\n`;
    xml += `      <fotos>\n`;
    (v.fotos || []).forEach(foto => {
      xml += `        <foto>${escapeXml(foto)}</foto>\n`;
    });
    xml += `      </fotos>\n`;
    xml += `    </anuncio>\n`;
  });
  xml += `  </revenda>\n`;
  xml += `</carga_icarros>`;

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

// 4. Exportação CSV (Compatível com OLX, Chaves na Mão e planilhas)
router.get('/export/csv', (req, res) => {
  const vehicles = readVehicles();
  const headers = ['ID', 'Marca', 'Modelo', 'Versao', 'Ano Fab', 'Ano Mod', 'KM', 'Preco', 'Preco Demo', 'Cambio', 'Combustivel', 'Cor', 'Portas', 'Carroceria', 'Final Placa', 'Status'];
  
  const rows = vehicles.map(v => [
    v.id,
    `"${v.marca}"`,
    `"${v.modelo}"`,
    `"${v.versao}"`,
    v.anoFabricacao,
    v.anoModelo,
    v.km,
    v.preco,
    v.isDemoPrice ? 'SIM' : 'NAO',
    `"${v.cambio}"`,
    `"${v.combustivel}"`,
    `"${v.cor}"`,
    v.portas,
    `"${v.carroceria}"`,
    v.finalPlaca,
    `"${v.status}"`
  ]);

  const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');

  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="estoque-brenza-multimarcas.csv"'
  });
  res.send('\uFEFF' + csvContent);
});

// 5. Webhook Ingestion API (para receber dados de CRMs ou estoques externos)
router.post('/webhook/sync', (req, res) => {
  const apiKey = req.headers['authorization'];
  // Token de demonstração para integrações
  if (!apiKey || (!apiKey.includes('brenza-secure-api-key') && apiKey !== 'Bearer brenza-key-2026')) {
    return res.status(401).json({
      error: 'Não autorizado. Forneça um Bearer token válido de integração da Brenza Multimarcas.'
    });
  }

  const payload = req.body;
  if (!payload || !Array.isArray(payload.vehicles)) {
    return res.status(400).json({
      error: 'Formato inválido. Envie um objeto com a chave "vehicles" contendo a lista de veículos.'
    });
  }

  const vehicles = readVehicles();
  let updatedCount = 0;
  let insertedCount = 0;

  payload.vehicles.forEach(incoming => {
    const existingIndex = vehicles.findIndex(v => v.id === incoming.id || (v.marca === incoming.marca && v.modelo === incoming.modelo && v.anoModelo === incoming.anoModelo));
    if (existingIndex >= 0) {
      vehicles[existingIndex] = { ...vehicles[existingIndex], ...incoming };
      updatedCount++;
    } else {
      vehicles.push({
        ...incoming,
        id: incoming.id || `brz-${Date.now().toString().slice(-4)}`
      });
      insertedCount++;
    }
  });

  saveVehicles(vehicles);

  res.json({
    success: true,
    message: 'Sincronização de estoque concluída com sucesso.',
    inserted: insertedCount,
    updated: updatedCount,
    total: vehicles.length
  });
});

// 6. Endpoint de status e documentação das integrações
router.get('/status', (req, res) => {
  const vehicles = readVehicles();
  const activeCount = vehicles.filter(v => v.status === 'Disponível').length;
  const webmotorsCount = vehicles.filter(v => v.status === 'Disponível' && v.webmotorsSync !== false).length;

  res.json({
    status: 'Online',
    totalEstoque: vehicles.length,
    veiculosAtivos: activeCount,
    sincronizadosWebmotors: webmotorsCount,
    endpoints: {
      webmotorsXml: '/api/integrations/webmotors/feed.xml',
      webmotorsJson: '/api/integrations/webmotors/feed.json',
      icarrosXml: '/api/integrations/icarros/feed.xml',
      exportCsv: '/api/integrations/export/csv',
      webhookSync: '/api/integrations/webhook/sync'
    },
    authHeaderExample: 'Authorization: Bearer brenza-key-2026'
  });
});

export default router;
