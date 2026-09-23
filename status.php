<?php
/**
 * Diagnóstico de Instalação - Brenza Multimarcas
 * Use este arquivo para testar se sua hospedagem (Hostinger/HostGator) está 100% pronta.
 */

$phpVersion = phpversion();
$isPhpOk = version_compare($phpVersion, '7.4.0', '>=');

$dataDir = __DIR__ . '/data';
$vehiclesFile = $dataDir . '/vehicles.json';
$leadsFile = $dataDir . '/leads.json';
$settingsFile = $dataDir . '/settings.json';

$isDataDirWritable = is_writable($dataDir);
$isVehiclesWritable = file_exists($vehiclesFile) ? is_writable($vehiclesFile) : is_writable($dataDir);
$isLeadsWritable = file_exists($leadsFile) ? is_writable($leadsFile) : is_writable($dataDir);
$isSettingsWritable = file_exists($settingsFile) ? is_writable($settingsFile) : is_writable($dataDir);

$currentWhatsapp = '';
if (file_exists($settingsFile)) {
    $sData = json_decode(file_get_contents($settingsFile), true);
    if (!empty($sData['whatsapp'])) {
        $currentWhatsapp = $sData['whatsapp'];
    }
}

$vehiclesCount = 0;
if (file_exists($vehiclesFile)) {
    $data = json_decode(file_get_contents($vehiclesFile), true);
    $vehiclesCount = is_array($data) ? count($data) : 0;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnóstico da Hospedagem - Brenza Multimarcas</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0b0f13; color: #f1f5f9; padding: 2rem; margin: 0; }
        .card { max-width: 650px; margin: 0 auto; background: #131821; border: 1px solid #2a3442; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        h1 { font-size: 1.5rem; margin-top: 0; color: #fff; display: flex; align-items: center; gap: 0.5rem; }
        .item { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid #1e293b; font-size: 0.9rem; }
        .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: bold; font-size: 0.8rem; }
        .badge-success { background: #064e3b; color: #34d399; }
        .badge-error { background: #881337; color: #f43f5e; }
        .btn { display: inline-block; background: #e5222d; color: #fff; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: bold; margin-top: 1.5rem; }
        .btn:hover { background: #c81b24; }
        .note { font-size: 0.8rem; color: #94a3b8; margin-top: 1rem; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Diagnóstico do Sistema Brenza (PHP)</h1>
        <p style="color: #94a3b8; font-size: 0.85rem;">Verificação de compatibilidade com Hostinger, HostGator ou cPanel.</p>

        <div class="item">
            <span>Versão do PHP</span>
            <span class="badge <?= $isPhpOk ? 'badge-success' : 'badge-error' ?>">
                PHP <?= $phpVersion ?> <?= $isPhpOk ? '(Compatível)' : '(Recomendado 7.4+)' ?>
            </span>
        </div>

        <div class="item">
            <span>Permissão de Escrita na Pasta /data</span>
            <span class="badge <?= $isDataDirWritable ? 'badge-success' : 'badge-error' ?>">
                <?= $isDataDirWritable ? 'Permitido (OK)' : 'Sem permissão (Ajuste para 755)' ?>
            </span>
        </div>

        <div class="item">
            <span>Banco de Veículos (vehicles.json)</span>
            <span class="badge <?= $isVehiclesWritable ? 'badge-success' : 'badge-error' ?>">
                <?= $isVehiclesWritable ? "OK ({$vehiclesCount} veículos carregados)" : 'Erro de Escrita' ?>
            </span>
        </div>

        <div class="item">
            <span>Banco de Leads e Propostas</span>
            <span class="badge <?= $isLeadsWritable ? 'badge-success' : 'badge-error' ?>">
                <?= $isLeadsWritable ? 'OK (Gravável)' : 'Sem permissão' ?>
            </span>
        </div>

        <div class="item">
            <span>Configurações da Loja & WhatsApp (settings.json)</span>
            <span class="badge <?= $isSettingsWritable ? 'badge-success' : 'badge-error' ?>">
                <?= $isSettingsWritable ? "OK (WhatsApp ativo: {$currentWhatsapp})" : 'Sem permissão' ?>
            </span>
        </div>

        <div class="item">
            <span>Feed Webmotors XML</span>
            <span><a href="/api/integrations/webmotors/feed.xml" target="_blank" style="color: #60a5fa; font-size: 0.85rem;">Testar Feed XML</a></span>
        </div>

        <div style="text-align: center;">
            <a href="/" class="btn">Acessar o Site da Brenza Multimarcas</a>
        </div>

        <p class="note">
            Dica: Se todos os itens estiverem verdes com "OK", seu site e painel administrativo estão 100% operacionais na sua hospedagem.
        </p>
    </div>
</body>
</html>
