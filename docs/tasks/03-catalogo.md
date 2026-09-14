# Abas Motoristas e Veículos

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## CAT-01 — Cadastro e perfil dos motoristas

**Estado:** EM CURSO — contratos e catálogo de demonstração; persistência de mutações pendente

**Dependências:** SEC-01

**Regras:** DEC-01..03; DEC-15

**Implementação:** Owner cadastra parceiro convidado, perfil PT/EN, imagem, contacto e estado; associar usuário e estado de habilitação para pagamentos sem expor conta privada.

**Aceitação:** Perfil só publica com campos exigidos; desativação bloqueia novos serviços sem apagar os anteriores; parceiro não cria outro motorista.

**Evidência:** `src/contracts/catalog.ts`, `src/application/catalog-admin.ts`, `src/web/pages/CatalogSandbox.tsx`, `tests/catalog.test.ts`, `tests/catalog-admin.test.ts` e teste Playwright do catálogo. O contrato de comando server-side exige proprietário ativo, injeta a organização da sessão e normaliza `publishedAt`; convite e perfil real usam a base Supabase, mas o adaptador HTTP/Edge Function ainda falta.

## CAT-02 — Veículos, capacidade e associações temporais

**Estado:** EM CURSO — schema e validações prontas; CRUD e associação persistentes pendentes

**Dependências:** CAT-01

**Regras:** DEC-02; PEN-10; CAL-R04

**Implementação:** Cadastrar carros com capacidade de passageiros excluindo condutor, bagagem, fotos, comodidades, antecedência, suplementos; associação muitos-para-muitos e indisponibilidade.

**Aceitação:** Carro partilhado é único recurso; capacidade 6 não permite 7 passageiros mesmo que nome diga 7 lugares; histórico e associações futuras preservados.

**Evidência:** Migração operacional `vehicles`/`driver_vehicle_assignments`, `src/contracts/catalog.ts`, `src/application/catalog-admin.ts`, `CatalogSandbox.tsx`, `tests/catalog.test.ts` e `tests/catalog-admin.test.ts`. O comando server-side rejeita associações sobrepostas por motorista ou veículo e mantém janelas adjacentes; a demonstração permite vários motoristas no mesmo carro. Falta adaptador persistente, fotos/indisponibilidades e teste de histórico temporal no browser.

## CAT-03 — Zonas de atendimento e taxas de recolha

**Estado:** PLANEADA

**Dependências:** CAT-01, CFG-01

**Regras:** DEC-14; CAL-R05

**Implementação:** Editor de zonas por motorista com geometria/área bem definida, taxa, prioridade e publicação; validar endereço/coordenadas e casos de sobreposição.

**Aceitação:** Fronteira e sobreposição têm resultados determinísticos; aplica uma taxa de recolha correta; fora da zona não apresenta disponibilidade confirmada.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
