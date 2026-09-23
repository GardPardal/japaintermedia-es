<?php
/**
 * Gerador e Otimizador de Thumbnails para SEO Social (WhatsApp, Facebook, Meta, Twitter)
 * Redimensiona imagens de veículos para o formato ideal Open Graph (1200x630, < 200KB)
 * permitindo que o WhatsApp e o Facebook renderizem a foto real instantaneamente.
 */

// Aumenta limite de memória temporariamente para processar imagens em alta resolução de celular
@ini_set('memory_limit', '256M');

$id = trim($_GET['id'] ?? '');
$imgPath = trim($_GET['img'] ?? '');

$rootDir = __DIR__;
$cacheDir = $rootDir . '/uploads/thumbs';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}

// 1. Identifica a foto original do veículo
$sourceFile = '';
if (!empty($id)) {
    $vehiclesPath = $rootDir . '/data/vehicles.json';
    if (file_exists($vehiclesPath)) {
        $vehicles = json_decode(@file_get_contents($vehiclesPath), true) ?: [];
        $numericQuery = preg_replace('/\D/', '', $id);
        foreach ($vehicles as $v) {
            $vId = (string)($v['id'] ?? '');
            $numV = preg_replace('/\D/', '', $vId);
            if (strcasecmp($vId, $id) === 0 || (!empty($numericQuery) && intval($numV) === intval($numericQuery))) {
                $fotos = is_array($v['fotos'] ?? null) ? $v['fotos'] : [];
                if (!empty($fotos[0])) {
                    $imgPath = $fotos[0];
                }
                break;
            }
        }
    }
}

if (!empty($imgPath)) {
    // Normaliza caminho local
    if (strpos($imgPath, 'http://') === 0 || strpos($imgPath, 'https://') === 0) {
        $parsed = parse_url($imgPath, PHP_URL_PATH);
        if ($parsed) {
            $imgPath = $parsed;
        }
    }
    $cleanPath = ltrim($imgPath, '/\\');
    if (file_exists($rootDir . '/' . $cleanPath)) {
        $sourceFile = $rootDir . '/' . $cleanPath;
    } elseif (file_exists($cleanPath)) {
        $sourceFile = $cleanPath;
    }
}

// Se não encontrou foto do veículo, usa a logo oficial ou imagem padrão
if (empty($sourceFile) || !file_exists($sourceFile)) {
    if (file_exists($rootDir . '/hero-japa.jpg')) {
        $sourceFile = $rootDir . '/hero-japa.jpg';
    } elseif (file_exists($rootDir . '/logo-japa-oficial.png')) {
        $sourceFile = $rootDir . '/logo-japa-oficial.png';
    } else {
        http_response_code(404);
        exit('Imagem não encontrada');
    }
}

$fileMtime = filemtime($sourceFile);
$cacheKey = md5($sourceFile . '_' . $fileMtime . '_og1200x630');
$cacheFile = $cacheDir . '/thumb_' . $cacheKey . '.jpg';

// 2. Serve do cache se já existir
if (file_exists($cacheFile) && filesize($cacheFile) > 0) {
    header('Content-Type: image/jpeg');
    header('Content-Length: ' . filesize($cacheFile));
    header('Cache-Control: public, max-age=2592000'); // 30 dias
    header('ETag: "' . $cacheKey . '"');
    readfile($cacheFile);
    exit;
}

// 3. Processa e redimensiona a imagem usando GD
if (!function_exists('imagecreatefromstring')) {
    // Fallback se GD não estiver disponível: serve o arquivo original
    $mime = mime_content_type($sourceFile) ?: 'image/jpeg';
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($sourceFile));
    readfile($sourceFile);
    exit;
}

$imgData = @file_get_contents($sourceFile);
if (!$imgData) {
    http_response_code(500);
    exit('Erro ao ler imagem original');
}

$srcImg = @imagecreatefromstring($imgData);
if (!$srcImg) {
    http_response_code(500);
    exit('Formato de imagem inválido');
}

$origWidth = imagesx($srcImg);
$origHeight = imagesy($srcImg);

// Dimensões ideais para Open Graph (WhatsApp / Facebook / Instagram / Twitter)
$targetWidth = 1200;
$targetHeight = 630;

// Cria tela de destino 1200x630
$dstImg = imagecreatetruecolor($targetWidth, $targetHeight);

// Fundo cinza escuro sofisticado caso a proporção seja diferente
$bg = imagecolorallocate($dstImg, 24, 24, 27); // #18181b
imagefill($dstImg, 0, 0, $bg);

// Ajusta a proporção: preenche proporcionalmente cobrindo a área (cover / center crop)
$srcRatio = $origWidth / $origHeight;
$targetRatio = $targetWidth / $targetHeight;

if ($srcRatio > $targetRatio) {
    // Imagem original é mais larga: corta laterais proporcionalmente
    $cropWidth = (int)round($origHeight * $targetRatio);
    $cropHeight = $origHeight;
    $srcX = (int)round(($origWidth - $cropWidth) / 2);
    $srcY = 0;
} else {
    // Imagem original é mais alta: corta topo/baixo
    $cropWidth = $origWidth;
    $cropHeight = (int)round($origWidth / $targetRatio);
    $srcX = 0;
    $srcY = (int)round(($origHeight - $cropHeight) / 2);
}

imagecopyresampled(
    $dstImg, $srcImg,
    0, 0,
    $srcX, $srcY,
    $targetWidth, $targetHeight,
    $cropWidth, $cropHeight
);

// Opcional: Adiciona leve vinheta/sombra na base para melhorar contraste
imagedestroy($srcImg);

// Salva em cache como JPEG com compressão otimizada (82% resulta em ~90-140KB, ideal para WhatsApp)
imagejpeg($dstImg, $cacheFile, 82);
imagedestroy($dstImg);

if (file_exists($cacheFile)) {
    header('Content-Type: image/jpeg');
    header('Content-Length: ' . filesize($cacheFile));
    header('Cache-Control: public, max-age=2592000');
    header('ETag: "' . $cacheKey . '"');
    readfile($cacheFile);
    exit;
} else {
    http_response_code(500);
    exit('Erro ao gerar thumbnail');
}
