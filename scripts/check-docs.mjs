import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
const root = resolve(import.meta.dirname, '..');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.filter(e => e.name !== '.git' && e.name !== 'node_modules').map(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
  return nested.flat();
}
const files = (await walk(root)).filter(path => path.endsWith('.md'));
const errors = [];
let links = 0;
for (const file of files) {
  const content = await readFile(file, 'utf8');
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^https?:|^mailto:/.test(target)) continue;
    links++;
    try { await access(resolve(dirname(file), target)); } catch { errors.push(`${file}: ligação inexistente ${target}`); }
  }
}
const taskFiles = files.filter(path => /[\\/]tasks[\\/]/.test(path) && !path.endsWith('README.md'));
const tasks = new Map();
for (const file of taskFiles) {
  const content = await readFile(file, 'utf8');
  for (const section of content.split(/^## /m).slice(1)) {
    const id = section.match(/^([A-Z]+-\d{2})\b/)?.[1];
    if (!id) { errors.push(`Tarefa sem ID: ${file}`); continue; }
    if (tasks.has(id)) errors.push(`ID duplicado: ${id}`);
    for (const field of ['Estado:', 'Dependências:', 'Regras:', 'Implementação:', 'Aceitação:', 'Evidência:']) {
      if (!section.includes(field)) errors.push(`${id}: falta ${field}`);
    }
    tasks.set(id, section);
  }
}
for (const [id, section] of tasks) {
  const dependencies = section.match(/Dependências:\*\* (.*)/)?.[1] ?? '';
  for (const dep of dependencies.matchAll(/[A-Z]+-\d{2}/g)) if (!tasks.has(dep[0])) errors.push(`${id}: dependência inexistente ${dep[0]}`);
}
const visiting = new Set(), visited = new Set();
function visit(id) {
  if (visiting.has(id)) { errors.push(`Ciclo de dependência em ${id}`); return; }
  if (visited.has(id) || !tasks.has(id)) return;
  visiting.add(id);
  const dependencies = tasks.get(id).match(/Dependências:\*\* (.*)/)?.[1] ?? '';
  for (const dep of dependencies.matchAll(/[A-Z]+-\d{2}/g)) visit(dep[0]);
  visiting.delete(id); visited.add(id);
}
for (const id of tasks.keys()) visit(id);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`${files.length} documentos, ${links} ligações locais e ${tasks.size} tarefas: estrutura validada.`);
