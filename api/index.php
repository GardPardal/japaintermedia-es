<?php
/**
 * Roteador Central da API PHP da Brenza Multimarcas
 * Suporta Webmotors XML/JSON, iCarros, Gestão de Estoque, Preços e Leads
 */

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Extração robusta do caminho da rota
if (!empty($_GET['route'])) {
    $path = trim($_GET['route'], '/');
} elseif (!empty($_SERVER['PATH_INFO'])) {
    $path = trim($_SERVER['PATH_INFO'], '/');
} else {
    $requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    $path = preg_replace('#^.*?/api(/index\.php)?/?#i', '', $requestUri);
    $path = trim($path, '/');
}

$segments = empty($path) ? [] : explode('/', $path);

$resource = $segments[0] ?? '';
$subResource = $segments[1] ?? '';
$action = $segments[2] ?? '';

// ==========================================
// 1. ROTAS DE VEÍCULOS (/api/vehicles)
// ==========================================
if ($resource === 'vehicles') {
    $vehicles = getVehicles();

    // GET /api/vehicles/filters/options
    if ($subResource === 'filters' && $action === 'options' && $method === 'GET') {
        $marcas = array_values(array_unique(array_filter(array_column($vehicles, 'marca'))));
        sort($marcas);
        $carrocerias = array_values(array_unique(array_filter(array_column($vehicles, 'carroceria'))));
        sort($carrocerias);
        $cambios = array_values(array_unique(array_filter(array_column($vehicles, 'cambio'))));
        sort($cambios);
        $combustiveis = array_values(array_unique(array_filter(array_column($vehicles, 'combustivel'))));
        sort($combustiveis);

        $precos = array_column($vehicles, 'preco');
        $minPreco = !empty($precos) ? min($precos) : 0;
        $maxPreco = !empty($precos) ? max($precos) : 300000;

        sendJson([
            'marcas' => $marcas,
            'carrocerias' => $carrocerias,
            'cambios' => $cambios,
            'combustiveis' => $combustiveis,
            'minPreco' => $minPreco,
            'maxPreco' => $maxPreco
        ]);
    }

    // PATCH /api/vehicles/{id}/price (Atualização rápida de preço)
    if (!empty($subResource) && $subResource !== 'filters' && $action === 'price' && $method === 'PATCH') {
        $id = $subResource;
        $body = getRequestBody();
        $updatedVehicle = null;

        foreach ($vehicles as $key => $v) {
            if ($v['id'] === $id) {
                if (isset($body['preco'])) {
                    $vehicles[$key]['preco'] = (float)$body['preco'];
                }
                if (isset($body['isDemoPrice'])) {
                    $vehicles[$key]['isDemoPrice'] = (bool)$body['isDemoPrice'];
                }
                if (array_key_exists('precoPromocional', $body)) {
                    $vehicles[$key]['precoPromocional'] = $body['precoPromocional'] ? (float)$body['precoPromocional'] : null;
                }
                $updatedVehicle = $vehicles[$key];
                break;
            }
        }

        if ($updatedVehicle) {
            saveVehicles($vehicles);
            sendJson([
                'success' => true,
                'message' => 'Preço atualizado com sucesso.',
                'vehicle' => $updatedVehicle
            ]);
        } else {
            sendJson(['error' => 'Veículo não encontrado.'], 404);
        }
    }

    // GET /api/vehicles/{id}
    if (!empty($subResource) && $method === 'GET') {
        $id = $subResource;
        foreach ($vehicles as $v) {
            if ($v['id'] === $id) {
                sendJson($v);
            }
        }
        sendJson(['error' => 'Veículo não encontrado.'], 404);
    }

    // PUT /api/vehicles/{id} (Atualização completa)
    if (!empty($subResource) && $method === 'PUT') {
        $id = $subResource;
        $body = getRequestBody();
        $updatedVehicle = null;

        foreach ($vehicles as $key => $v) {
            if ($v['id'] === $id) {
                $vehicles[$key] = array_merge($vehicles[$key], $body);
                $vehicles[$key]['id'] = $id;
                $vehicles[$key]['preco'] = (float)($body['preco'] ?? $vehicles[$key]['preco']);
                $vehicles[$key]['km'] = (int)($body['km'] ?? $vehicles[$key]['km']);
                $vehicles[$key]['anoFabricacao'] = (int)($body['anoFabricacao'] ?? $vehicles[$key]['anoFabricacao']);
                $vehicles[$key]['anoModelo'] = (int)($body['anoModelo'] ?? $vehicles[$key]['anoModelo']);
                $vehicles[$key]['finalPlaca'] = isset($body['finalPlaca']) ? (int)$body['finalPlaca'] : $vehicles[$key]['finalPlaca'];
                $updatedVehicle = $vehicles[$key];
                break;
            }
        }

        if ($updatedVehicle) {
            saveVehicles($vehicles);
            sendJson($updatedVehicle);
        } else {
            sendJson(['error' => 'Veículo não encontrado.'], 404);
        }
    }

    // DELETE /api/vehicles/{id}
    if (!empty($subResource) && $method === 'DELETE') {
        $id = $subResource;

        // Deleta do MySQL se conectado
        $db = getDbConnection();
        if ($db) {
            try {
                $stmt = $db->prepare("DELETE FROM veiculos WHERE id = ?");
                $stmt->execute([$id]);
            } catch (Exception $e) {}
        }

        $filtered = array_filter($vehicles, function($v) use ($id) {
            return (string)$v['id'] !== (string)$id;
        });

        if (count($filtered) !== count($vehicles) || $db) {
            saveVehicles(array_values($filtered));
            sendJson(['success' => true, 'message' => 'Veículo removido com sucesso.']);
        } else {
            sendJson(['error' => 'Veículo não encontrado.'], 404);
        }
    }

    // POST /api/vehicles (Cadastrar novo veículo)
    if (empty($subResource) && $method === 'POST') {
        $body = getRequestBody();
        $newVehicle = [
            'id' => 'brz-' . substr((string)time(), -4),
            'marca' => $body['marca'] ?? '',
            'modelo' => $body['modelo'] ?? '',
            'versao' => $body['versao'] ?? '',
            'anoFabricacao' => (int)($body['anoFabricacao'] ?? date('Y')),
            'anoModelo' => (int)($body['anoModelo'] ?? date('Y')),
            'km' => (int)($body['km'] ?? 0),
            'preco' => (float)($body['preco'] ?? 0),
            'precoPromocional' => !empty($body['precoPromocional']) ? (float)$body['precoPromocional'] : null,
            'isDemoPrice' => !empty($body['isDemoPrice']),
            'cambio' => $body['cambio'] ?? 'Automático',
            'combustivel' => $body['combustivel'] ?? 'Flex',
            'cor' => $body['cor'] ?? 'Branco',
            'portas' => (int)($body['portas'] ?? 4),
            'carroceria' => $body['carroceria'] ?? 'Sedan',
            'finalPlaca' => isset($body['finalPlaca']) ? (int)$body['finalPlaca'] : 0,
            'cidade' => $body['cidade'] ?? 'Wenceslau Braz',
            'uf' => $body['uf'] ?? 'PR',
            'status' => $body['status'] ?? 'Disponível',
            'destaque' => !empty($body['destaque']),
            'webmotorsSync' => isset($body['webmotorsSync']) ? (bool)$body['webmotorsSync'] : true,
            'descricao' => $body['descricao'] ?? '',
            'fotos' => !empty($body['fotos']) && is_array($body['fotos']) ? $body['fotos'] : [
                'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
            ],
            'opcionais' => !empty($body['opcionais']) && is_array($body['opcionais']) ? $body['opcionais'] : []
        ];

        array_unshift($vehicles, $newVehicle);
        saveVehicles($vehicles);
        sendJson($newVehicle, 201);
    }

    // GET /api/vehicles (Listagem com filtros e busca)
    if (empty($subResource) && $method === 'GET') {
        $q = isset($_GET['q']) ? mb_strtolower(trim($_GET['q'])) : '';
        $marca = $_GET['marca'] ?? '';
        $carroceria = $_GET['carroceria'] ?? '';
        $cambio = $_GET['cambio'] ?? '';
        $combustivel = $_GET['combustivel'] ?? '';
        $status = $_GET['status'] ?? '';
        $minPreco = isset($_GET['minPreco']) ? (float)$_GET['minPreco'] : null;
        $maxPreco = isset($_GET['maxPreco']) ? (float)$_GET['maxPreco'] : null;
        $sort = $_GET['sort'] ?? '';

        $filtered = array_filter($vehicles, function($v) use ($q, $marca, $carroceria, $cambio, $combustivel, $status, $minPreco, $maxPreco) {
            if ($q !== '') {
                $text = mb_strtolower($v['marca'] . ' ' . $v['modelo'] . ' ' . $v['versao'] . ' ' . ($v['descricao'] ?? ''));
                if (mb_strpos($text, $q) === false) return false;
            }
            if ($marca && $marca !== 'todas' && mb_strtolower($v['marca']) !== mb_strtolower($marca)) return false;
            if ($carroceria && $carroceria !== 'todas' && mb_strtolower($v['carroceria']) !== mb_strtolower($carroceria)) return false;
            if ($cambio && $cambio !== 'todos' && mb_strtolower($v['cambio']) !== mb_strtolower($cambio)) return false;
            if ($combustivel && $combustivel !== 'todos' && mb_strtolower($v['combustivel']) !== mb_strtolower($combustivel)) return false;
            if ($status && $status !== 'todos' && mb_strtolower($v['status']) !== mb_strtolower($status)) return false;
            if ($minPreco !== null && $v['preco'] < $minPreco) return false;
            if ($maxPreco !== null && $v['preco'] > $maxPreco) return false;

            return true;
        });

        $filtered = array_values($filtered);

        // Ordenação
        if ($sort === 'preco-asc') {
            usort($filtered, fn($a, $b) => $a['preco'] <=> $b['preco']);
        } elseif ($sort === 'preco-desc') {
            usort($filtered, fn($a, $b) => $b['preco'] <=> $a['preco']);
        } elseif ($sort === 'ano-desc') {
            usort($filtered, fn($a, $b) => $b['anoModelo'] <=> $a['anoModelo']);
        } elseif ($sort === 'km-asc') {
            usort($filtered, fn($a, $b) => $a['km'] <=> $b['km']);
        } else {
            // Padrão: destaques primeiro, depois ordem natural de ID (brz-01 Corolla, brz-02 Hilux, brz-03 HR-V)
            usort($filtered, function($a, $b) {
                if (!empty($a['destaque']) && empty($b['destaque'])) return -1;
                if (empty($a['destaque']) && !empty($b['destaque'])) return 1;
                return strcmp($a['id'], $b['id']);
            });
        }

        sendJson([
            'total' => count($filtered),
            'vehicles' => $filtered
        ]);
    }
}

