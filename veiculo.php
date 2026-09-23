<?php
/**
 * Roteador de SEO Social Dinâmico para Veículos
 * JAPA Intermediações - Meta Tags para WhatsApp, Facebook, Instagram, Twitter/X & Google
 */

$rawId = trim($_GET['id'] ?? '');

// Se id vier como caminho da URL (ex: /veiculo/brz-01)
if (empty($rawId)) {
    $requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if (preg_match('#^/veiculo/([^/]+)#i', $requestUri, $matches)) {
        $rawId = trim($matches[1]);
    }
}

// Arquivo HTML base (bundle compilado do Vite)
$indexPath = __DIR__ . '/index.html';
if (!file_exists($indexPath)) {
    http_response_code(404);
    echo "index.html não encontrado.";
    exit();
}

$html = file_get_contents($indexPath);

// Carrega configurações da loja
$settingsPath = __DIR__ . '/data/settings.json';
$settings = [];
if (file_exists($settingsPath)) {
    $settings = json_decode(@file_get_contents($settingsPath), true) ?: [];
}
$nomeLoja = $settings['nomeLoja'] ?? 'JAPA Intermediações';
$cidade = $settings['cidade'] ?? 'Wenceslau Braz';
$uf = $settings['uf'] ?? 'PR';

// Carrega estoque de veículos
$vehiclesPath = __DIR__ . '/data/vehicles.json';
$vehicles = [];
if (file_exists($vehiclesPath)) {
    $vehicles = json_decode(@file_get_contents($vehiclesPath), true) ?: [];
}

// Localiza o veículo solicitado
$found = null;
if (!empty($rawId)) {
    $numericQuery = preg_replace('/\D/', '', $rawId);
    foreach ($vehicles as $v) {
        if (strcasecmp((string)$v['id'], $rawId) === 0) {
            $found = $v;
            break;
        }
        $numericV = preg_replace('/\D/', '', (string)$v['id']);
        if (!empty($numericQuery) && intval($numericV) === intval($numericQuery)) {
            $found = $v;
            break;
        }
    }
}

// Se não encontrou o veículo, serve o index.html padrão
if (!$found) {
    header('Content-Type: text/html; charset=UTF-8');
    echo $html;
    exit();
}

