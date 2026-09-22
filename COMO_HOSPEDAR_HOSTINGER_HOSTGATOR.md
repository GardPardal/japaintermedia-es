# Guia de Hospedagem na Hostinger e HostGator - Japa Intermediações

Este projeto foi totalmente adaptado em **PHP nativo e Apache/LiteSpeed**, funcionando com perfeição em **qualquer plano de hospedagem compartilhada** (Hostinger, HostGator, Locaweb, cPanel, etc.), sem precisar de VPS, Docker ou Node.js.

---

## Arquivo Pronto para Envio
Você tem à disposição o arquivo compactado:
📁 **`D:\Brenza\japa_intermediacoes_hostinger_hostgator.zip`**
*(Também mantido como `brenza_hostinger_hostgator.zip` para compatibilidade)*

Este arquivo já contém:
- O site completo com design automotivo luxury dark e identidade **Japa Intermediações**.
- Todas as correções de tela e rolagem no modal de veículos.
- A API completa em PHP nativo (`/api`).
- O estoque inicial de veículos e sistema de leads (`/data`).
- O arquivo de configuração e roteamento (`.htaccess`).
- A página de diagnóstico (`status.php`).

---

## Passo a Passo 1: Como Hospedar na Hostinger (hPanel)

1. Acesse sua conta na **Hostinger** e clique em **Gerenciar** no seu plano de hospedagem.
2. No menu lateral, acesse **Arquivos** > **Gerenciador de Arquivos** (File Manager).
3. Abra a pasta **`public_html`**.
   *(Se houver algum arquivo padrão como `default.php`, pode apagar).*
4. Clique no ícone de **Enviar (Upload)** no canto superior direito e selecione o arquivo:
   `japa_intermediacoes_hostinger_hostgator.zip`
5. Após o término do envio, clique com o botão direito sobre o arquivo `japa_intermediacoes_hostinger_hostgator.zip` e escolha **Extrair (Extract)**.
6. Digite `.` (ponto) ou deixe em branco para extrair diretamente dentro da `public_html`.
7. **Pronto!** O site já estará no ar no seu domínio.

---

## Passo a Passo 2: Como Hospedar na HostGator (cPanel)

1. Acesse o **cPanel** da sua conta na HostGator.
2. Na seção **Arquivos**, clique em **Gerenciador de Arquivos**.
3. Abra a pasta **`public_html`**.
4. No menu superior, clique em **Carregar (Upload)**.
5. Selecione o arquivo `japa_intermediacoes_hostinger_hostgator.zip`.
6. Após completar 100%, volte para o Gerenciador de Arquivos, selecione o `.zip` e clique em **Extrair (Extract)** no menu superior.
7. Confirme o caminho como `/public_html` e clique em **Extract File(s)**.
8. **Pronto!** O site estará funcionando imediatamente.

---

## Verificação e Diagnóstico da Hospedagem

Após fazer o upload, abra no seu navegador:
👉 **`https://seusite.com.br/status.php`**

Essa página irá checar automaticamente:
- Se a versão do PHP é compatível (PHP 7.4, 8.0, 8.1, 8.2 ou 8.3).
- Se a pasta `data/` tem permissão de escrita para salvar novos carros e alterações de preço.
- Quantidade de veículos carregados no estoque.
- Link direto de teste do Feed XML da Webmotors.

---

## Como Acessar o Painel Administrativo no Seu Domínio

- **Pela URL:** `https://seusite.com.br/admin`
- **Pelo botão no site:** Clique em **"Painel de Gestão"** no cabeçalho ou no rodapé.

### Credenciais de Acesso:
- **Usuário:** `admin` (ou `brenza`)
- **Senha:** `brenza2026`

---

## Endpoints Prontos para Webmotors, iCarros e Portais

Basta fornecer essas URLs para o suporte da Webmotors ou configurar no seu integrador:

| Integração | URL no seu Domínio |
| :--- | :--- |
| **Webmotors XML Feed** | `https://seusite.com.br/api/integrations/webmotors/feed.xml` |
| **Webmotors JSON API** | `https://seusite.com.br/api/integrations/webmotors/feed.json` |
| **iCarros XML Feed** | `https://seusite.com.br/api/integrations/icarros/feed.xml` |
| **Exportação Planilha CSV (OLX)** | `https://seusite.com.br/api/integrations/export/csv` |
| **Webhook de Sincronização** | `https://seusite.com.br/api/integrations/webhook/sync` |

---

## Permissões de Pastas (Se Necessário)
Por padrão na Hostinger e HostGator, as permissões já vêm corretas. Caso edite permissões manualmente:
- Pastas: `755`
- Arquivos: `644`
- A pasta `data/` e os arquivos `data/vehicles.json` e `data/leads.json` precisam de permissão de gravação para o PHP atualizar os preços em tempo real.