// ==========================================
// 2. ROTAS DE LEADS / PROPOSTAS (/api/leads)
// ==========================================
if ($resource === 'leads') {
    $leads = getLeads();

    // PATCH /api/leads/{id}/status
    if (!empty($subResource) && $action === 'status' && $method === 'PATCH') {
        $id = $subResource;
        $body = getRequestBody();
        $updatedLead = null;

        foreach ($leads as $key => $l) {
            if ($l['id'] === $id) {
                $leads[$key]['status'] = $body['status'] ?? $leads[$key]['status'];
                $updatedLead = $leads[$key];
                break;
            }
        }

        if ($updatedLead) {
            saveLeads($leads);
            sendJson(['success' => true, 'lead' => $updatedLead]);
        } else {
            sendJson(['error' => 'Lead não encontrado.'], 404);
        }
    }

    // POST /api/leads (Criar proposta ou simulação)
    if (empty($subResource) && $method === 'POST') {
        $body = getRequestBody();
        if (empty($body['nome']) || empty($body['telefone'])) {
            sendJson(['error' => 'Nome e telefone são obrigatórios.'], 400);
        }

        $newLead = [
            'id' => 'lead-' . time(),
            'tipo' => $body['tipo'] ?? 'proposta',
            'nome' => $body['nome'],
            'telefone' => $body['telefone'],
            'email' => $body['email'] ?? '',
            'veiculoId' => $body['veiculoId'] ?? null,
            'veiculoNome' => $body['veiculoNome'] ?? '',
            'mensagem' => $body['mensagem'] ?? '',
            'simulacao' => (!empty($body['entrada']) || !empty($body['parcelas'])) ? [
                'entrada' => $body['entrada'] ?? 0,
                'parcelas' => $body['parcelas'] ?? 48
            ] : null,
            'veiculoTroca' => !empty($body['trocaModelo']) ? [
                'modelo' => $body['trocaModelo'],
                'ano' => $body['trocaAno'] ?? '',
                'km' => $body['trocaKm'] ?? ''
            ] : null,
            'status' => 'Novo',
            'data' => date('c')
        ];

        array_unshift($leads, $newLead);
        saveLeads($leads);

        sendJson([
            'success' => true,
            'message' => 'Proposta registrada com sucesso.',
            'lead' => $newLead
        ], 201);
    }

    // GET /api/leads
    if (empty($subResource) && $method === 'GET') {
        sendJson([
            'total' => count($leads),
            'leads' => $leads
        ]);
    }
}

