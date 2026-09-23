import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const indexPath = path.join(rootDir, 'index.html');
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(rootDir, 'assets');

console.log('--- 1. Preparando index.html com entrypoint /src/main.jsx ---');
let html = fs.readFileSync(indexPath, 'utf8');

// Garante que o index.html tenha o script src="/src/main.jsx" para o Vite compilar
html = html.replace(/<script type="module" crossorigin src="\/assets\/index-[^"]+\.js"><\/script>\s*<link rel="stylesheet" crossorigin href="\/assets\/index-[^"]+\.css">/g, '');
if (!html.includes('/src/main.jsx')) {
  html = html.replace('</body>', '  <script type="module" src="/src/main.jsx"></script>\n  </body>');
}
fs.writeFileSync(indexPath, html, 'utf8');

console.log('--- 2. Executando vite build ---');
execSync('npx vite build', { stdio: 'inherit' });

console.log('--- 3. Atualizando index.html da raiz e pasta assets com o bundle de produção ---');
const builtIndex = path.join(distDir, 'index.html');
if (fs.existsSync(builtIndex)) {
  fs.copyFileSync(builtIndex, indexPath);
  console.log('✓ index.html atualizado com o bundle compilado.');
}

const builtAssets = path.join(distDir, 'assets');
if (fs.existsSync(builtAssets)) {
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
  // Limpa assets antigos
  for (const f of fs.readdirSync(assetsDir)) {
    fs.unlinkSync(path.join(assetsDir, f));
  }
  // Copia novos assets
  for (const f of fs.readdirSync(builtAssets)) {
    fs.copyFileSync(path.join(builtAssets, f), path.join(assetsDir, f));
    console.log(`✓ assets/${f} copiado.`);
  }
}

// 4. Sincroniza com public_html se existir
const publicHtmlDir = path.join(rootDir, 'public_html');
if (fs.existsSync(publicHtmlDir)) {
  console.log('--- 4. Sincronizando com public_html ---');
  if (fs.existsSync(builtIndex)) {
    fs.copyFileSync(builtIndex, path.join(publicHtmlDir, 'index.html'));
  }

  const pubAssetsDir = path.join(publicHtmlDir, 'assets');
  if (!fs.existsSync(pubAssetsDir)) fs.mkdirSync(pubAssetsDir, { recursive: true });
  for (const f of fs.readdirSync(pubAssetsDir)) {
    fs.unlinkSync(path.join(pubAssetsDir, f));
  }
  if (fs.existsSync(builtAssets)) {
    for (const f of fs.readdirSync(builtAssets)) {
      fs.copyFileSync(path.join(builtAssets, f), path.join(pubAssetsDir, f));
    }
  }

  // Copia api/ atualizada para public_html/api
  const pubApiDir = path.join(publicHtmlDir, 'api');
  const srcApiDir = path.join(rootDir, 'api');
  if (fs.existsSync(srcApiDir)) {
    if (!fs.existsSync(pubApiDir)) fs.mkdirSync(pubApiDir, { recursive: true });
    for (const f of fs.readdirSync(srcApiDir)) {
      fs.copyFileSync(path.join(srcApiDir, f), path.join(pubApiDir, f));
    }
  }

  // Copia status.php atualizado para public_html/status.php
  const statusPhp = path.join(rootDir, 'status.php');
  if (fs.existsSync(statusPhp)) {
    fs.copyFileSync(statusPhp, path.join(publicHtmlDir, 'status.php'));
  }

  // Garante data/settings.json e data/sales.json em public_html/data
  const pubDataDir = path.join(publicHtmlDir, 'data');
  if (!fs.existsSync(pubDataDir)) fs.mkdirSync(pubDataDir, { recursive: true });
  const srcSettings = path.join(rootDir, 'data/settings.json');
  const pubSettings = path.join(pubDataDir, 'settings.json');
  if (fs.existsSync(srcSettings) && !fs.existsSync(pubSettings)) {
    fs.copyFileSync(srcSettings, pubSettings);
  }
  const srcSales = path.join(rootDir, 'data/sales.json');
  const pubSales = path.join(pubDataDir, 'sales.json');
  if (fs.existsSync(srcSales) && !fs.existsSync(pubSales)) {
    fs.copyFileSync(srcSales, pubSales);
  }

  console.log('✓ public_html atualizado com assets, index.html, api e data.');
}

console.log('--- BUILD CONCLUÍDO COM SUCESSO! ---');
