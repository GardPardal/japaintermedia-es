<?php
/**
 * Configuração e Utilitários da API Brenza Multimarcas (PHP)
 * Compatível com Hostinger, HostGator, Locaweb, cPanel e Apache/LiteSpeed
 */

// Tratamento de cabeçalhos CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Caminhos dos dados
define('DATA_DIR', __DIR__ . '/../data');
define('VEHICLES_FILE', DATA_DIR . '/vehicles.json');
define('LEADS_FILE', DATA_DIR . '/leads.json');
define('SALES_FILE', DATA_DIR . '/sales.json');
define('SETTINGS_FILE', DATA_DIR . '/settings.json');

// Garante que o diretório data exista
if (!is_dir(DATA_DIR)) {
    @mkdir(DATA_DIR, 0755, true);
}

// Carrega variáveis do arquivo .env se existir na raiz
if (file_exists(__DIR__ . '/../.env')) {
    $envLines = @file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($envLines) {
        foreach ($envLines as $envLine) {
            $envLine = trim($envLine);
            if ($envLine === '' || str_starts_with($envLine, '#')) continue;
            if (strpos($envLine, '=') !== false) {
                list($envKey, $envVal) = explode('=', $envLine, 2);
                $envKey = trim($envKey);
                $envVal = trim($envVal, " \t\n\r\0\x0B\"'");
                putenv("{$envKey}={$envVal}");
                $_ENV[$envKey] = $envVal;
                $_SERVER[$envKey] = $envVal;
            }
        }
    }
}

// Configurações do Banco de Dados MySQL
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: 3306);
define('DB_NAME', getenv('DB_NAME') ?: 'japa');
define('DB_USER', getenv('DB_USER') ?: '');
define('DB_PASS', getenv('DB_PASS') ?: '');

/**
 * Retorna conexão PDO com o MySQL
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    if (!DB_USER) {
        return null;
    }

    $hosts = [DB_HOST, '127.0.0.1'];
    foreach (array_unique($hosts) as $h) {
        try {
            $dsn = "mysql:host={$h};port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $conn = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 3
            ]);
            $pdo = $conn;
            return $pdo;
        } catch (Exception $e) {
            // Tenta próximo host se falhar
        }
    }
    return null;
}

/**
 * Lê os veículos do banco MySQL (com fallback para JSON se offline)
 */
