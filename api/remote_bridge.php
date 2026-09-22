<?php
/**
 * Hostoo Remote Editor & Bridge for MCP (Model Context Protocol)
 * Japa Intermediações - Gestão Remota
 */
header('Content-Type: application/json; charset=utf-8');

// Carrega variáveis do .env se presente
if (file_exists(__DIR__ . '/../.env')) {
    $envLines = @file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($envLines) {
        foreach ($envLines as $envLine) {
            $envLine = trim($envLine);
            if ($envLine === '' || str_starts_with($envLine, '#')) continue;
            if (strpos($envLine, '=') !== false) {
                list($k, $v) = explode('=', $envLine, 2);
                $k = trim($k);
                $v = trim($v, " \t\n\r\0\x0B\"'");
                putenv("{$k}={$v}");
                $_ENV[$k] = $v;
                $_SERVER[$k] = $v;
            }
        }
    }
}

// Configuração de segurança via variável de ambiente
$configuredSecret = getenv('BRIDGE_SECRET') ?: getenv('MCP_REMOTE_SECRET') ?: '';
define('BASE_DIR', realpath(__DIR__ . '/..'));

// Validação de autenticação
$token = '';
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    if (preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
        $token = trim($matches[1]);
    }
}
if (!$token && isset($_REQUEST['token'])) {
    $token = trim($_REQUEST['token']);
}

if (empty($configuredSecret) || $token !== $configuredSecret) {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso negado. Token de autorização inválido ou não configurado.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$action = $_REQUEST['action'] ?? 'ping';

function sanitizePath($relPath) {
    $clean = str_replace(['../', '..\\'], '', trim($relPath, "/\\"));
    $full = BASE_DIR . ($clean ? DIRECTORY_SEPARATOR . $clean : '');
    if (strpos(realpath($full) ?: $full, BASE_DIR) !== 0) {
        throw new Exception('Caminho fora do diretório permitido.');
    }
    return $full;
}

try {
    switch ($action) {
        case 'ping':
            echo json_encode([
                'status' => 'online',
                'php_version' => PHP_VERSION,
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Hostoo Web Server',
                'base_dir' => BASE_DIR,
                'data_writable' => is_writable(BASE_DIR . '/data'),
                'time' => date('c')
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            break;

        case 'list':
            $dir = sanitizePath($_REQUEST['path'] ?? '');
            if (!is_dir($dir)) {
                throw new Exception('Diretório não encontrado: ' . $dir);
            }
            $items = scandir($dir);
            $result = [];
            foreach ($items as $item) {
                if ($item === '.' || $item === '..') continue;
                $p = $dir . DIRECTORY_SEPARATOR . $item;
                $result[] = [
                    'name' => $item,
                    'path' => str_replace('\\', '/', substr($p, strlen(BASE_DIR) + 1)),
                    'type' => is_dir($p) ? 'dir' : 'file',
                    'size' => is_file($p) ? filesize($p) : 0,
                    'mtime' => filemtime($p)
                ];
            }
            echo json_encode(['success' => true, 'items' => $result], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            break;

        case 'read':
            $file = sanitizePath($_REQUEST['file'] ?? '');
            if (!is_file($file)) {
                throw new Exception('Arquivo não encontrado: ' . $file);
            }
            $content = file_get_contents($file);
            echo json_encode([
                'success' => true,
                'file' => $_REQUEST['file'],
                'size' => strlen($content),
                'content' => $content
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'write':
            $file = sanitizePath($_REQUEST['file'] ?? '');
            $content = $_POST['content'] ?? file_get_contents('php://input');
            $dir = dirname($file);
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            if (is_file($file)) {
                @copy($file, $file . '.bak');
            }
            $bytes = file_put_contents($file, $content);
            echo json_encode([
                'success' => true,
                'file' => $_REQUEST['file'],
                'bytes_written' => $bytes,
                'updated_at' => date('c')
            ], JSON_UNESCAPED_UNICODE);
            break;

        default:
            throw new Exception('Ação não suportada: ' . $action);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

