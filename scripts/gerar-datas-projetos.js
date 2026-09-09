// Gera config/projects.json com a data do ultimo commit de cada projeto.
//
// "Projeto" = pasta de primeiro nivel que contem um index.html (direto ou aninhado),
// exceto as pastas de infraestrutura (config, css, shared, scripts...).
//
// A data vem de: git log -1 --format=%cs -- <pasta-do-projeto>
// Ou seja, so conta commit que tocou em arquivo dentro da pasta do projeto.
// Mudanca apenas em shared/ nao atualiza a data de nenhum projeto.
//
// Uso:
//   node scripts/gerar-datas-projetos.js
//
// Roda automaticamente no build da Vercel (ver vercel.json).

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const raiz = path.resolve(__dirname, '..');
const saida = path.join(raiz, 'config', 'projects.json');

const IGNORAR = new Set([
  'config', 'css', 'scripts', 'shared', 'node_modules', '.git', '.github', '.vercel'
]);

function log(msg) {
  console.log('[datas-projetos] ' + msg);
}

// A Vercel clona o repo de forma rasa (shallow). Sem historico completo o
// git log de uma pasta especifica pode vir vazio. Isso resolve.
function garantirHistorico() {
  try {
    const raso = execSync('git rev-parse --is-shallow-repository', { cwd: raiz })
      .toString().trim();
    if (raso === 'true') {
      log('repositorio raso, buscando historico completo...');
      execSync('git fetch --unshallow --quiet', { cwd: raiz, stdio: 'ignore' });
    }
  } catch (erro) {
    log('nao foi possivel completar o historico do git: ' + erro.message);
  }
}

function temIndexHtml(dir) {
  const alvoDireto = path.join(dir, 'index.html');
  if (fs.existsSync(alvoDireto)) return true;
  return fs.readdirSync(dir, { withFileTypes: true }).some((item) => {
    return item.isDirectory() && fs.existsSync(path.join(dir, item.name, 'index.html'));
  });
}

function listarProjetos() {
  return fs.readdirSync(raiz, { withFileTypes: true })
    .filter((item) => item.isDirectory() && !IGNORAR.has(item.name))
    .map((item) => item.name)
    .filter((nome) => temIndexHtml(path.join(raiz, nome)))
    .sort();
}

function dataDoUltimoCommit(projeto) {
  try {
    const iso = execSync(`git log -1 --format=%cs -- "${projeto}"`, { cwd: raiz })
      .toString().trim();
    return iso || null; // formato: 2026-09-08
  } catch (erro) {
    log(`git log falhou para "${projeto}": ${erro.message}`);
    return null;
  }
}

function formatarRotulo(iso) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function lerAtual() {
  try {
    return JSON.parse(fs.readFileSync(saida, 'utf8'));
  } catch (erro) {
    return {};
  }
}

function main() {
  garantirHistorico();

  const atual = lerAtual();
  const projetos = listarProjetos();
  const resultado = {};

  projetos.forEach((projeto) => {
    const iso = dataDoUltimoCommit(projeto);
    if (iso) {
      resultado[projeto] = { iso, label: formatarRotulo(iso) };
    } else if (atual[projeto] && atual[projeto].iso) {
      // Sem data no git (projeto ainda nao commitado): mantem o valor anterior.
      resultado[projeto] = atual[projeto];
      log(`sem data no git para "${projeto}", mantendo valor anterior`);
    } else {
      log(`sem data para "${projeto}", chip ficara oculto`);
    }
  });

  const conteudo = JSON.stringify(resultado, null, 2) + '\n';
  fs.writeFileSync(saida, conteudo);
  log(`config/projects.json gerado com ${Object.keys(resultado).length} projeto(s):`);
  Object.entries(resultado).forEach(([nome, info]) => log(`  ${nome}: ${info.label}`));
}

main();
