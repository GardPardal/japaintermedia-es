import { Client } from 'ssh2';

const conn = new Client();

const config = {
  host: 'ssh.samtooweb.com',
  port: 44737,
  username: 'hz18jx9b',
  password: 'xf4Hx3Vj09',
  algorithms: {
    mac: ['hmac-sha2-512', 'hmac-sha2-256', 'hmac-sha1']
  }
};

const commands = [
  'echo "--- 1. Atualizando repositório Git no servidor ---"',
  'cd /home/hz18jx9b/public_html/japaintermedia-es',
  'git fetch origin',
  'git reset --hard origin/main',
  'git clean -fd',
  'echo "--- 2. Copiando arquivos compilados para public_html ---"',
  'cp -f /home/hz18jx9b/public_html/japaintermedia-es/index.html /home/hz18jx9b/public_html/index.html',
  'cp -rf /home/hz18jx9b/public_html/japaintermedia-es/assets/* /home/hz18jx9b/public_html/assets/',
  'cp -f /home/hz18jx9b/public_html/japaintermedia-es/api/index.php /home/hz18jx9b/public_html/api/index.php',
  'echo "--- 3. Limpando cache do LiteSpeed ---"',
  'rm -rf /home/hz18jx9b/lscache/*',
  'echo "--- 4. Concluído ---"'
].join(' && ');

console.log('Conectando ao servidor Hostoo via SSH...');

conn.on('ready', () => {
  console.log('Conexão SSH estabelecida. Executando deploy...');
  conn.exec(commands, (err, stream) => {
    if (err) {
      console.error('Erro na execução:', err);
      conn.end();
      process.exit(1);
    }
    stream.on('close', (code, signal) => {
      console.log(`Comando finalizado com código ${code}`);
      conn.end();
      process.exit(code === 0 ? 0 : 1);
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('error', (err) => {
  console.error('Falha na conexão SSH:', err);
  process.exit(1);
}).connect(config);