// ==========================================
// 3. ESTATÍSTICAS GERAIS (/api/stats)
// ==========================================
if ($resource === 'stats' && $method === 'GET') {
    $vehicles = getVehicles();
    $leads = getLeads();

    $totalEstoque = count($vehicles);
    $disponiveis = count(array_filter($vehicles, fn($v) => ($v['status'] ?? '') === 'Disponível'));
    $vendidos = count(array_filter($vehicles, fn($v) => ($v['status'] ?? '') === 'Vendido'));
    $reservados = count(array_filter($vehicles, fn($v) => ($v['status'] ?? '') === 'Reservado'));
    $demoPrices = count(array_filter($vehicles, fn($v) => !empty($v['isDemoPrice'])));

    $valorTotal = 0;
    foreach ($vehicles as $v) {
        if (($v['status'] ?? '') === 'Disponível') {
            $valorTotal += (float)($v['preco'] ?? 0);
        }
    }

    $precoMedio = $disponiveis > 0 ? (int)round($valorTotal / $disponiveis) : 0;
    $leadsNovos = count(array_filter($leads, fn($l) => ($l['status'] ?? '') === 'Novo'));

    sendJson([
        'totalEstoque' => $totalEstoque,
        'disponiveis' => $disponiveis,
        'vendidos' => $vendidos,
        'reservados' => $reservados,
        'demoPrices' => $demoPrices,
        'valorTotalEstoque' => $valorTotal,
        'precoMedio' => $precoMedio,
        'totalLeads' => count($leads),
        'leadsNovos' => $leadsNovos
    ]);
}

