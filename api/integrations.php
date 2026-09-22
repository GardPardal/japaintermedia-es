<?php
/**
 * Endpoint direto de Integrações Automotivas (Webmotors / iCarros / CSV)
 */
$_GET['route'] = 'integrations' . (!empty($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '');
require_once __DIR__ . '/index.php';
