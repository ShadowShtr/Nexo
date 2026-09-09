# Aba Acertos / ganhos do parceiro

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar.

## SET-01 — Acordo X e dívida por serviço concluído

**Estado:** PLANEADA

**Dependências:** BKG-02, FIN-01

**Regras:** REG-07; PEN-04

**Implementação:** Persistir valor X fixo acordado, apresentar ao parceiro antes do aceite e gerar dívida na conclusão; serviço próprio gera zero; cancelamento pede regra definida.

**Aceitação:** X ausente bloqueia gerar dívida automática; total pago pelo cliente não sofre retenção pelo dono; conclusão repetida não duplica dívida; alteração do acordo é auditada.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## SET-02 — Liquidação pessoal e extrato por parceiro

**Estado:** PLANEADA

**Dependências:** SET-01

**Regras:** DEC-16; REG-07

**Implementação:** Owner regista data, valor e nota do acerto pessoal, aloca a um ou mais serviços, suporta parcial e extrato por período; parceiro consulta próprios valores.

**Aceitação:** Duas liquidações concorrentes não excedem dívida; extrato mostra devido/liquidado/pendente por serviço; não dispara transferência; correção usa inversão com motivo.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