// ==========================================
// 4. AUTENTICAÇÃO (/api/auth/login)
// ==========================================
if ($resource === 'auth') {
    if ($subResource === 'login' && $method === 'POST') {
        $body = getRequestBody();
        $username = trim(mb_strtolower($body['username'] ?? ''));
        $password = trim($body['password'] ?? '');

        $db = getDbConnection();
        if ($db) {
            try {
                $stmt = $db->prepare("SELECT * FROM usuarios WHERE (username = :u OR email = :u) AND ativo = 1 LIMIT 1");
                $stmt->execute([':u' => $username]);
                $userRow = $stmt->fetch();
                if ($userRow && password_verify($password, $userRow['password_hash'])) {
                    @$db->prepare("UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?")->execute([$userRow['id']]);
                    sendJson([
                        'success' => true,
                        'token' => 'japa-jwt-' . bin2hex(random_bytes(16)),
                        'user' => [
                            'name' => $userRow['nome'],
                            'role' => $userRow['role'],
                            'email' => $userRow['email']
                        ]
                    ]);
                }
            } catch (Exception $e) {
                // fallback para verificação via variável de ambiente
            }
        }

        $envUser = getenv('ADMIN_USER') ?: 'admin';
        $envPass = getenv('ADMIN_PASSWORD');

        if (!empty($envPass) && strtolower($username) === strtolower($envUser) && $password === $envPass) {
            sendJson([
                'success' => true,
                'token' => 'japa-admin-token-' . bin2hex(random_bytes(16)),
                'user' => [
                    'name' => 'Administrador Japa Intermediações',
                    'role' => 'Diretoria / Gestor de Estoque',
                    'email' => $envUser
                ]
            ]);
        }

        sendJson([
            'success' => false,
            'error' => 'Credenciais inválidas. Verifique o usuário e a senha.'
        ], 401);
    }
}

