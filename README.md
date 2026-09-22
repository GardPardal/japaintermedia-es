# JAPA Intermediações - Portal Automotivo & Gestão de Estoque

Portal automotivo oficial da **JAPA Intermediações** (Wenceslau Braz - PR), especializado em compra, venda, troca e financiamento de veículos seminovos e novos com procedência garantida e laudo cautelar 100% aprovado.

---

## Estrutura do Projeto

- **Frontend:** React 18 + Vite + Tailwind CSS (Design nipo-moderno sofisticado fiel ao mockup oficial).
- **Backend:** API REST em PHP 8 nativo (`api/index.php`) compatível com LiteSpeed, Apache e cPanel.
- **Banco de Dados:** MySQL (`japa`) com suporte a múltiplos ambientes e fallback automático em `data/vehicles.json`.
- **Deploy Contínuo:** Integrado via Git Deploy na hospedagem **Hostoo** (`japainter.site` / IP `200.9.22.2`) e repositório GitHub.

---

## Dados da Loja

- **Empresa:** JAPA Intermediações de Veículos
- **Endereço:** Av. Avelino Vieira, 68 - Centro, Wenceslau Braz - PR, CEP 84950-000
- **WhatsApp / Telefone:** (43) 99643-7966
- **Horário:** Seg. a Sex. das 08h às 18h | Sábados das 08h às 12h30
- **Lema:** *"Confiança que te leva mais longe!"*

---

## Como Funciona a Integração GitHub + Hostoo

O repositório está conectado ao **Deploy via GIT da Hostoo**:
1. Toda vez que um `git push` é realizado no branch `main` deste repositório, a Hostoo atualiza os arquivos do site automaticamente.
2. Você pode editar arquivos diretamente pelo GitHub (ex: alterar preços ou cadastrar veículos em `data/vehicles.json`, ou modificar textos e imagens) e a hospedagem sincronizará as alterações.
3. O assistente de IA (Antigravity) possui ferramentas locais e servidor MCP remoto para continuar evoluindo o projeto diretamente em sincronia com o GitHub e a Hostoo.

---

## Desenvolvimento Local

### 1. Instalar Dependências
```bash
npm install
```

### 2. Rodar em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse: `http://localhost:5173`

### 3. Compilar para Produção
```bash
npm run build
```
Os arquivos gerados em `dist/` são copiados para a raiz do repositório para servir diretamente no LiteSpeed/Apache sem necessidade de compilação no servidor compartilhado.

---

## Painel Administrativo

- **Acesso direto:** `https://japainter.site/admin` (ou botão discreto no rodapé do site).
- **Usuários cadastrados:** `admin` ou `japa`
- **Senhas:** `japa2026` / `brenza2026` / `qfzY43Wq`

---

## Licença e Direitos

© JAPA Intermediações. Todos os direitos reservados.
