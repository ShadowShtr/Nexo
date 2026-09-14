# Rota e Waze

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## NAV-01 — Percurso e navegação por etapa

**Estado:** EM CURSO — mapa e deep link Waze demonstrados; rota real e testes físicos pendentes

**Dependências:** DRV-01, PRC-02

**Regras:** DEC-18; CAL-R02

**Implementação:** Validar integração oficial de link Waze por coordenadas; abrir recolha antes do início e próxima etapa depois; fallback endereço copiável; manter roteiro ordenado.

**Aceitação:** Testes em Android/iOS com app presente/ausente; paragem certa em cada etapa; Waze não é apresentado como fornecedor do preço ou tracking automático.

**Evidência:** `src/infrastructure/routing/osrm.ts` implementa `RouteProvider` server-side com OSRM configurável, coordenadas ordenadas, HTTPS obrigatório para hosts remotos, timeout, arredondamento conservador e erro explícito sem fallback fictício. `tests/osrm.test.ts` cobre URL, rota ausente, falha HTTP/rede e coordenadas. Continuam pendentes próxima etapa dinâmica, teste em Android/iOS com app presente/ausente e endereço copiável.

Evidência parcial 0.2.5–0.2.24: mapa Leaflet no percurso público com pontos ordenados, geometria fictícia, atribuição OSM e fallback textual; link oficial HTTPS do Waze por coordenadas nos serviços do motorista; adaptador OSRM server-side para distância/duração rodoviárias. Testes automatizados validam parâmetros, PT/EN, layout e falhas do provedor. Continuam pendentes próxima etapa dinâmica, teste em Android/iOS com app presente/ausente e endereço copiável.
