<?php
/**
 * Endpoint direto de Leads e Propostas (Compatibilidade Máxima)
 */
$_GET['route'] = 'leads' . (!empty($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '');
require_once __DIR__ . '/index.php';