// Protocolo e Domínio base absoluto (Essencial para WhatsApp, Facebook e crawlers da Meta)
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
           (($_SERVER['SERVER_PORT'] ?? 80) == 443) ||
           (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
$protocol = $isHttps ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'] ?? 'japainter.site';
$baseUrl = rtrim($protocol . $host, '/');

// Foto de capa do veículo (DEVE ser URL absoluta)
$fotos = is_array($found['fotos'] ?? null) ? $found['fotos'] : [];
$primaryPhoto = !empty($fotos[0]) ? $fotos[0] : '/hero-japa.jpg';
if (strpos($primaryPhoto, 'http://') !== 0 && strpos($primaryPhoto, 'https://') !== 0) {
    $primaryPhoto = $baseUrl . '/' . ltrim($primaryPhoto, '/');
}

// URL canônica do veículo
$vehicleUrl = $baseUrl . '/veiculo/' . rawurlencode($found['id']);

// Dados do Veículo formatados
$marca = htmlspecialchars($found['marca'] ?? '', ENT_QUOTES, 'UTF-8');
$modelo = htmlspecialchars($found['modelo'] ?? '', ENT_QUOTES, 'UTF-8');
$versao = htmlspecialchars($found['versao'] ?? '', ENT_QUOTES, 'UTF-8');
$ano = htmlspecialchars((string)($found['anoModelo'] ?? $found['anoFabricacao'] ?? ''), ENT_QUOTES, 'UTF-8');
$precoNum = (float)($found['preco'] ?? 0);
$precoFmt = $precoNum > 0 ? 'R$ ' . number_format($precoNum, 0, ',', '.') : 'Sob Consulta';
$cambio = htmlspecialchars($found['cambio'] ?? 'Automático', ENT_QUOTES, 'UTF-8');
$km = !empty($found['km']) ? number_format($found['km'], 0, ',', '.') . ' km' : '';

$pageTitle = "{$marca} {$modelo} {$versao} ({$ano}) - {$precoFmt} | {$nomeLoja}";
$pageDesc = "🚗 {$marca} {$modelo} {$versao} {$ano} por {$precoFmt} na {$nomeLoja} em {$cidade} - {$uf}. Câmbio {$cambio}" . ($km ? ", {$km}" : "") . ", laudo cautelar 100% aprovado e garantia. Confira fotos e ficha completa!";

// 1. Substitui <title>
$html = preg_replace('/<title>.*?<\/title>/is', "<title>{$pageTitle}</title>", $html);

// 2. Substitui og:title e twitter:title
$html = preg_replace('/<meta\s+property=["\']og:title["\']\s+content=["\'][^"\']*["\']\s*\/?>/i', '<meta property="og:title" content="' . $pageTitle . '" />', $html);
$html = preg_replace('/<meta\s+name=["\']twitter:title["\']\s+content=["\'][^"\']*["\']\s*\/?>/i', '<meta name="twitter:title" content="' . $pageTitle . '" />', $html);

// 3. Substitui og:description e twitter:description
$html = preg_replace('/<meta\s+property=["\']og:description["\']\s+content=["\'][^"\']*["\']\s*\/?>/i', '<meta property="og:description" content="' . $pageDesc . '" />', $html);
$html = preg_replace('/<meta\s+name=["\']twitter:description["\']\s+content=["\'][^"\']*["\']\s*\/?>/i', '<meta name="twitter:description" content="' . $pageDesc . '" />', $html);

// 4. Substitui og:url e twitter:url e canonical
$html = preg_replace('/<meta\s+property=["\']og:url["\']\s+content=["\'][^"\']*["\']\s*\/?>/i', '<meta property="og:url" content="' . $vehicleUrl . '" />', $html);
$html = preg_replace('/<meta\s+name=["\']twitter:url["\']\s+content=["\'][^"\']*["\']\s*\/?>/i', '<meta name="twitter:url" content="' . $vehicleUrl . '" />', $html);
if (preg_match('/<link\s+rel=["\']canonical["\']/i', $html)) {
    $html = preg_replace('/<link\s+rel=["\']canonical["\']\s+href=["\'][^"\']*["\']\s*\/?>/i', '<link rel="canonical" href="' . $vehicleUrl . '" />', $html);
} else {
    $html = str_replace('</head>', '    <link rel="canonical" href="' . $vehicleUrl . '" />' . "\n</head>", $html);
}

// 5. Substitui TODAS as referências de imagem genéricas anteriores pelas fotos REAIS do veículo
// Foto de capa otimizada do veículo para Meta (WhatsApp, Facebook, Twitter)
// O WhatsApp exige imagens leves (< 300KB) e formato 1200x630 para carregar a prévia instantaneamente
$thumbUrl = $baseUrl . '/veiculo_thumb.php?id=' . rawurlencode($found['id']);

// Remove TODAS as tags og:image e image_src existentes para garantir que apenas a foto real do carro seja enviada
$html = preg_replace('/<meta\s+property=["\']og:image["\'][^>]*\/?>\s*/i', '', $html);
$html = preg_replace('/<meta\s+property=["\']og:image:[^"\']*["\'][^>]*\/?>\s*/i', '', $html);
$html = preg_replace('/<link\s+rel=["\']image_src["\'][^>]*\/?>\s*/i', '', $html);

$carImageTags = "\n    <!-- FOTO REAL DO VEÍCULO OTIMIZADA PARA META (WHATSAPP, FACEBOOK, INSTAGRAM) -->\n"
              . '    <meta property="og:image" content="' . htmlspecialchars($thumbUrl, ENT_QUOTES, 'UTF-8') . '" />' . "\n"
              . '    <meta property="og:image:secure_url" content="' . htmlspecialchars($thumbUrl, ENT_QUOTES, 'UTF-8') . '" />' . "\n"
              . '    <meta property="og:image:type" content="image/jpeg" />' . "\n"
              . '    <meta property="og:image:width" content="1200" />' . "\n"
              . '    <meta property="og:image:height" content="630" />' . "\n"
              . '    <meta property="og:image:alt" content="' . htmlspecialchars("{$marca} {$modelo} {$ano}", ENT_QUOTES, 'UTF-8') . '" />' . "\n"
              . '    <link rel="image_src" href="' . htmlspecialchars($thumbUrl, ENT_QUOTES, 'UTF-8') . '" />' . "\n";

// Injeta a foto do veículo logo após og:description
$html = preg_replace('/(<meta\s+property=["\']og:description["\'][^>]*\/?>)/i', '$1' . $carImageTags, $html);

// Atualiza twitter:image
$html = preg_replace('/<meta\s+name=["\']twitter:image["\']\s+content=["\'][^"\']*["\']\s*\/?>/i', '<meta name="twitter:image" content="' . htmlspecialchars($thumbUrl, ENT_QUOTES, 'UTF-8') . '" />', $html);

// 6. Injeta metadados de produto
$productMeta = "    <meta property=\"product:price:amount\" content=\"" . $precoNum . "\" />\n"
             . "    <meta property=\"product:price:currency\" content=\"BRL\" />\n";
$html = str_replace('</head>', $productMeta . '</head>', $html);

header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
echo $html;
exit();
