<?php
/**
 * Endpoint direto de Veículos (Compatibilidade Máxima)
 */
$_GET['route'] = 'vehicles' . (!empty($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '');
require_once __DIR__ . '/index.php';
