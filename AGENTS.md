# Regras de implementação

## Continuidade obrigatória em qualquer PC

Antes de trabalhar, ler [guia entre PCs](docs/21-continuidade-entre-pcs.md), [estado atual e limites](docs/22-estado-atual-e-limites.md) e, para o cliente, [decisões visuais](docs/23-decisoes-visuais-cliente.md). Não depender da conversa nem de ficheiros da máquina anterior.

Verificar branch, remoto, histórico e alterações locais; sincronizar sem sobrescrever trabalho. No fim de cada tarefa, atualizar documentação específica, evidência, changelog e o estado atual quando aplicável; guardar código e assets no Git e comunicar se o push ficou pendente. A próxima máquina deve cumprir e manter estas mesmas instruções. Commit local não equivale a sincronização remota.

Ler os relatórios antigos pela versão indicada. O documento de estado atual consolida limites recentes; em conflito com uma regra confirmada, registar a divergência em vez de alterar silenciosamente a regra. Nunca afirmar disponibilidade multiutilizador, pagamento real ou validação iOS apenas com testes da demonstração.

## Implementação

1. Ler README.md, docs/01-escopo.md, docs/03-regras.md e a tarefa em docs/tasks antes de alterar código.
2. Manter a arquitetura modular de docs/02-arquitetura.md. A interface nunca é a fonte de verdade de preço, permissões ou disponibilidade.
3. Trabalhar uma tarefa identificada de cada vez; atualizar estado, evidência e CHANGELOG. Não marcar uma aba concluída por ter apenas o desenho.
4. Distinguir confirmado, hipótese e pendência. Não resolver decisões comerciais silenciosamente.
5. Dinheiro em cêntimos inteiros; taxas em pontos base; durações em minutos inteiros; instantes UTC e apresentação Europe/Lisbon. Nunca calcular dinheiro com floats.
6. Criar testes para limites financeiros, transições, acesso e concorrência. Testar exatamente 24h, 24h menos 1ms, margem de 60min e fronteiras de capacidade.
7. Novas configurações não recalculam reservas confirmadas. Guardar versão e fotografia do orçamento/regras.
8. Não usar localStorage como base de dados, não simular pagamentos como reais, não dar permissões através de controlos apenas visuais.
9. Parceiros só consultam os seus serviços e acertos. CRM, preços, atribuição e configurações pertencem ao proprietário.
10. Textos de interface em pt-PT e en; conteúdo editorial bilingue. Não publicar tours com tradução em falta.
11. Migrações futuras numeradas e imutáveis depois de aplicadas. Não apagar histórico financeiro nem reservas.
12. Não publicar, configurar cobrança real ou inventar credenciais durante a fase de fundação. Preparar primeiro a funcionalidade e a validação correspondentes.
13. Atualizações pequenas, SemVer, commits por assunto. Nunca incluir dados reais, NIF, contactos ou segredos nos exemplos/testes.
14. A aprovação do utilizador é necessária para mudar uma regra comercial já confirmada; escolhas técnicas reversíveis podem prosseguir.
15. Para qualquer tela/componente, ler docs/12-design-system.md e docs/13-mapa-visual-abas.md. Usar src/ui/styles/tokens.css; não inventar tema por aba. Fonte exata das imagens não foi identificada. Aplicar critérios UI-02/UI-03 antes de fechar tarefas de interface.
