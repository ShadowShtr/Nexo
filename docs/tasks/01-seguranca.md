# Identidade e acesso

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## SEC-01 — Sessões e papéis do proprietário/parceiro

**Estado:** PLANEADA

**Dependências:** BAS-03, BAS-04

**Regras:** DEC-01; DEC-24

**Implementação:** Implementar autenticação, convites privados a parceiros, sessão segura, middleware e autorização nos casos de uso; owner também pode executar viagens.

**Aceitação:** Parceiro A recebe 403/404 ao tentar dados de B, CRM, tarifa e settings; testes incluem chamadas diretas à API e organização diferente.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## SEC-02 — Acesso do cliente à marcação por link seguro

**Estado:** PLANEADA

**Dependências:** SEC-01

**Regras:** REG-06; DEC-18

**Implementação:** Gerar referência de suporte e token aleatório independente; guardar hash, validade/revogação, trocar por sessão restrita e remover token da URL; limitar tentativas.

**Aceitação:** Só referência não abre reserva; token revogado falha; GET não cancela; resposta omite NIF, notas internas e acertos; logs não guardam token.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## SEC-03 — Revisão de dados, retenção e proteção operacional

**Estado:** PLANEADA

**Dependências:** CRM-01, PAY-03, SEC-02

**Regras:** PEN-08; PEN-09

**Implementação:** Inventariar dados e responsáveis, definir retenção e acesso operacional, redigir fluxos de exportação/anonimização compatíveis com histórico necessário; revisar upload, logs e dependências.

**Aceitação:** Políticas reais documentadas e validadas pelo negócio; nenhum dado privado em resposta pública ou fixture; testes de segurança e backup registados.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
