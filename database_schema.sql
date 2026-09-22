-- Estrutura do Banco de Dados MySQL - Japa Intermediações
-- Base de Dados: japa

SET NAMES utf8mb4;
SET time_zone = '-03:00';

CREATE TABLE IF NOT EXISTS `veiculos` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `marca` VARCHAR(100) NOT NULL,
    `modelo` VARCHAR(100) NOT NULL,
    `versao` VARCHAR(150) NOT NULL,
    `ano_fabricacao` INT NOT NULL,
    `ano_modelo` INT NOT NULL,
    `km` INT NOT NULL DEFAULT 0,
    `preco` DECIMAL(12,2) NOT NULL,
    `is_demo_price` TINYINT(1) NOT NULL DEFAULT 0,
    `preco_original` DECIMAL(12,2) NULL,
    `combustivel` VARCHAR(50) NOT NULL,
    `cambio` VARCHAR(50) NOT NULL,
    `cor` VARCHAR(50) NOT NULL,
    `portas` INT NOT NULL DEFAULT 4,
    `carroceria` VARCHAR(50) NOT NULL,
    `final_placa` VARCHAR(5) NULL,
    `cidade` VARCHAR(100) NOT NULL DEFAULT 'Wenceslau Braz',
    `uf` VARCHAR(5) NOT NULL DEFAULT 'PR',
    `destaque` TINYINT(1) NOT NULL DEFAULT 0,
    `status` ENUM('Disponível', 'Reservado', 'Vendido') NOT NULL DEFAULT 'Disponível',
    `descricao` TEXT NULL,
    `fotos` LONGTEXT NULL,
    `opcionais` LONGTEXT NULL,
    `laudo_cautelar` VARCHAR(100) DEFAULT 'Aprovado 100%',
    `webmotors_sync` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `leads` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tipo` VARCHAR(50) NOT NULL DEFAULT 'Geral',
    `nome` VARCHAR(150) NOT NULL,
    `telefone` VARCHAR(30) NOT NULL,
    `email` VARCHAR(150) NULL,
    `cpf` VARCHAR(20) NULL,
    `veiculo_id` VARCHAR(50) NULL,
    `veiculo_nome` VARCHAR(200) NULL,
    `valor_veiculo` DECIMAL(12,2) NULL,
    `valor_entrada` DECIMAL(12,2) NULL,
    `prazo_meses` INT NULL,
    `mensagem` TEXT NULL,
    `dados_veiculo_cliente` LONGTEXT NULL,
    `status` ENUM('Novo', 'Em Atendimento', 'Concluído', 'Cancelado') NOT NULL DEFAULT 'Novo',
    `origem` VARCHAR(100) DEFAULT 'Website Japa Intermediações',
    `ip_origem` VARCHAR(45) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `ultimo_login` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `configuracoes` (
    `chave` VARCHAR(100) PRIMARY KEY,
    `valor` TEXT NOT NULL,
    `descricao` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
