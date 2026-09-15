# Continuidade entre computadores

Atualizado em 15/09/2026. Código de referência: v0.2.72, b5fedb7. Esta entrega acrescenta documentação; não altera a versão da aplicação.

## Repositório e ponto de partida

Repositório: https://github.com/ShadowShtr/Nexo.git. Branch atual: main. Neste PC o remoto chama-se nexo; um clone normal chama-lhe origin. O nome Nexo no Git e o título provisório Premium Mobility na interface referem-se ao mesmo projeto.

A raiz do repositório contém package.json, AGENTS.md, src e docs. Neste PC está em outputs/premium-mobility dentro do workspace. Noutro PC pode estar em qualquer pasta: não recriar esse caminho absoluto nem copiar apenas src. Clonar inclui histórico, imagens em public, referências, testes e migrações.

Começar por [AGENTS](../AGENTS.md), [estado atual](22-estado-atual-e-limites.md), [escopo](01-escopo.md), [regras](03-regras.md) e tarefa correspondente em [tarefas](tasks/README.md). Para UI, ler também [decisões visuais recentes](23-decisoes-visuais-cliente.md).

## Instalação num PC novo

Instalar Git, Node.js 24.x com npm e Microsoft Edge para os testes de interface. Docker só é necessário para os testes de banco/autenticação. Usar acesso GitHub autorizado; nunca colocar tokens na URL nem nos documentos.

```sh
git clone https://github.com/ShadowShtr/Nexo.git
cd Nexo
git status
git log -5 --oneline
node --version
npm ci
npm run build
npm run check
npm run dev
```

Se o PowerShell bloquear npm.ps1, usar npm.cmd e npx.cmd. Usar npm ci para respeitar package-lock.json; não atualizar bibliotecas só por mudar de máquina.

Cliente: http://127.0.0.1:5173/?demo=1&lang=pt-PT#/customer/discover
Proprietário: http://127.0.0.1:5173/?demo=1#/owner/calendar
Parceiro: http://127.0.0.1:5173/?demo=1#/driver/services

demo=1 ativa dados fictícios; lang=en permite verificar inglês. A rota booking é uma etapa interna, não a página inicial do cliente. A porta deve ser 5173 para os testes; não deixar outro projeto ocupá-la.

## Configuração e dados que não viajam no Git

A demonstração funciona sem .env. Se necessário, copiar .env.example para .env.local e preencher apenas as variáveis necessárias, com credenciais obtidas por canal próprio. Nunca versionar .env.local.

| Variável | Utilização |
|---|---|
| VITE_GEOAPIFY_API_KEY | Chave opcional de autocomplete; por ser VITE, é pública no bundle. Restringir domínios no fornecedor. |
| VITE_GEOAPIFY_URL | Endpoint de autocomplete Geoapify. |
| VITE_PHOTON_URL | Fallback Photon. |
| VITE_SUPABASE_URL | URL do ambiente próprio para autenticação, lida por browser-client.ts. |
| VITE_SUPABASE_PUBLISHABLE_KEY | Chave pública do mesmo ambiente; nunca service_role/secret key. |

Os dois últimos nomes existem no código, mas não no .env.example atual. Reiniciar Vite após alterar variáveis. A ausência de credenciais deve manter as áreas autenticadas num estado seguro.

O Git não transporta node_modules, dist, relatórios em artifacts/test-results/playwright-report, sessões do navegador, .env nem volumes Docker. Instalar dependências de novo. Pedidos de demonstração em memória e pm.owner.calendar em sessionStorage não são backup de reservas nem sincronização entre PCs. Os ficheiros de imagem utilizados pela aplicação já estão em public; não dependem da pasta Downloads do utilizador.

## Testes e ambientes locais opcionais

