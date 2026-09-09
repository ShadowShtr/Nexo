# 08 — Qualidade, versões e entrega

## Versões

SemVer durante desenvolvimento: 0.1.0 fundação; 0.2.x infraestrutura/configurações; 0.3.x catálogo/agenda; 0.4.x reservas/CRM; 0.5.x cliente e motorista; 0.6.x financeiro/pagamentos; 0.7.x estabilização. São marcos propostos, não datas prometidas. 1.0.0 só após gates de lançamento.

Branches curtas por tarefa: `feat/CAL-02-conflicts`, `fix/PAY-03-retry`. Commits pequenos com ID: `feat(CAL-02): validate shared vehicle conflicts`. Tag apenas após testes e changelog; nenhum push remoto está configurado nesta fundação.

Releases de schema usam migrações progressivas. Para mudança incompatível: expandir schema → escrever/ler compatível → migrar dados → retirar formato antigo em versão posterior. Não alterar valor histórico para adequar o passado à regra nova.

## Definição de pronto de uma tarefa

1. Critérios específicos satisfeitos, links para REG/CAL/DEC e dependências prontas.
2. Domínio e persistência implementados quando exigidos, não apenas UI.
3. Permissões verificadas no servidor, estados vazios/erro/loading e PT/EN nas telas.
4. Testes de risco relevantes passam; evidência registada no ficheiro da tarefa.
5. Changelog, contratos e documentação atualizados.
6. Nenhum dado real/segredo no commit; diff revisto.
7. Pendências e limitações explícitas. “Mock”, “contrato” e “produção” são estados diferentes.

## Matriz de testes

| Área | Cenários obrigatórios |
|---|---|
| Preço | 1/2/3 pessoas, limite carro/pacote, metros fracionando km, half-up, total=soma, sinal+saldo=total, negativos/overflow. |
| Espera | 0, dentro da franquia, exatamente bloco e um minuto acima; não duplicar duração/cobrança. |
| Política | exatamente 24h, menos 1ms, passado, data original preservada, cancelamento repetido não duplica devolução. |
| Agenda | sobreposição, margem exata/insuficiente, deslocação longa, antes/depois, carro partilhado, motorista com carros diferentes, bloqueio expirado. |
| Tempo | verão/inverno Europe/Lisbon, hora inexistente/repetida, reservas cruzando meia-noite, idioma sem alterar timezone. |
| Concorrência | duas reservas mesmo slot, pagamento na expiração, dois reagendamentos, acertos simultâneos, atualização com versão antiga. |
| Acesso | parceiro A não consulta B; cliente A não consulta B; CRM/ajustes bloqueados a parceiro; token revogado. |
| Pagamento | assinatura inválida, beneficiário errado, moeda/montante errados, webhook duplicado/fora de ordem, reembolso falhado. |
| Configurações | override zero/vazio, publicação incompleta, alteração não mexe no passado, simulação=API. |
| UI | PT/EN, teclado, mobile/desktop, zoom 200%, textos longos, estado offline/erro sem falso sucesso. |

O núcleo desta versão cobre apenas parte dos testes unitários acima. Testes de integração, segurança, E2E, acessibilidade e concorrência aguardam as camadas correspondentes; não são reclamados como concluídos.

## Gates por release

G0 fundação: documentos coerentes, funções puras, testes executáveis, tarefa de cada aba identificada.

G1 persistência: migrações, transações/concorrência e autorização demonstradas com integração real de teste. Nenhuma tela confirma dinheiro/agenda antes disto.

G2 operação interna: proprietário consegue criar manualmente cliente, tour, reserva, atribuir parceiro, executar e registar acerto com histórico.

G3 percurso público: idioma → perfil → carro → disponibilidade → orçamento → consulta/reagendamento, com dados de teste e sem cobrança real.

G4 financeiro: MB WAY por motorista e reembolsos comprovados em sandbox, ledger idempotente, conciliação e exceções.

G5 lançamento: pendências comerciais resolvidas, conteúdo bilingue real, acesso e dados revistos, backup/restauração testados, fluxos E2E e operação piloto aprovados. Publicação segue Sites apenas nesta etapa apropriada; não publicar uma base documental como se fosse o app pronto.

## Observabilidade e recuperação

Logs estruturados com requestId/bookingId/eventId, sem dados pessoais desnecessários. Alertas: pagamento sem reserva confirmada, devolução falhada, bloqueio preso, conflito por atraso e outbox em falha repetida. Dashboard futuro mede falhas e latência; metas definidas após medir carga real.

Antes de cada release: backup quando houver banco, testar migração em cópia sintética, validar rollback da aplicação compatível com schema novo. Ensaio de restauração com tempo e resultado registados. Nunca prometer rollback financeiro apagando movimentos.