// ==========================================
// 5. INTEGRAÇÕES AUTOMOTIVAS (/api/integrations)
// ==========================================
if ($resource === 'integrations') {
    $vehicles = getVehicles();

    // 5.1 Webmotors XML Feed (/api/integrations/webmotors/feed.xml)
    if ($subResource === 'webmotors' && $action === 'feed.xml') {
        $active = array_filter($vehicles, fn($v) => ($v['status'] ?? '') === 'Disponível' && ($v['webmotorsSync'] ?? true) !== false);

        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $xml .= "<estoque>\n";
        $xml .= "  <revenda>\n";
        $xml .= "    <codigo_revenda>JAPA-01</codigo_revenda>\n";
        $xml .= "    <nome_fantasia>Japa Intermediações</nome_fantasia>\n";
        $xml .= "    <cnpj>48.650.390/0001-71</cnpj>\n";
        $xml .= "    <cidade>Wenceslau Braz</cidade>\n";
        $xml .= "    <uf>PR</uf>\n";
        $xml .= "    <telefone>43996437966</telefone>\n";
        $xml .= "    <total_veiculos>" . count($active) . "</total_veiculos>\n";
        $xml .= "    <data_geracao>" . date('c') . "</data_geracao>\n";
        $xml .= "    <veiculos>\n";

        foreach ($active as $v) {
            $xml .= "      <veiculo>\n";
            $xml .= "        <codigo_veiculo>" . escapeXml($v['id']) . "</codigo_veiculo>\n";
            $xml .= "        <tipo>Carro</tipo>\n";
            $xml .= "        <marca>" . escapeXml($v['marca']) . "</marca>\n";
            $xml .= "        <modelo>" . escapeXml($v['modelo']) . "</modelo>\n";
            $xml .= "        <versao>" . escapeXml($v['versao']) . "</versao>\n";
            $xml .= "        <ano_fabricacao>" . (int)$v['anoFabricacao'] . "</ano_fabricacao>\n";
            $xml .= "        <ano_modelo>" . (int)$v['anoModelo'] . "</ano_modelo>\n";
            $xml .= "        <km>" . (int)$v['km'] . "</km>\n";
            $xml .= "        <preco>" . number_format((float)$v['preco'], 2, '.', '') . "</preco>\n";
            $xml .= "        <preco_demonstracao>" . (!empty($v['isDemoPrice']) ? 'S' : 'N') . "</preco_demonstracao>\n";
            $xml .= "        <cor>" . escapeXml($v['cor'] ?? '') . "</cor>\n";
            $xml .= "        <combustivel>" . escapeXml($v['combustivel'] ?? '') . "</combustivel>\n";
            $xml .= "        <cambio>" . escapeXml($v['cambio'] ?? '') . "</cambio>\n";
            $xml .= "        <portas>" . (int)($v['portas'] ?? 4) . "</portas>\n";
            $xml .= "        <carroceria>" . escapeXml($v['carroceria'] ?? '') . "</carroceria>\n";
            $xml .= "        <placa_final>" . (int)($v['finalPlaca'] ?? 0) . "</placa_final>\n";
            $xml .= "        <status>" . escapeXml($v['status'] ?? 'Disponível') . "</status>\n";
            $xml .= "        <cidade>" . escapeXml($v['cidade'] ?? 'Wenceslau Braz') . "</cidade>\n";
            $xml .= "        <uf>" . escapeXml($v['uf'] ?? 'PR') . "</uf>\n";
            $xml .= "        <descricao><![CDATA[" . ($v['descricao'] ?? '') . "]]></descricao>\n";

            $xml .= "        <fotos>\n";
            foreach (($v['fotos'] ?? []) as $i => $foto) {
                $xml .= "          <foto ordem=\"" . ($i + 1) . "\"><![CDATA[" . $foto . "]]></foto>\n";
            }
            $xml .= "        </fotos>\n";

            $xml .= "        <opcionais>\n";
            foreach (($v['opcionais'] ?? []) as $opt) {
                $xml .= "          <opcional>" . escapeXml($opt) . "</opcional>\n";
            }
            $xml .= "        </opcionais>\n";

            $xml .= "      </veiculo>\n";
        }

        $xml .= "    </veiculos>\n";
        $xml .= "  </revenda>\n";
        $xml .= "</estoque>";

        sendXml($xml);
    }

    // 5.2 Webmotors JSON Feed (/api/integrations/webmotors/feed.json)
    if ($subResource === 'webmotors' && $action === 'feed.json') {
        $active = array_filter($vehicles, fn($v) => ($v['status'] ?? '') === 'Disponível' && ($v['webmotorsSync'] ?? true) !== false);
        $mapped = [];

        foreach ($active as $v) {
            $mapped[] = [
                'id' => $v['id'],
                'make' => $v['marca'],
                'model' => $v['modelo'],
                'version' => $v['versao'],
                'yearFabrication' => $v['anoFabricacao'],
                'yearModel' => $v['anoModelo'],
                'mileage' => $v['km'],
                'price' => $v['preco'],
                'isDemoPrice' => !empty($v['isDemoPrice']),
                'transmission' => $v['cambio'],
                'fuel' => $v['combustivel'],
                'color' => $v['cor'],
                'doors' => $v['portas'],
                'bodyType' => $v['carroceria'],
                'licensePlateEnding' => $v['finalPlaca'],
                'description' => $v['descricao'] ?? '',
                'photos' => $v['fotos'] ?? [],
                'features' => $v['opcionais'] ?? []
            ];
        }

        sendJson([
            'provider' => 'Japa Intermediações PHP API',
            'revenda' => [
                'codigo' => 'JAPA-01',
                'nome' => 'Japa Intermediações',
                'cidade' => 'Wenceslau Braz',
                'uf' => 'PR',
                'telefone' => '(43) 99643-7966'
            ],
            'generatedAt' => date('c'),
            'count' => count($mapped),
            'vehicles' => $mapped
        ]);
    }

    // 5.3 iCarros XML Feed (/api/integrations/icarros/feed.xml)
    if ($subResource === 'icarros' && $action === 'feed.xml') {
        $active = array_filter($vehicles, fn($v) => ($v['status'] ?? '') === 'Disponível');

        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $xml .= "<carga_icarros>\n";
        $xml .= "  <revenda id=\"JAPA-01\" nome=\"Japa Intermediações\">\n";

        foreach ($active as $v) {
            $xml .= "    <anuncio>\n";
            $xml .= "      <id>" . escapeXml($v['id']) . "</id>\n";
            $xml .= "      <marca>" . escapeXml($v['marca']) . "</marca>\n";
            $xml .= "      <modelo>" . escapeXml($v['modelo']) . "</modelo>\n";
            $xml .= "      <versao>" . escapeXml($v['versao']) . "</versao>\n";
            $xml .= "      <ano_fabricacao>" . (int)$v['anoFabricacao'] . "</ano_fabricacao>\n";
            $xml .= "      <ano_modelo>" . (int)$v['anoModelo'] . "</ano_modelo>\n";
            $xml .= "      <km>" . (int)$v['km'] . "</km>\n";
            $xml .= "      <preco>" . number_format((float)$v['preco'], 2, '.', '') . "</preco>\n";
            $xml .= "      <cambio>" . escapeXml($v['cambio'] ?? '') . "</cambio>\n";
            $xml .= "      <combustivel>" . escapeXml($v['combustivel'] ?? '') . "</combustivel>\n";
            $xml .= "      <cor>" . escapeXml($v['cor'] ?? '') . "</cor>\n";
            $xml .= "      <portas>" . (int)($v['portas'] ?? 4) . "</portas>\n";
            $xml .= "      <fotos>\n";
            foreach (($v['fotos'] ?? []) as $foto) {
                $xml .= "        <foto>" . escapeXml($foto) . "</foto>\n";
            }
            $xml .= "      </fotos>\n";
            $xml .= "    </anuncio>\n";
        }

        $xml .= "  </revenda>\n";
        $xml .= "</carga_icarros>";

        sendXml($xml);
    }

    // 5.4 Exportação CSV (/api/integrations/export/csv)
    if ($subResource === 'export' && $action === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="estoque-japa-intermediacoes.csv"');

        $out = fopen('php://output', 'w');
        // BOM UTF-8 para Excel abrir acentos corretamente
        fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF));

        fputcsv($out, ['ID', 'Marca', 'Modelo', 'Versao', 'Ano Fab', 'Ano Mod', 'KM', 'Preco', 'Preco Demo', 'Cambio', 'Combustivel', 'Cor', 'Portas', 'Carroceria', 'Final Placa', 'Status'], ';');

        foreach ($vehicles as $v) {
            fputcsv($out, [
                $v['id'],
                $v['marca'],
                $v['modelo'],
                $v['versao'],
                $v['anoFabricacao'],
                $v['anoModelo'],
                $v['km'],
                $v['preco'],
                !empty($v['isDemoPrice']) ? 'SIM' : 'NAO',
                $v['cambio'] ?? '',
                $v['combustivel'] ?? '',
                $v['cor'] ?? '',
                $v['portas'] ?? 4,
                $v['carroceria'] ?? '',
                $v['finalPlaca'] ?? 0,
                $v['status'] ?? 'Disponível'
            ], ';');
        }

        fclose($out);
        exit();
    }

    // 5.5 Webhook Sync (/api/integrations/webhook/sync)
    if ($subResource === 'webhook' && $action === 'sync' && $method === 'POST') {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!str_contains($auth, 'brenza-secure-api-key') && $auth !== 'Bearer brenza-key-2026') {
            sendJson(['error' => 'Não autorizado. Forneça o token Bearer válido.'], 401);
        }

        $body = getRequestBody();
        if (empty($body['vehicles']) || !is_array($body['vehicles'])) {
            sendJson(['error' => 'Envie a lista de veículos na chave "vehicles".'], 400);
        }

        $updated = 0;
        $inserted = 0;

        foreach ($body['vehicles'] as $incoming) {
            $found = false;
            foreach ($vehicles as $k => $existing) {
                if ($existing['id'] === ($incoming['id'] ?? '') ||
                   ($existing['marca'] === ($incoming['marca'] ?? '') && $existing['modelo'] === ($incoming['modelo'] ?? '') && $existing['anoModelo'] === ($incoming['anoModelo'] ?? ''))) {
                    $vehicles[$k] = array_merge($existing, $incoming);
                    $found = true;
                    $updated++;
                    break;
                }
            }

            if (!$found) {
                $incoming['id'] = $incoming['id'] ?? ('brz-' . substr((string)time(), -4));
                $vehicles[] = $incoming;
                $inserted++;
            }
        }

        saveVehicles($vehicles);

        sendJson([
            'success' => true,
            'message' => 'Sincronização concluída com sucesso.',
            'inserted' => $inserted,
            'updated' => $updated,
            'total' => count($vehicles)
        ]);
    }

    // 5.6 Status (/api/integrations/status)
    if ($subResource === 'status') {
        $active = count(array_filter($vehicles, fn($v) => ($v['status'] ?? '') === 'Disponível'));
        $wm = count(array_filter($vehicles, fn($v) => ($v['status'] ?? '') === 'Disponível' && ($v['webmotorsSync'] ?? true) !== false));

        sendJson([
            'status' => 'Online (PHP)',
            'totalEstoque' => count($vehicles),
            'veiculosAtivos' => $active,
            'sincronizadosWebmotors' => $wm,
            'endpoints' => [
                'webmotorsXml' => '/api/integrations/webmotors/feed.xml',
                'webmotorsJson' => '/api/integrations/webmotors/feed.json',
                'icarrosXml' => '/api/integrations/icarros/feed.xml',
                'exportCsv' => '/api/integrations/export/csv',
                'webhookSync' => '/api/integrations/webhook/sync'
            ]
        ]);
    }
}