| Comando | O que verifica / requisito |
|---|---|
| npm run check | Domínio e ligações/estrutura documental; sem banco. |
| npm run build | TypeScript e bundle de produção. |
| npm run test:ui | Playwright com Edge; inicia Vite se necessário. |
| npm run db:test:start e npm run test:db | Prova PostgreSQL em Docker, porta local 55439. |
| npm run supabase:start e npm run test:auth | Identidade, acesso e schema em ambiente local dedicado. |
| npm run test:auth-ui | Fluxo visual autenticado local; consultar guia de identidade. |

Se Edge não estiver instalado, a instalação pelo Playwright é npx playwright install msedge; em Linux a CI utiliza --with-deps. A interface nativa de data depende do navegador/SO; emular largura de iPhone não testa o seletor real do iOS.

Seguir [persistência](16-prova-persistencia.md), [identidade local](17-identidade-local.md) e [schema](19-schema-operacional.md) para os testes opcionais. Não executar reset de base com dados a conservar. Não ligar a projetos externos existentes de outros negócios. Nenhuma destas instruções exige provisionar ambiente remoto.

## Rotina obrigatória em qualquer máquina

1. Antes de editar: git status, git remote -v e git log -5 --oneline. Identificar tarefa e ler os documentos relacionados.
2. Atualizar a branch com git fetch origin e git pull --ff-only quando estiver limpa. Neste PC substituir origin por nexo. Se houver trabalho local ou divergência, preservá-lo numa branch/commit próprio e reconciliar sem force push ou reset destrutivo.
3. Trabalhar uma tarefa por branch curta quando houver trabalho simultâneo. As duas máquinas não devem editar main independentemente e sobrescrever o resultado uma da outra.
4. Alterar as camadas relacionadas: uma regra de disponibilidade afeta calendário, escolha de recursos, validação final e testes; uma mudança de preço afeta cotação, resumo e snapshot.
5. Atualizar o documento específico, estado atual se necessário, evidência da tarefa, docs/10-validacao.md e CHANGELOG.md. Registar limitações, testes executados e os que ficaram por executar.
6. Rever git diff e git diff --check. Adicionar ficheiros explicitamente; não incluir segredos, dados reais ou ficheiros temporários.
7. Commit por assunto. Para alterações da aplicação, manter package.json, package-lock.json, README e versão visível em App.tsx coerentes; criar tag apenas após validação. Documentação isolada pode manter a versão do app.
8. Enviar a branch e as tags novas autorizadas para o remoto existente. Nunca usar --force para resolver divergência.
9. Verificar se o commit local corresponde ao remoto e se a CI terminou. Se envio/CI falhar, registar a falha; commit local não significa que o outro PC já o recebe.
10. Ao terminar, deixar um resumo com alteração, decisão, ficheiros, testes, pendências e próximo passo. A outra máquina deve repetir esta rotina, inclusive atualizar estes documentos.

## Instrução pronta para a outra máquina

> Continue este repositório existente. Leia AGENTS.md, README.md e docs/21-continuidade-entre-pcs.md, depois docs/22-estado-atual-e-limites.md e a tarefa aplicável. Preserve decisões comerciais e visuais registadas. Confirme branch/commit e sincronize sem perder alterações. Não trate demonstrações em memória como funcionalidades de produção. Faça alterações coerentes entre interface, regras, dados e testes. Documente o que mudou e os limites, atualize tarefas/changelog/evidência, valide e guarde no Git. Deixe a mesma instrução e documentação atualizada para o próximo PC. Não dependa da conversa anterior nem de ficheiros fora do repositório.

## Recuperação e conflitos

Se houver commits diferentes nos dois PCs, guardar primeiro o trabalho local numa branch. Comparar histórico e integrar numa branch de trabalho, executando os testes antes de integrar em main. Não copiar ficheiros por cima do clone para resolver conflitos.

Para reproduzir uma versão antiga sem mexer na branch ativa: git worktree add --detach ../Nexo-v0.2.72 v0.2.72. Instalar dependências nessa pasta. Git recupera código e assets versionados; dados de produção futuros exigem backup próprio e restauro testado.

