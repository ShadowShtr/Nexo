# Fundação técnica

Reutilização: BAS-04 deve aplicar a seleção de bibliotecas e a prova de compatibilidade descritas na pesquisa. Ver [pesquisa GitHub](../14-reutilizacao-github.md).

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## BAS-01 — Especificação e domínio inicial

**Estado:** CONCLUÍDA — fundação, sem UI/persistência

**Dependências:** —

**Regras:** DEC-01..25; REG-01..09; CAL-R01..08

**Implementação:** Documentar o escopo, decisões pendentes, arquitetura, contratos, configurações e tarefas; implementar funções puras e testes de fronteira.

**Aceitação:** Documentos navegáveis; fórmulas reproduzíveis; estados de implementação honestos; testes e demo executáveis; versão Git local.

**Evidência:** Documentos desta versão; src/domain; tests/domain.test.ts; executar npm test e npm run check:docs. Resultado de validação em ../10-validacao.md.

## BAS-02 — Escolher persistência e contratos de repositório

**Estado:** CONCLUÍDA — contratos e prova PostgreSQL local validados

**Dependências:** BAS-01

**Regras:** CAL-R06; REG-08

**Implementação:** Validar Supabase/Postgres, capacidade transacional, integração com runtime e migrações; registar ADR; definir UnitOfWork, repositórios de reserva/alocação e contratos validados.

**Aceitação:** Uma prova executável explica como serializa motorista e veículo; schema lógico mapeado; nenhuma reserva depende de localStorage.

**Evidência:** [Prova de persistência](../16-prova-persistencia.md), contratos e adaptador PostgreSQL; 11 testes de integração aprovados em 11/09/2026. Sem migração remota.

## BAS-03 — Migrações, atomicidade e fixtures

**Estado:** PLANEADA

**Dependências:** BAS-02

**Regras:** CAL-R04; CAL-R06; REG-07

**Implementação:** Criar migrações numeradas para identidade, recursos, reservas, alocações, versões e outbox; seed fictício; teste de concorrência real no motor escolhido.

**Aceitação:** Dois pedidos concorrentes por mesma vaga resultam em uma alocação; rollback não deixa hold órfão; migrações repetidas são controladas e restauração testável.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## BAS-04 — Inicializar aplicação web e ferramentas de desenvolvimento

**Estado:** EM CURSO — scaffold local validado; persistência e acesso pendentes

**Dependências:** BAS-02, BAS-05

**Regras:** DEC-15; ADR-001..005

**Implementação:** Inicializar aplicação web para hospedagem preferida Vercel, com decisão de plano/alternativa registada, composição modular, tokens premium, navegação por papéis, catálogos PT/EN, package lock, compilador TypeScript e CI; manter o domínio existente.

**Aceitação:** Build e typecheck passam; navegação com estados vazios reais; scripts documentados; nenhum dashboard fictício apresentado como dado real.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.


## BAS-05 — Pesquisar e selecionar componentes reutilizáveis

**Estado:** CONCLUÍDA — pesquisa documental, sem integração

**Dependências:** BAS-01

**Regras:** ADR-001; DEC-15; DEC-30; pedido de reutilização de 11/09/2026

**Implementação:** Comparar bibliotecas e bases existentes, licenças, custos e adequação às regras; mapear reutilização às tarefas.

**Aceitação:** Fontes dos autores, escolha inicial de calendário e alternativas, limites de reutilização, ausência de promessa de funcionalidades já instaladas.

**Evidência:** [Pesquisa e decisões](../14-reutilizacao-github.md), realizada em 11/09/2026. Integração e compatibilidade executável ficam em BAS-04/CAL-04.


Evidência parcial 0.2.0: [base web e limites](../15-base-web.md). Navegação e exemplos visuais não concluem critérios funcionais dependentes de persistência e acesso.