// ==========================================
// 6. MCP & REMOTE BRIDGE (/api/mcp ou /api/bridge)
// ==========================================
if ($resource === 'mcp' || $resource === 'bridge' || $resource === 'remote_bridge.php') {
    require_once __DIR__ . '/remote_bridge.php';
    exit;
}

// ==========================================
// 7. UPLOAD DE FOTOS DE VEÍCULOS (/api/upload ou /api/vehicles/upload)
// ==========================================
if ($resource === 'upload' || ($resource === 'vehicles' && $subResource === 'upload')) {
    if ($method !== 'POST') {
        sendJson(['error' => 'Método não permitido.'], 405);
    }

    $uploadDir = __DIR__ . '/../uploads/vehicles';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }

    $uploadedUrls = [];

    // 1. Upload via multipart/form-data
    if (!empty($_FILES)) {
        $files = $_FILES['images'] ?? $_FILES['image'] ?? $_FILES['file'] ?? $_FILES['fotos'] ?? [];

        $fileList = [];
        if (is_array($files['name'] ?? null)) {
            $count = count($files['name']);
            for ($i = 0; $i < $count; $i++) {
                if (($files['error'][$i] ?? 0) === UPLOAD_ERR_OK) {
                    $fileList[] = [
                        'name' => $files['name'][$i],
                        'tmp_name' => $files['tmp_name'][$i],
                        'size' => $files['size'][$i]
                    ];
                }
            }
        } elseif (!empty($files['tmp_name']) && ($files['error'] ?? 0) === UPLOAD_ERR_OK) {
            $fileList[] = $files;
        }

        foreach ($fileList as $f) {
            $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'], true)) {
                $ext = 'jpg';
            }
            $filename = 'car-' . uniqid() . '-' . mt_rand(100, 999) . '.' . $ext;
            $targetPath = $uploadDir . '/' . $filename;

            if (move_uploaded_file($f['tmp_name'], $targetPath)) {
                $uploadedUrls[] = '/uploads/vehicles/' . $filename;
            }
        }
    }

    // 2. Upload via JSON Base64
    $body = getRequestBody();
    if (!empty($body['image']) || !empty($body['base64'])) {
        $base64Data = $body['image'] ?? $body['base64'];
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
            $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
            $ext = strtolower($type[1]);
            if ($ext === 'jpeg') $ext = 'jpg';
        } else {
            $ext = 'jpg';
        }
        $decoded = base64_decode($base64Data);
        if ($decoded) {
            $filename = 'car-' . uniqid() . '-' . mt_rand(100, 999) . '.' . $ext;
            $targetPath = $uploadDir . '/' . $filename;
            if (file_put_contents($targetPath, $decoded)) {
                $uploadedUrls[] = '/uploads/vehicles/' . $filename;
            }
        }
    }

    if (!empty($uploadedUrls)) {
        sendJson([
            'success' => true,
            'message' => 'Upload realizado com sucesso.',
            'url' => $uploadedUrls[0],
            'urls' => $uploadedUrls
        ]);
    } else {
        sendJson([
            'success' => false,
            'error' => 'Nenhum arquivo de imagem válido foi enviado.'
        ], 400);
    }
}

// Rota não encontrada
sendJson([
    'error' => 'Endpoint não encontrado.',
    'path' => $requestUri,
    'method' => $method
], 404);
