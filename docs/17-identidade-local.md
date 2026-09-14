# 17 — Identidade e acesso local (0.2.2–0.2.7)

## Isolamento

Projeto Docker/Supabase `premium-mobility`, API `http://127.0.0.1:55421`, PostgreSQL na porta 55422, shadow 55420 e caixa de email de desenvolvimento 55424. Nenhum projeto remoto foi ligado. Não utiliza o Supabase da MO Limpezas. Não executar `link`, `db push`, `--linked` ou `stop --all` para esta fundação.

O teste recusa URLs diferentes das portas locais acima. Credenciais locais são lidas da CLI em memória; não ficam na interface, em ficheiros versionados ou nos logs dos testes. Utilizadores fictícios com passwords aleatórias são criados apenas durante os testes e removidos no final. Não há envio para endereços reais.

## Entrega deste incremento

- Primeira migração em `supabase/migrations`: organizações, memberships, perfis de motorista, estrutura mínima de clientes e versões mínimas da política de agenda.
- Chaves estrangeiras, índices, validações e RLS nas cinco tabelas.
- Proprietário lê apenas dados da própria organização. Motorista lê apenas a própria identidade/perfil; não consulta CRM ou configurações.
- Escrita através dos clientes está bloqueada, inclusive para owner, até existirem casos de uso auditados. Este schema não entrega um CRM operacional.
- Módulo `src/modules/identity/session.ts`: login por password, identidade verificada por `getUser`, permissões lidas das memberships e rejeição de conta sem associação ativa.
- Desativação da membership retira o acesso aos dados na próxima consulta, mesmo com JWT anteriormente emitido. Logout isolado não é apresentado como revogação instantânea de todos os JWT.

Papéis não vêm de `user_metadata`, do URL ou do seletor da pré-visualização. Não existem funções SECURITY DEFINER nem views nesta migração. Contas e memberships serão provisionadas por um futuro fluxo administrativo privado; não há inscrição pública.

Em `config.toml`, `auth.enable_signup=false` bloqueia o registo público. `auth.email.enable_signup=true` mantém o fornecedor email disponível para o login de contas existentes nesta versão da CLI; desligá-lo também rejeita login com `email_provider_disabled`. O teste verifica explicitamente que o registo público continua bloqueado.

## Executar

Na raiz do projeto, com Node 24 e Docker disponíveis:

```powershell
npm.cmd ci
npm.cmd run supabase:start
npm.cmd run test:auth
```

O primeiro arranque descarrega imagens Docker e aplica migrações. Arranques posteriores reutilizam volumes. Para verificar o histórico: `npx.cmd --no-install supabase migration list --local`.

Para ensaiar a migração numa base local descartável e sem dados a conservar: `npx.cmd --no-install supabase db reset --local --yes`, seguido de `npm.cmd run test:auth`. Reset apaga os dados desse projeto local; não é um procedimento de atualização normal nem um restauro de backup de produção. Para parar apenas este projeto preservando volumes: `npx.cmd --no-install supabase stop --project-id premium-mobility`.

## Conclusão 0.2.7

As áreas de proprietário e motorista agora passam por `AuthGate`: sem configuração mostram um estado seguro; com Supabase próprio exigem email/password, membership ativa e papel autorizado. O modo explícito `?demo=1` continua livre para demonstrações; a área do cliente permanece pública. O proprietário pode abrir a vista de motorista e o parceiro não pode abrir a área do proprietário. Há término de sessão local.

O convite é um caso de uso restrito a owner. O adaptador usa `inviteUserByEmail` apenas num servidor com secret key, cria membership/perfil em rascunho e remove o utilizador convidado se o provisionamento falhar. O redirect recebe `invite=1`, e a interface permite definir uma palavra-passe de pelo menos 12 caracteres. A secret key nunca entra no bundle web.

Doze testes reais Auth/PostgREST/PostgreSQL e um teste visual com Supabase local validam login do proprietário, isolamento do parceiro, área do motorista, logout, convite e revogação. BAS-03, BAS-04 e SEC-01 ficam concluídas. Recuperação de palavra-passe, MFA e ambiente remoto pertencem à estabilização futura.

Os testes de acesso fazem chamadas reais a Auth e PostgREST. Consultas sem autorização retornam listas vazias por RLS; escritas e acesso anónimo retornam erro. Um futuro endpoint de detalhe deverá mapear ausência para 404 sem revelar existência.

Fontes técnicas: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [verificação de utilizador](https://supabase.com/docs/reference/javascript/auth-getuser) e [login](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), consultadas em 11/09/2026.

A reinstalação detetou que o gerador pg-delta omitiu a revogação de privilégios anónimos. A segunda migração torna essa revogação explícita; a primeira foi preservada. RLS já impedia leitura de linhas, mas o contrato exige também negar acesso à tabela para anon.
