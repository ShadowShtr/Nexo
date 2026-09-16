# Sistema visual e interface

Reutilização: UI-02 deve reutilizar shadcn/ui e os componentes selecionados, adaptados aos tokens existentes. Ver [pesquisa GitHub](../14-reutilizacao-github.md).

Ler [sistema visual](../12-design-system.md), [mapa de abas](../13-mapa-visual-abas.md) e [definição de pronto](../08-entrega.md).

## UI-01 — Documentar referências e criar tokens partilhados

**Estado:** CONCLUÍDA — especificação e CSS, sem telas funcionais

**Dependências:** BAS-01

**Regras:** DEC-30; sistema visual v1

**Implementação:** Catalogar as cinco referências, distinguir observação de estimativa, definir tipografia, cores, geometria, componentes, navegação e adaptação de cada aba; guardar tokens CSS independentes de framework.

**Aceitação:** Todas as abas mapeadas; fonte exata não apresentada como identificada; diferenças deliberadas de acessibilidade descritas; regras financeiras preservadas; referência e documentação guardadas no projeto.

**Evidência:** docs/12-design-system.md, docs/13-mapa-visual-abas.md, src/ui/styles/tokens.css e design/references. Validação documental; sem QA de browser nesta fase.

## UI-02 — Implementar componentes e exemplos de estados

**Estado:** EM CURSO — primitivas e estados vazios; catálogo completo pendente

**Dependências:** UI-01, BAS-04

**Regras:** DEC-30; secções 3–9 do sistema visual

**Implementação:** Construir headers, cards, navegação, listas, grupos de configuração, formulários, badges e painéis com biblioteca acessível do scaffold; catálogo local de estados PT/EN e dados sintéticos claramente identificados.

**Aceitação:** Componentes partilham tokens; keyboard/foco/disabled/loading funcionam; nenhuma ação demonstra sucesso fictício; estilos não alteram regras de negócio; sem fontes remotas não aprovadas.

**Evidência:** `src/ui/styles/tokens.css`, `src/ui/components/Primitives.tsx`, `src/web/styles.css`, build TypeScript/Vite e 15 cenários Playwright. O calendário demo foi revisto em viewport móvel; persistência real e catálogo completo continuam pendentes.

## UI-03 — Rever consistência visual em todas as abas implementadas

**Estado:** PLANEADA

**Dependências:** UI-02, PUB-03, DRV-02, FIN-02, CFG-03, CAL-04

**Regras:** DEC-30; mapa visual completo; secções 10–12 do sistema visual

**Implementação:** Comparar referências com telas reais em larguras 320/375/390/430/768/1024/1440, PT/EN e texto ampliado; registar capturas/diferenças, corrigir truncamento, foco, safe areas, menus e margens de agenda.

**Aceitação:** Nenhum valor/ação importante cortado ou tapado pela barra; cada aba mantém hierarquia partilhada; contraste e alvos verificados na composição final; revisão funcional não substituída pela aparência.

**Evidência:** Por preencher com capturas e cenários por aba. Não foi executado browser QA nesta entrega.


Evidência parcial 0.2.0: [base web e limites](../15-base-web.md). Navegação e exemplos visuais não concluem critérios funcionais dependentes de persistência e acesso.

Evidência parcial 0.2.79: barra inicial de pesquisa compacta, botões e caixas de planeamento menores, ícones alinhados e calendário principal com horários e pop-up próprio arredondado de data sem grelha duplicada; build e browser focado aprovados. Ver docs/10-validacao.md. UI-02 permanece em curso.