function getVehicles() {
    $db = getDbConnection();
    if ($db) {
        try {
            $stmt = $db->query("SELECT * FROM veiculos ORDER BY destaque DESC, id ASC");
            $rows = $stmt->fetchAll();
            $vehicles = [];
            foreach ($rows as $r) {
                $vehicles[] = [
                    'id' => $r['id'],
                    'marca' => $r['marca'],
                    'modelo' => $r['modelo'],
                    'versao' => $r['versao'],
                    'anoFabricacao' => (int)$r['ano_fabricacao'],
                    'anoModelo' => (int)$r['ano_modelo'],
                    'km' => (int)$r['km'],
                    'preco' => (float)$r['preco'],
                    'isDemoPrice' => (bool)$r['is_demo_price'],
                    'precoOriginal' => $r['preco_original'] !== null ? (float)$r['preco_original'] : null,
                    'combustivel' => $r['combustivel'],
                    'cambio' => $r['cambio'],
                    'cor' => $r['cor'],
                    'portas' => (int)$r['portas'],
                    'carroceria' => $r['carroceria'],
                    'finalPlaca' => $r['final_placa'],
                    'cidade' => $r['cidade'],
                    'uf' => $r['uf'],
                    'destaque' => (bool)$r['destaque'],
                    'status' => $r['status'],
                    'descricao' => $r['descricao'],
                    'fotos' => json_decode($r['fotos'] ?: '[]', true) ?: [],
                    'opcionais' => json_decode($r['opcionais'] ?: '[]', true) ?: [],
                    'laudoCautelar' => $r['laudo_cautelar'],
                    'webmotorsSync' => (bool)$r['webmotors_sync']
                ];
            }
            return $vehicles;
        } catch (Exception $e) {
            // fallback json
        }
    }

    if (!file_exists(VEHICLES_FILE)) {
        return [];
    }
    $content = file_get_contents(VEHICLES_FILE);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

/**
 * Salva os veículos no banco de dados MySQL e sincroniza arquivo JSON
 */
function saveVehicles($vehicles) {
    $db = getDbConnection();
    if ($db) {
        try {
            $stmt = $db->prepare("
                INSERT INTO veiculos (
                    id, marca, modelo, versao, ano_fabricacao, ano_modelo, km, preco,
                    is_demo_price, preco_original, combustivel, cambio, cor, portas,
                    carroceria, final_placa, cidade, uf, destaque, status, descricao,
                    fotos, opcionais, laudo_cautelar, webmotors_sync
                ) VALUES (
                    :id, :marca, :modelo, :versao, :ano_fabricacao, :ano_modelo, :km, :preco,
                    :is_demo_price, :preco_original, :combustivel, :cambio, :cor, :portas,
                    :carroceria, :final_placa, :cidade, :uf, :destaque, :status, :descricao,
                    :fotos, :opcionais, :laudo_cautelar, :webmotors_sync
                ) ON DUPLICATE KEY UPDATE
                    marca=VALUES(marca), modelo=VALUES(modelo), versao=VALUES(versao),
                    ano_fabricacao=VALUES(ano_fabricacao), ano_modelo=VALUES(ano_modelo),
                    km=VALUES(km), preco=VALUES(preco), is_demo_price=VALUES(is_demo_price),
                    preco_original=VALUES(preco_original), combustivel=VALUES(combustivel),
                    cambio=VALUES(cambio), cor=VALUES(cor), portas=VALUES(portas),
                    carroceria=VALUES(carroceria), final_placa=VALUES(final_placa),
                    cidade=VALUES(cidade), uf=VALUES(uf), destaque=VALUES(destaque),
                    status=VALUES(status), descricao=VALUES(descricao), fotos=VALUES(fotos),
                    opcionais=VALUES(opcionais), laudo_cautelar=VALUES(laudo_cautelar),
                    webmotors_sync=VALUES(webmotors_sync)
            ");

            foreach ($vehicles as $v) {
                $stmt->execute([
                    ':id' => $v['id'],
                    ':marca' => $v['marca'],
                    ':modelo' => $v['modelo'],
                    ':versao' => $v['versao'],
                    ':ano_fabricacao' => (int)$v['anoFabricacao'],
                    ':ano_modelo' => (int)$v['anoModelo'],
                    ':km' => (int)$v['km'],
                    ':preco' => (float)$v['preco'],
                    ':is_demo_price' => !empty($v['isDemoPrice']) ? 1 : 0,
                    ':preco_original' => isset($v['precoOriginal']) ? (float)$v['precoOriginal'] : null,
                    ':combustivel' => $v['combustivel'] ?? 'Flex',
                    ':cambio' => $v['cambio'] ?? 'Automático',
                    ':cor' => $v['cor'] ?? 'Branco',
                    ':portas' => (int)($v['portas'] ?? 4),
                    ':carroceria' => $v['carroceria'] ?? 'SUV',
                    ':final_placa' => $v['finalPlaca'] ?? '',
                    ':cidade' => $v['cidade'] ?? 'Wenceslau Braz',
                    ':uf' => $v['uf'] ?? 'PR',
                    ':destaque' => !empty($v['destaque']) ? 1 : 0,
                    ':status' => $v['status'] ?? 'Disponível',
                    ':descricao' => $v['descricao'] ?? '',
                    ':fotos' => json_encode($v['fotos'] ?? [], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                    ':opcionais' => json_encode($v['opcionais'] ?? [], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                    ':laudo_cautelar' => $v['laudoCautelar'] ?? 'Aprovado 100%',
                    ':webmotors_sync' => isset($v['webmotorsSync']) && !$v['webmotorsSync'] ? 0 : 1
                ]);
            }
        } catch (Exception $e) {
            // Continua para o backup JSON
        }
    }

    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0755, true);
    }
    $json = json_encode($vehicles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return file_put_contents(VEHICLES_FILE, $json, LOCK_EX) !== false;
}

/**
 * Lê os leads da base de dados MySQL (com fallback para JSON)
 */
function getLeads() {
    $db = getDbConnection();
    if ($db) {
        try {
            $stmt = $db->query("SELECT * FROM leads ORDER BY id DESC");
            $rows = $stmt->fetchAll();
            $leads = [];
            foreach ($rows as $r) {
                $leads[] = [
                    'id' => (int)$r['id'],
                    'tipo' => $r['tipo'],
                    'nome' => $r['nome'],
                    'telefone' => $r['telefone'],
                    'email' => $r['email'],
                    'cpf' => $r['cpf'],
                    'veiculoId' => $r['veiculo_id'],
                    'veiculoNome' => $r['veiculo_nome'],
                    'valorVeiculo' => $r['valor_veiculo'] !== null ? (float)$r['valor_veiculo'] : null,
                    'entrada' => $r['valor_entrada'] !== null ? (float)$r['valor_entrada'] : null,
                    'prazo' => $r['prazo_meses'] !== null ? (int)$r['prazo_meses'] : null,
                    'mensagem' => $r['mensagem'],
                    'dadosVeiculoCliente' => json_decode($r['dados_veiculo_cliente'] ?: '[]', true) ?: null,
                    'status' => $r['status'],
                    'data' => $r['created_at']
                ];
            }
            return $leads;
        } catch (Exception $e) {
            // fallback json
        }
    }

    if (!file_exists(LEADS_FILE)) {
        return [];
    }
    $content = file_get_contents(LEADS_FILE);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

/**
 * Salva os leads na base de dados MySQL e JSON
 */
function saveLeads($leads) {
    $db = getDbConnection();
    if ($db && count($leads) > 0) {
        try {
            $latest = $leads[0]; // mais recente
            $stmt = $db->prepare("
                INSERT INTO leads (
                    tipo, nome, telefone, email, cpf, veiculo_id, veiculo_nome,
                    valor_veiculo, valor_entrada, prazo_meses, mensagem, dados_veiculo_cliente,
                    status, origem
                ) VALUES (
                    :tipo, :nome, :telefone, :email, :cpf, :veiculo_id, :veiculo_nome,
                    :valor_veiculo, :valor_entrada, :prazo_meses, :mensagem, :dados_veiculo_cliente,
                    :status, :origem
                )
            ");
            $stmt->execute([
                ':tipo' => $latest['tipo'] ?? 'Geral',
                ':nome' => $latest['nome'] ?? '',
                ':telefone' => $latest['telefone'] ?? '',
                ':email' => $latest['email'] ?? null,
                ':cpf' => $latest['cpf'] ?? null,
                ':veiculo_id' => $latest['veiculoId'] ?? null,
                ':veiculo_nome' => $latest['veiculoNome'] ?? null,
                ':valor_veiculo' => $latest['valorVeiculo'] ?? null,
                ':valor_entrada' => $latest['entrada'] ?? null,
                ':prazo_meses' => $latest['prazo'] ?? null,
                ':mensagem' => $latest['mensagem'] ?? null,
                ':dados_veiculo_cliente' => isset($latest['dadosVeiculoCliente']) ? json_encode($latest['dadosVeiculoCliente'], JSON_UNESCAPED_UNICODE) : null,
                ':status' => $latest['status'] ?? 'Novo',
                ':origem' => 'Website Japa Intermediações'
            ]);
        } catch (Exception $e) {
            // Continua para backup JSON
        }
    }

    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0755, true);
    }
    $json = json_encode($leads, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return file_put_contents(LEADS_FILE, $json, LOCK_EX) !== false;
}

/**
 * Lê o histórico de vendas (com fallback para JSON)
 */
function getSales() {
    $db = getDbConnection();
    if ($db) {
        try {
            $stmt = $db->query("SELECT * FROM vendas ORDER BY data_venda DESC, id DESC");
            $rows = $stmt->fetchAll();
            if (!empty($rows)) {
                $sales = [];
                foreach ($rows as $r) {
                    $sales[] = [
                        'id' => (string)$r['id'],
                        'veiculoId' => $r['veiculo_id'] ?? null,
                        'veiculoNome' => $r['veiculo_nome'] ?? '',
                        'veiculoFoto' => $r['veiculo_foto'] ?? '',
                        'clienteNome' => $r['cliente_nome'] ?? '',
                        'clienteCpf' => $r['cliente_cpf'] ?? '',
                        'clienteTelefone' => $r['cliente_telefone'] ?? '',
                        'valorVenda' => (float)($r['valor_venda'] ?? 0),
                        'formaPagamento' => $r['forma_pagamento'] ?? 'Financiamento',
                        'vendedor' => $r['vendedor'] ?? 'Loja Matriz',
                        'dataVenda' => $r['data_venda'] ?? date('c'),
                        'lucroEstimado' => isset($r['lucro_estimado']) ? (float)$r['lucro_estimado'] : 0,
                        'observacoes' => $r['observacoes'] ?? ''
                    ];
                }
                return $sales;
            }
        } catch (Exception $e) {}
    }

    if (!file_exists(SALES_FILE)) {
        return [];
    }
    $content = file_get_contents(SALES_FILE);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

/**
 * Salva as vendas na base de dados MySQL e JSON
 */
function saveSales($sales) {
    $db = getDbConnection();
    if ($db && count($sales) > 0) {
        try {
            $db->exec("
                CREATE TABLE IF NOT EXISTS vendas (
                    id VARCHAR(64) PRIMARY KEY,
                    veiculo_id VARCHAR(64) NULL,
                    veiculo_nome VARCHAR(255) NOT NULL,
                    veiculo_foto VARCHAR(500) NULL,
                    cliente_nome VARCHAR(255) NOT NULL,
                    cliente_cpf VARCHAR(20) NULL,
                    cliente_telefone VARCHAR(30) NULL,
                    valor_venda DECIMAL(12,2) NOT NULL,
                    forma_pagamento VARCHAR(100) NOT NULL,
                    vendedor VARCHAR(100) NULL,
                    data_venda DATETIME NOT NULL,
                    lucro_estimado DECIMAL(12,2) NULL,
                    observacoes TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");
            
            $latest = $sales[0];
            $stmt = $db->prepare("
                INSERT INTO vendas (
                    id, veiculo_id, veiculo_nome, veiculo_foto, cliente_nome, cliente_cpf,
                    cliente_telefone, valor_venda, forma_pagamento, vendedor, data_venda,
                    lucro_estimado, observacoes
                ) VALUES (
                    :id, :veiculo_id, :veiculo_nome, :veiculo_foto, :cliente_nome, :cliente_cpf,
                    :cliente_telefone, :valor_venda, :forma_pagamento, :vendedor, :data_venda,
                    :lucro_estimado, :observacoes
                ) ON DUPLICATE KEY UPDATE
                    valor_venda = VALUES(valor_venda),
                    forma_pagamento = VALUES(forma_pagamento),
                    observacoes = VALUES(observacoes)
            ");
            $stmt->execute([
                ':id' => (string)($latest['id'] ?? uniqid('venda-')),
                ':veiculo_id' => $latest['veiculoId'] ?? null,
                ':veiculo_nome' => $latest['veiculoNome'] ?? '',
                ':veiculo_foto' => $latest['veiculoFoto'] ?? null,
                ':cliente_nome' => $latest['clienteNome'] ?? '',
                ':cliente_cpf' => $latest['clienteCpf'] ?? null,
                ':cliente_telefone' => $latest['clienteTelefone'] ?? null,
                ':valor_venda' => (float)($latest['valorVenda'] ?? 0),
                ':forma_pagamento' => $latest['formaPagamento'] ?? 'Financiamento',
                ':vendedor' => $latest['vendedor'] ?? 'Loja Matriz',
                ':data_venda' => !empty($latest['dataVenda']) ? date('Y-m-d H:i:s', strtotime($latest['dataVenda'])) : date('Y-m-d H:i:s'),
                ':lucro_estimado' => (float)($latest['lucroEstimado'] ?? 0),
                ':observacoes' => $latest['observacoes'] ?? null
            ]);
        } catch (Exception $e) {}
    }

    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0755, true);
    }
    $json = json_encode($sales, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return file_put_contents(SALES_FILE, $json, LOCK_EX) !== false;
}

/**
 * Lê as configurações da loja
 */
function getSettings() {
    $defaultSettings = [
        'nomeLoja' => 'JAPA Intermediações',
        'razaoSocial' => 'Japa Intermediações de Veículos Ltda',
        'cnpj' => '48.650.390/0001-71',
        'telefone' => '(43) 99643-7966',
        'whatsapp' => '43996437966',
        'email' => 'contato@japaintermediacoes.com.br',
        'endereco' => 'Avenida Avelino Vieira, 68',
        'bairro' => 'Centro',
        'cidade' => 'Wenceslau Braz',
        'uf' => 'PR',
        'cep' => '84950-000',
        'horarioSemana' => '08:00 às 18:00',
        'horarioSabado' => '08:00 às 12:30',
        'instagram' => 'https://instagram.com/japaintermediacoes',
        'facebook' => 'https://facebook.com/japaintermediacoes',
        'taxaFinanciamento' => '1.39',
        'notificacoesWhatsapp' => true,
        'notificacoesEmail' => true,
        'ocultarVendidos' => false,
        'garantiaPadrao' => '3 meses (motor e câmbio)',
        'mensagemPadraoWhatsapp' => 'Olá! Gostaria de mais informações sobre o veículo que vi no site JAPA Intermediações.'
    ];

    if (!file_exists(SETTINGS_FILE)) {
        return $defaultSettings;
    }
    $content = file_get_contents(SETTINGS_FILE);
    $data = json_decode($content, true);
    return is_array($data) ? array_merge($defaultSettings, $data) : $defaultSettings;
}

function saveSettings($settings) {
    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0755, true);
    }
    $json = json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $saved = file_put_contents(SETTINGS_FILE, $json, LOCK_EX) !== false;

    // Também sincroniza com server/data/settings.json se a pasta existir (para ambiente Node local)
    $serverDataDir = __DIR__ . '/../server/data';
    if (is_dir($serverDataDir)) {
        @file_put_contents($serverDataDir . '/settings.json', $json, LOCK_EX);
    }

    // E sincroniza com public_html/data/settings.json se existir
    $publicDataDir = __DIR__ . '/../public_html/data';
    if (is_dir($publicDataDir) && realpath($publicDataDir) !== realpath(DATA_DIR)) {
        @file_put_contents($publicDataDir . '/settings.json', $json, LOCK_EX);
    }

    return $saved;
}

/**
 * Resposta formatada em JSON
 */
function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Resposta formatada em XML
 */
function sendXml($xmlString, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/xml; charset=utf-8');
    echo $xmlString;
    exit();
}

/**
 * Obtém o corpo da requisição em formato JSON
 */
function getRequestBody() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST;
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $_POST;
}

/**
 * Escapa strings para formato XML seguro
 */
function escapeXml($string) {
    if ($string === null || $string === '') return '';
    return htmlspecialchars((string)$string, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}
